/* flint_moe_ssd.js — Recursive Flint (GGUF arch `flint`, 39.8B total, ~2.5B active) with its routed experts on disk:
 * rung 2g of the SSD-streaming ladder. Flint is a coding-agent model (released 2026-10-21, Apache-2.0). As an engine it
 * is the Hy-Memory graph (hy_v3_moe_ssd.js, on the LFM2.5 rung) with attention sinks, a sliding window and no RoPE on
 * its full-attention layers, read from Q4_1 weights.
 *
 * The math follows llama.cpp src/models/flint.cpp (a37cc461). 49 layers, each:
 *   x += attn(rms_norm(x) · attn_norm): Q/K/V (32 / 4 / 4 heads × 128; Q is 4096 wide), per-head weighted RMS norm on
 *     Q and K, then NeoX RoPE (base 10000, all 128 dims) on the 35 sliding layers and none on the 14 full layers
 *     (rope_pattern). Scores QKᵀ/√128; the sliding layers see the current token and the 512 before it (window 513,
 *     llama.cpp LLAMA_SWA_TYPE_STANDARD); softmax with one learned sink logit per head in the denominator
 *     (attn_sinks); output projection 4096 → 2048.
 *   x += ffn(rms_norm(x) · ffn_norm): a dense SwiGLU (6144) on layers 0–1; on layers 2–48 a MoE of 256 experts, top 6
 *     by sigmoid(router) (no selection bias in this file), weights = the picked sigmoids over their sum (scale 1),
 *     SwiGLU experts (512), plus one always-on shared SwiGLU expert (1024, no gate).
 * Embedding: F32 rows (no scale); head: rms_norm(x) · output_norm, then output.weight (Q4_1, untied).
 *
 * File: Recursive's own Q4_1 GGUF (RecursiveSI/flint-int4-gguf: the MLX export's trained INT4 codes with f16 scales and
 * offsets): every matrix and expert Q4_1; norms, sinks, router and the token table F32. Q4_1 blocks are 20 bytes (f16
 * d, f16 m, 16 bytes of nibbles), a whole number of u32 words, so the store keeps them as they are in the GGUF and the
 * kernels read value = d·q + m straight from the blocks. The store's scale planes (the `s` binding and the pool's
 * guS / dS parts) are unused here.
 */

import { Qwen3MoeSsd, GGML, TOK, STORAGE } from './qwen3_moe_ssd.js';
import { Gemma4MoeSsd } from './gemma4_moe_ssd.js';
import { Lfm2MoeSsd } from './lfm2_moe_ssd.js';
import { HyV3Tokenizer, isolate } from './hy_v3_moe_ssd.js';

const Q41_BLOCK = 20;   // f16 d + f16 m + 32 × 4-bit
const GGML_Q4_1 = 3;

export function configFromGgufFlint(kv) {
  const a = kv['general.architecture'];
  if (a !== 'flint') throw new Error(`expected a flint GGUF, got ${a}`);
  const g = (k) => kv[`${a}.${k}`];
  if (g('expert_gating_func') !== 2) throw new Error(`flint expert_gating_func ${g('expert_gating_func')}: this engine implements sigmoid (2)`);
  if (g('expert_weights_norm') === false) throw new Error('flint without expert_weights_norm: not implemented');
  const modelLayers = g('block_count'), lead = g('leading_dense_block_count'), layers = modelLayers - lead;
  const H = g('embedding_length'), heads = g('attention.head_count'), kvH = g('attention.head_count_kv');
  const hd = g('attention.key_length') || H / heads, theta = g('rope.freq_base');
  const swaPat = g('attention.sliding_window_pattern'), ropePat = g('attention.rope_pattern');
  if (swaPat.length !== modelLayers || ropePat.length !== modelLayers) throw new Error('flint: per-layer patterns do not match block_count');
  return {
    arch: a, modelLayers, lead, layers,
    attn: Array(modelLayers).fill(true),
    hidden: H, denseFf: g('feed_forward_length'), heads, kvHeadsAttn: kvH, attnHeadDim: hd,
    experts: g('expert_count'), topK: g('expert_used_count'), expertFf: g('expert_feed_forward_length'),
    shexpFf: g('expert_shared_feed_forward_length'), expScale: g('expert_weights_scale') ?? 1,
    eps: g('attention.layer_norm_rms_epsilon'), contextLength: g('context_length'),
    vocab: kv['tokenizer.ggml.tokens'].length,
    bos: kv['tokenizer.ggml.bos_token_id'], eos: kv['tokenizer.ggml.eos_token_id'],
    // Per model layer: the attention window (0 = all positions) and whether Q and K take RoPE.
    win: swaPat.map((s) => (s ? g('attention.sliding_window') : 0)), rope: ropePat.map(Boolean),
    // The shape Gemma4MoeSsd's RoPE tables read, per MoE layer: one RoPE table (the NoPE layers bind an identity one).
    swa: Array(layers).fill(false), headDim: Array(layers).fill(hd), ropeTheta: Array(layers).fill(theta), softcap: 0,
    kvHeads: Array(layers).fill(kvH),
  };
}

// The OPFS layout from the header alone: the LFM2.5 store shape with Q4_1 blocks kept whole. One expert record = the
// unused guS and dS (256 bytes each, first, so every record ends in written bytes and the file reaches its full
// length), gate rows then up rows (guQ), down rows (dQ); the store holds the 47 MoE layers, indexed from 0. Dense
// tensors are raw copies (Q4_1 blocks or F32).
export function planLayoutFlint(gguf) {
  const cfg = configFromGgufFlint(gguf.kv), H = cfg.hidden, F = cfg.expertFf;
  const names = new Set(gguf.tensors.map((t) => t.name));
  let lead = 0;
  while (names.has(`blk.${lead}.ffn_gate.weight`)) lead++;
  if (lead !== cfg.lead || !names.has(`blk.${lead}.ffn_gate_inp.weight`)) throw new Error(`flint: ${lead} dense leading layers, expected ${cfg.lead}`);
  const blk = (rows, cols) => rows * (cols / 32) * Q41_BLOCK, gu = blk(2 * F, H), dn = blk(H, F);
  const parts = {
    guS: { off: 0, bytes: 256 }, dS: { off: 256, bytes: 256 },
    guQ: { off: 512, bytes: gu }, dQ: { off: 512 + gu, bytes: dn },
  };
  const record = parts.dQ.off + parts.dQ.bytes;
  const dense = {};
  let off = 0;
  const take = (n) => { const o = off; off += Math.ceil(n / 256) * 256; return o; };
  for (const t of gguf.tensors) {
    if (/_exps\.weight$/.test(t.name)) continue;
    const n = t.dims.reduce((x, y) => x * y, 1);
    if (t.type === GGML_Q4_1) dense[t.name] = { type: 'q41', dims: t.dims, raw: { off: take(n / 32 * Q41_BLOCK), bytes: n / 32 * Q41_BLOCK } };
    else if (t.type === GGML.F32) dense[t.name] = { type: 'f32', dims: t.dims, raw: { off: take(n * 4), bytes: n * 4 } };
    else throw new Error(`dense tensor ${t.name}: unsupported type ${t.type} (this engine reads Recursive's Q4_1 file)`);
  }
  return {
    config: cfg,
    experts: { file: 'experts.bin', record, parts, layers: cfg.layers, perLayer: cfg.experts, bytes: record * cfg.layers * cfg.experts },
    dense: { file: 'dense.bin', bytes: off, tensors: dense },
  };
}

// Every unit is a raw copy. Expert slices go to their record; dense tensors in bands of at most 8 MB (the F32 token
// table is 1.23 GB, larger than one range request).
export function planUnitsFlint(gguf, layout) {
  const units = [];
  const { record, parts, perLayer } = layout.experts, lead = layout.config.lead, F = layout.config.expertFf, H = layout.config.hidden;
  const gateBytes = F * (H / 32) * Q41_BLOCK, band = 8 << 20;
  for (const t of gguf.tensors) {
    const abs = gguf.dataStart + t.offset;
    const m = /^blk\.(\d+)\.ffn_(gate|up|down)_exps\.weight$/.exec(t.name);
    if (m) {
      if (t.type !== GGML_Q4_1) throw new Error(`${t.name}: experts must be Q4_1`);
      const layer = Number(m[1]) - lead, which = m[2];
      const slice = t.dims.reduce((x, y) => x * y, 1) / 32 * Q41_BLOCK / perLayer;
      const dst = which === 'down' ? parts.dQ.off : parts.guQ.off + (which === 'up' ? gateBytes : 0);
      for (let e = 0; e < perLayer; e++) units.push({ src: abs + e * slice, len: slice, file: 'experts', raw: (layer * perLayer + e) * record + dst });
      continue;
    }
    const d = layout.dense.tensors[t.name];
    for (let o = 0; o < d.raw.bytes; o += band) units.push({ src: abs + o, len: Math.min(band, d.raw.bytes - o), file: 'dense', raw: d.raw.off + o });
  }
  units.sort((a, b) => a.src - b.src);
  return units;
}

export const FLINT_INGEST_PLAN = { layout: planLayoutFlint, units: planUnitsFlint };

// Recursive's own Q4_1 GGUF (rev 9c47151, 2026-10-21); sha256 = the LFS object id.
export const FLINT_40B_A2B = {
  repo: 'RecursiveSI/flint-int4-gguf',
  file: 'flint-int4-q4_1.gguf',
  revision: '9c47151036bc2c34331142dda04488bceab2bc9f',
  sha256: '43c07baccdba42eb7528a9630ee15699b1942c297291dc1b39a061f508ee1a4b',
  size: 25992966976,
};

// ── Tokenizer: byte-level BPE; tokenizer.json's pre-tokenizer is a Sequence of three Isolated splits (llama.cpp
// LLAMA_VOCAB_PRE_TYPE_FLINT has the same three regexes; `(?i:'s|…)` spelled out case by case): digit runs of up to
// 3, CJK / kana runs, then the word split. Same mechanics as Hy-Memory's (HyV3Tokenizer), other word split.
const CONTR = "(?:'[sS]|'[tT]|'[rR][eE]|'[vV][eE]|'[mM]|'[lL][lL]|'[dD])?";
const FLINT_SPLITS = [
  /\p{N}{1,3}/gu,
  /[一-龥぀-ゟ゠-ヿ]+/gu,
  new RegExp(`[^\\r\\n\\p{L}\\p{N}]?[\\p{Lu}\\p{Lt}\\p{Lm}\\p{Lo}\\p{M}]*[\\p{Ll}\\p{Lm}\\p{Lo}\\p{M}]+${CONTR}|[^\\r\\n\\p{L}\\p{N}]?[\\p{Lu}\\p{Lt}\\p{Lm}\\p{Lo}\\p{M}]+[\\p{Ll}\\p{Lm}\\p{Lo}\\p{M}]*${CONTR}| ?[\\p{P}\\p{S}]+[\\r\\n]*|\\s*[\\r\\n]+|\\s+(?!\\S)|\\s+`, 'gu'),
];
export class FlintTokenizer extends HyV3Tokenizer {
  constructor(kv) {
    super(kv);
    this.preRe = { [Symbol.matchAll]: (s) => FLINT_SPLITS.reduce(isolate, [s]).map((p) => [p])[Symbol.iterator]() };
  }
}

// The chat template (chat_template.jinja), no native tools: <|system|>…, <|user|>…, <|assistant|><think>reasoning
// </think>…, <|observation|><tool_response>…</tool_response>, with no separators; the generation prompt is
// <|assistant|>. User, system and tool text loses NUL, <think> and </think>, and its role markers are escaped as the
// template does. Earlier replies keep their reasoning, as the model card asks (LocalMind's <|think|> … <|/think|>
// markers or the model's own </think>).
const FLINT_MARKERS = ['<|begin_of_text|>', '<|end_of_text|>', '<|system|>', '<|developer|>', '<|user|>', '<|assistant|>', '<|observation|>'];
function flintText(t) {
  let s = String(t ?? '').replace(/\x00/g, '').replace(/<think>/g, '').replace(/<\/think>/g, '');
  for (const m of FLINT_MARKERS) s = s.split(m).join('&lt;' + m.slice(1, -1) + '&gt;');
  return s;
}
export function flintChatPrompt(messages) {
  let s = '';
  for (const m of messages) {
    if (m.role === 'system') s += '<|system|>' + flintText(m.content);
    else if (m.role === 'developer') s += '<|developer|>' + flintText(m.content);
    else if (m.role === 'user') s += '<|user|>' + flintText(m.content);
    else if (m.role === 'tool') s += '<|observation|><tool_response>' + flintText(m.content) + '</tool_response>';
    else if (m.role === 'assistant') {
      let c = String(m.content ?? ''), r = String(m.reasoning_content ?? '');
      c = c.replace(/<\|think\|>([\s\S]*?)<\|\/think\|>/g, (_, x) => { r += x; return ''; });
      if (c.includes('</think>')) { const i = c.lastIndexOf('</think>'); r += c.slice(0, i).replace(/<think>/g, ''); c = c.slice(i + 8); }
      r = r.trim(); c = c.trim();
      s += '<|assistant|>' + (r ? `<think>${r}</think>` : '') + c;
    }
  }
  const last = messages[messages.length - 1];
  return last && last.role === 'assistant' ? s : s + '<|assistant|>';
}

// ── WGSL ────────────────────────────────────────────────────────────────────
// Q4_1 straight from the GGUF blocks: block (row r, block b) is words (r·nb + b)·5 …+4 of `qw`; word 0 = f16 d | f16 m
// << 16, words 1–4 the 16 nibble bytes in ggml's order (low nibbles = values 0..15, high = 16..31). Value = d·q + m,
// so a block's dot is d·Σ q·x + m·Σ x. `aux` (binding 2) keeps the Q4_0 kernels' bindings; it is read once and unused.
const Q41DOT = `
fn q41dot(wd: u32, dm: vec2<f32>, xb: u32) -> f32 {
  let lo = f32(wd & 15u) * xin[xb] + f32((wd >> 8u) & 15u) * xin[xb + 1u]
         + f32((wd >> 16u) & 15u) * xin[xb + 2u] + f32((wd >> 24u) & 15u) * xin[xb + 3u];
  let hi = f32((wd >> 4u) & 15u) * xin[xb + 16u] + f32((wd >> 12u) & 15u) * xin[xb + 17u]
         + f32((wd >> 20u) & 15u) * xin[xb + 18u] + f32((wd >> 28u) & 15u) * xin[xb + 19u];
  let sx = xin[xb] + xin[xb + 1u] + xin[xb + 2u] + xin[xb + 3u] + xin[xb + 16u] + xin[xb + 17u] + xin[xb + 18u] + xin[xb + 19u];
  return dm.x * (lo + hi) + dm.y * sx;
}`;
const Q41_BINDINGS = `@group(0) @binding(0) var<storage, read> xin: array<f32>;
@group(0) @binding(1) var<storage, read> qw: array<u32>;
@group(0) @binding(2) var<storage, read> aux: array<u32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;`;
// Four rows per workgroup; rows past M repeat the last one and are not written.
const Q41_ROWS = (rowBase, xoff) => `
  var a0 = 0.0; var a1 = 0.0; var a2 = 0.0; var a3 = 0.0;
  let r0 = ${rowBase} + min(m0, M - 1u); let r1 = ${rowBase} + min(m0 + 1u, M - 1u); let r2 = ${rowBase} + min(m0 + 2u, M - 1u); let r3 = ${rowBase} + min(m0 + 3u, M - 1u);
  for (var w = t; w < nw; w += 256u) {
    let b = w >> 2u; let i = 1u + (w & 3u); let xb = ${xoff} + b * 32u + (w & 3u) * 4u;
    let k0 = (r0 * nb + b) * 5u; let k1 = (r1 * nb + b) * 5u; let k2 = (r2 * nb + b) * 5u; let k3 = (r3 * nb + b) * 5u;
    a0 += q41dot(qw[k0 + i], unpack2x16float(qw[k0]), xb);
    a1 += q41dot(qw[k1 + i], unpack2x16float(qw[k1]), xb);
    a2 += q41dot(qw[k2 + i], unpack2x16float(qw[k2]), xb);
    a3 += q41dot(qw[k3 + i], unpack2x16float(qw[k3]), xb);
  }
  part[t] = a0; part[256u + t] = a1; part[512u + t] = a2; part[768u + t] = a3;
  workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) {
    if (t < s) { part[t] += part[t + s]; part[256u + t] += part[256u + t + s]; part[512u + t] += part[512u + t + s]; part[768u + t] += part[768u + t + s]; }
    workgroupBarrier();
  }`;
const SOFTMAX_SINK = (rowExpr, headExpr, nExpr) => `
  let n = ${nExpr}; let base = ${rowExpr} * n; let t = l.x; let sink = sinks[${headExpr}];
  var mx = -3.4e38;
  for (var i = t; i < n; i += 256u) { mx = max(mx, sc[base + i]); }
  red[t] = mx; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] = max(red[t], red[t + s]); } workgroupBarrier(); }
  let m = max(red[0], sink); workgroupBarrier();
  var sum = 0.0;
  for (var i = t; i < n; i += 256u) { let e = exp(sc[base + i] - m); sc[base + i] = e; sum += e; }
  red[t] = sum; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  let inv = 1.0 / (red[0] + exp(sink - m));
  for (var i = t; i < n; i += 256u) { sc[base + i] = sc[base + i] * inv; }
}`;
const WIN = 'fn winStart(n: u32, win: u32) -> u32 { return select(0u, n - win, win > 0u && n > win); }';
const QB = 'struct Q { T: u32, pos0: u32, S: u32, pad: u32 }';

const FL = {
  matmulQ41: `
struct P { M: u32, N: u32 }
${Q41_BINDINGS}
@group(0) @binding(4) var<uniform> p: P;
${Q41DOT}
var<workgroup> part: array<f32, 1024>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  _ = aux[0];
  let m0 = (wg.y * ng.x + wg.x) * 4u; let t = l.x; let M = p.M; let nw = p.N / 8u; let nb = p.N / 32u;
  if (m0 >= M) { return; }${Q41_ROWS('0u', '0u')}
  if (t < 4u && m0 + t < M) { y[m0 + t] = part[t * 256u]; }
}`,
  // Routed experts, all k at once (workgroup z = top-k position); slots[z] picks the expert's rows in the pool.
  expertQ41: `
struct P { M: u32, N: u32, rowsPerExpert: u32, inputPerSlot: u32 }
${Q41_BINDINGS}
@group(0) @binding(4) var<uniform> p: P;
@group(0) @binding(5) var<storage, read> slots: array<u32>;
${Q41DOT}
var<workgroup> part: array<f32, 1024>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  _ = aux[0];
  let z = wg.z; let m0 = (wg.y * ng.x + wg.x) * 4u; let t = l.x; let M = p.M; let nw = p.N / 8u; let nb = p.N / 32u;
  if (m0 >= M) { return; }
  let rb = slots[z] * p.rowsPerExpert; let xo = select(0u, z * p.N, p.inputPerSlot == 1u);${Q41_ROWS('rb', 'xo')}
  if (t < 4u && m0 + t < M) { y[z * M + m0 + t] = part[t * 256u]; }
}`,
  // The F32 token table: x = row tok.token.
  embedF32: `
${TOK}
struct P { n: u32 }
@group(0) @binding(0) var<storage, read> emb: array<f32>;
@group(0) @binding(1) var<storage, read_write> y: array<f32>;
@group(0) @binding(2) var<uniform> tok: Tok;
@group(0) @binding(3) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; if (i < p.n) { y[i] = emb[tok.token * p.n + i]; }
}`,
  // Windowed scores (positions [start, seqLen)) times the 1/√hd scale.
  attnScoreSW: `enable f16;
${TOK}
struct P { heads: u32, kvHeads: u32, hd: u32, win: u32, scale: f32, p0: u32, p1: u32, p2: u32 }
@group(0) @binding(0) var<storage, read> q: array<f32>;
@group(0) @binding(1) var<storage, read> kc: array<f16>;
@group(0) @binding(2) var<storage, read_write> sc: array<f32>;
@group(0) @binding(3) var<uniform> tok: Tok;
@group(0) @binding(4) var<uniform> p: P;
${WIN}
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let st = winStart(tok.seqLen, p.win); let n = tok.seqLen - st; let idx = g.x;
  if (idx >= p.heads * n) { return; }
  let h = idx / n; let j = idx % n; let kvh = h / (p.heads / p.kvHeads);
  let qo = h * p.hd; let ko = (st + j) * p.kvHeads * p.hd + kvh * p.hd;
  var acc = 0.0;
  for (var d = 0u; d < p.hd; d++) { acc += q[qo + d] * f32(kc[ko + d]); }
  sc[h * n + j] = acc * p.scale;
}`,
  // Softmax over the window with the head's sink logit in the denominator (ggml_soft_max_ext with sinks).
  softmaxSinkW: `
${TOK}
struct P { heads: u32, kvHeads: u32, hd: u32, win: u32 }
@group(0) @binding(0) var<storage, read_write> sc: array<f32>;
@group(0) @binding(1) var<storage, read> sinks: array<f32>;
@group(0) @binding(2) var<uniform> tok: Tok;
@group(0) @binding(3) var<uniform> p: P;
${WIN}
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {${SOFTMAX_SINK('wg.x', 'wg.x', 'tok.seqLen - winStart(tok.seqLen, p.win)')}`,
};

const FLB = {
  // Tiled Q4_1 GEMM (matmulQ4T's tiling): y[t·M + m] = Σ_k x[t·N + k]·W[m][k], 16 rows × 16 tokens per workgroup.
  matmulQ41T: `
struct P { M: u32, N: u32 }
${QB}
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> qw: array<u32>;
@group(0) @binding(2) var<storage, read> aux: array<u32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@group(0) @binding(5) var<uniform> qd: Q;
var<workgroup> ws: array<f32, 512>;
var<workgroup> xs: array<f32, 512>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  _ = aux[0];
  let m0 = wg.x * 16u; let t0 = wg.y * 16u; let r = l.x / 16u; let c = l.x % 16u;
  let nb = p.N / 32u; var acc = 0.0;
  for (var b = 0u; b < nb; b++) {
    for (var i = l.x; i < 512u; i += 256u) {
      let rr = i / 32u; let kk = i % 32u;
      let m = m0 + rr; var wv = 0.0;
      if (m < p.M) {
        let k = (m * nb + b) * 5u; let dm = unpack2x16float(qw[k]);
        let wd = qw[k + 1u + ((kk & 15u) >> 2u)];
        wv = f32((wd >> ((kk & 3u) * 8u + (kk >> 4u) * 4u)) & 15u) * dm.x + dm.y;
      }
      ws[i] = wv;
      let t = t0 + rr; var xv = 0.0;
      if (t < qd.T) { xv = x[t * p.N + b * 32u + kk]; }
      xs[i] = xv;
    }
    workgroupBarrier();
    for (var kk = 0u; kk < 32u; kk++) { acc += ws[r * 32u + kk] * xs[c * 32u + kk]; }
    workgroupBarrier();
  }
  let m = m0 + r; let t = t0 + c;
  if (m < p.M && t < qd.T) { y[t * p.M + m] = acc; }
}`,
  // Routed experts for every (token, pick) pair: z = t·K + j. Input: the token's row (gate/up, inputMode 0) or the
  // pair's own row (down, inputMode 1).
  expertQ41B: `
struct P { M: u32, N: u32, rowsPerExpert: u32, inputMode: u32, K: u32 }
${Q41_BINDINGS}
@group(0) @binding(4) var<uniform> p: P;
@group(0) @binding(5) var<storage, read> slots: array<u32>;
${Q41DOT}
var<workgroup> part: array<f32, 1024>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  _ = aux[0];
  let z = wg.z; let m0 = (wg.y * ng.x + wg.x) * 4u; let t = l.x; let M = p.M; let nw = p.N / 8u; let nb = p.N / 32u;
  if (m0 >= M) { return; }
  let rb = slots[z] * p.rowsPerExpert; let xo = select((z / p.K) * p.N, z * p.N, p.inputMode == 1u);${Q41_ROWS('rb', 'xo')}
  if (t < 4u && m0 + t < M) { y[z * M + m0 + t] = part[t * 256u]; }
}`,
  embedF32B: `
struct P { n: u32 }
${QB}
@group(0) @binding(0) var<storage, read> emb: array<f32>;
@group(0) @binding(1) var<storage, read> ids: array<u32>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
@group(0) @binding(4) var<uniform> qd: Q;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; let t = g.y; if (i >= p.n || t >= qd.T) { return; }
  y[t * p.n + i] = emb[ids[t] * p.n + i];
}`,
  // Causal (and, on sliding layers, windowed) scores for T queries over S = pos0 + T keys, times the scale.
  attnScoreSWB: `enable f16;
struct P { heads: u32, kvHeads: u32, hd: u32, win: u32, scale: f32, p0: u32, p1: u32, p2: u32 }
${QB}
@group(0) @binding(0) var<storage, read> q: array<f32>;
@group(0) @binding(1) var<storage, read> kc: array<f16>;
@group(0) @binding(2) var<storage, read_write> sc: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
@group(0) @binding(4) var<uniform> qd: Q;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>) {
  let idx = g.y * ng.x * 256u + g.x; let S = qd.S; let T = qd.T;
  if (idx >= p.heads * T * S) { return; }
  let h = idx / (T * S); let rem = idx % (T * S); let t = rem / S; let pos = rem % S; let qp = qd.pos0 + t;
  if (pos > qp || (p.win > 0u && qp - pos >= p.win)) { sc[idx] = -3.4e38; return; }
  let kvh = h / (p.heads / p.kvHeads);
  let qo = t * p.heads * p.hd + h * p.hd; let ko = pos * p.kvHeads * p.hd + kvh * p.hd;
  var acc = 0.0;
  for (var d = 0u; d < p.hd; d++) { acc += q[qo + d] * f32(kc[ko + d]); }
  sc[idx] = acc * p.scale;
}`,
  // Row wg.x = h·T + t over S keys (masked ones are -3.4e38 and come out 0), with the head's sink.
  softmaxSinkB: `
${QB}
@group(0) @binding(0) var<storage, read_write> sc: array<f32>;
@group(0) @binding(1) var<storage, read> sinks: array<f32>;
@group(0) @binding(2) var<uniform> qd: Q;
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {${SOFTMAX_SINK('wg.x', 'wg.x / qd.T', 'qd.S')}`,
};

// ── Engine ──────────────────────────────────────────────────────────────────
export class FlintMoeSsd extends Lfm2MoeSsd {
  static configFrom(kv) { return configFromGgufFlint(kv); }
  static get ingestPlan() { return FLINT_INGEST_PLAN; }
  static tokenizerFrom(kv) { return new FlintTokenizer(kv); }
  static load(modelId, opts = {}) { return Qwen3MoeSsd.load.call(this, modelId, { ...opts, source: opts.source || FLINT_40B_A2B }); }

  chatPrompt(messages) { return flintChatPrompt(messages); }
  get stopTokenIds() {
    const t = this.tokenizer.ids;
    return [this.cfg.eos, t.get('<|user|>'), t.get('<|observation|>'), t.get('<|developer|>')].filter((x) => x !== undefined);
  }
  get thinkOpenTokenId() { return this.tokenizer.ids.get('<think>') ?? null; }
  get thinkCloseTokenId() { return this.tokenizer.ids.get('</think>') ?? null; }
  get thinkInPrompt() { return false; }
  get alwaysThinks() { return false; }
  get thinkPreamble() { return ''; }

  get kq() { return { mm: 'matmulQ41', mmT: 'matmulQ41T', ex: 'expertQ41', exB: 'expertQ41B' }; }
  get attnK() { return { score: 'attnScoreSW', soft: 'softmaxSinkW', out: 'attnOutW', scoreB: 'attnScoreSWB', softB: 'softmaxSinkB', outB: 'attnOutB' }; }
  get embedKernel() { return 'embedF32'; }
  get embedKernelB() { return 'embedF32B'; }
  get lmKernel() { return 'matmulQ41'; }
  get kernels() {
    return (this._flKernels ||= { ...super.kernels, ...FL, ...(this.batchPrefill ? FLB : {}) });
  }

  // Q4_1 and F32 tensors arrive raw. A Q4_1 matrix binds its blocks as `q` and a 16-byte unused buffer as `s`; each MoE
  // layer gets a zero router bias (this file has none; topkSig adds one before picking).
  async uploadDense(onProgress) {
    const dt = this.manifest.dense.tensors;
    for (const [name, d] of Object.entries(dt)) if (d.type !== 'f32' && d.type !== 'q41') throw new Error(`${name}: ${d.type} in a Q4_1 flint file`);
    await Qwen3MoeSsd.prototype.uploadDense.call(this, onProgress);
    this.ropeFreqs = null;
    this.aux = this.buffer(16, STORAGE, 'dense');
    for (const [name, d] of Object.entries(dt)) if (d.type === 'q41') Object.assign(this.w[name], { q: this.w[name].raw, s: this.aux });
    const c = this.cfg, zero = this.buffer(c.experts * 4, STORAGE, 'dense');
    for (let L = c.lead; L < c.modelLayers; L++) this.w[`blk.${L}.exp_probs_b`] = { raw: zero };
  }

  // The base binds, then Flint's own: the token table and head, an identity RoPE table for the NoPE layers, and per
  // layer the windowed, scaled scores and the softmax with sinks.
  initBuffers() {
    const c = this.cfg, H = c.hidden, hd = c.attnHeadDim, W = this.w;
    this.ropeId = this.buffer(hd * 4, STORAGE | 0x8 /* COPY_DST */);
    this.device.queue.writeBuffer(this.ropeId, 0, identityRope(hd, 1));
    super.initBuffers();
    const a = this.a, qk = this.uniform([hd, { f: c.eps }]), scale = { f: Math.fround(1 / Math.sqrt(hd)) };
    this.g.embed = this.bind('embedF32', [W['token_embd.weight'].raw, a.x, this.tok, this.uniform([H])]);
    this.g.lm = this.bind('matmulQ41', [a.xn, W['output.weight'].q, W['output.weight'].s, a.logits, this.uniform([c.vocab, H])]);
    for (let L = 0; L < c.modelLayers; L++) {
      const ly = this.mlayers[L], p = (n) => W[`blk.${L}.${n}`];
      if (!c.rope[L]) {
        ly.ropeQ = this.bind('qkNormRope', [a.q, p('attn_q_norm.weight').raw, this.ropeId, qk]);
        ly.ropeK = this.bind('qkNormRope', [a.k, p('attn_k_norm.weight').raw, this.ropeId, qk]);
      }
      const win = this.uniform([c.heads, c.kvHeadsAttn, hd, c.win[L]]);
      ly.score = this.bind('attnScoreSW', [a.q, this.kc[L], a.sc, this.tok, this.uniform([c.heads, c.kvHeadsAttn, hd, c.win[L], scale, 0, 0, 0])]);
      ly.soft = this.bind('softmaxSinkW', [a.sc, p('attn_sinks.weight').raw, this.tok, win]);
      ly.attOut = this.bind('attnOutW', [a.sc, this.vc[L], a.att, this.tok, win]);
    }
  }
  initBatch() {
    super.initBatch();
    const c = this.cfg, B = this.chunkTokens, H = c.hidden, hd = c.attnHeadDim, W = this.w, b = this.b, qb = this.qb;
    const QN = c.heads * hd, KVN = c.kvHeadsAttn * hd, eps = { f: c.eps }, scale = { f: Math.fround(1 / Math.sqrt(hd)) };
    this.ropeIdB = this.buffer(B * hd * 4, STORAGE | 0x8, 'batch');
    this.device.queue.writeBuffer(this.ropeIdB, 0, identityRope(hd, B));
    this.gB.embed = this.bind('embedF32B', [W['token_embd.weight'].raw, b.ids, b.x, this.uniform([H]), qb]);
    const rq = this.uniform([hd, QN, eps]), rk = this.uniform([hd, KVN, eps]), attOut = this.uniform([c.heads, c.kvHeadsAttn, hd, 0]);
    for (let L = 0; L < c.modelLayers; L++) {
      const B_ = this.mlayers[L].B, p = (n) => W[`blk.${L}.${n}`];
      if (!c.rope[L]) {
        B_.ropeQ = this.bind('qkNormRopeB', [b.q, p('attn_q_norm.weight').raw, this.ropeIdB, rq]);
        B_.ropeK = this.bind('qkNormRopeB', [b.k, p('attn_k_norm.weight').raw, this.ropeIdB, rk]);
      }
      B_.score = this.bind('attnScoreSWB', [b.q, this.kc[L], b.sc, this.uniform([c.heads, c.kvHeadsAttn, hd, c.win[L], scale, 0, 0, 0]), qb]);
      B_.soft = this.bind('softmaxSinkB', [b.sc, p('attn_sinks.weight').raw, qb]);
      B_.attOut = this.bind('attnOutB', [b.sc, this.vc[L], b.att, attOut, qb]);
    }
  }

  // No recurrent state: thinking follows the model (LFM2.5 forces it on).
  async *generateTurn(messages, opts = {}) { yield* Gemma4MoeSsd.prototype.generateTurn.call(this, messages, opts); }
}

// n rows of [cos | sin] = [1 … 1 | 0 … 0]: qkNormRope with this table only normalises.
function identityRope(hd, n) {
  const r = new Float32Array(n * hd);
  for (let t = 0; t < n; t++) r.fill(1, t * hd, t * hd + hd / 2);
  return r;
}

// For kernel tests (scripts): the WGSL this module adds.
export { FL as FLINT_KERNELS, FLB as FLINT_BATCH_KERNELS };
