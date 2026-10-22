// The rung-2a harness API, shared by the page (engine on the page thread) and
// qwen3-moe-worker.mjs (engine in a dedicated worker, the way LocalMind runs engines).
// Every method returns JSON-able results for a DevTools-protocol client.
import { Qwen3MoeSsd, removeIngest } from '../src/qwen3_moe_ssd.js';
import { Qwen35MoeSsd, MiniCpmV47Ssd } from '../src/qwen35_moe_ssd.js';
import { Gemma4MoeSsd } from '../src/gemma4_moe_ssd.js';
import { Qwen35Dense, Qwen3Dense } from '../src/qwen35_dense.js';
import { Lfm2MoeSsd } from '../src/lfm2_moe_ssd.js';
import { HyV3MoeSsd } from '../src/hy_v3_moe_ssd.js';
import { FlintMoeSsd } from '../src/flint_moe_ssd.js';
import { FlashMapDrafter, specGenerate, FLASHMAP_QWEN3_4B_LAYERS } from '../src/flashmap_drafter.js';
import { lookupGenerate } from '../src/prompt_lookup.js';

const ENGINES = { qwen3: Qwen3MoeSsd, qwen35: Qwen35MoeSsd, gemma4: Gemma4MoeSsd, qwen35dense: Qwen35Dense, qwen3dense: Qwen3Dense, lfm2moe: Lfm2MoeSsd, hyv3: HyV3MoeSsd, flint: FlintMoeSsd, minicpmv: MiniCpmV47Ssd };

export function makeApi(log = () => {}) {
  let m = null, fm = null;
  const api = {
    // engine: 'qwen3' (rung 2a, qwen3moe GGUFs), 'qwen35' (rung 2b, qwen35moe), 'gemma4' (rung 2c, Gemma 4 MoE), 'lfm2moe' (rung 2d, LFM2.5-24B-A2B) or
    // 'qwen35dense' (dense qwen35 from an IQ-mix GGUF, qwen35_dense.js; no expert pool, so bench with clearPool: false).
    // capture (gemma4): keep each layer's states of the last step for states().
    async load({ url, key, engine = 'qwen3', poolGB = 4, readers = 4, prefetch, maxCtx = 4096, reingest = false, uploadRing, evict, hotHalfLife, lookahead, batchPrefill, prefillChunk, subgroups, gpuRouting, routeWindow, capture, gpuBudgetGB, root, flashmap } = {}) {
      if (m) { await m.dispose(); m = null; }
      const t0 = performance.now();
      let last = 0;
      if (!ENGINES[engine]) throw new Error(`unknown engine ${engine}`);
      m = await ENGINES[engine].load(null, {
        url, key, poolBytes: poolGB * 2 ** 30, readers, prefetch, maxCtx, reingest, uploadRing, evict, hotHalfLife, lookahead, batchPrefill, prefillChunk, subgroups, gpuRouting, routeWindow, capture, root,
        ...(flashmap ? { captureLayers: FLASHMAP_QWEN3_4B_LAYERS } : {}),
        gpuBudgetBytes: gpuBudgetGB ? gpuBudgetGB * 1e9 : undefined,
        onProgress: (e) => {
          if (e.status === 'weights' && e.kind !== 'tensors' && performance.now() - last > 2000) { last = performance.now(); log({ ingest: e.loaded, total: e.total, secs: e.secs }); }
          else if (e.status === 'ingest-plan') log(e);
        },
      });
      globalThis.engine = m;
      return log({ gpuBytesTotal: Object.values(m.gpuBytes).reduce((x, y) => x + y, 0), subgroupKernels: !!m.subgroupKernels, gpuRouting: m.gpuRouting, loaded: key, secs: (performance.now() - t0) / 1000, ingestSecs: m.manifest.ingestSecs, denseUploadSecs: m.denseUploadSecs, poolSlots: m.poolSlots, gpuBytes: m.gpuBytes, cfg: m.cfg });
    },
    // FlashMap (qwen3dense loaded with flashmap: true): the drafter from `url` (a local safetensors) or Hugging Face.
    async flashmapLoad({ url } = {}) {
      const t0 = performance.now();
      fm = await FlashMapDrafter.load(m, { url });
      return { secs: (performance.now() - t0) / 1000, gpuBytes: fm.gpuBytes };
    },
    // The drafter against drafter_ref.py's float32 reference: its features and anchor in, the 16 slots' DiT output and
    // their tokens out.
    async flashmapPeek(names) { return fm.peek(names); },
    // The app's own path (generateTurn) on `messages`, with the drafter (Qwen3Dense speculative) and without (plain).
    async flashmapTurn(messages, maxNewTokens = 256) {
      const run = async (drafter) => {
        m.drafter = drafter; const t0 = performance.now(); let last = null;
        for await (const o of m.generateTurn(messages, { maxNewTokens, enableThinking: false })) last = o;
        m.drafter = null;
        return { text: last ? last.text : '', tokens: last ? last.tokens : 0, secs: +((performance.now() - t0) / 1000).toFixed(2) };
      };
      const plain = await run(null), spec = await run(fm);
      return { same: plain.text === spec.text, plain, spec };
    },
    async flashmapCheck(refBase) {
      const ref = await (await fetch(`${refBase}.json`, { cache: 'no-store' })).json();
      const feats = new Float32Array(await (await fetch(`${refBase}-features.f32`, { cache: 'no-store' })).arrayBuffer());
      m.device.queue.writeBuffer(m.b.feat, 0, feats);
      m.device.pushErrorScope('validation');
      fm.reset(); fm.extendContext(ref.P, 0);
      const extendErr = await m.device.popErrorScope();
      m.device.pushErrorScope('validation');
      const toks = await fm.draft(ref.anchor, ref.anchorPos);
      const draftErr = await m.device.popErrorScope();
      if (extendErr || draftErr) return { extendErr: extendErr && extendErr.message, draftErr: draftErr && draftErr.message };
      const h = await fm.readOut(), D = 2560;
      let maxAbs = 0, minCos = 1, num = 0, den = 0;
      for (let s = 0; s < 16; s++) {
        let dot = 0, na = 0, nb = 0;
        for (let i = 0; i < D; i++) { const a = h[s * D + i], b = ref.h[s][i]; maxAbs = Math.max(maxAbs, Math.abs(a - b)); dot += a * b; na += a * a; nb += b * b; num += (a - b) ** 2; den += b * b; }
        minCos = Math.min(minCos, dot / Math.sqrt(na * nb));
      }
      return { tokens: toks, refTokens: ref.draftTokens, tokensSame: toks.filter((t, i) => t === ref.draftTokens[i]).length, maxAbs, relErr: Math.sqrt(num / den), minCos };
    },
    // Plain greedy (prefill, then one-token steps) against FlashMap speculative greedy, per prompt: tokens, time, and
    // whether the outputs are the same. Thinking off; stops at the model's stop tokens or maxNew.
    async flashmapBench(texts, maxNew = 256, specOpts = {}) {
      const stops = new Set(m.stopTokenIds), rows = [];
      for (const text of texts) {
        const ids = m.tokenizer.encode(m.chatPrompt([{ role: 'user', content: text }], { enableThinking: false }));
        m.reset();
        let t0 = performance.now(), next = await m.prefill(ids, 'argmax');
        const plainPrefill = (performance.now() - t0) / 1000, plain = [next];
        t0 = performance.now();
        while (plain.length < maxNew && !stops.has(next)) { next = await m.step(next, 'argmax'); plain.push(next); }
        const plainDecode = (performance.now() - t0) / 1000;
        const spec = []; let rounds = 0, plainSteps = 0, specPrefill = 0, accepted = 0, draftMs = 0, verifyMs = 0;
        t0 = performance.now();
        let t1 = 0;
        for await (const r of specGenerate(m, fm, ids, { maxNewTokens: maxNew, ...specOpts })) {
          if (r.prefill) { specPrefill = (performance.now() - t0) / 1000; t1 = performance.now(); } else if (r.plain) plainSteps++; else { rounds++; accepted += r.accepted; draftMs += r.draftMs; verifyMs += r.verifyMs; }
          spec.push(...r.tokens);
        }
        const specDecode = (performance.now() - t1) / 1000;
        const n = Math.min(spec.length, plain.length), firstDiff = spec.slice(0, n).findIndex((t, i) => t !== plain[i]);
        // At a divergence: the one-token path's top-2 margin there (a near-tie between the two kernels' sums, or not).
        let diffMargin = null;
        if (firstDiff >= 0) {
          m.reset(); let lg = await m.prefill(ids, 'logits');
          for (let i = 0; i < firstDiff; i++) lg = await m.step(plain[i], 'logits');
          let a1 = -Infinity, a2 = -Infinity; for (const v of lg) { if (v > a1) { a2 = a1; a1 = v; } else if (v > a2) a2 = v; }
          diffMargin = +(a1 - a2).toFixed(4);
        }
        const row = { promptTokens: ids.length, plainTokens: plain.length, specTokens: spec.length, same: firstDiff < 0 && spec.length >= plain.length, firstDiff, diffMargin,
          plainDecodeTokPerSec: +((plain.length - 1) / plainDecode).toFixed(2), specDecodeTokPerSec: +((spec.length - 1) / specDecode).toFixed(2),
          speedup: +(((spec.length - 1) / specDecode) / ((plain.length - 1) / plainDecode)).toFixed(2),
          tokensPerRound: +((spec.length - 1 - plainSteps) / Math.max(1, rounds)).toFixed(2), rounds, plainSteps, meanAccepted: +(accepted / Math.max(1, rounds)).toFixed(2),
          msPerRound: { draft: +(draftMs / Math.max(1, rounds)).toFixed(1), verify: +(verifyMs / Math.max(1, rounds)).toFixed(1) }, plainMsPerToken: +(1000 * plainDecode / Math.max(1, plain.length - 1)).toFixed(1),
          prefillSecs: { plain: +plainPrefill.toFixed(3), spec: +specPrefill.toFixed(3) }, text: m.tokenizer.decode(spec).slice(0, 200) };
        rows.push(row); log(row);
      }
      return rows;
    },
    // Prompt lookup (prompt_lookup.js) against plain greedy on chat `turns` (each a messages array), thinking off.
    async lookupBench(turns, maxNew = 256, opts = {}) {
      const stops = new Set(m.stopTokenIds), rows = [];
      for (const messages of turns) {
        const ids = m.tokenizer.encode(m.chatPrompt(messages, { enableThinking: false }));
        m.reset();
        let t0 = performance.now(), next = await m.prefill(ids, 'argmax'); const plainPrefill = performance.now() - t0, plain = [next];
        t0 = performance.now();
        while (plain.length < maxNew && !stops.has(next)) { next = await m.step(next, 'argmax'); plain.push(next); }
        const plainSecs = (performance.now() - t0) / 1000;
        const out = []; let checks = 0, plainSteps = 0, accepted = 0, drafted = 0, checkMs = 0, t1 = 0;
        t0 = performance.now();
        for await (const r of lookupGenerate(m, ids, { maxNewTokens: maxNew, ...opts })) {
          if (r.prefill) t1 = performance.now(); else if (r.plain) plainSteps++; else { checks++; accepted += r.accepted; drafted += r.drafted; checkMs += r.checkMs; }
          out.push(...r.tokens);
        }
        const secs = (performance.now() - t1) / 1000, n = Math.min(out.length, plain.length);
        const firstDiff = out.slice(0, n).findIndex((t, i) => t !== plain[i]);
        const row = { promptTokens: ids.length, tokens: out.length, same: firstDiff < 0 && out.length >= plain.length, firstDiff,
          plainTokPerSec: +((plain.length - 1) / plainSecs).toFixed(2), lookupTokPerSec: +((out.length - 1) / secs).toFixed(2),
          speedup: +(((out.length - 1) / secs) / ((plain.length - 1) / plainSecs)).toFixed(2),
          checks, plainSteps, acceptRate: +(accepted / Math.max(1, drafted)).toFixed(2), tokensPerCheck: +((accepted + checks) / Math.max(1, checks)).toFixed(2),
          msPerCheck: +(checkMs / Math.max(1, checks)).toFixed(1), plainMsPerToken: +(1000 * plainSecs / Math.max(1, plain.length - 1)).toFixed(1), text: m.tokenizer.decode(out).slice(0, 160) };
        rows.push(row); log(row);
      }
      return rows;
    },
    // The cost of a check pass of T tokens (prefillChunk 'rows', then rewind) against one plain step, after `ids`.
    async checkCost(ids, Ts = [2, 5, 9, 17], reps = 3) {
      m.reset(); let next = await m.prefill(ids, 'argmax');
      const time = async (f) => { await f(); const t0 = performance.now(); for (let i = 0; i < reps; i++) await f(); return +((performance.now() - t0) / reps).toFixed(1); };
      const pos = m.position, out = {};
      out.stepMs = await time(async () => { await m.step(next, 'argmax'); m.rewind(pos); });
      for (const T of Ts) out[`check${T}Ms`] = await time(async () => { await m.prefillChunk(Array.from({ length: T }, (_, i) => (next + i * 7) % 1000 + 100), 'rows'); m.rewind(pos); });
      return out;
    },
    async greedy(ids, n = 16, { top = 5, resetStats = true } = {}) {
      if (resetStats) m.resetCounters();
      const r = await m.greedy(ids, n, { top });
      return { ids: r.ids, tops: r.tops.map((t) => t.map((x) => [x.id, +x.logit.toFixed(4), +x.logprob.toFixed(5)])), stats: m.stats() };
    },
    // Greedy-match gate against a llama-ref.mjs JSON: same prompt ids, same number of tokens.
    // At the first divergence, both sides' top-2 log-prob margins tell a near-tie from a bug.
    async compare(refUrl, { limit = Infinity } = {}) {
      const ref = await (await fetch(refUrl, { cache: 'no-store' })).json();
      const rows = [];
      for (const r of ref.results.slice(0, limit)) {
        const t0 = performance.now();
        const g = await m.greedy(r.ids, r.gen.length, { top: 5 });
        // The reference runs with ignore_eos, so where its own top-1 is a banned token (EOS) its
        // sampled token is not its top-1. The comparison ends there: agreeing on that top-1 is a match.
        let n = r.gen.length, endedAtBan = false;
        for (let i = 0; i < r.gen.length; i++) if (r.top[i][0][0] !== r.gen[i]) { n = i; endedAtBan = g.ids[i] === r.top[i][0][0]; break; }
        let div = -1;
        for (let i = 0; i < n; i++) if (g.ids[i] !== r.gen[i]) { div = i; break; }
        if (div < 0 && n < r.gen.length && !endedAtBan) div = n;
        // ignore_eos also drops the end-of-turn tokens from the reference's top-5, so its top-1 can be a token it would
        // never have picked; when we end the turn there (a stop token the reference list lacks), the answer is over.
        const stops = new Set(m.stopTokenIds || []);
        if (div >= 0 && stops.has(g.ids[div]) && !r.top[div].some(([id]) => id === g.ids[div])) { n = div; endedAtBan = true; div = -1; }
        const row = { name: r.name, promptTokens: r.ids.length, n, endedAtBan, match: div < 0, firstDivergence: div, secs: (performance.now() - t0) / 1000 };
        // max |Δ logprob| over positions before divergence, for tokens in both top-5 lists
        // Max |Δ logprob| over shared top-5 tokens, and over the reference's top-1 token alone (tail
        // tokens far below the top drift most, so the top-1 figure is the one that decides greedy).
        let maxd = 0, maxd1 = 0;
        for (let i = 0; i < (div < 0 ? n : div); i++) {
          const ours = new Map(g.tops[i].map((x) => [x.id, x.logprob]));
          for (const [id, lp] of r.top[i]) if (ours.has(id)) maxd = Math.max(maxd, Math.abs(ours.get(id) - lp));
          const [id1, lp1] = r.top[i][0];
          if (ours.has(id1)) maxd1 = Math.max(maxd1, Math.abs(ours.get(id1) - lp1));
        }
        row.maxAbsLogprobDiff = +maxd.toFixed(5);
        row.maxAbsTop1LogprobDiff = +maxd1.toFixed(5);
        if (div >= 0) {
          const rt = r.top[div], ot = g.tops[div];
          row.ref = { top: rt.slice(0, 3), margin: +(rt[0][1] - rt[1][1]).toFixed(5) };
          row.ours = { top: ot.slice(0, 3).map((x) => [x.id, +x.logprob.toFixed(5)]), margin: +(ot[0].logprob - ot[1].logprob).toFixed(5) };
        }
        rows.push(row);
        log(row);
      }
      return { label: ref.label, matched: rows.filter((r) => r.match).length, of: rows.length, rows, stats: m.stats() };
    },
    // Decode benchmark: prefill `ids`, then `n` greedy tokens (GPU argmax, 4-byte readback).
    // Prefill and decode are counted separately; `clearPool` empties the expert pool first
    // (the OS page cache is outside the tab's control — the caller records its state).
    async bench(ids, n = 64, { clearPool = true, prefetch } = {}) {
      if (prefetch !== undefined) m.prefetch = !!prefetch;
      if (clearPool) await m.xs.clear();
      m.reset(); m.resetCounters();
      const t0 = performance.now();
      let next = await m.prefill(ids, 'argmax');
      const prefill = { ...m.stats(), secs: (performance.now() - t0) / 1000 };
      m.resetCounters();
      const out = [next];
      const t1 = performance.now();
      for (let i = 1; i < n; i++) { next = await m.step(next, 'argmax'); out.push(next); }
      const decode = { ...m.stats(), secs: (performance.now() - t1) / 1000 };
      return { prefetch: m.prefetch, poolSlots: m.poolSlots, promptTokens: ids.length, ids: out, text: m.tokenizer.decode(out), prefill, decode };
    },
    // Diagnostic: GPU time for one token's forward pass with no router readbacks — every layer
    // uses pool slots 0..k-1 whatever the router picks, all layers in one submit. Output is
    // meaningless; the time is the compute floor that per-layer readbacks and loads sit on top of.
    // stopped (rung 2b): the stop flag is set first, so every guarded kernel returns at once —
    // the cost of the rest of a token after the GPU router stops it.
    async gpuFloor(n = 16, { attention = true, experts = true, head = true, stopped = false } = {}) {
      const c = m.cfg, dev = m.device, K = c.topK;
      dev.queue.writeBuffer(m.a.slots, 0, Uint32Array.from({ length: K }, (_, i) => i));
      if (m.a.stop) dev.queue.writeBuffer(m.a.stop, 0, new Uint32Array([stopped ? 1 : 0, 0, 0, 0]));
      const times = [];
      for (let t = 0; t < n; t++) {
        m.writeTokenUniforms(1000, 0);
        const t0 = performance.now();
        const enc = dev.createCommandEncoder(), pass = enc.beginComputePass();
        m.encodeEmbed(pass);
        for (let l = 0; l < c.layers; l++) { if (attention) m.encodeAttention(pass, l, 1); if (experts) m.encodeExperts(pass, l); }
        if (head) m.encodeHead(pass, 'argmax');
        pass.end(); dev.queue.submit([enc.finish()]);
        await dev.queue.onSubmittedWorkDone();
        times.push(performance.now() - t0);
      }
      if (m.a.stop) dev.queue.writeBuffer(m.a.stop, 0, new Uint32Array(4));
      times.sort((a, b) => a - b);
      return { msPerToken: times[Math.floor(n / 2)], min: times[0], max: times[n - 1] };
    },
    // gemma4 with load({ capture: true }): prefill `ids`, then the last position's per-layer states
    // (attn_out after the attention residual, each layer's output) and the top logits, for scripts/gemma4-ref.py.
    async states(ids, { top = 5 } = {}) {
      m.reset();
      const logits = await m.prefill(ids, 'logits');
      const cap = await m.readCapture();
      const r = (a) => Array.from(a, (v) => +v.toPrecision(7));
      return { attnOut: cap.attnOut.map(r), layers: cap.layers.map(r), top: topLogits(logits, top), stats: m.stats() };
    },
    // Router picks of every layer for every position of `ids` (one-token steps), as [token][layer] → ids.
    async selections(ids) {
      const orig = m.readSel, rec = [];
      m.readSel = async function (n) { const r = await orig.call(this, n); rec.push(Array.from(r.ids)); return r; };
      try { m.reset(); await m.prefill(ids, 'none'); } finally { m.readSel = orig; }
      const L = m.cfg.layers;
      return Array.from({ length: rec.length / L }, (_, t) => rec.slice(t * L, (t + 1) * L));
    },
    setPrefetch(on) { m.prefetch = !!on; return m.prefetch; },
    // rung 2b: switch between chunked and one-token prefill (the batch buffers stay allocated).
    setBatchPrefill(on) { m.batchPrefill = !!on && !!m.b; return m.batchPrefill; },
    // rung 2b: routing on the GPU (sync only at a layer with an absent expert) or after every layer.
    // Needs load({ gpuRouting: true }), which compiles the guarded kernels.
    setGpuRouting(on, window) { if (m.routeGuards) { m.gpuRouting = !!on; if (window) m.routeWindow = window; } return m.gpuRouting; },
    async clearPool() { await m.xs.clear(); m.resetCounters(); return true; },
    stats() { return m.stats(); },
    encode(text) { return m.tokenizer.encode(text); },
    decode(ids) { return m.tokenizer.decode(ids); },
    async generate(messages, maxNewTokens = 64) {
      m.resetCounters();
      let text = '';
      for await (const o of m.generate(messages, { maxNewTokens })) text = o.text;
      return { text, stats: m.stats() };
    },
    async opfs() {
      const est = await navigator.storage.estimate();
      const root = await navigator.storage.getDirectory();
      const list = [];
      try {
        const d = await root.getDirectoryHandle('localmind-ssd');
        for await (const [name, h] of d.entries()) {
          const files = [];
          if (h.kind === 'directory') for await (const [fn, fh] of h.entries()) if (fh.kind === 'file') files.push([fn, (await fh.getFile()).size]);
          list.push({ name, files });
        }
      } catch (_) {}
      return { quota: est.quota, usage: est.usage, persisted: await navigator.storage.persisted(), list };
    },
    async remove(key) { if (m) { await m.dispose(); m = null; } await removeIngest(key); return api.opfs(); },
  };
  return api;
}

function topLogits(lg, n) {
  const idx = Array.from(lg.keys()).sort((a, b) => lg[b] - lg[a] || a - b).slice(0, n);
  let mx = -Infinity, sum = 0;
  for (const v of lg) if (v > mx) mx = v;
  for (const v of lg) sum += Math.exp(v - mx);
  const lse = mx + Math.log(sum);
  return idx.map((i) => [i, +lg[i].toFixed(4), +(lg[i] - lse).toFixed(5)]);
}
