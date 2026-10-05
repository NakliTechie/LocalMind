/* ingest.js — copy a GGUF from a URL into OPFS in an engine's own layout, streaming: HTTP Range requests of
 * ≤1 GiB, each unit transformed and written while the next bytes arrive (at most 8 writes in flight). OPFS quota
 * grows with what is written, so files grow by writes rather than one up-front truncate. The manifest is written
 * incomplete first and complete last, so an interrupted ingest is never taken as valid.
 * Extracted from LocalMind's qwen3_moe_ssd.js (2026-10-05); `root` and `format` are new options (LocalMind
 * passes 'localmind-ssd' and its own format string).
 *
 *   const manifest = await ingestGguf({ url, key, plan: { layout, units }, onProgress });
 *   // OPFS: <root>/<key>/{header.bin, dense.bin, experts.bin, manifest.json}
 */

import { OpfsWriter, writeOpfsText, removeOpfs } from './opfs-reader.js';
import { parseGguf, splitQ8, splitQ4, Q8_BLOCK, Q4_BLOCK } from './gguf.js';

export const ROOT = 'diskformer';
export const FORMAT = 'diskformer-gguf/1';

// ── Ingest: GGUF (over HTTP Range) → OPFS, in the engine layout ─────────────
export const storeKey = (file) => file.replace(/\.gguf$/i, '').toLowerCase().replace(/[^a-z0-9._-]+/g, '-');

export async function readHeader(url, fetchFn, signal) {
  let n = 16 << 20;
  for (;;) {
    const r = await fetchFn(url, { headers: { Range: `bytes=0-${n - 1}` }, signal, cache: 'no-store' });
    if (!r.ok) throw new Error(`GGUF header fetch: HTTP ${r.status}`);
    const u8 = new Uint8Array(await r.arrayBuffer());
    try { return { gguf: parseGguf(u8), bytes: u8 }; } catch (e) { if (!e.needBytes) throw e; n = e.needBytes; }
  }
}

// plan.layout(gguf) → { experts: { file, bytes, … }, dense: { file, bytes, tensors } }: where every kept byte goes.
// plan.units(gguf, layout) → sorted units { src, len, file: 'dense' | 'experts', raw } or { …, kind?: 'q4', q, s }:
// byte ranges of the GGUF, each small enough to transform in memory (raw copies, or Q8_0 / Q4_0 blocks split
// into a value plane at q and an f16-scale plane at s).
export async function ingestGguf({ url, key, plan, root = ROOT, format = FORMAT, fetch: fetchFn = fetch, onProgress = () => {}, signal, source = {} }) {
  if (!plan || !plan.layout || !plan.units) throw new Error('ingestGguf: plan { layout, units } is required');
  const t0 = performance.now();
  const { gguf, bytes: headerBuf } = await readHeader(url, fetchFn, signal);
  const layout = plan.layout(gguf);
  const dir = `${root}/${key}`;
  const est = navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate() : {};
  const persisted = navigator.storage && navigator.storage.persist ? await navigator.storage.persist().catch(() => false) : false;
  const needed = layout.experts.bytes + layout.dense.bytes;
  onProgress({ status: 'ingest-plan', needed, quota: est.quota, usage: est.usage, persisted });
  const quotaLog = [{ written: 0, quota: est.quota, usage: est.usage }];
  await writeOpfsText(`${dir}/manifest.json`, JSON.stringify({ format, complete: false }));
  // Header bytes, for the tokenizer and metadata at every later load.
  const hw = await OpfsWriter.open(`${dir}/header.bin`, { truncate: true });
  await hw.write(headerBuf.subarray(0, gguf.dataStart), 0);
  await hw.close();

  const units = plan.units(gguf, layout);
  const writers = {
    dense: await OpfsWriter.open(`${dir}/dense.bin`, { truncate: true }),
    experts: await OpfsWriter.open(`${dir}/experts.bin`, { truncate: true }),
  };
  // No up-front truncate to full size: a fresh origin's quota is ~10 GiB and grows with what is
  // actually written (measured 2026-10-02), so a single 30.8 GB extension would be refused. The
  // writes below grow each file by at most one layer's records (~642 MB) at a time.

  // Stream the data section in order. Units are filled from the response chunks, transformed,
  // and written while the next bytes arrive (at most `maxWrites` writes in flight).
  const first = units[0].src, last = units[units.length - 1].src + units[units.length - 1].len;
  const maxUnit = units.reduce((m, u) => Math.max(m, u.len), 0);
  let ui = 0, fill = 0, unitBuf = new Uint8Array(maxUnit);
  const inflight = new Set(); const maxWrites = 8;
  const spare = [];
  const getBuf = (n) => { const i = spare.findIndex((b) => b.byteLength >= n); return i >= 0 ? spare.splice(i, 1)[0] : new ArrayBuffer(n); };
  const queue = async (w, buf, len, at) => {
    while (inflight.size >= maxWrites) await Promise.race(inflight);
    const p = w.writeOwned(buf, len, at).then((b) => { inflight.delete(p); if (spare.length < 16) spare.push(b); });
    inflight.add(p);
  };
  let done = 0, written = 0;
  const flushUnit = async (u) => {
    const src = unitBuf.subarray(0, u.len);
    const w = writers[u.file];
    if (u.raw !== undefined) {
      const b = getBuf(u.len); new Uint8Array(b, 0, u.len).set(src);
      await queue(w, b, u.len, u.raw); written += u.len; return;
    }
    const q4 = u.kind === 'q4', blk = q4 ? Q4_BLOCK : Q8_BLOCK, qPer = q4 ? 16 : 32;
    const nb = u.len / blk;
    const qb = getBuf(nb * qPer), sb = getBuf(nb * 2);
    (q4 ? splitQ4 : splitQ8)(src, new Uint8Array(qb, 0, nb * qPer), new Uint8Array(sb, 0, nb * 2));
    await queue(w, qb, nb * qPer, u.q);
    await queue(w, sb, nb * 2, u.s);
    written += nb * blk;
  };
  // Several sequential range requests (one per ~1 GiB) keep any one response bounded.
  const SPAN = 1 << 30;
  let pos = first;
  for (let start = first; start < last; start += SPAN) {
    const end = Math.min(last, start + SPAN) - 1;
    const r = await fetchFn(url, { headers: { Range: `bytes=${start}-${end}` }, signal, cache: 'no-store' });
    if (r.status !== 206) throw new Error(`GGUF range ${start}-${end}: HTTP ${r.status}`);
    const reader = r.body.getReader();
    for (;;) {
      const { done: eof, value } = await reader.read();
      if (eof) break;
      let off = 0;
      while (off < value.byteLength && ui < units.length) {
        const u = units[ui];
        if (pos < u.src) { const skip = Math.min(u.src - pos, value.byteLength - off); pos += skip; off += skip; continue; }
        const take = Math.min(u.len - fill, value.byteLength - off);
        unitBuf.set(value.subarray(off, off + take), fill);
        fill += take; off += take; pos += take;
        if (fill === u.len) { await flushUnit(u); ui++; fill = 0; }
      }
      done = pos - first;
      onProgress({ status: 'ingest', loaded: done, total: last - first, written, secs: (performance.now() - t0) / 1000 });
      if (written - quotaLog[quotaLog.length - 1].written > 4 * 2 ** 30 && navigator.storage.estimate) {
        const e = await navigator.storage.estimate();
        quotaLog.push({ written, quota: e.quota, usage: e.usage });
      }
    }
  }
  if (ui !== units.length) throw new Error(`ingest ended early: ${ui} of ${units.length} units`);
  await Promise.all(inflight);
  await writers.dense.close();
  await writers.experts.close();
  const manifest = {
    format, complete: true, ingestedAt: new Date().toISOString(),
    source: { url, ...source, dataStart: gguf.dataStart, headerBytes: gguf.headerBytes },
    ingestSecs: (performance.now() - t0) / 1000, quotaBefore: est.quota, persisted, quotaLog,
    ...layout,
  };
  await writeOpfsText(`${dir}/manifest.json`, JSON.stringify(manifest));
  return manifest;
}

// Ingest progress as hosts read it: a 'weights' event with byte counts. The spread goes first, so the
// event's own status ('ingest') cannot overwrite 'weights' (LocalMind's 2026-10-04 bug: a host's load
// watchdog, seeing no progress, killed a 37 GB first download).
export function ingestProgress(e) {
  return e && e.status === 'ingest' ? { ...e, status: 'weights', loaded: e.loaded, total: e.total } : e;
}

export async function removeStore(key, { root = ROOT } = {}) { await removeOpfs(`${root}/${key}`); }
