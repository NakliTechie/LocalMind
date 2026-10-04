// The rung-2a harness API, shared by the page (engine on the page thread) and
// qwen3-moe-worker.mjs (engine in a dedicated worker, the way LocalMind runs engines).
// Every method returns JSON-able results for a DevTools-protocol client.
import { Qwen3MoeSsd, removeIngest } from '../qwen3_moe_ssd.js';

export function makeApi(log = () => {}) {
  let m = null;
  const api = {
    async load({ url, key, poolGB = 4, readers = 4, prefetch = false, maxCtx = 4096, reingest = false, uploadRing, evict, hotHalfLife } = {}) {
      if (m) { await m.dispose(); m = null; }
      const t0 = performance.now();
      let last = 0;
      m = await Qwen3MoeSsd.load(null, {
        url, key, poolBytes: poolGB * 2 ** 30, readers, prefetch, maxCtx, reingest, uploadRing, evict, hotHalfLife,
        onProgress: (e) => {
          if (e.status === 'weights' && e.kind !== 'tensors' && performance.now() - last > 2000) { last = performance.now(); log({ ingest: e.loaded, total: e.total, secs: e.secs }); }
          else if (e.status === 'ingest-plan') log(e);
        },
      });
      globalThis.engine = m;
      return log({ loaded: key, secs: (performance.now() - t0) / 1000, ingestSecs: m.manifest.ingestSecs, denseUploadSecs: m.denseUploadSecs, poolSlots: m.poolSlots, gpuBytes: m.gpuBytes, cfg: m.cfg });
    },
    async greedy(ids, n = 16, { top = 5, resetStats = true } = {}) {
      if (resetStats) m.resetCounters();
      const r = await m.greedy(ids, n, { top });
      return { ids: r.ids, tops: r.tops.map((t) => t.map((x) => [x.id, +x.logit.toFixed(4)])), stats: m.stats() };
    },
    // Greedy-match gate against a llama-ref.mjs JSON: same prompt ids, same number of tokens.
    // At the first divergence, both sides' top-2 log-prob margins tell a near-tie from a bug.
    async compare(refUrl, { limit = Infinity } = {}) {
      const ref = await (await fetch(refUrl, { cache: 'no-store' })).json();
      const rows = [];
      for (const r of ref.results.slice(0, limit)) {
        const t0 = performance.now();
        const g = await m.greedy(r.ids, r.gen.length, { top: 5 });
        let div = -1;
        for (let i = 0; i < r.gen.length; i++) if (g.ids[i] !== r.gen[i]) { div = i; break; }
        const row = { name: r.name, promptTokens: r.ids.length, n: r.gen.length, match: div < 0, firstDivergence: div, secs: (performance.now() - t0) / 1000 };
        // max |Δ logprob| over positions before divergence, for tokens in both top-5 lists
        let maxd = 0;
        for (let i = 0; i < (div < 0 ? r.gen.length : div); i++) {
          const ours = new Map(g.tops[i].map((x) => [x.id, x.logprob]));
          for (const [id, lp] of r.top[i]) if (ours.has(id)) maxd = Math.max(maxd, Math.abs(ours.get(id) - lp));
        }
        row.maxAbsLogprobDiff = +maxd.toFixed(5);
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
      if (clearPool) m.xs.clear();
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
    setPrefetch(on) { m.prefetch = !!on; return m.prefetch; },
    clearPool() { m.xs.clear(); m.resetCounters(); return true; },
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
