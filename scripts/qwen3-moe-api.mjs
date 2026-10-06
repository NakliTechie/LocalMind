// The rung-2a harness API, shared by the page (engine on the page thread) and
// qwen3-moe-worker.mjs (engine in a dedicated worker, the way LocalMind runs engines).
// Every method returns JSON-able results for a DevTools-protocol client.
import { Qwen3MoeSsd, removeIngest } from '../src/qwen3_moe_ssd.js';
import { Qwen35MoeSsd } from '../src/qwen35_moe_ssd.js';
import { Gemma4MoeSsd } from '../src/gemma4_moe_ssd.js';

const ENGINES = { qwen3: Qwen3MoeSsd, qwen35: Qwen35MoeSsd, gemma4: Gemma4MoeSsd };

export function makeApi(log = () => {}) {
  let m = null;
  const api = {
    // engine: 'qwen3' (rung 2a, qwen3moe GGUFs), 'qwen35' (rung 2b, qwen35moe) or 'gemma4' (rung 2c, Gemma 4 MoE).
    // capture (gemma4): keep each layer's states of the last step for states().
    async load({ url, key, engine = 'qwen3', poolGB = 4, readers = 4, prefetch, maxCtx = 4096, reingest = false, uploadRing, evict, hotHalfLife, lookahead, batchPrefill, prefillChunk, subgroups, gpuRouting, routeWindow, capture, gpuBudgetGB, root } = {}) {
      if (m) { await m.dispose(); m = null; }
      const t0 = performance.now();
      let last = 0;
      if (!ENGINES[engine]) throw new Error(`unknown engine ${engine}`);
      m = await ENGINES[engine].load(null, {
        url, key, poolBytes: poolGB * 2 ** 30, readers, prefetch, maxCtx, reingest, uploadRing, evict, hotHalfLife, lookahead, batchPrefill, prefillChunk, subgroups, gpuRouting, routeWindow, capture, root,
        gpuBudgetBytes: gpuBudgetGB ? gpuBudgetGB * 1e9 : undefined,
        onProgress: (e) => {
          if (e.status === 'weights' && e.kind !== 'tensors' && performance.now() - last > 2000) { last = performance.now(); log({ ingest: e.loaded, total: e.total, secs: e.secs }); }
          else if (e.status === 'ingest-plan') log(e);
        },
      });
      globalThis.engine = m;
      return log({ gpuBytesTotal: Object.values(m.gpuBytes).reduce((x, y) => x + y, 0), subgroupKernels: !!m.subgroupKernels, gpuRouting: m.gpuRouting, loaded: key, secs: (performance.now() - t0) / 1000, ingestSecs: m.manifest.ingestSecs, denseUploadSecs: m.denseUploadSecs, poolSlots: m.poolSlots, gpuBytes: m.gpuBytes, cfg: m.cfg });
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
