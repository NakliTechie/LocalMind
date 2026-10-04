/* qwen3_moe_ssd.js — Qwen3-MoE (Qwen3-30B-A3B) in a browser tab, larger than RAM: the dense
 * weights, routers and KV cache live on the GPU; the 6,144 routed experts (≈31 GB at Q8_0)
 * live in OPFS and stream into a GPU slot pool as the router asks for them.
 *
 * Rung 2a of the SSD-streaming ladder (plan/pending.md). From-scratch WebGPU engine; the
 * kernels are ports of browser-big-fast-lab's custom-kernels engine (an Apache-2.0 fork of
 * tylerstraub/gemma4-webgpu): in-shader Q8_0 GEMV (int8 + f16 scale per 32-block, f32
 * accumulate), GPU softmax + top-k router, slot-indexed batched expert GEMVs, MoE combine.
 *
 *   const m = await Qwen3MoeSsd.load('Qwen/Qwen3-30B-A3B-GGUF', { fetch, onProgress, poolBytes });
 *   for await (const { text } of m.generate(messages, { maxNewTokens })) …
 *
 * Load = (first time only) ingest the GGUF into OPFS in the engine's own layout, then upload
 * the dense part to the GPU. OPFS layout under localmind-ssd/<key>/:
 *   header.bin     the GGUF header bytes (metadata + tokenizer), re-parsed at every load
 *   dense.bin      every non-expert tensor; Q8_0 split losslessly into int8 + f16-scale planes
 *   experts.bin    one 5,013,504-byte record per (layer, expert), gate‖up‖down contiguous
 *   manifest.json  source (repo, revision, sha256, size) + every offset above
 * Q8_0 is never re-quantized: each block's f16 scale and 32 int8 values are copied bit-exact,
 * so the engine computes the same dot products llama.cpp does, up to summation order.
 */

import { OpfsReaderPool, OpfsWriter, readOpfsText, writeOpfsText, removeOpfs } from './opfs-reader.js';
import { ExpertStreamer } from './moe-expert-stream.js';

export const QWEN3_30B_A3B = {
  repo: 'Qwen/Qwen3-30B-A3B-GGUF',
  file: 'Qwen3-30B-A3B-Q8_0.gguf',
  revision: 'e4d4bafdfb96a411a163846265362aceb0b9c63a',
  sha256: '4ad960d180b16f56024f5b704697e5dd5b0837167c2e515ef0569abfc599743c',
  size: 32483931648,
};
const FORMAT = 'localmind-qwen3moe-ssd/1';
const OPFS_ROOT = 'localmind-ssd';

// ── GGUF ────────────────────────────────────────────────────────────────────
export const GGML = { F32: 0, F16: 1, Q8_0: 8 };
const Q8_BLOCK = 34;  // f16 scale + 32 × int8

// Parses a GGUF header. Throws { needBytes } when `u8` stops before the header ends.
export function parseGguf(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let p = 0;
  const need = (n) => { if (p + n > u8.byteLength) { const e = new Error('GGUF header truncated'); e.needBytes = Math.max(u8.byteLength * 2, p + n + (1 << 20)); throw e; } };
  const u32 = () => { need(4); const v = dv.getUint32(p, true); p += 4; return v; };
  const u64 = () => { need(8); const v = Number(dv.getBigUint64(p, true)); p += 8; return v; };
  const dec = new TextDecoder();
  const str = () => { const n = u64(); need(n); const s = dec.decode(u8.subarray(p, p + n)); p += n; return s; };
  const scalar = {
    0: () => { need(1); return dv.getUint8(p++); }, 1: () => { need(1); return dv.getInt8(p++); },
    2: () => { need(2); const v = dv.getUint16(p, true); p += 2; return v; }, 3: () => { need(2); const v = dv.getInt16(p, true); p += 2; return v; },
    4: u32, 5: () => { need(4); const v = dv.getInt32(p, true); p += 4; return v; },
    6: () => { need(4); const v = dv.getFloat32(p, true); p += 4; return v; },
    7: () => { need(1); return dv.getUint8(p++) !== 0; },
    10: u64, 11: () => { need(8); const v = Number(dv.getBigInt64(p, true)); p += 8; return v; },
    12: () => { need(8); const v = dv.getFloat64(p, true); p += 8; return v; },
  };
  const value = (t) => {
    if (t === 8) return str();
    if (t === 9) { const at = u32(), n = u64(); const a = new Array(n); for (let i = 0; i < n; i++) a[i] = value(at); return a; }
    const f = scalar[t];
    if (!f) throw new Error(`GGUF: unknown value type ${t}`);
    return f();
  };
  need(4);
  if (dec.decode(u8.subarray(0, 4)) !== 'GGUF') throw new Error('not a GGUF file');
  p = 4;
  const version = u32(), nTensors = u64(), nKv = u64();
  const kv = {};
  for (let i = 0; i < nKv; i++) { const k = str(); kv[k] = value(u32()); }
  const tensors = [];
  for (let i = 0; i < nTensors; i++) {
    const name = str(), nd = u32(), dims = [];
    for (let d = 0; d < nd; d++) dims.push(u64());
    const type = u32(), offset = u64();
    tensors.push({ name, dims, type, offset });
  }
  const align = kv['general.alignment'] || 32;
  const dataStart = Math.ceil(p / align) * align;
  return { version, kv, tensors, headerBytes: p, dataStart };
}

export function tensorBytes(t) {
  const n = t.dims.reduce((a, b) => a * b, 1);
  if (t.type === GGML.F32) return n * 4;
  if (t.type === GGML.F16) return n * 2;
  if (t.type === GGML.Q8_0) return (n / 32) * Q8_BLOCK;
  throw new Error(`unsupported tensor type ${t.type} (${t.name})`);
}

export function configFromGguf(kv) {
  const a = kv['general.architecture'];
  if (a !== 'qwen3moe') throw new Error(`expected a qwen3moe GGUF, got ${a}`);
  const g = (k) => kv[`${a}.${k}`];
  return {
    arch: a,
    layers: g('block_count'), hidden: g('embedding_length'),
    heads: g('attention.head_count'), kvHeads: g('attention.head_count_kv'),
    headDim: g('attention.key_length') || g('embedding_length') / g('attention.head_count'),
    experts: g('expert_count'), topK: g('expert_used_count'), expertFf: g('expert_feed_forward_length'),
    ropeTheta: g('rope.freq_base'), eps: g('attention.layer_norm_rms_epsilon'),
    contextLength: g('context_length'),
    vocab: kv['tokenizer.ggml.tokens'].length,
    bos: kv['tokenizer.ggml.bos_token_id'], eos: kv['tokenizer.ggml.eos_token_id'],
  };
}

// The engine's OPFS layout, derived from the header alone (ingest and load agree on it).
export function planLayout(gguf) {
  const cfg = configFromGguf(gguf.kv);
  const H = cfg.hidden, F = cfg.expertFf;
  const qBytes = F * H;                  // one projection's int8 plane
  const sBytes = (F * H / 32) * 2;       // its f16 scale plane
  const parts = {
    guQ: { off: 0, bytes: 2 * qBytes },               // gate rows 0..F-1, up rows F..2F-1
    guS: { off: 2 * qBytes, bytes: 2 * sBytes },
    dQ: { off: 2 * qBytes + 2 * sBytes, bytes: qBytes },
    dS: { off: 3 * qBytes + 2 * sBytes, bytes: sBytes },
  };
  const record = 3 * qBytes + 3 * sBytes;
  const dense = {};
  let off = 0;
  const take = (n) => { const o = off; off += Math.ceil(n / 256) * 256; return o; };
  for (const t of gguf.tensors) {
    if (/_exps\.weight$/.test(t.name)) continue;
    const n = t.dims.reduce((a, b) => a * b, 1);
    if (t.type === GGML.Q8_0) {
      dense[t.name] = { type: 'q8', dims: t.dims, q: { off: take(n), bytes: n }, s: { off: take(n / 16), bytes: n / 16 } };
    } else if (t.type === GGML.F32) {
      dense[t.name] = { type: 'f32', dims: t.dims, raw: { off: take(n * 4), bytes: n * 4 } };
    } else throw new Error(`dense tensor ${t.name}: unsupported type ${t.type}`);
  }
  return {
    config: cfg,
    experts: { file: 'experts.bin', record, parts, layers: cfg.layers, perLayer: cfg.experts, bytes: record * cfg.layers * cfg.experts },
    dense: { file: 'dense.bin', bytes: off, tensors: dense },
  };
}

// Q8_0 blocks → an int8 plane + an f16-scale plane, bit-exact. `src` holds whole blocks and
// starts at an even byte offset, so both planes copy as u16 lanes.
function splitQ8(src, q, s) {
  const nb = src.byteLength / Q8_BLOCK;
  const a = new Uint16Array(src.buffer, src.byteOffset, nb * 17);
  const qd = new Uint16Array(q.buffer, q.byteOffset, nb * 16);
  const sd = new Uint16Array(s.buffer, s.byteOffset, nb);
  for (let b = 0, i = 0, o = 0; b < nb; b++, i += 17, o += 16) {
    sd[b] = a[i];
    qd[o] = a[i + 1]; qd[o + 1] = a[i + 2]; qd[o + 2] = a[i + 3]; qd[o + 3] = a[i + 4];
    qd[o + 4] = a[i + 5]; qd[o + 5] = a[i + 6]; qd[o + 6] = a[i + 7]; qd[o + 7] = a[i + 8];
    qd[o + 8] = a[i + 9]; qd[o + 9] = a[i + 10]; qd[o + 10] = a[i + 11]; qd[o + 11] = a[i + 12];
    qd[o + 12] = a[i + 13]; qd[o + 13] = a[i + 14]; qd[o + 14] = a[i + 15]; qd[o + 15] = a[i + 16];
  }
}

// ── Ingest: GGUF (over HTTP Range) → OPFS, in the engine layout ─────────────
const keyOf = (file) => file.replace(/\.gguf$/i, '').toLowerCase().replace(/[^a-z0-9._-]+/g, '-');

async function readHeader(url, fetchFn, signal) {
  let n = 16 << 20;
  for (;;) {
    const r = await fetchFn(url, { headers: { Range: `bytes=0-${n - 1}` }, signal, cache: 'no-store' });
    if (!r.ok) throw new Error(`GGUF header fetch: HTTP ${r.status}`);
    const u8 = new Uint8Array(await r.arrayBuffer());
    try { return { gguf: parseGguf(u8), bytes: u8 }; } catch (e) { if (!e.needBytes) throw e; n = e.needBytes; }
  }
}

// Every byte range of the GGUF the engine keeps, as units small enough to transform in
// memory: one unit per expert slice, row bands for dense Q8_0, whole F32 tensors.
function planUnits(gguf, layout) {
  const units = [];
  const { record, parts, perLayer } = layout.experts;
  const qBytes = parts.dQ.bytes, sBytes = parts.dS.bytes;
  for (const t of gguf.tensors) {
    const abs = gguf.dataStart + t.offset;
    const m = /^blk\.(\d+)\.ffn_(gate|up|down)_exps\.weight$/.exec(t.name);
    if (m) {
      const layer = Number(m[1]), which = m[2];
      if (t.type !== GGML.Q8_0) throw new Error(`${t.name}: experts must be Q8_0`);
      const slice = tensorBytes(t) / perLayer;
      const qOff = which === 'gate' ? parts.guQ.off : which === 'up' ? parts.guQ.off + qBytes : parts.dQ.off;
      const sOff = which === 'gate' ? parts.guS.off : which === 'up' ? parts.guS.off + sBytes : parts.dS.off;
      for (let e = 0; e < perLayer; e++) {
        const rec = (layer * perLayer + e) * record;
        units.push({ src: abs + e * slice, len: slice, file: 'experts', q: rec + qOff, s: rec + sOff });
      }
      continue;
    }
    const d = layout.dense.tensors[t.name];
    if (d.type === 'f32') { units.push({ src: abs, len: d.raw.bytes, file: 'dense', raw: d.raw.off }); continue; }
    const cols = t.dims[0], rows = d.q.bytes / cols, rowBytes = (cols / 32) * Q8_BLOCK;
    const band = Math.max(1, Math.floor((8 << 20) / rowBytes));
    for (let r = 0; r < rows; r += band) {
      const nr = Math.min(band, rows - r);
      units.push({ src: abs + r * rowBytes, len: nr * rowBytes, file: 'dense', q: d.q.off + r * cols, s: d.s.off + r * cols / 16 });
    }
  }
  units.sort((a, b) => a.src - b.src);
  return units;
}

export async function ingestGguf({ url, key, fetch: fetchFn = fetch, onProgress = () => {}, signal, source = {} }) {
  const t0 = performance.now();
  const { gguf, bytes: headerBuf } = await readHeader(url, fetchFn, signal);
  const layout = planLayout(gguf);
  const dir = `${OPFS_ROOT}/${key}`;
  const est = navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate() : {};
  const persisted = navigator.storage && navigator.storage.persist ? await navigator.storage.persist().catch(() => false) : false;
  const needed = layout.experts.bytes + layout.dense.bytes;
  onProgress({ status: 'ingest-plan', needed, quota: est.quota, usage: est.usage, persisted });
  const quotaLog = [{ written: 0, quota: est.quota, usage: est.usage }];
  await writeOpfsText(`${dir}/manifest.json`, JSON.stringify({ format: FORMAT, complete: false }));
  // Header bytes, for the tokenizer and metadata at every later load.
  const hw = await OpfsWriter.open(`${dir}/header.bin`, { truncate: true });
  await hw.write(headerBuf.subarray(0, gguf.dataStart), 0);
  await hw.close();

  const units = planUnits(gguf, layout);
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
    const nb = u.len / Q8_BLOCK;
    const qb = getBuf(nb * 32), sb = getBuf(nb * 2);
    splitQ8(src, new Uint8Array(qb, 0, nb * 32), new Uint8Array(sb, 0, nb * 2));
    await queue(w, qb, nb * 32, u.q);
    await queue(w, sb, nb * 2, u.s);
    written += nb * 34;
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
    format: FORMAT, complete: true, ingestedAt: new Date().toISOString(),
    source: { url, ...source, dataStart: gguf.dataStart, headerBytes: gguf.headerBytes },
    ingestSecs: (performance.now() - t0) / 1000, quotaBefore: est.quota, persisted, quotaLog,
    ...layout,
  };
  await writeOpfsText(`${dir}/manifest.json`, JSON.stringify(manifest));
  return manifest;
}

// ── Tokenizer: byte-level BPE from the GGUF vocab (tokenizer.ggml.model = gpt2, pre = qwen2) ──
// Same pre-tokenizer regex llama.cpp uses for LLAMA_VOCAB_PRE_TYPE_QWEN2.
const QWEN2_PRE = /(?:'[sS]|'[tT]|'[rR][eE]|'[vV][eE]|'[mM]|'[lL][lL]|'[dD])|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s*[\r\n]+|\s+(?!\S)|\s+/gu;

function byteToUnicode() {
  const bs = [];
  for (let i = 33; i <= 126; i++) bs.push(i);
  for (let i = 161; i <= 172; i++) bs.push(i);
  for (let i = 174; i <= 255; i++) bs.push(i);
  const cs = bs.slice();
  let n = 0;
  for (let b = 0; b < 256; b++) if (!bs.includes(b)) { bs.push(b); cs.push(256 + n); n++; }
  const enc = new Array(256), dec = new Map();
  bs.forEach((b, i) => { enc[b] = String.fromCodePoint(cs[i]); dec.set(String.fromCodePoint(cs[i]), b); });
  return { enc, dec };
}

export class BpeTokenizer {
  constructor(kv) {
    this.tokens = kv['tokenizer.ggml.tokens'];
    const types = kv['tokenizer.ggml.token_type'] || [];
    this.ids = new Map(this.tokens.map((t, i) => [t, i]));
    this.ranks = new Map((kv['tokenizer.ggml.merges'] || []).map((m, i) => [m, i]));
    this.special = [];
    this.isSpecial = new Uint8Array(this.tokens.length);
    for (let i = 0; i < this.tokens.length; i++) if (types[i] === 3 || types[i] === 4) { this.special.push(this.tokens[i]); this.isSpecial[i] = 1; }
    this.special.sort((a, b) => b.length - a.length);
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    this.specialRe = this.special.length ? new RegExp(`(${this.special.map(esc).join('|')})`) : null;
    const { enc, dec } = byteToUnicode();
    this.byteEnc = enc; this.byteDec = dec;
    this.cache = new Map();
    this.utf8 = new TextEncoder();
  }
  bpe(word) {
    const hit = this.cache.get(word);
    if (hit) return hit;
    let parts = Array.from(word);
    while (parts.length > 1) {
      let best = -1, bestRank = Infinity;
      for (let i = 0; i < parts.length - 1; i++) {
        const r = this.ranks.get(parts[i] + ' ' + parts[i + 1]);
        if (r !== undefined && r < bestRank) { bestRank = r; best = i; }
      }
      if (best < 0) break;
      parts = [...parts.slice(0, best), parts[best] + parts[best + 1], ...parts.slice(best + 2)];
    }
    const ids = parts.map((p) => {
      const id = this.ids.get(p);
      if (id === undefined) throw new Error(`BPE: no token for ${JSON.stringify(p)}`);
      return id;
    });
    if (this.cache.size < 50000) this.cache.set(word, ids);
    return ids;
  }
  // parseSpecial: special-token text (e.g. <|im_start|>) maps to its single id.
  encode(text, { parseSpecial = true } = {}) {
    const out = [];
    const pieces = parseSpecial && this.specialRe ? text.split(this.specialRe) : [text];
    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      if (!piece) continue;
      if (parseSpecial && i % 2 === 1) { out.push(this.ids.get(piece)); continue; }
      for (const m of piece.matchAll(QWEN2_PRE)) {
        let s = '';
        for (const b of this.utf8.encode(m[0])) s += this.byteEnc[b];
        out.push(...this.bpe(s));
      }
    }
    return out;
  }
  tokenBytes(id) {
    const t = this.tokens[id];
    if (this.isSpecial[id]) return this.utf8.encode(t);
    const bytes = [];
    for (const ch of t) { const b = this.byteDec.get(ch); if (b !== undefined) bytes.push(b); }
    return Uint8Array.from(bytes);
  }
  decode(ids) {
    const chunks = ids.map((id) => this.tokenBytes(id));
    const n = chunks.reduce((a, c) => a + c.length, 0), all = new Uint8Array(n);
    let o = 0; for (const c of chunks) { all.set(c, o); o += c.length; }
    return new TextDecoder().decode(all);
  }
}

export function chatPrompt(messages, { enableThinking = true } = {}) {
  let s = '';
  for (const m of messages) s += `<|im_start|>${m.role}\n${m.content}<|im_end|>\n`;
  s += '<|im_start|>assistant\n';
  if (!enableThinking) s += '<think>\n\n</think>\n\n';
  return s;
}

// ── WGSL ────────────────────────────────────────────────────────────────────
// Activations f32 throughout; Q8_0 weights as an int8 plane (u32-packed) + an f16 scale per
// 32 values, dequantized exactly in f32 inside the GEMV; KV cache f16 (llama.cpp's default).
const TOK = 'struct Tok { token: u32, pos: u32, seqLen: u32, pad: u32 }';
const I8 = `fn i8at(w: u32, lane: u32) -> f32 { let b = (w >> (lane * 8u)) & 0xffu; return f32(select(i32(b), i32(b) - 256, b >= 128u)); }`;
const WGSL = {
  embedQ8: `enable f16;
${TOK}
struct P { n: u32 }
@group(0) @binding(0) var<storage, read> q: array<u32>;
@group(0) @binding(1) var<storage, read> s: array<f16>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@group(0) @binding(3) var<uniform> tok: Tok;
@group(0) @binding(4) var<uniform> p: P;
${I8}
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; if (i >= p.n) { return; }
  let e = tok.token * p.n + i;
  y[i] = i8at(q[e >> 2u], e & 3u) * f32(s[e >> 5u]);
}`,
  rmsnorm: `
struct P { n: u32, eps: f32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256) fn main(@builtin(local_invocation_id) l: vec3<u32>) {
  let t = l.x; var acc = 0.0;
  for (var i = t; i < p.n; i += 256u) { let v = x[i]; acc += v * v; }
  red[t] = acc; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  let scale = 1.0 / sqrt(red[0] / f32(p.n) + p.eps);
  for (var i = t; i < p.n; i += 256u) { y[i] = (x[i] * scale) * w[i]; }
}`,
  // 4 output rows per workgroup; input read once per k. Dispatch ceil(M/4) workgroups (2-D ok).
  matmulQ8: `enable f16;
struct P { M: u32, N: u32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> qw: array<u32>;
@group(0) @binding(2) var<storage, read> qs: array<f16>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
${I8}
var<workgroup> part: array<f32, 1024>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let m0 = (wg.y * ng.x + wg.x) * 4u; let t = l.x; let N = p.N; let M = p.M; let nb = N / 32u;
  if (m0 >= M) { return; }
  let r0 = min(m0, M - 1u); let r1 = min(m0 + 1u, M - 1u); let r2 = min(m0 + 2u, M - 1u); let r3 = min(m0 + 3u, M - 1u);
  let q0 = (r0 * N) >> 2u; let q1 = (r1 * N) >> 2u; let q2 = (r2 * N) >> 2u; let q3 = (r3 * N) >> 2u;
  var a0 = 0.0; var a1 = 0.0; var a2 = 0.0; var a3 = 0.0;
  for (var k = t; k < N; k += 256u) {
    let xv = x[k]; let wi = k >> 2u; let ln = k & 3u; let b = k >> 5u;
    a0 += i8at(qw[q0 + wi], ln) * f32(qs[r0 * nb + b]) * xv;
    a1 += i8at(qw[q1 + wi], ln) * f32(qs[r1 * nb + b]) * xv;
    a2 += i8at(qw[q2 + wi], ln) * f32(qs[r2 * nb + b]) * xv;
    a3 += i8at(qw[q3 + wi], ln) * f32(qs[r3 * nb + b]) * xv;
  }
  part[t] = a0; part[256u + t] = a1; part[512u + t] = a2; part[768u + t] = a3;
  workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) {
    if (t < s) { part[t] += part[t + s]; part[256u + t] += part[256u + t + s]; part[512u + t] += part[512u + t + s]; part[768u + t] += part[768u + t + s]; }
    workgroupBarrier();
  }
  if (t < 4u && m0 + t < M) { y[m0 + t] = part[t * 256u]; }
}`,
  matmulF32: `
struct P { M: u32, N: u32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let m = wg.x; let t = l.x; var acc = 0.0;
  for (var k = t; k < p.N; k += 256u) { acc += w[m * p.N + k] * x[k]; }
  red[t] = acc; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  if (t == 0u) { y[m] = red[0]; }
}`,
  // Per-head RMSNorm (QK-norm) then NeoX RoPE (pairs i, i+hd/2), in place. One workgroup per head.
  // rope[0..hd/2) = cos, rope[hd/2..hd) = sin for this token's position (computed on the CPU).
  qkNormRope: `
struct P { hd: u32, eps: f32 }
@group(0) @binding(0) var<storage, read_write> x: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read> rope: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
var<workgroup> red: array<f32, 64>;
@compute @workgroup_size(64) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let base = wg.x * p.hd; let t = l.x; let half = p.hd / 2u;
  var acc = 0.0;
  for (var i = t; i < p.hd; i += 64u) { let v = x[base + i]; acc += v * v; }
  red[t] = acc; workgroupBarrier();
  for (var s = 32u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  let scale = 1.0 / sqrt(red[0] / f32(p.hd) + p.eps);
  for (var i = t; i < half; i += 64u) {
    let a = (x[base + i] * scale) * w[i];
    let b = (x[base + i + half] * scale) * w[i + half];
    let c = rope[i]; let sn = rope[half + i];
    x[base + i] = a * c - b * sn;
    x[base + i + half] = a * sn + b * c;
  }
}`,
  kvStore: `enable f16;
${TOK}
struct P { n: u32 }
@group(0) @binding(0) var<storage, read> k: array<f32>;
@group(0) @binding(1) var<storage, read> v: array<f32>;
@group(0) @binding(2) var<storage, read_write> kc: array<f16>;
@group(0) @binding(3) var<storage, read_write> vc: array<f16>;
@group(0) @binding(4) var<uniform> tok: Tok;
@group(0) @binding(5) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; if (i >= p.n) { return; }
  kc[tok.pos * p.n + i] = f16(k[i]);
  vc[tok.pos * p.n + i] = f16(v[i]);
}`,
  attnScore: `enable f16;
${TOK}
struct P { heads: u32, kvHeads: u32, hd: u32, scale: f32 }
@group(0) @binding(0) var<storage, read> q: array<f32>;
@group(0) @binding(1) var<storage, read> kc: array<f16>;
@group(0) @binding(2) var<storage, read_write> sc: array<f32>;
@group(0) @binding(3) var<uniform> tok: Tok;
@group(0) @binding(4) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let n = tok.seqLen; let idx = g.x; if (idx >= p.heads * n) { return; }
  let h = idx / n; let pos = idx % n; let kvh = h / (p.heads / p.kvHeads);
  let qo = h * p.hd; let ko = pos * p.kvHeads * p.hd + kvh * p.hd;
  var acc = 0.0;
  for (var d = 0u; d < p.hd; d++) { acc += q[qo + d] * f32(kc[ko + d]); }
  sc[h * n + pos] = acc * p.scale;
}`,
  softmax: `
${TOK}
@group(0) @binding(0) var<storage, read_write> sc: array<f32>;
@group(0) @binding(1) var<uniform> tok: Tok;
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let n = tok.seqLen; let base = wg.x * n; let t = l.x;
  var mx = -3.4e38;
  for (var i = t; i < n; i += 256u) { mx = max(mx, sc[base + i]); }
  red[t] = mx; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] = max(red[t], red[t + s]); } workgroupBarrier(); }
  let m = red[0]; workgroupBarrier();
  var sum = 0.0;
  for (var i = t; i < n; i += 256u) { let e = exp(sc[base + i] - m); sc[base + i] = e; sum += e; }
  red[t] = sum; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  let inv = 1.0 / red[0];
  for (var i = t; i < n; i += 256u) { sc[base + i] = sc[base + i] * inv; }
}`,
  attnOut: `enable f16;
${TOK}
struct P { heads: u32, kvHeads: u32, hd: u32, pad: u32 }
@group(0) @binding(0) var<storage, read> pr: array<f32>;
@group(0) @binding(1) var<storage, read> vc: array<f16>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@group(0) @binding(3) var<uniform> tok: Tok;
@group(0) @binding(4) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let idx = g.x; if (idx >= p.heads * p.hd) { return; }
  let n = tok.seqLen; let h = idx / p.hd; let d = idx % p.hd; let kvh = h / (p.heads / p.kvHeads);
  let stride = p.kvHeads * p.hd;
  var acc = 0.0;
  for (var pos = 0u; pos < n; pos++) { acc += pr[h * n + pos] * f32(vc[pos * stride + kvh * p.hd + d]); }
  y[idx] = acc;
}`,
  addInPlace: `
struct P { n: u32 }
@group(0) @binding(0) var<storage, read_write> x: array<f32>;
@group(0) @binding(1) var<storage, read> y: array<f32>;
@group(0) @binding(2) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; if (i < p.n) { x[i] = x[i] + y[i]; }
}`,
  // Router: softmax over n logits, greedy top-k (ties → lowest index), weights renormalized to
  // sum 1 (Qwen3-MoE norm_topk_prob). sel = k ids then k f32 weights (bitcast). One workgroup.
  topk: `
struct P { n: u32, k: u32 }
@group(0) @binding(0) var<storage, read> lg: array<f32>;
@group(0) @binding(1) var<storage, read_write> sel: array<u32>;
@group(0) @binding(2) var<uniform> p: P;
var<workgroup> red: array<f32, 256>;
var<workgroup> gmax: f32;
var<workgroup> gsum: f32;
@compute @workgroup_size(256) fn main(@builtin(local_invocation_id) l: vec3<u32>) {
  let t = l.x; let n = p.n;
  red[t] = select(-3.4e38, lg[min(t, n - 1u)], t < n); workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] = max(red[t], red[t + s]); } workgroupBarrier(); }
  if (t == 0u) { gmax = red[0]; } workgroupBarrier();
  red[t] = select(0.0, exp(lg[min(t, n - 1u)] - gmax), t < n); workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  if (t == 0u) { gsum = red[0]; } workgroupBarrier();
  if (t == 0u) {
    var taken: array<bool, 256>;
    for (var i = 0u; i < n; i++) { taken[i] = false; }
    var wsum = 0.0;
    for (var j = 0u; j < p.k; j++) {
      var best = -1.0; var bi = 0u;
      for (var i = 0u; i < n; i++) { if (!taken[i]) { let pr = exp(lg[i] - gmax) / gsum; if (pr > best) { best = pr; bi = i; } } }
      taken[bi] = true; sel[j] = bi; sel[p.k + j] = bitcast<u32>(best); wsum += best;
    }
    for (var j = 0u; j < p.k; j++) { sel[p.k + j] = bitcast<u32>(bitcast<f32>(sel[p.k + j]) / wsum); }
  }
}`,
  // Routed experts, all k at once: workgroup z = top-k position, slot = slots[z] picks the
  // expert's rows in the pool buffer (rows_per_expert per slot). Input is shared (gate/up) or
  // per-position (down). Output region z × M.
  expertQ8: `enable f16;
struct P { M: u32, N: u32, rowsPerExpert: u32, inputPerSlot: u32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> qw: array<u32>;
@group(0) @binding(2) var<storage, read> qs: array<f16>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@group(0) @binding(5) var<storage, read> slots: array<u32>;
${I8}
var<workgroup> part: array<f32, 1024>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let z = wg.z; let m0 = (wg.y * ng.x + wg.x) * 4u; let t = l.x; let N = p.N; let M = p.M; let nb = N / 32u;
  if (m0 >= M) { return; }
  let rb = slots[z] * p.rowsPerExpert;
  let xb = select(0u, z * N, p.inputPerSlot == 1u);
  let r0 = rb + min(m0, M - 1u); let r1 = rb + min(m0 + 1u, M - 1u); let r2 = rb + min(m0 + 2u, M - 1u); let r3 = rb + min(m0 + 3u, M - 1u);
  let q0 = (r0 * N) >> 2u; let q1 = (r1 * N) >> 2u; let q2 = (r2 * N) >> 2u; let q3 = (r3 * N) >> 2u;
  var a0 = 0.0; var a1 = 0.0; var a2 = 0.0; var a3 = 0.0;
  for (var k = t; k < N; k += 256u) {
    let xv = x[xb + k]; let wi = k >> 2u; let ln = k & 3u; let b = k >> 5u;
    a0 += i8at(qw[q0 + wi], ln) * f32(qs[r0 * nb + b]) * xv;
    a1 += i8at(qw[q1 + wi], ln) * f32(qs[r1 * nb + b]) * xv;
    a2 += i8at(qw[q2 + wi], ln) * f32(qs[r2 * nb + b]) * xv;
    a3 += i8at(qw[q3 + wi], ln) * f32(qs[r3 * nb + b]) * xv;
  }
  part[t] = a0; part[256u + t] = a1; part[512u + t] = a2; part[768u + t] = a3;
  workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) {
    if (t < s) { part[t] += part[t + s]; part[256u + t] += part[256u + t + s]; part[512u + t] += part[512u + t + s]; part[768u + t] += part[768u + t + s]; }
    workgroupBarrier();
  }
  if (t < 4u && m0 + t < M) { y[z * M + m0 + t] = part[t * 256u]; }
}`,
  // gu = k × [gate F | up F] → act = k × F of SiLU(gate)·up.
  siluMulMoe: `
struct P { F: u32, k: u32 }
@group(0) @binding(0) var<storage, read> gu: array<f32>;
@group(0) @binding(1) var<storage, read_write> act: array<f32>;
@group(0) @binding(2) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; if (i >= p.k * p.F) { return; }
  let z = i / p.F; let j = i % p.F; let g0 = gu[z * 2u * p.F + j];
  act[i] = (g0 / (1.0 + exp(-g0))) * gu[z * 2u * p.F + p.F + j];
}`,
  // x[h] += Σ_j w_j · out[j·H + h]   (the expert sum, then the residual add — llama.cpp's order)
  moeAccum: `
struct P { H: u32, k: u32 }
@group(0) @binding(0) var<storage, read> out: array<f32>;
@group(0) @binding(1) var<storage, read> sel: array<u32>;
@group(0) @binding(2) var<storage, read_write> x: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let h = g.x; if (h >= p.H) { return; }
  var acc = 0.0;
  for (var j = 0u; j < p.k; j++) { acc += bitcast<f32>(sel[p.k + j]) * out[j * p.H + h]; }
  x[h] = x[h] + acc;
}`,
  argmax: `
struct P { n: u32 }
@group(0) @binding(0) var<storage, read> lg: array<f32>;
@group(0) @binding(1) var<storage, read_write> res: array<u32>;
@group(0) @binding(2) var<uniform> p: P;
var<workgroup> bv: array<f32, 256>;
var<workgroup> bi: array<u32, 256>;
@compute @workgroup_size(256) fn main(@builtin(local_invocation_id) l: vec3<u32>) {
  let t = l.x; var v = -3.4e38; var ix = 0u;
  for (var i = t; i < p.n; i += 256u) { let x = lg[i]; if (x > v) { v = x; ix = i; } }
  bv[t] = v; bi[t] = ix; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) {
    if (t < s) { let o = bv[t + s]; if (o > bv[t] || (o == bv[t] && bi[t + s] < bi[t])) { bv[t] = o; bi[t] = bi[t + s]; } }
    workgroupBarrier();
  }
  if (t == 0u) { res[0] = bi[0]; }
}`,
};

const STORAGE = 0x80, COPY_SRC = 0x04, COPY_DST = 0x08, UNIFORM = 0x40, MAP_READ = 0x01;

// ── Engine ──────────────────────────────────────────────────────────────────
export class Qwen3MoeSsd {
  static async load(modelId = QWEN3_30B_A3B.repo, opts = {}) {
    const { fetch: fetchFn = (u, i) => fetch(u, i), onProgress = () => {}, signal } = opts;
    const src = opts.source || (modelId === QWEN3_30B_A3B.repo || !modelId ? QWEN3_30B_A3B : { repo: modelId, file: opts.file, revision: opts.revision || 'main' });
    const url = opts.url || `https://huggingface.co/${src.repo}/resolve/${src.revision}/${src.file}`;
    const key = opts.key || keyOf(opts.file || src.file || url.split('/').pop());
    const dir = `${OPFS_ROOT}/${key}`;

    onProgress({ status: 'init' });
    if (!navigator.gpu) throw new Error('WebGPU is not available');
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) throw new Error('no WebGPU adapter');
    if (!adapter.features.has('shader-f16')) throw new Error('this GPU lacks shader-f16');
    const L = adapter.limits;
    const device = await adapter.requestDevice({
      requiredFeatures: ['shader-f16'],
      requiredLimits: { maxBufferSize: L.maxBufferSize, maxStorageBufferBindingSize: L.maxStorageBufferBindingSize, maxStorageBuffersPerShaderStage: L.maxStorageBuffersPerShaderStage, maxComputeWorkgroupsPerDimension: L.maxComputeWorkgroupsPerDimension },
    });
    device.lost.then((info) => console.warn('qwen3-moe-ssd: GPU device lost:', info.message));

    let manifest = null;
    try { manifest = JSON.parse(await readOpfsText(`${dir}/manifest.json`) || 'null'); } catch (_) { manifest = null; }
    if (opts.reingest || !manifest || !manifest.complete || manifest.format !== FORMAT) {
      manifest = await ingestGguf({
        url, key, fetch: fetchFn, signal, source: { repo: src.repo, file: src.file, revision: src.revision, sha256: src.sha256, size: src.size },
        onProgress: (e) => onProgress(e.status === 'ingest' ? { status: 'weights', loaded: e.loaded, total: e.total, ...e } : e),
      });
    }
    const headerFile = await (await (await navigator.storage.getDirectory()).getDirectoryHandle(OPFS_ROOT)).getDirectoryHandle(key);
    const headerBytes = new Uint8Array(await (await (await headerFile.getFileHandle('header.bin')).getFile()).arrayBuffer());
    const gguf = parseGguf(headerBytes);
    const engine = new Qwen3MoeSsd(device, manifest, gguf, { ...opts, dir, key, url });
    await engine.init(onProgress);
    return engine;
  }

  constructor(device, manifest, gguf, opts) {
    this.device = device;
    this.manifest = manifest;
    this.cfg = configFromGguf(gguf.kv);
    this.tokenizer = new BpeTokenizer(gguf.kv);
    this.opts = opts;
    this.maxCtx = Math.min(opts.maxCtx || 4096, this.cfg.contextLength);
    this.gpuBytes = { dense: 0, pool: 0, kv: 0, act: 0 };
    this.pipelines = {};
    this.position = 0;
    this.cached = [];          // token ids whose K/V are in the cache, in order
    this.prefetch = !!opts.prefetch;
    this.resetCounters();
  }

  buffer(size, usage, cat = 'act') {
    const b = this.device.createBuffer({ size: Math.ceil(size / 4) * 4, usage });
    this.gpuBytes[cat] = (this.gpuBytes[cat] || 0) + b.size;
    return b;
  }
  uniform(words) {
    const b = this.buffer(Math.max(16, words.length * 4), UNIFORM | COPY_DST, 'act');
    const ab = new ArrayBuffer(b.size), u = new Uint32Array(ab), f = new Float32Array(ab);
    words.forEach((w, i) => { if (typeof w === 'object') f[i] = w.f; else u[i] = w; });
    this.device.queue.writeBuffer(b, 0, ab);
    return b;
  }
  pipeline(name) {
    if (!this.pipelines[name]) {
      const module = this.device.createShaderModule({ code: WGSL[name], label: name });
      this.pipelines[name] = this.device.createComputePipeline({ layout: 'auto', compute: { module, entryPoint: 'main' }, label: name });
    }
    return this.pipelines[name];
  }
  bind(name, buffers) {
    return this.device.createBindGroup({
      layout: this.pipeline(name).getBindGroupLayout(0),
      entries: buffers.map((b, i) => ({ binding: i, resource: { buffer: b } })),
    });
  }

  async init(onProgress) {
    const c = this.cfg, dev = this.device, m = this.manifest;
    // Fail early on a shader that does not compile.
    dev.pushErrorScope('validation');
    for (const k of Object.keys(WGSL)) this.pipeline(k);
    const err = await dev.popErrorScope();
    if (err) throw new Error(`WGSL: ${err.message}`);

    // Dense weights: OPFS → GPU.
    const t0 = performance.now();
    const reader = await OpfsReaderPool.open(`${this.opts.dir}/${m.dense.file}`, { workers: 4 });
    const names = Object.keys(m.dense.tensors);
    this.w = {};
    let doneT = 0;
    const CH = 64 << 20;
    const upload = async (gbuf, part) => {
      for (let o = 0; o < part.bytes; o += CH) {
        const n = Math.min(CH, part.bytes - o);
        const r = await reader.read(part.off + o, n);
        if (r.got !== n) throw new Error(`dense read short at ${part.off + o}`);
        dev.queue.writeBuffer(gbuf, o, r.buf, 0, n);
      }
    };
    const queue = [];
    for (const name of names) {
      const d = m.dense.tensors[name];
      if (d.type === 'q8') {
        const q = this.buffer(d.q.bytes, STORAGE | COPY_DST, 'dense'), s = this.buffer(d.s.bytes, STORAGE | COPY_DST, 'dense');
        this.w[name] = { q, s, rows: d.q.bytes / d.dims[0], cols: d.dims[0] };
        queue.push(() => upload(q, d.q), () => upload(s, d.s));
      } else {
        const raw = this.buffer(d.raw.bytes, STORAGE | COPY_DST, 'dense');
        this.w[name] = { raw };
        queue.push(() => upload(raw, d.raw));
      }
    }
    let qi = 0;
    await Promise.all([0, 1, 2, 3].map(async () => {
      while (qi < queue.length) { await queue[qi++](); doneT++; onProgress({ status: 'weights', kind: 'tensors', loaded: doneT, total: queue.length }); }
    }));
    await reader.close();
    await dev.queue.onSubmittedWorkDone();
    this.denseUploadSecs = (performance.now() - t0) / 1000;

    // Expert slot pool + the streamer that feeds it.
    const xp = m.experts;
    const maxSlotsByBinding = Math.floor(dev.limits.maxStorageBufferBindingSize / xp.parts.guQ.bytes);
    this.poolSlots = Math.max(c.topK * 2, Math.min(maxSlotsByBinding, Math.floor((this.opts.poolBytes || 4 * 2 ** 30) / xp.record), c.layers * c.experts));
    this.pool = {};
    for (const [k, part] of Object.entries(xp.parts)) this.pool[k] = this.buffer(this.poolSlots * part.bytes, STORAGE | COPY_DST, 'pool');
    this.expertReader = await OpfsReaderPool.open(`${this.opts.dir}/${xp.file}`, { workers: this.opts.readers || 4 });
    this.xs = new ExpertStreamer({
      device: dev, reader: this.expertReader, recordBytes: xp.record,
      recordOffset: (layer, e) => (layer * xp.perLayer + e) * xp.record,
      parts: ['guQ', 'guS', 'dQ', 'dS'].map((k) => ({ buffer: this.pool[k], srcOffset: xp.parts[k].off, bytes: xp.parts[k].bytes })),
      slots: this.poolSlots, numLayers: c.layers, numExperts: c.experts,
      ...(this.opts.uploadRing !== undefined ? { uploadRing: this.opts.uploadRing } : {}),
      ...(this.opts.evict ? { evict: this.opts.evict, hotHalfLife: this.opts.hotHalfLife } : {}),
    });
    this.gpuBytes.staging = this.xs.ringBytes();

    // KV cache (f16) and activations.
    const kvn = c.kvHeads * c.headDim;
    this.kc = []; this.vc = [];
    for (let l = 0; l < c.layers; l++) {
      this.kc.push(this.buffer(this.maxCtx * kvn * 2, STORAGE, 'kv'));
      this.vc.push(this.buffer(this.maxCtx * kvn * 2, STORAGE, 'kv'));
    }
    const H = c.hidden, QN = c.heads * c.headDim, F = c.expertFf, K = c.topK;
    const A = (n) => this.buffer(n * 4, STORAGE | COPY_SRC | COPY_DST);
    this.a = {
      x: A(H), xn: A(H), q: A(QN), k: A(kvn), v: A(kvn), att: A(QN), o: A(H), sc: A(c.heads * this.maxCtx),
      rl: A(c.experts), sel: A(2 * K), pxn: A(H), prl: A(c.experts), psel: A(2 * K), slots: A(K),
      gu: A(K * 2 * F), act: A(K * F), dn: A(K * H), logits: A(c.vocab), am: A(4),
      rope: A(c.headDim),
    };
    this.tok = this.buffer(16, UNIFORM | COPY_DST);
    this.rbSel = this.buffer(4 * K * 4, MAP_READ | COPY_DST);
    this.rbLogits = this.buffer(c.vocab * 4, MAP_READ | COPY_DST);
    this.rbArg = this.buffer(16, MAP_READ | COPY_DST);

    const u = {
      nH: this.uniform([H]), rmsH: this.uniform([H, { f: c.eps }]), mmQ: this.uniform([QN, H]), mmKV: this.uniform([kvn, H]),
      mmO: this.uniform([H, QN]), qk: this.uniform([c.headDim, { f: c.eps }]), kvn: this.uniform([kvn]),
      att: this.uniform([c.heads, c.kvHeads, c.headDim, { f: 1 / Math.sqrt(c.headDim) }]), attOut: this.uniform([c.heads, c.kvHeads, c.headDim, 0]),
      router: this.uniform([c.experts, H]), topk: this.uniform([c.experts, K]),
      gu: this.uniform([2 * F, H, 2 * F, 0]), dn: this.uniform([H, F, H, 1]), silu: this.uniform([F, K]), acc: this.uniform([H, K]),
      lm: this.uniform([c.vocab, H]), am: this.uniform([c.vocab]),
    };
    const a = this.a, W = this.w;
    this.g = { embed: this.bind('embedQ8', [W['token_embd.weight'].q, W['token_embd.weight'].s, a.x, this.tok, u.nH]) };
    this.layers = [];
    for (let l = 0; l < c.layers; l++) {
      const p = (n) => W[`blk.${l}.${n}.weight`];
      const next = l + 1 < c.layers ? (n) => W[`blk.${l + 1}.${n}.weight`] : null;
      this.layers.push({
        rmsA: this.bind('rmsnorm', [a.x, p('attn_norm').raw, a.xn, u.rmsH]),
        q: this.bind('matmulQ8', [a.xn, p('attn_q').q, p('attn_q').s, a.q, u.mmQ]),
        k: this.bind('matmulQ8', [a.xn, p('attn_k').q, p('attn_k').s, a.k, u.mmKV]),
        v: this.bind('matmulQ8', [a.xn, p('attn_v').q, p('attn_v').s, a.v, u.mmKV]),
        ropeQ: this.bind('qkNormRope', [a.q, p('attn_q_norm').raw, a.rope, u.qk]),
        ropeK: this.bind('qkNormRope', [a.k, p('attn_k_norm').raw, a.rope, u.qk]),
        kv: this.bind('kvStore', [a.k, a.v, this.kc[l], this.vc[l], this.tok, u.kvn]),
        score: this.bind('attnScore', [a.q, this.kc[l], a.sc, this.tok, u.att]),
        soft: this.bind('softmax', [a.sc, this.tok]),
        attOut: this.bind('attnOut', [a.sc, this.vc[l], a.att, this.tok, u.attOut]),
        o: this.bind('matmulQ8', [a.att, p('attn_output').q, p('attn_output').s, a.o, u.mmO]),
        addO: this.bind('addInPlace', [a.x, a.o, u.nH]),
        rmsF: this.bind('rmsnorm', [a.x, p('ffn_norm').raw, a.xn, u.rmsH]),
        router: this.bind('matmulF32', [a.xn, p('ffn_gate_inp').raw, a.rl, u.router]),
        topk: this.bind('topk', [a.rl, a.sel, u.topk]),
        // Next layer's router on this layer's post-attention state: the prefetch guess.
        pRms: next && this.bind('rmsnorm', [a.x, next('ffn_norm').raw, a.pxn, u.rmsH]),
        pRouter: next && this.bind('matmulF32', [a.pxn, next('ffn_gate_inp').raw, a.prl, u.router]),
        pTopk: next && this.bind('topk', [a.prl, a.psel, u.topk]),
        gu: this.bind('expertQ8', [a.xn, this.pool.guQ, this.pool.guS, a.gu, u.gu, a.slots]),
        silu: this.bind('siluMulMoe', [a.gu, a.act, u.silu]),
        dn: this.bind('expertQ8', [a.act, this.pool.dQ, this.pool.dS, a.dn, u.dn, a.slots]),
        acc: this.bind('moeAccum', [a.dn, a.sel, a.x, u.acc]),
      });
    }
    this.g.rmsOut = this.bind('rmsnorm', [a.x, W['output_norm.weight'].raw, a.xn, u.rmsH]);
    this.g.lm = this.bind('matmulQ8', [a.xn, W['output.weight'].q, W['output.weight'].s, a.logits, u.lm]);
    this.g.am = this.bind('argmax', [a.logits, a.am, u.am]);
    await dev.queue.onSubmittedWorkDone();
  }

  // ── forward ───────────────────────────────────────────────────────────────
  dispatch(pass, name, group, x, y = 1, z = 1) {
    pass.setPipeline(this.pipeline(name));
    pass.setBindGroup(0, group);
    if (x > 65535) { y = Math.ceil(x / 32768); x = 32768; }
    pass.dispatchWorkgroups(x, y, z);
  }
  encodeAttention(pass, l, seqLen) {
    const c = this.cfg, g = this.layers[l], d = (n, gr, x, y, z) => this.dispatch(pass, n, gr, x, y, z);
    const QN = c.heads * c.headDim, kvn = c.kvHeads * c.headDim;
    d('rmsnorm', g.rmsA, 1);
    d('matmulQ8', g.q, Math.ceil(QN / 4)); d('matmulQ8', g.k, Math.ceil(kvn / 4)); d('matmulQ8', g.v, Math.ceil(kvn / 4));
    d('qkNormRope', g.ropeQ, c.heads); d('qkNormRope', g.ropeK, c.kvHeads);
    d('kvStore', g.kv, Math.ceil(kvn / 256));
    d('attnScore', g.score, Math.ceil(c.heads * seqLen / 256));
    d('softmax', g.soft, c.heads);
    d('attnOut', g.attOut, Math.ceil(QN / 256));
    d('matmulQ8', g.o, Math.ceil(c.hidden / 4));
    d('addInPlace', g.addO, Math.ceil(c.hidden / 256));
    if (this.prefetch && g.pRms) { d('rmsnorm', g.pRms, 1); d('matmulF32', g.pRouter, c.experts); d('topk', g.pTopk, 1); }
    d('rmsnorm', g.rmsF, 1);
    d('matmulF32', g.router, c.experts);
    d('topk', g.topk, 1);
  }
  encodeExperts(pass, l) {
    const c = this.cfg, g = this.layers[l], d = (n, gr, x, y, z) => this.dispatch(pass, n, gr, x, y, z);
    d('expertQ8', g.gu, Math.ceil(2 * c.expertFf / 4), 1, c.topK);
    d('siluMulMoe', g.silu, Math.ceil(c.topK * c.expertFf / 256));
    d('expertQ8', g.dn, Math.ceil(c.hidden / 4), 1, c.topK);
    d('moeAccum', g.acc, Math.ceil(c.hidden / 256));
  }

  writeTokenUniforms(token, pos) {
    const c = this.cfg;
    this.device.queue.writeBuffer(this.tok, 0, new Uint32Array([token, pos, pos + 1, 0]));
    // NeoX RoPE angles the way llama.cpp's Metal kernel forms them: f32 pos × base^(-2i/hd).
    const half = c.headDim / 2, r = new Float32Array(c.headDim), inv = Math.fround(-1 / c.headDim);
    for (let i = 0; i < half; i++) {
      const th = Math.fround(pos * Math.fround(Math.pow(c.ropeTheta, Math.fround(inv * 2 * i))));
      r[i] = Math.cos(th); r[half + i] = Math.sin(th);
    }
    this.device.queue.writeBuffer(this.a.rope, 0, r);
  }

  resetCounters() {
    this.counters = { tokens: 0, gpuWaitMs: 0, ensureMs: 0, encodeMs: 0, wallMs: 0, predHits: 0, predTotal: 0 };
    if (this.xs) this.xs.resetStats();
  }

  async readSel(withPred) {
    const K = this.cfg.topK;
    const t0 = performance.now();
    await this.rbSel.mapAsync(1, 0, 16 * K);
    this.counters.gpuWaitMs += performance.now() - t0;
    const u = new Uint32Array(this.rbSel.getMappedRange(0, 16 * K).slice(0));
    this.rbSel.unmap();
    return { ids: u.subarray(0, K), pred: withPred ? u.subarray(2 * K, 3 * K) : null };
  }

  // One token through all layers at position this.position. want: 'none' | 'argmax' | 'logits'.
  async step(token, want = 'argmax') {
    const c = this.cfg, dev = this.device, K = c.topK;
    if (this.position >= this.maxCtx) throw new Error(`context full (${this.maxCtx} tokens)`);
    const tStart = performance.now();
    const pos = this.position, seqLen = pos + 1;
    this.writeTokenUniforms(token, pos);
    let te = performance.now();
    let enc = dev.createCommandEncoder(), pass = enc.beginComputePass();
    this.dispatch(pass, 'embedQ8', this.g.embed, Math.ceil(c.hidden / 256));
    this.encodeAttention(pass, 0, seqLen);
    pass.end();
    enc.copyBufferToBuffer(this.a.sel, 0, this.rbSel, 0, 8 * K);
    if (this.prefetch) enc.copyBufferToBuffer(this.a.psel, 0, this.rbSel, 8 * K, 8 * K);
    dev.queue.submit([enc.finish()]);
    this.counters.encodeMs += performance.now() - te;
    let predIds = null;
    for (let l = 0; l < c.layers; l++) {
      const { ids, pred } = await this.readSel(this.prefetch && l + 1 < c.layers);
      if (predIds) { // accuracy of the guess made one layer earlier
        let hit = 0; for (const e of ids) if (predIds.includes(e)) hit++;
        this.counters.predHits += hit; this.counters.predTotal += K;
      }
      const tq = performance.now();
      const ensuring = this.xs.ensure(l, ids);
      if (pred) { this.xs.prefetch(l + 1, pred); predIds = Array.from(pred); } else predIds = null;
      const slots = await ensuring;
      this.counters.ensureMs += performance.now() - tq;
      dev.queue.writeBuffer(this.a.slots, 0, slots);
      te = performance.now();
      enc = dev.createCommandEncoder(); pass = enc.beginComputePass();
      this.encodeExperts(pass, l);
      if (l + 1 < c.layers) {
        this.encodeAttention(pass, l + 1, seqLen);
        pass.end();
        enc.copyBufferToBuffer(this.a.sel, 0, this.rbSel, 0, 8 * K);
        if (this.prefetch && l + 2 < c.layers) enc.copyBufferToBuffer(this.a.psel, 0, this.rbSel, 8 * K, 8 * K);
      } else {
        if (want !== 'none') {
          this.dispatch(pass, 'rmsnorm', this.g.rmsOut, 1);
          this.dispatch(pass, 'matmulQ8', this.g.lm, Math.ceil(c.vocab / 4));
          if (want === 'argmax') this.dispatch(pass, 'argmax', this.g.am, 1);
        }
        pass.end();
        if (want === 'argmax') enc.copyBufferToBuffer(this.a.am, 0, this.rbArg, 0, 4);
        if (want === 'logits') enc.copyBufferToBuffer(this.a.logits, 0, this.rbLogits, 0, c.vocab * 4);
      }
      dev.queue.submit([enc.finish()]);
      this.counters.encodeMs += performance.now() - te;
      this.xs.release(slots);
    }
    this.position++;
    this.cached.push(token);
    let result = null;
    const tw = performance.now();
    if (want === 'argmax') {
      await this.rbArg.mapAsync(1, 0, 4);
      result = new Uint32Array(this.rbArg.getMappedRange(0, 4))[0];
      this.rbArg.unmap();
    } else if (want === 'logits') {
      await this.rbLogits.mapAsync(1);
      result = new Float32Array(this.rbLogits.getMappedRange().slice(0));
      this.rbLogits.unmap();
    } else {
      await dev.queue.onSubmittedWorkDone();
    }
    this.counters.gpuWaitMs += performance.now() - tw;
    this.counters.tokens++;
    this.counters.wallMs += performance.now() - tStart;
    return result;
  }

  reset() { this.position = 0; this.cached = []; }

  // Feeds `ids` after the cached prefix they share (re-prefilling only what changed); returns
  // the logits/argmax of the last token.
  async prefill(ids, want = 'argmax') {
    let common = 0;
    while (common < ids.length - 1 && common < this.cached.length && this.cached[common] === ids[common]) common++;
    if (common < this.cached.length) { this.position = common; this.cached.length = common; }
    let r = null;
    for (let i = common; i < ids.length; i++) r = await this.step(ids[i], i === ids.length - 1 ? want : 'none');
    return r;
  }

  // Diagnostics for the llama.cpp comparison: greedy continuation of raw token ids, with the
  // top-n logits at every generated position.
  async greedy(ids, n, { top = 5 } = {}) {
    this.reset();
    const out = [], tops = [];
    let logits = await this.prefill(ids, 'logits');
    for (let i = 0; i < n; i++) {
      const order = topN(logits, top);
      let mx = -Infinity, sum = 0;
      for (let j = 0; j < logits.length; j++) if (logits[j] > mx) mx = logits[j];
      for (let j = 0; j < logits.length; j++) sum += Math.exp(logits[j] - mx);
      const lse = mx + Math.log(sum);
      for (const o of order) o.logprob = o.logit - lse;
      tops.push(order);
      const next = order[0].id;
      out.push(next);
      if (i + 1 < n) logits = await this.step(next, 'logits');
    }
    return { ids: out, tops };
  }

  async *generate(messages, { maxNewTokens = 512, signal, enableThinking = true } = {}) {
    const ids = this.tokenizer.encode(chatPrompt(messages, { enableThinking }));
    const stops = new Set([this.cfg.eos, this.tokenizer.ids.get('<|im_end|>'), this.tokenizer.ids.get('<|endoftext|>')]);
    let next = await this.prefill(ids, 'argmax');
    const outIds = [];
    for (let i = 0; i < maxNewTokens; i++) {
      if (signal && signal.aborted) break;
      if (stops.has(next)) break;
      outIds.push(next);
      yield { text: this.tokenizer.decode(outIds), token: next, tokens: outIds.length };
      if (this.position >= this.maxCtx) break;
      next = await this.step(next, 'argmax');
    }
  }

  // Raw ids of the reasoning delimiters, for hosts that re-mark the thought block.
  get thinkOpenTokenId() { return this.tokenizer.ids.get('<think>') ?? null; }
  get thinkCloseTokenId() { return this.tokenizer.ids.get('</think>') ?? null; }

  stats() {
    const s = this.xs.stats, c = this.counters, n = Math.max(1, c.tokens);
    return {
      tokens: c.tokens, tokPerSec: c.tokens / (c.wallMs / 1000),
      msPerToken: c.wallMs / n, gpuWaitMsPerToken: c.gpuWaitMs / n, ensureMsPerToken: c.ensureMs / n, encodeMsPerToken: c.encodeMs / n,
      readMsPerToken: s.readMs / n, uploadMsPerToken: s.uploadMs / n,
      hitRate: (s.hits + s.lateHits) / Math.max(1, s.hits + s.lateHits + s.misses),
      hits: s.hits, lateHits: s.lateHits, misses: s.misses, evictions: s.evictions,
      bytesReadPerToken: s.bytesRead / n, prefetchIssued: s.prefetchIssued, prefetchUsed: s.prefetchUsed,
      prefetchAccuracy: c.predTotal ? c.predHits / c.predTotal : null,
      hitRateByLayer: Array.from(s.hitsByLayer, (h, l) => +(h / Math.max(1, h + s.missesByLayer[l])).toFixed(3)),
      poolSlots: this.poolSlots, resident: this.xs.resident(), gpuBytes: { ...this.gpuBytes },
    };
  }

  async warmup() {}

  async dispose() {
    try { await this.xs.drain(); } catch (_) {}
    try { await this.expertReader.close(); } catch (_) {}
    try { this.device.destroy(); } catch (_) {}
  }
}

function topN(logits, n) {
  const best = [];
  for (let i = 0; i < logits.length; i++) {
    const v = logits[i];
    if (best.length < n || v > best[best.length - 1].logit) {
      best.push({ id: i, logit: v });
      best.sort((a, b) => b.logit - a.logit || a.id - b.id);
      if (best.length > n) best.pop();
    }
  }
  return best;
}

export async function removeIngest(key) { await removeOpfs(`${OPFS_ROOT}/${key}`); }
