/* gemma4_moe_ssd.js — Gemma 4 26B-A4B (GGUF arch `gemma4`, MoE) with its routed experts on disk:
 * rung 2c of the SSD-streaming ladder. Reuses rung 2a/2b's OPFS ingest, reader pool and expert streamer
 * (qwen3_moe_ssd.js, moe-expert-stream.js); what differs is the file format and the trunk.
 *
 * Status (2026-10-05): ingest layout only — config, the OPFS layout and the ingest units, checked by
 * scripts/test-gemma4-layout.mjs against the real GGUF header. The WGSL trunk (Q4_0 / Q6_K kernels, Gemma 4
 * attention, the GELU MLP + MoE block) is next; the math to follow is llama.cpp b9830's
 * src/models/gemma4.cpp (notes: LocalMind plan/gemma4-26b-a4b-port-notes.md).
 *
 * File format (google/gemma-4-26B-A4B-it-qat-q4_0-gguf): matmul weights Q4_0, norms / router / scales F32,
 * the token embedding (tied output head) Q6_K. Experts: fused `ffn_gate_up_exps` [H, 2F, E] and
 * `ffn_down_exps` [F, H, E], both Q4_0, plus a per-expert F32 `ffn_down_exps.scale` [E].
 */

import { GGML, Q4_BLOCK, Q6K_BLOCK, tensorBytes } from './qwen3_moe_ssd.js';

export function configFromGgufGemma4(kv) {
  const a = kv['general.architecture'];
  if (a !== 'gemma4') throw new Error(`expected a gemma4 GGUF, got ${a}`);
  const g = (k) => kv[`${a}.${k}`];
  const layers = g('block_count');
  const perLayer = (v) => (Array.isArray(v) ? v : Array(layers).fill(v));
  const swa = perLayer(g('attention.sliding_window_pattern')).map(Boolean);
  if (!g('expert_count')) throw new Error('gemma4 GGUF without experts: this engine is for the MoE (26B-A4B)');
  return {
    arch: a, layers,
    hidden: g('embedding_length'), denseFf: g('feed_forward_length'),
    heads: g('attention.head_count'), kvHeads: perLayer(g('attention.head_count_kv')),
    swa,                                                             // true: sliding-window layer
    headDim: swa.map((s) => (s ? g('attention.key_length_swa') : g('attention.key_length'))),
    ropeDims: swa.map((s) => (s ? g('rope.dimension_count_swa') : g('rope.dimension_count'))),
    ropeTheta: swa.map((s) => (s ? g('rope.freq_base_swa') : g('rope.freq_base'))),
    window: g('attention.sliding_window'),
    experts: g('expert_count'), topK: g('expert_used_count'), expertFf: g('expert_feed_forward_length'),
    softcap: g('final_logit_softcapping') || 0,
    eps: g('attention.layer_norm_rms_epsilon'),
    contextLength: g('context_length'),
    vocab: kv['tokenizer.ggml.tokens'].length,
    bos: kv['tokenizer.ggml.bos_token_id'], eos: kv['tokenizer.ggml.eos_token_id'],
  };
}

// The OPFS layout from the header alone. One expert record = the fused gate/up planes then the down
// planes, each split into a nibble plane (16 B per 32 values) and an f16 scale plane (2 B per 32).
export function planLayoutGemma4(gguf) {
  const cfg = configFromGgufGemma4(gguf.kv);
  const H = cfg.hidden, F = cfg.expertFf;
  const nib = (rows, cols) => rows * cols / 2, scl = (rows, cols) => rows * (cols / 32) * 2;
  const parts = {
    guQ: { off: 0, bytes: nib(2 * F, H) },                         // gate rows 0..F-1, up rows F..2F-1
    guS: { off: nib(2 * F, H), bytes: scl(2 * F, H) },
    dQ: { off: nib(2 * F, H) + scl(2 * F, H), bytes: nib(H, F) },
    dS: { off: nib(2 * F, H) + scl(2 * F, H) + nib(H, F), bytes: scl(H, F) },
  };
  const record = parts.dS.off + parts.dS.bytes;
  const dense = {};
  let off = 0;
  const take = (n) => { const o = off; off += Math.ceil(n / 256) * 256; return o; };
  for (const t of gguf.tensors) {
    if (/_exps\.weight$/.test(t.name)) continue;
    const n = t.dims.reduce((x, y) => x * y, 1);
    if (t.type === GGML.Q4_0) {
      dense[t.name] = { type: 'q4', dims: t.dims, q: { off: take(n / 2), bytes: n / 2 }, s: { off: take(n / 16), bytes: n / 16 } };
    } else if (t.type === GGML.Q6_K) {
      dense[t.name] = { type: 'q6k', dims: t.dims, raw: { off: take(tensorBytes(t)), bytes: tensorBytes(t) } };
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

// Byte ranges of the GGUF to keep, each small enough to transform in memory: one unit per expert slice
// (kind q4), row bands of dense Q4_0 tensors (kind q4), whole Q6_K / F32 tensors (raw).
export function planUnitsGemma4(gguf, layout) {
  const units = [];
  const { record, parts, perLayer } = layout.experts;
  for (const t of gguf.tensors) {
    const abs = gguf.dataStart + t.offset;
    const m = /^blk\.(\d+)\.ffn_(gate_up|down)_exps\.weight$/.exec(t.name);
    if (m) {
      if (t.type !== GGML.Q4_0) throw new Error(`${t.name}: experts must be Q4_0`);
      const layer = Number(m[1]), gu = m[2] === 'gate_up';
      const slice = tensorBytes(t) / perLayer;
      for (let e = 0; e < perLayer; e++) {
        const rec = (layer * perLayer + e) * record;
        units.push({ kind: 'q4', src: abs + e * slice, len: slice, file: 'experts', q: rec + (gu ? parts.guQ.off : parts.dQ.off), s: rec + (gu ? parts.guS.off : parts.dS.off) });
      }
      continue;
    }
    const d = layout.dense.tensors[t.name];
    if (d.type !== 'q4') { units.push({ src: abs, len: d.raw.bytes, file: 'dense', raw: d.raw.off }); continue; }
    const cols = t.dims[0], rows = (d.q.bytes * 2) / cols, rowBytes = (cols / 32) * Q4_BLOCK;
    const band = Math.max(1, Math.floor((8 << 20) / rowBytes));
    for (let r = 0; r < rows; r += band) {
      const nr = Math.min(band, rows - r);
      units.push({ kind: 'q4', src: abs + r * rowBytes, len: nr * rowBytes, file: 'dense', q: d.q.off + r * cols / 2, s: d.s.off + r * (cols / 32) * 2 });
    }
  }
  units.sort((a, b) => a.src - b.src);
  return units;
}

export const GEMMA4_INGEST_PLAN = { layout: planLayoutGemma4, units: planUnitsGemma4 };
export { Q6K_BLOCK };
