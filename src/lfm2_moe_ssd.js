/* lfm2_moe_ssd.js — Liquid AI LFM2.5-24B-A2B (GGUF arch `lfm2moe`) with its routed experts on disk: rung 2d of
 * the SSD-streaming ladder. Reuses the Gemma 4 rung's Q4_0 / Q6_K kernels and chunked prefill (gemma4_moe_ssd.js)
 * on the rung 2a base (qwen3_moe_ssd.js, moe-expert-stream.js); what differs is the trunk.
 *
 * The math follows llama.cpp b9.. src/models/lfm2.cpp (graph shared by lfm2 and lfm2moe). 40 layers, each:
 *   x += op(rms_norm(x) · attn_norm), where op is
 *     short conv (30 layers): in_proj (Q4_0, H → 3H) splits into b | c | xx; bx = b · xx; a depthwise causal conv of
 *       width 3 over [bx two tokens back, one back, now] (conv.weight [3, H], tap 0 = oldest); y = c · conv;
 *       out_proj (H → H). The state is the last two bx rows per layer.
 *     attention (10 layers): Q/K/V (32 / 8 / 8 heads × 64), per-head weighted RMS norm on Q and K, NeoX RoPE
 *       (base 1e7, all 64 dims), softmax(QKᵀ/8) V, output projection.
 *   x += ffn(rms_norm(x) · ffn_norm), where ffn is a dense SwiGLU (11776) on the first 2 layers and a MoE on the rest:
 *     64 experts, top 4 by sigmoid(router) + exp_probs_b (the bias only picks), weights = the picked sigmoids over
 *     their sum (clamped at 2⁻¹⁴), SwiGLU experts (1536).
 * Embedding: Q6_K rows (no scale); head: rms_norm(x) · token_embd_norm, then the same Q6_K table (tied).
 *
 * File format (LiquidAI/LFM2.5-24B-A2B-GGUF, QAD-Q4_0): matmul weights Q4_0, norms / conv / router / bias F32, the
 * token embedding Q6_K. Experts: separate ffn_gate_exps / ffn_up_exps [H, F, E] and ffn_down_exps [F, H, E], Q4_0.
 *
 * Layer indexing: the expert store, the streamer and the step loop count only the 38 MoE layers (cfg.layers);
 * the two dense layers run inside MoE layer 0's trunk pass. cfg.modelLayers = 40 for everything per model layer.
 */

import { Qwen3MoeSsd, BpeTokenizer, GGML, Q4_BLOCK, tensorBytes, TOK, STORAGE, COPY_SRC, COPY_DST, MAP_READ } from './qwen3_moe_ssd.js';
import { Gemma4MoeSsd } from './gemma4_moe_ssd.js';
import { Q8_BLOCK } from './gguf.js';
import { QWEN35_BATCH_KERNELS } from './qwen35_moe_ssd.js';

export function configFromGgufLfm2Moe(kv) {
  const a = kv['general.architecture'];
  if (a !== 'lfm2moe') throw new Error(`expected an lfm2moe GGUF, got ${a}`);
  const g = (k) => kv[`${a}.${k}`];
  const modelLayers = g('block_count'), lead = g('leading_dense_block_count') || 0;
  const kvH = g('attention.head_count_kv');
  const kvHeads = Array.isArray(kvH) ? kvH : Array(modelLayers).fill(kvH);
  if (g('expert_gating_func') !== 2) throw new Error(`lfm2moe expert_gating_func ${g('expert_gating_func')}: this engine implements sigmoid (2)`);
  const H = g('embedding_length'), heads = g('attention.head_count'), hd = H / heads, attnHeads = kvHeads.filter((n) => n > 0);
  if (new Set(attnHeads).size !== 1) throw new Error('lfm2moe: attention layers with different KV head counts');
  const layers = modelLayers - lead, theta = g('rope.freq_base');
  return {
    arch: a, modelLayers, lead, layers,
    attn: kvHeads.map((n) => n > 0),                                  // per model layer: attention (else short conv)
    hidden: H, denseFf: g('feed_forward_length'), heads, kvHeadsAttn: attnHeads[0],
    lCache: g('shortconv.l_cache'),
    experts: g('expert_count'), topK: g('expert_used_count'), expertFf: g('expert_feed_forward_length'),
    eps: g('attention.layer_norm_rms_epsilon'), contextLength: g('context_length'),
    vocab: kv['tokenizer.ggml.tokens'].length,
    bos: kv['tokenizer.ggml.bos_token_id'], eos: kv['tokenizer.ggml.eos_token_id'],
    // The shape Gemma4MoeSsd's prefill and RoPE code read, per MoE layer: one kind of RoPE, no sliding window.
    swa: Array(layers).fill(false), headDim: Array(layers).fill(hd), ropeTheta: Array(layers).fill(theta), softcap: 0,
    kvHeads: Array(layers).fill(attnHeads[0]),
  };
}

// The OPFS layout from the header alone. One expert record = gate rows then up rows (nibble plane, then scale
// plane), then down; the store holds the 38 MoE layers, indexed from 0.
// `cfg` lets another architecture with the same store shape reuse it (hy_v3: hy_v3_moe_ssd.js).
export function planLayoutLfm2Moe(gguf, cfg = configFromGgufLfm2Moe(gguf.kv)) {
  const H = cfg.hidden, F = cfg.expertFf;
  // Expert planes: Q4_0 → a nibble plane (16 B per 32 values), Q8_0 → an int8 plane (32 B); both with an f16 scale plane.
  const q8 = gguf.tensors.find((t) => /_exps\.weight$/.test(t.name))?.type === GGML.Q8_0;
  const nib = (rows, cols) => rows * cols / (q8 ? 1 : 2), scl = (rows, cols) => rows * (cols / 32) * 2;
  const parts = {
    guQ: { off: 0, bytes: nib(2 * F, H) },
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
    } else if (t.type === GGML.Q8_0) {
      dense[t.name] = { type: 'q8', dims: t.dims, q: { off: take(n), bytes: n }, s: { off: take(n / 16), bytes: n / 16 } };
    } else if (t.type === GGML.Q6_K) {
      dense[t.name] = { type: 'q6k', dims: t.dims, raw: { off: take(tensorBytes(t)), bytes: tensorBytes(t) } };
    } else if (t.type === GGML.F32) {
      dense[t.name] = { type: 'f32', dims: t.dims, raw: { off: take(n * 4), bytes: n * 4 } };
    } else throw new Error(`dense tensor ${t.name}: unsupported type ${t.type} (this engine reads Q4_0 or Q8_0 files)`);
  }
  return {
    config: cfg,
    experts: { file: 'experts.bin', record, parts, layers: cfg.layers, perLayer: cfg.experts, bytes: record * cfg.layers * cfg.experts },
    dense: { file: 'dense.bin', bytes: off, tensors: dense },
  };
}

export function planUnitsLfm2Moe(gguf, layout) {
  const units = [];
  const { record, parts, perLayer } = layout.experts, lead = layout.config.lead;
  const half = { q: parts.guQ.bytes / 2, s: parts.guS.bytes / 2 };
  for (const t of gguf.tensors) {
    const abs = gguf.dataStart + t.offset;
    const m = /^blk\.(\d+)\.ffn_(gate|up|down)_exps\.weight$/.exec(t.name);
    if (m) {
      if (t.type !== GGML.Q4_0 && t.type !== GGML.Q8_0) throw new Error(`${t.name}: experts must be Q4_0 or Q8_0`);
      const kind = t.type === GGML.Q4_0 ? { kind: 'q4' } : {};
      const layer = Number(m[1]) - lead, which = m[2];
      const slice = tensorBytes(t) / perLayer;
      const qOff = which === 'down' ? parts.dQ.off : parts.guQ.off + (which === 'up' ? half.q : 0);
      const sOff = which === 'down' ? parts.dS.off : parts.guS.off + (which === 'up' ? half.s : 0);
      for (let e = 0; e < perLayer; e++) {
        const rec = (layer * perLayer + e) * record;
        units.push({ ...kind, src: abs + e * slice, len: slice, file: 'experts', q: rec + qOff, s: rec + sOff });
      }
      continue;
    }
    const d = layout.dense.tensors[t.name];
    if (d.type !== 'q4' && d.type !== 'q8') { units.push({ src: abs, len: d.raw.bytes, file: 'dense', raw: d.raw.off }); continue; }
    const q4 = d.type === 'q4', cols = t.dims[0], rows = (q4 ? d.q.bytes * 2 : d.q.bytes) / cols, rowBytes = (cols / 32) * (q4 ? Q4_BLOCK : Q8_BLOCK);
    const band = Math.max(1, Math.floor((8 << 20) / rowBytes));
    for (let r = 0; r < rows; r += band) {
      const nr = Math.min(band, rows - r);
      units.push({ ...(q4 ? { kind: 'q4' } : {}), src: abs + r * rowBytes, len: nr * rowBytes, file: 'dense', q: d.q.off + r * (q4 ? cols / 2 : cols), s: d.s.off + r * (cols / 32) * 2 });
    }
  }
  units.sort((a, b) => a.src - b.src);
  return units;
}

export const LFM2MOE_INGEST_PLAN = { layout: planLayoutLfm2Moe, units: planUnitsLfm2Moe };

export const LFM25_24B_A2B = {
  repo: 'LiquidAI/LFM2.5-24B-A2B-GGUF',
  file: 'LFM2.5-24B-A2B-QAD-Q4_0.gguf',
  revision: 'f97fc8a443da86c71818adf91baecde5b7ef4c50',
  sha256: '89617cc4d3a52e973ee8dea72c7df04285f582107385796ba903f81e540e4afa',
  size: 13578190880,
};

// ── Tokenizer: byte-level BPE, tokenizer.ggml.pre = lfm2 ──
// llama.cpp maps `lfm2` to LLAMA_VOCAB_PRE_TYPE_LLAMA3: the Llama 3 split regex (digits in runs of up to 3) and
// ignore_merges (a pre-token that is itself in the vocab is emitted whole, before any merging).
const LLAMA3_PRE = /(?:'[sS]|'[tT]|'[rR][eE]|'[vV][eE]|'[mM]|'[lL][lL]|'[dD])|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}{1,3}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s*[\r\n]+|\s+(?!\S)|\s+/gu;
export class Lfm2Tokenizer extends BpeTokenizer {
  constructor(kv) { super(kv); this.preRe = LLAMA3_PRE; }
  bpe(word) {
    const id = this.ids.get(word);
    return id !== undefined ? [id] : super.bpe(word);
  }
}

// The GGUF's chat template (text turns): <|startoftext|>, a system turn if any, then <|im_start|>role\n…<|im_end|>\n per
// message; assistant turns before the last user turn lose their reasoning (the text up to </think>). The generation
// prompt opens the reasoning block: the model is reasoning-only, so there is no thinking-off form.
export function lfm2ChatPrompt(messages) {
  let s = '<|startoftext|>', msgs = messages;
  if (msgs.length && msgs[0].role === 'system') {
    if (msgs[0].content) s += `<|im_start|>system\n${msgs[0].content}<|im_end|>\n`;
    msgs = msgs.slice(1);
  }
  const lastUser = msgs.map((m) => m.role).lastIndexOf('user');
  msgs.forEach((m, i) => {
    let c = String(m.content ?? '');
    // Earlier replies lose their reasoning: the model's own </think> and LocalMind's <|think|> … <|/think|> markers.
    if (m.role === 'assistant' && i < lastUser) {
      c = c.replace(/<\|think\|>[\s\S]*?<\|\/think\|>/g, '');
      if (c.includes('</think>')) c = c.split('</think>').pop();
      c = c.trim();
    }
    s += `<|im_start|>${m.role}\n${c}<|im_end|>\n`;
  });
  return s + '<|im_start|>assistant\n<think>';
}

// ── WGSL ────────────────────────────────────────────────────────────────────
// Router: probs = sigmoid(l); pick the top k of probs + bias (lowest index on ties); weights = picked probs over
// their sum, the sum clamped at 6.103515625e-5, times expert_weights_scale (llama.cpp build_moe_ffn; 1 for LFM).
// sel = k ids then k weights (f32 bits).
const TOPK_SIG_BODY = `
  let t = l.x; let n = p.n;
  var mine = -3.4e38; var pr = 0.0;
  if (t < n) { pr = 1.0 / (1.0 + exp(-lg[lb + t])); mine = pr + bias[t]; }
  for (var j = 0u; j < p.k; j++) {
    red[t] = mine; bi[t] = t; workgroupBarrier();
    for (var s = 128u; s > 0u; s >>= 1u) {
      if (t < s) { let o = red[t + s]; if (o > red[t] || (o == red[t] && bi[t + s] < bi[t])) { red[t] = o; bi[t] = bi[t + s]; } }
      workgroupBarrier();
    }
    if (t == 0u) { picks[j] = bi[0]; }
    workgroupBarrier();
    if (t == picks[j]) { probs[j] = pr; mine = -3.4e38; }
    workgroupBarrier();
  }
  if (t == 0u) {
    var wsum = 0.0;
    for (var j = 0u; j < p.k; j++) { wsum += probs[j]; }
    wsum = max(wsum, 6.103515625e-5);
    for (var j = 0u; j < p.k; j++) { sel[sb + j] = picks[j]; sel[sb + p.k + j] = bitcast<u32>(probs[j] / wsum * p.scale); }
  }
}`;
const TOPK_SIG_DECL = `
struct P { n: u32, k: u32, scale: f32 }
@group(0) @binding(0) var<storage, read> lg: array<f32>;
@group(0) @binding(1) var<storage, read> bias: array<f32>;
@group(0) @binding(2) var<storage, read_write> sel: array<u32>;
@group(0) @binding(3) var<uniform> p: P;
var<workgroup> red: array<f32, 256>;
var<workgroup> bi: array<u32, 256>;
var<workgroup> picks: array<u32, 32>;
var<workgroup> probs: array<f32, 32>;`;

const L2 = {
  topkSig: `${TOPK_SIG_DECL}
@compute @workgroup_size(256) fn main(@builtin(local_invocation_id) l: vec3<u32>) {
  let lb = 0u; let sb = 0u;${TOPK_SIG_BODY}`,
  // Short conv for one token, one thread per channel: bcx = [b | c | xx] (3H); st holds the last two bx per channel
  // (oldest first) and moves on by one.
  shortConv: `
struct P { H: u32 }
@group(0) @binding(0) var<storage, read> bcx: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read_write> st: array<f32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; if (i >= p.H) { return; }
  let bx = bcx[i] * bcx[2u * p.H + i];
  let s0 = st[2u * i]; let s1 = st[2u * i + 1u];
  let conv = w[3u * i] * s0 + w[3u * i + 1u] * s1 + w[3u * i + 2u] * bx;
  y[i] = bcx[p.H + i] * conv;
  st[2u * i] = s1; st[2u * i + 1u] = bx;
}`,
  // Debug capture: y[off + i] = x[i].
  copyAt: `
struct P { n: u32, off: u32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read_write> y: array<f32>;
@group(0) @binding(2) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; if (i < p.n) { y[p.off + i] = x[i]; }
}`,
};

const QB = 'struct Q { T: u32, pos0: u32, S: u32, pad: u32 }';
const L2B = {
  topkSigB: `${TOPK_SIG_DECL}
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let lb = wg.x * p.n; let sb = wg.x * 2u * p.k;${TOPK_SIG_BODY}`,
  // The chunk's T tokens in order, one thread per channel.
  shortConvB: `
struct P { H: u32 }
${QB}
@group(0) @binding(0) var<storage, read> bcx: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read_write> st: array<f32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@group(0) @binding(5) var<uniform> qd: Q;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; if (i >= p.H) { return; }
  var s0 = st[2u * i]; var s1 = st[2u * i + 1u];
  let w0 = w[3u * i]; let w1 = w[3u * i + 1u]; let w2 = w[3u * i + 2u];
  for (var t = 0u; t < qd.T; t++) {
    let r = t * 3u * p.H;
    let bx = bcx[r + i] * bcx[r + 2u * p.H + i];
    y[t * p.H + i] = bcx[r + p.H + i] * (w0 * s0 + w1 * s1 + w2 * bx);
    s0 = s1; s1 = bx;
  }
  st[2u * i] = s0; st[2u * i + 1u] = s1;
}`,
  // act = SiLU(g) · u over T × n (the dense FFN's separate gate and up).
  siluSplitB: `
struct P { n: u32 }
${QB}
@group(0) @binding(0) var<storage, read> g: array<f32>;
@group(0) @binding(1) var<storage, read> u: array<f32>;
@group(0) @binding(2) var<storage, read_write> act: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
@group(0) @binding(4) var<uniform> qd: Q;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) gi: vec3<u32>) {
  let i = gi.x; let t = gi.y; if (i >= p.n || t >= qd.T) { return; }
  let k = t * p.n + i; let g0 = g[k]; act[k] = (g0 / (1.0 + exp(-g0))) * u[k];
}`,
  // x[t] += Σ_j w_tj · dn[t·k + j] per token (the routed experts' weighted sum and the residual add).
  moeAccumB: `
struct P { H: u32, k: u32 }
${QB}
@group(0) @binding(0) var<storage, read> dn: array<f32>;
@group(0) @binding(1) var<storage, read> sel: array<u32>;
@group(0) @binding(2) var<storage, read_write> x: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
@group(0) @binding(4) var<uniform> qd: Q;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) gi: vec3<u32>) {
  let h = gi.x; let t = gi.y; if (h >= p.H || t >= qd.T) { return; }
  let sb = t * 2u * p.k; let ob = t * p.k * p.H + h;
  var acc = 0.0;
  for (var j = 0u; j < p.k; j++) { acc += bitcast<f32>(sel[sb + p.k + j]) * dn[ob + j * p.H]; }
  x[t * p.H + h] = x[t * p.H + h] + acc;
}`,
  // Per-head weighted RMS norm and NeoX RoPE over all hd dims, in place, for (head wg.x, token wg.y).
  qkNormRopeB: `
struct P { hd: u32, row: u32, eps: f32 }
@group(0) @binding(0) var<storage, read_write> x: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read> rope: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
var<workgroup> red: array<f32, 64>;
@compute @workgroup_size(64) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let base = wg.y * p.row + wg.x * p.hd; let rb = wg.y * p.hd; let t = l.x; let half = p.hd / 2u;
  var acc = 0.0;
  for (var i = t; i < p.hd; i += 64u) { let v = x[base + i]; acc += v * v; }
  red[t] = acc; workgroupBarrier();
  for (var s = 32u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  let scale = 1.0 / sqrt(red[0] / f32(p.hd) + p.eps);
  workgroupBarrier();
  for (var i = t; i < half; i += 64u) {
    let a = (x[base + i] * scale) * w[i];
    let b = (x[base + i + half] * scale) * w[i + half];
    let c = rope[rb + i]; let sn = rope[rb + half + i];
    x[base + i] = a * c - b * sn;
    x[base + i + half] = a * sn + b * c;
  }
}`,
};
const REUSED_B = ['rmsnormB', 'matmulF32T', 'kvStoreB', 'attnScoreB', 'softmaxB', 'attnOutB', 'addInPlaceB'];

// ── Engine ──────────────────────────────────────────────────────────────────
export class Lfm2MoeSsd extends Gemma4MoeSsd {
  static configFrom(kv) { return configFromGgufLfm2Moe(kv); }
  static get ingestPlan() { return LFM2MOE_INGEST_PLAN; }
  static tokenizerFrom(kv) { return new Lfm2Tokenizer(kv); }
  static load(modelId, opts = {}) { return Qwen3MoeSsd.load.call(this, modelId, { ...opts, source: opts.source || LFM25_24B_A2B }); }

  // Prefetch one MoE layer ahead by default. Measured 2026-10-14 (M4 Pro, 4 GB pool, 376-token prompt, 256 tokens warm):
  // lookahead 2 → 4.0 tok/s (344 ms of SSD reads per token: the extra guesses evict experts still in use), lookahead 1
  // → 16.1 tok/s, prefetch off → 15.0 tok/s. 8 GB pool (1,365 slots, the binding cap) with lookahead 1 → 23.7 tok/s.
  constructor(device, manifest, gguf, opts) {
    super(device, manifest, gguf, opts);
    this.lookahead = Math.max(1, Math.floor(opts.lookahead ?? 1));
  }

  // Kernel names for the matrix and expert weights: Q4_0 here; an engine reading a Q8_0 file (hy_v3_moe_ssd.js) swaps
  // in the Q8_0 kernels, which take the same bindings and dispatch sizes.
  get kq() { return { mm: 'matmulQ4', mmT: 'matmulQ4T', ex: 'expertQ4', exB: 'expertQ4B' }; }

  chatPrompt(messages) { return lfm2ChatPrompt(messages); }
  get stopTokenIds() { return [this.cfg.eos, this.tokenizer.ids.get('<|im_end|>'), this.tokenizer.ids.get('<|endoftext|>')].filter((t) => t !== undefined); }
  get thinkOpenTokenId() { return this.tokenizer.ids.get('<think>') ?? null; }
  get thinkCloseTokenId() { return this.tokenizer.ids.get('</think>') ?? null; }
  get thinkInPrompt() { return true; }
  get alwaysThinks() { return true; }
  get thinkPreamble() { return ''; }

  get kernels() {
    return (this._kernels ||= {
      ...super.kernels, ...L2,
      ...(this.batchPrefill ? { ...Object.fromEntries(REUSED_B.map((k) => [k, QWEN35_BATCH_KERNELS[k]])), ...L2B } : {}),
    });
  }

  // KV cache only on the attention layers.
  kvBytes() { const c = this.cfg, hd = c.attnHeadDim || c.hidden / c.heads; return c.attn.filter(Boolean).length * 2 * 2 * this.maxCtx * c.kvHeadsAttn * hd; }

  // The Q6_K table into planes (Gemma's uploadDense); this model has no rope_freqs.
  async uploadDense(onProgress) { await super.uploadDense(onProgress); this.ropeFreqs = null; }

  initBuffers() {
    const c = this.cfg, H = c.hidden, K = c.topK, E = c.experts, F = c.expertFf, DF = c.denseFf, ML = c.modelLayers;
    const hd = c.attnHeadDim || H / c.heads, QN = c.heads * hd, KVN = c.kvHeadsAttn * hd, SF = c.shexpFf || 0;
    if (2 * K * 4 > 256) throw new Error(`top-k ${K} > 32`);
    if (E > 256) throw new Error(`${E} experts: the router top-k kernel handles at most 256`);
    if ((DF * 4) % 256) throw new Error(`dense FFN ${DF}: gate/up halves must sit on 256-byte offsets`);
    this.kc = []; this.vc = []; this.cs = [];
    for (let L = 0; L < ML; L++) {
      this.kc.push(c.attn[L] ? this.buffer(this.maxCtx * KVN * 2, STORAGE, 'kv') : null);
      this.vc.push(c.attn[L] ? this.buffer(this.maxCtx * KVN * 2, STORAGE, 'kv') : null);
      this.cs.push(c.attn[L] ? null : this.buffer((c.lCache - 1) * H * 4, STORAGE | COPY_DST, 'kv'));
    }
    const A = (n) => this.buffer(n * 4, STORAGE | COPY_SRC | COPY_DST);
    this.a = {
      x: A(H), xn: A(H), bcx: A(3 * H), y: A(H), q: A(QN), k: A(KVN), v: A(KVN), att: A(QN), o: A(H), sc: A(c.heads * this.maxCtx),
      mgu: A(2 * DF), ma: A(DF), rl: A(E), sel: A(2 * K), pxn: A(H), prl: A(E), psel: A(64 * this.lookahead), slots: A(K),
      gu: A(K * 2 * F), act: A(K * F), dn: A(K * H), logits: A(c.vocab), am: A(4), ropeS: A(hd), ropeF: A(hd),
    };
    if (this.opts.capture) this.a.cap = A(ML * H);
    this.tok = this.buffer(16, 0x40 | COPY_DST);
    this.rbSel = this.buffer(256 * (1 + this.lookahead), MAP_READ | COPY_DST);
    this.rbLogits = this.buffer(c.vocab * 4, MAP_READ | COPY_DST);
    this.rbArg = this.buffer(16, MAP_READ | COPY_DST);

    const f = (v) => ({ f: v }), eps = f(c.eps);
    const u = {
      embed: this.uniform([H, H / 256, f(1)]), rmsH: this.uniform([H, eps]), nH: this.uniform([H]),
      inProj: this.uniform([3 * H, H]), mmH: this.uniform([H, H]), conv: this.uniform([H]),
      mmQ: this.uniform([QN, H]), mmO: this.uniform([H, QN]), mmKV: this.uniform([KVN, H]), qk: this.uniform([hd, eps]), kvn: this.uniform([KVN]),
      att: this.uniform([c.heads, c.kvHeadsAttn, hd, f(Math.fround(1 / Math.sqrt(hd)))]), attOut: this.uniform([c.heads, c.kvHeadsAttn, hd, 0]),
      mmG: this.uniform([DF, H]), mmD: this.uniform([H, DF]), siluD: this.uniform([DF, 1]),
      router: this.uniform([E, H]), topk: this.uniform([E, K, f(c.expScale ?? 1)]),
      ...(SF ? { mmSG: this.uniform([SF, H]), mmSD: this.uniform([H, SF]), siluS: this.uniform([SF, 1]) } : {}),
      gu: this.uniform([2 * F, H, 2 * F, 0]), dn: this.uniform([H, F, H, 1]), siluE: this.uniform([F, K]), acc: this.uniform([H, K]),
      lm: this.uniform([c.vocab, H]), am: this.uniform([c.vocab]),
    };
    const a = this.a, W = this.w, gateBytes = DF * 4;
    // The Q6_K token table (LFM2.5); an engine with another table type binds embed and lm itself (this.q6 unset).
    const q6 = this.q6 ? [this.q6.ql, this.q6.qh, this.q6.sc, this.q6.dd] : null;
    this.g = { embed: q6 ? this.bind('embedQ6K', [...q6, a.x, this.tok, u.embed]) : null };
    // Per model layer: the operator (conv or attention) and, for the dense layers, the whole FFN.
    this.mlayers = [];
    for (let L = 0; L < ML; L++) {
      const p = (n) => W[`blk.${L}.${n}`];
      const ly = { attn: c.attn[L], rmsA: this.bind('rmsnorm', [a.x, p('attn_norm.weight').raw, a.xn, u.rmsH]) };
      if (ly.attn) {
        Object.assign(ly, {
          q: this.bind(this.kq.mm, [a.xn, p('attn_q.weight').q, p('attn_q.weight').s, a.q, u.mmQ]),
          k: this.bind(this.kq.mm, [a.xn, p('attn_k.weight').q, p('attn_k.weight').s, a.k, u.mmKV]),
          v: this.bind(this.kq.mm, [a.xn, p('attn_v.weight').q, p('attn_v.weight').s, a.v, u.mmKV]),
          ropeQ: this.bind('qkNormRope', [a.q, p('attn_q_norm.weight').raw, a.ropeF, u.qk]),
          ropeK: this.bind('qkNormRope', [a.k, p('attn_k_norm.weight').raw, a.ropeF, u.qk]),
          kv: this.bind('kvStore', [a.k, a.v, this.kc[L], this.vc[L], this.tok, u.kvn]),
          score: this.bind('attnScore', [a.q, this.kc[L], a.sc, this.tok, u.att]),
          soft: this.bind('softmax', [a.sc, this.tok]),
          attOut: this.bind('attnOut', [a.sc, this.vc[L], a.att, this.tok, u.attOut]),
          o: this.bind(this.kq.mm, [a.att, p('attn_output.weight').q, p('attn_output.weight').s, a.o, u.mmO]),
        });
      } else {
        Object.assign(ly, {
          inProj: this.bind(this.kq.mm, [a.xn, p('shortconv.in_proj.weight').q, p('shortconv.in_proj.weight').s, a.bcx, u.inProj]),
          conv: this.bind('shortConv', [a.bcx, p('shortconv.conv.weight').raw, this.cs[L], a.y, u.conv]),
          o: this.bind(this.kq.mm, [a.y, p('shortconv.out_proj.weight').q, p('shortconv.out_proj.weight').s, a.o, u.mmH]),
        });
      }
      ly.addO = this.bind('addInPlace', [a.x, a.o, u.nH]);
      ly.rmsF = this.bind('rmsnorm', [a.x, p('ffn_norm.weight').raw, a.xn, u.rmsH]);
      if (L < c.lead) {
        Object.assign(ly, {
          mg: this.bindR(this.kq.mm, [a.xn, p('ffn_gate.weight').q, p('ffn_gate.weight').s, { buffer: a.mgu, offset: 0, size: gateBytes }, u.mmG]),
          mu: this.bindR(this.kq.mm, [a.xn, p('ffn_up.weight').q, p('ffn_up.weight').s, { buffer: a.mgu, offset: gateBytes, size: gateBytes }, u.mmG]),
          mact: this.bind('siluMulMoe', [a.mgu, a.ma, u.siluD]),
          md: this.bind(this.kq.mm, [a.ma, p('ffn_down.weight').q, p('ffn_down.weight').s, a.o, u.mmD]),
        });
      }
      if (a.cap) ly.cap = this.bind('copyAt', [a.x, a.cap, this.uniform([H, L * H])]);
      this.mlayers.push(ly);
    }
    // Per MoE layer l (model layer l + lead): router, prefetch guesses, experts.
    this.layers = [];
    for (let l = 0; l < c.layers; l++) {
      const L = l + c.lead, p = (n) => W[`blk.${L}.${n}`];
      this.layers.push({
        router: this.bind('matmulF32', [a.xn, p('ffn_gate_inp.weight').raw, a.rl, u.router]),
        topk: this.bind('topkSig', [a.rl, (p('exp_probs_b.bias') || p('exp_probs_b')).raw, a.sel, u.topk]),
        // Routers of MoE layers l+1..l+lookahead on this layer's post-operator state: the prefetch guesses.
        pf: Array.from({ length: Math.min(this.lookahead, c.layers - 1 - l) }, (_, i) => {
          const at = (n) => W[`blk.${L + 1 + i}.${n}`];
          return {
            rms: this.bind('rmsnorm', [a.x, at('ffn_norm.weight').raw, a.pxn, u.rmsH]),
            router: this.bind('matmulF32', [a.pxn, at('ffn_gate_inp.weight').raw, a.prl, u.router]),
            topk: this.bindR('topkSig', [a.prl, (at('exp_probs_b.bias') || at('exp_probs_b')).raw, { buffer: a.psel, offset: 256 * i, size: 8 * K }, u.topk]),
          };
        }),
        gu: this.bind(this.kq.ex, [a.xn, this.pool.guQ, this.pool.guS, a.gu, u.gu, a.slots]),
        act: this.bind('siluMulMoe', [a.gu, a.act, u.siluE]),
        dn: this.bind(this.kq.ex, [a.act, this.pool.dQ, this.pool.dS, a.dn, u.dn, a.slots]),
        acc: this.bind('moeAccum', [a.dn, a.sel, a.x, u.acc]),
        // The shared expert (always on, no gate; hy_v3): x += down(SiLU(gate(xn)) · up(xn)).
        ...(SF ? { sh: {
          g: this.bindR(this.kq.mm, [a.xn, p('ffn_gate_shexp.weight').q, p('ffn_gate_shexp.weight').s, { buffer: a.mgu, offset: 0, size: SF * 4 }, u.mmSG]),
          u: this.bindR(this.kq.mm, [a.xn, p('ffn_up_shexp.weight').q, p('ffn_up_shexp.weight').s, { buffer: a.mgu, offset: SF * 4, size: SF * 4 }, u.mmSG]),
          act: this.bind('siluMulMoe', [a.mgu, a.ma, u.siluS]),
          d: this.bind(this.kq.mm, [a.ma, p('ffn_down_shexp.weight').q, p('ffn_down_shexp.weight').s, a.o, u.mmSD]),
          add: this.bind('addInPlace', [a.x, a.o, u.nH]),
        } } : {}),
      });
    }
    this.g.rmsOut = this.bind('rmsnorm', [a.x, (W['token_embd_norm.weight'] || W['output_norm.weight']).raw, a.xn, u.rmsH]);
    this.g.lm = q6 ? this.bind('matmulQ6K', [...q6, a.xn, a.logits, u.lm]) : null;
    this.g.am = this.bind('argmax', [a.logits, a.am, u.am]);
    if (Math.min(c.experts, this.chunkTokens * c.topK) > this.poolSlots / 2) this.chunkTokens = Math.max(2, Math.floor(this.poolSlots / 2 / c.topK));
    if (this.batchPrefill) this.initBatch();
  }

  initBatch() {
    const c = this.cfg, B = this.chunkTokens, W = this.w, H = c.hidden, K = c.topK, E = c.experts, F = c.expertFf, DF = c.denseFf;
    const hd = c.attnHeadDim || H / c.heads, QN = c.heads * hd, KVN = c.kvHeadsAttn * hd, SF = c.shexpFf || 0;
    const A = (n) => this.buffer(n * 4, STORAGE | COPY_SRC | COPY_DST, 'batch');
    const b = this.b = {
      ids: A(B), x: A(B * H), xn: A(B * H), bcx: A(B * 3 * H), y: A(B * H), q: A(B * QN), k: A(B * KVN), v: A(B * KVN),
      att: A(B * QN), o: A(B * H), sc: A(c.heads * B * this.maxCtx), mg: A(B * DF), mu: A(B * DF), ma: A(B * DF),
      rl: A(B * E), sel: A(B * 2 * K), slots: A(B * K), gu: A(B * K * 2 * F), act: A(B * K * F), dn: A(B * K * H),
      ropeS: A(B * hd), ropeF: A(B * hd),
    };
    this.qb = this.buffer(16, 0x40 | COPY_DST, 'batch');
    this.rbSelB = this.buffer(B * 2 * K * 4, MAP_READ | COPY_DST, 'batch');
    const U = (w) => this.uniform(w), eps = { f: c.eps }, qb = this.qb;
    const u = {
      embed: U([H, H / 256, { f: 1 }]), rmsH: U([H, eps]), nH: U([H]), inProj: U([3 * H, H]), mmH: U([H, H]), mmO: U([H, QN]), conv: U([H]),
      q: U([QN, H]), kv: U([KVN, H]), ropeQ: U([hd, QN, eps]), ropeK: U([hd, KVN, eps]), kvn: U([KVN]),
      att: U([c.heads, c.kvHeadsAttn, hd, { f: Math.fround(1 / Math.sqrt(hd)) }]), attOut: U([c.heads, c.kvHeadsAttn, hd, 0]),
      mg: U([DF, H]), md: U([H, DF]), silu: U([DF]), router: U([E, H]), topk: U([E, K, { f: c.expScale ?? 1 }]),
      ...(SF ? { sg: U([SF, H]), sd: U([H, SF]), siluS: U([SF]) } : {}),
      gu: U([2 * F, H, 2 * F, 0, K]), dn: U([H, F, H, 1, K]), siluE: U([F, B * K]), acc: U([H, K]),
    };
    const q4 = (name, x, y, uni) => this.bind(this.kq.mmT, [x, W[name].q, W[name].s, y, uni, qb]);
    this.gB = { embed: this.q6 ? this.bind('embedQ6KB', [this.q6.ql, this.q6.qh, this.q6.sc, this.q6.dd, b.ids, b.x, u.embed, qb]) : null };
    for (let L = 0; L < c.modelLayers; L++) {
      const n = (t) => `blk.${L}.${t}`, raw = (t) => W[n(t)].raw, ly = this.mlayers[L];
      const B_ = { rmsA: this.bind('rmsnormB', [b.x, raw('attn_norm.weight'), b.xn, u.rmsH]) };
      if (ly.attn) {
        Object.assign(B_, {
          q: q4(n('attn_q.weight'), b.xn, b.q, u.q), k: q4(n('attn_k.weight'), b.xn, b.k, u.kv), v: q4(n('attn_v.weight'), b.xn, b.v, u.kv),
          ropeQ: this.bind('qkNormRopeB', [b.q, raw('attn_q_norm.weight'), b.ropeF, u.ropeQ]),
          ropeK: this.bind('qkNormRopeB', [b.k, raw('attn_k_norm.weight'), b.ropeF, u.ropeK]),
          kv: this.bind('kvStoreB', [b.k, b.v, this.kc[L], this.vc[L], u.kvn, qb]),
          score: this.bind('attnScoreB', [b.q, this.kc[L], b.sc, u.att, qb]),
          soft: this.bind('softmaxB', [b.sc, qb]),
          attOut: this.bind('attnOutB', [b.sc, this.vc[L], b.att, u.attOut, qb]),
          o: q4(n('attn_output.weight'), b.att, b.o, u.mmO),
        });
      } else {
        Object.assign(B_, {
          inProj: q4(n('shortconv.in_proj.weight'), b.xn, b.bcx, u.inProj),
          conv: this.bind('shortConvB', [b.bcx, raw('shortconv.conv.weight'), this.cs[L], b.y, u.conv, qb]),
          o: q4(n('shortconv.out_proj.weight'), b.y, b.o, u.mmH),
        });
      }
      B_.addO = this.bind('addInPlaceB', [b.x, b.o, u.nH, qb]);
      B_.rmsF = this.bind('rmsnormB', [b.x, raw('ffn_norm.weight'), b.xn, u.rmsH]);
      if (L < c.lead) {
        Object.assign(B_, {
          mg: q4(n('ffn_gate.weight'), b.xn, b.mg, u.mg), mu: q4(n('ffn_up.weight'), b.xn, b.mu, u.mg),
          mact: this.bind('siluSplitB', [b.mg, b.mu, b.ma, u.silu, qb]),
          md: q4(n('ffn_down.weight'), b.ma, b.o, u.md),
        });
      }
      ly.B = B_;
    }
    for (let l = 0; l < c.layers; l++) {
      const raw = (t) => W[`blk.${l + c.lead}.${t}`].raw;
      this.layers[l].B = {
        router: this.bind('matmulF32T', [b.xn, raw('ffn_gate_inp.weight'), b.rl, u.router]),
        topk: this.bind('topkSigB', [b.rl, (W[`blk.${l + c.lead}.exp_probs_b.bias`] || W[`blk.${l + c.lead}.exp_probs_b`]).raw, b.sel, u.topk]),
        gu: this.bind(this.kq.exB, [b.xn, this.pool.guQ, this.pool.guS, b.gu, u.gu, b.slots]),
        act: this.bind('siluMulMoe', [b.gu, b.act, u.siluE]),
        dn: this.bind(this.kq.exB, [b.act, this.pool.dQ, this.pool.dS, b.dn, u.dn, b.slots]),
        acc: this.bind('moeAccumB', [b.dn, b.sel, b.x, u.acc, qb]),
        ...(SF ? { sh: {
          g: q4(`blk.${l + c.lead}.ffn_gate_shexp.weight`, b.xn, b.mg, u.sg), u: q4(`blk.${l + c.lead}.ffn_up_shexp.weight`, b.xn, b.mu, u.sg),
          act: this.bind('siluSplitB', [b.mg, b.mu, b.ma, u.siluS, qb]),
          d: q4(`blk.${l + c.lead}.ffn_down_shexp.weight`, b.ma, b.o, u.sd),
          add: this.bind('addInPlaceB', [b.x, b.o, u.nH, qb]),
        } } : {}),
      };
    }
  }

  // ── forward, one token ──
  // Model layer L's operator and residual add, then its FFN norm; the dense layers also run their FFN.
  encodeModelLayer(pass, L, seqLen) {
    const c = this.cfg, g = this.mlayers[L], d = (n, gr, x, y, z) => this.dispatch(pass, n, gr, x, y, z);
    const H = c.hidden, hd = c.attnHeadDim || H / c.heads, QN = c.heads * hd, KVN = c.kvHeadsAttn * hd;
    d('rmsnorm', g.rmsA, 1);
    if (g.attn) {
      d(this.kq.mm, g.q, Math.ceil(QN / 4)); d(this.kq.mm, g.k, Math.ceil(KVN / 4)); d(this.kq.mm, g.v, Math.ceil(KVN / 4));
      d('qkNormRope', g.ropeQ, c.heads); d('qkNormRope', g.ropeK, c.kvHeadsAttn);
      d('kvStore', g.kv, Math.ceil(KVN / 256));
      d('attnScore', g.score, Math.ceil(c.heads * seqLen / 256));
      d('softmax', g.soft, c.heads);
      d('attnOut', g.attOut, Math.ceil(QN / 256));
      d(this.kq.mm, g.o, Math.ceil(H / 4));
    } else {
      d(this.kq.mm, g.inProj, Math.ceil(3 * H / 4));
      d('shortConv', g.conv, Math.ceil(H / 256));
      d(this.kq.mm, g.o, Math.ceil(H / 4));
    }
    d('addInPlace', g.addO, Math.ceil(H / 256));
    d('rmsnorm', g.rmsF, 1);
    if (L < c.lead) {
      d(this.kq.mm, g.mg, Math.ceil(c.denseFf / 4)); d(this.kq.mm, g.mu, Math.ceil(c.denseFf / 4));
      d('siluMulMoe', g.mact, Math.ceil(c.denseFf / 256));
      d(this.kq.mm, g.md, Math.ceil(H / 4));
      d('addInPlace', g.addO, Math.ceil(H / 256));
      if (g.cap) d('copyAt', g.cap, Math.ceil(H / 256));
    }
  }
  // MoE layer l up to its routing: (the dense layers first, for l = 0), the operator, the guesses, the router.
  encodeAttention(pass, l, seqLen) {
    const c = this.cfg, g = this.layers[l], d = (n, gr, x, y, z) => this.dispatch(pass, n, gr, x, y, z);
    if (l === 0) for (let L = 0; L < c.lead; L++) this.encodeModelLayer(pass, L, seqLen);
    this.encodeModelLayer(pass, l + c.lead, seqLen);
    if (this.prefetch) for (const p of g.pf) { d('rmsnorm', p.rms, 1); d('matmulF32', p.router, c.experts); d('topkSig', p.topk, 1); }
    d('matmulF32', g.router, c.experts);
    d('topkSig', g.topk, 1);
  }
  encodeExperts(pass, l) {
    const c = this.cfg, g = this.layers[l], d = (n, gr, x, y, z) => this.dispatch(pass, n, gr, x, y, z);
    d(this.kq.ex, g.gu, Math.ceil(2 * c.expertFf / 4), 1, c.topK);
    d('siluMulMoe', g.act, Math.ceil(c.topK * c.expertFf / 256));
    d(this.kq.ex, g.dn, Math.ceil(c.hidden / 4), 1, c.topK);
    d('moeAccum', g.acc, Math.ceil(c.hidden / 256));
    if (g.sh) {
      const s = g.sh;
      d(this.kq.mm, s.g, Math.ceil(c.shexpFf / 4)); d(this.kq.mm, s.u, Math.ceil(c.shexpFf / 4));
      d('siluMulMoe', s.act, Math.ceil(c.shexpFf / 256));
      d(this.kq.mm, s.d, Math.ceil(c.hidden / 4));
      d('addInPlace', s.add, Math.ceil(c.hidden / 256));
    }
    const cap = this.mlayers[l + c.lead].cap;
    if (cap) d('copyAt', cap, Math.ceil(c.hidden / 256));
  }
  encodeHead(pass, want) {
    const c = this.cfg;
    this.dispatch(pass, 'rmsnorm', this.g.rmsOut, 1);
    this.dispatch(pass, this.lmKernel || 'matmulQ6K', this.g.lm, Math.ceil(c.vocab / 4));
    if (want === 'argmax') this.dispatch(pass, 'argmax', this.g.am, 1);
  }

  // ── forward, a chunk of T tokens ──
  encodeModelLayerB(pass, L, T, S) {
    const c = this.cfg, g = this.mlayers[L].B, d = (nm, gr, x, y, z) => this.dispatch(pass, nm, gr, x, y, z);
    const H = c.hidden, hd = c.attnHeadDim || H / c.heads, QN = c.heads * hd, KVN = c.kvHeadsAttn * hd, tt = Math.ceil(T / 16), mm = (n) => Math.ceil(n / 16);
    d('rmsnormB', g.rmsA, T);
    if (this.mlayers[L].attn) {
      d(this.kq.mmT, g.q, mm(QN), tt); d(this.kq.mmT, g.k, mm(KVN), tt); d(this.kq.mmT, g.v, mm(KVN), tt);
      d('qkNormRopeB', g.ropeQ, c.heads, T); d('qkNormRopeB', g.ropeK, c.kvHeadsAttn, T);
      d('kvStoreB', g.kv, Math.ceil(KVN / 256), T);
      d('attnScoreB', g.score, Math.ceil(c.heads * T * S / 256));
      d('softmaxB', g.soft, c.heads * T);
      d('attnOutB', g.attOut, Math.ceil(QN / 256), T);
      d(this.kq.mmT, g.o, mm(H), tt);
    } else {
      d(this.kq.mmT, g.inProj, mm(3 * H), tt);
      d('shortConvB', g.conv, Math.ceil(H / 256));
      d(this.kq.mmT, g.o, mm(H), tt);
    }
    d('addInPlaceB', g.addO, Math.ceil(H / 256), T);
    d('rmsnormB', g.rmsF, T);
    if (L < c.lead) {
      d(this.kq.mmT, g.mg, mm(c.denseFf), tt); d(this.kq.mmT, g.mu, mm(c.denseFf), tt);
      d('siluSplitB', g.mact, Math.ceil(c.denseFf / 256), T);
      d(this.kq.mmT, g.md, mm(H), tt);
      d('addInPlaceB', g.addO, Math.ceil(H / 256), T);
    }
  }
  encodeTrunkB(pass, l, T, S) {
    const c = this.cfg, g = this.layers[l].B;
    if (l === 0) for (let L = 0; L < c.lead; L++) this.encodeModelLayerB(pass, L, T, S);
    this.encodeModelLayerB(pass, l + c.lead, T, S);
    this.dispatch(pass, 'matmulF32T', g.router, c.experts, T);
    this.dispatch(pass, 'topkSigB', g.topk, T);
  }
  encodeExpertsB(pass, l, T) {
    const c = this.cfg, g = this.layers[l].B, d = (nm, gr, x, y, z) => this.dispatch(pass, nm, gr, x, y, z);
    d(this.kq.exB, g.gu, Math.ceil(2 * c.expertFf / 4), 1, T * c.topK);
    d('siluMulMoe', g.act, Math.ceil(T * c.topK * c.expertFf / 256));
    d(this.kq.exB, g.dn, Math.ceil(c.hidden / 4), 1, T * c.topK);
    d('moeAccumB', g.acc, Math.ceil(c.hidden / 256), T);
    if (g.sh) {
      const s = g.sh, tt = Math.ceil(T / 16), mm = (n) => Math.ceil(n / 16);
      d(this.kq.mmT, s.g, mm(c.shexpFf), tt); d(this.kq.mmT, s.u, mm(c.shexpFf), tt);
      d('siluSplitB', s.act, Math.ceil(c.shexpFf / 256), T);
      d(this.kq.mmT, s.d, mm(c.hidden), tt);
      d('addInPlaceB', s.add, Math.ceil(c.hidden / 256), T);
    }
  }

  // The conv state cannot rewind, so any change before the cached end restarts from token 0.
  reset() {
    super.reset();
    if (!this.cs) return;
    const enc = this.device.createCommandEncoder();
    for (const s of this.cs) if (s) enc.clearBuffer(s);
    this.device.queue.submit([enc.finish()]);
  }
  async prefill(ids, want = 'argmax') {
    let common = 0;
    while (common < ids.length - 1 && common < this.cached.length && this.cached[common] === ids[common]) common++;
    if (common < this.cached.length) this.reset();
    const rest = ids.slice(this.cached.length);
    let r = null;
    if (!this.batchPrefill || rest.length < 2) {
      for (let i = 0; i < rest.length; i++) r = await this.step(rest[i], i === rest.length - 1 ? want : 'none');
      return r;
    }
    for (let i = 0; i < rest.length; i += this.chunkTokens) {
      r = await this.prefillChunk(rest.slice(i, i + this.chunkTokens), i + this.chunkTokens >= rest.length ? want : 'none');
    }
    return r;
  }

  // The template has no thinking-off form; enableThinking is ignored.
  async *generateTurn(messages, opts = {}) { yield* super.generateTurn(messages, { ...opts, enableThinking: true }); }

  // Debug: each model layer's output from the last one-token step.
  async readCapture() {
    const c = this.cfg, H = c.hidden, n = c.modelLayers * H * 4;
    const rb = this.device.createBuffer({ size: n, usage: MAP_READ | COPY_DST });
    const enc = this.device.createCommandEncoder();
    enc.copyBufferToBuffer(this.a.cap, 0, rb, 0, n);
    this.device.queue.submit([enc.finish()]);
    await rb.mapAsync(1);
    const all = new Float32Array(rb.getMappedRange().slice(0));
    rb.unmap(); rb.destroy();
    return { layers: Array.from({ length: c.modelLayers }, (_, L) => all.subarray(L * H, (L + 1) * H)) };
  }
}

// For kernel tests (scripts): the WGSL this module adds.
export { L2 as LFM2MOE_KERNELS, L2B as LFM2MOE_BATCH_KERNELS };
