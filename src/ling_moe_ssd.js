/* ling_moe_ssd.js — inclusionAI Ling 3.0 Flash (GGUF arch `bailingmoe3`, 124B total, 5.1B active) with its routed
 * experts on disk: rung 2h of the SSD-streaming ladder. Released 2026-08-02, MIT. The file is inclusionAI's own Q4_K_M
 * GGUF (inclusionAI/Ling-3.0-flash-GGUF, two parts, 77.0 GB): Q4_K matrices with Q6_K on some, Q5_0 on attn_k_b, F32
 * norms, routers and small vectors. The engine reads every block type straight from the GGUF bytes (iq_quants.js).
 *
 * The math follows llama.cpp src/models/bailingmoe3.cpp and its CPU ops (a37cc461). 42 layers (a 43rd, the MTP head,
 * is not stored); layers 5, 11, …, 41 (head_count_kv = 1) are MLA attention, the other 35 are KDA linear attention:
 *   KDA (Kimi Delta Attention; 32 heads × 128): q, k, v projections, each through a 4-tap causal conv and SiLU; q, k
 *     L2-normalised per head (x / √(Σx² + eps)); per-channel decay g = -5·sigmoid(a_h·(x·f_a + dt_b)); β = sigmoid(x·w_β)
 *     per head; the delta rule on a 128×128 state per head, S = diag(e^g)·S, S += k ⊗ β(v − Sᵀk), o = Sᵀq / √128
 *     (ggml_gated_delta_net, KDA branch); then RMSNorm(o)·w per head times sigmoid(x·g_a), and the output projection.
 *   MLA (multi-head latent attention, 32 heads, absorbed): q = x·W_q (per head 128 no-RoPE + 64 RoPE dims);
 *     [c | k_pe] = x·W_kv_a (512 + 64); c = RMSNorm(c)·w; RoPE (GGML NORM: adjacent pairs, base 6e6) on q_pe and k_pe;
 *     the cache keeps [c | k_pe] per token (576 f32). Scores (W_k_b,h·q_nope,h)·c + q_pe·k_pe, over √192; softmax;
 *     o_h = W_v_b,h·Σ p·c; o_h scaled by sigmoid(x·w_gate)_h; output projection 4096 → 2560.
 *   FFN: layers 0–1 a dense SwiGLU (6144). Layers 2–41: 512 experts in 8 groups of 64; p = sigmoid(router);
 *     selection score p + bias; the 4 groups with the highest sum of their top-2 scores; top 8 experts of those by
 *     score; weights = their p over the sum (≥ 6.1e-5), × 2.5; SwiGLU experts (768) plus one shared expert (768).
 *     Some layers clamp the SwiGLU (llama.cpp's non-fused form): up to [-L, L], silu(gate) to ≤ L.
 * Embedding: Q4_K rows; head: RMSNorm · output_norm, then output.weight (Q6_K, untied).
 *
 * Decode is one token at a time and prefill feeds tokens through the same step. The recurrent KDA state only moves
 * forward, so a prompt that does not extend the cached tokens is fed again from position 0.
 *
 * Two-part GGUF: the engine reads both part headers first and gives the store one virtual file, part 1's bytes then
 * part 2's (splitFetch answers range requests across the boundary); tensors of part 2 get offsets in that space.
 */

import { Qwen3MoeSsd, BpeTokenizer, GGML, TOK, STORAGE, COPY_SRC, COPY_DST, MAP_READ, parseGguf } from './qwen3_moe_ssd.js';
import { QTYPES, QTYPE_BY_ID, rowBytes, mvKernel, embedKernel, deqFn, gpuBlock, gridData } from './iq_quants.js';

// inclusionAI's own Q4_K_M GGUF (rev 29edce5, 2026-08-31); sha256 = the LFS object ids of the two parts.
export const LING_FLASH = {
  repo: 'inclusionAI/Ling-3.0-flash-GGUF',
  revision: '29edce5130491e638f3e5ebec91fa0a5ed4f780e',
  file: 'Q4_K_M/Ling-3.0-flash-Q4_K_M-00001-of-00002.gguf',
  parts: [
    { file: 'Q4_K_M/Ling-3.0-flash-Q4_K_M-00001-of-00002.gguf', size: 49995534208, sha256: '24ff06f1ab74546a91f7c07bd725b3015896bbe9dd82ab0e5838be9ed06a6dcf' },
    { file: 'Q4_K_M/Ling-3.0-flash-Q4_K_M-00002-of-00002.gguf', size: 27014610464, sha256: '1a6a8c91562b817fd8ec5b250453be696b0fc209ed8f2acdb6c13f4e17f7e188' },
  ],
  size: 49995534208 + 27014610464,
};

// ── Two-part GGUF as one file ──
// A fetch-shaped function over the parts laid end to end: a Range request is split at the part boundaries and the
// bodies are streamed back in order. content-range reports the total size.
export function splitFetch(urls, sizes, fetchFn = (u, i) => fetch(u, i)) {
  const starts = sizes.map((_, i) => sizes.slice(0, i).reduce((a, b) => a + b, 0)), total = sizes.reduce((a, b) => a + b, 0);
  return async (_url, init = {}) => {
    const m = /^bytes=(\d+)-(\d+)$/.exec((init.headers && init.headers.Range) || '');
    if (!m) throw new Error('splitFetch: only Range requests (bytes=a-b) are supported');
    const a = Number(m[1]), b = Math.min(Number(m[2]), total - 1);
    const pieces = [];
    for (let i = 0; i < urls.length; i++) {
      const lo = Math.max(a, starts[i]), hi = Math.min(b, starts[i] + sizes[i] - 1);
      if (lo <= hi) pieces.push([i, lo - starts[i], hi - starts[i]]);
    }
    const responses = [];
    for (const [i, lo, hi] of pieces) {
      const r = await fetchFn(urls[i], { ...init, headers: { ...init.headers, Range: `bytes=${lo}-${hi}` } });
      if (r.status !== 206) throw new Error(`part ${i + 1} range ${lo}-${hi}: HTTP ${r.status}`);
      responses.push(r);
    }
    if (responses.length === 1) {
      return new Response(responses[0].body, { status: 206, headers: { 'content-range': `bytes ${a}-${b}/${total}`, ...(responses[0].headers.get('etag') ? { etag: responses[0].headers.get('etag') } : {}) } });
    }
    let k = 0, reader = null;
    const body = new ReadableStream({
      async pull(ctl) {
        for (;;) {
          if (!reader) { if (k >= responses.length) { ctl.close(); return; } reader = responses[k++].body.getReader(); }
          const { done, value } = await reader.read();
          if (done) { reader = null; continue; }
          ctl.enqueue(value); return;
        }
      },
      cancel() { for (const r of responses) try { r.body.cancel(); } catch (_) {} },
    });
    return new Response(body, { status: 206, headers: { 'content-range': `bytes ${a}-${b}/${total}` } });
  };
}

// Reads part 2's header (the parts after the first carry only tensor infos) → its tensors with offsets made relative
// to part 1's data start in the virtual file.
export async function readPartTensors(url, partStart, dataStart1, fetchFn) {
  let n = 4 << 20;
  for (;;) {
    const r = await fetchFn(url, { headers: { Range: `bytes=0-${n - 1}` }, cache: 'no-store' });
    if (!r.ok) throw new Error(`GGUF part header fetch: HTTP ${r.status}`);
    const u8 = new Uint8Array(await r.arrayBuffer());
    try {
      const g = parseGguf(u8);
      return g.tensors.map((t) => ({ ...t, offset: partStart + g.dataStart + t.offset - dataStart1 }));
    } catch (e) { if (!e.needBytes) throw e; n = e.needBytes; }
  }
}

// ── Config ──
export function configFromGgufLing(kv) {
  const a = kv['general.architecture'];
  if (a !== 'bailingmoe3') throw new Error(`expected a bailingmoe3 GGUF, got ${a}`);
  const g = (k) => kv[`${a}.${k}`];
  if (g('expert_gating_func') !== 2) throw new Error(`bailingmoe3 expert_gating_func ${g('expert_gating_func')}: this engine implements sigmoid (2)`);
  if (!g('expert_weights_norm')) throw new Error('bailingmoe3 without expert_weights_norm: not implemented');
  if (g('attention.q_lora_rank')) throw new Error('bailingmoe3 with a q LoRA (Ling 3.1): not implemented');
  if (g('rope.dimension_sections')) throw new Error('bailingmoe3 with mrope sections (the VL file): not implemented');
  const allLayers = g('block_count'), nextn = g('nextn_predict_layers') || 0, modelLayers = allLayers - nextn;
  const lead = g('leading_dense_block_count'), layers = modelLayers - lead;
  const kvH = g('attention.head_count_kv');
  return {
    arch: a, modelLayers, lead, layers,
    mla: Array.from({ length: modelLayers }, (_, l) => (Array.isArray(kvH) ? kvH[l] : kvH) > 0),
    hidden: g('embedding_length'), denseFf: g('feed_forward_length'), heads: g('attention.head_count'),
    kdaHd: g('kda.head_dim'), conv: g('ssm.conv_kernel'), gateLow: g('kda.gate_lower_bound'),
    kvRank: g('attention.kv_lora_rank'), qkHd: g('attention.key_length_mla'), vHd: g('attention.value_length_mla'),
    nRot: g('rope.dimension_count'), ropeTheta: g('rope.freq_base'),
    experts: g('expert_count'), topK: g('expert_used_count'), groups: g('expert_group_count'), groupsUsed: g('expert_group_used_count'),
    expertFf: g('expert_feed_forward_length'), shexpFf: g('expert_shared_feed_forward_length'), expScale: g('expert_weights_scale') ?? 1,
    clampExp: g('swiglu_clamp_exp') || [], clampShexp: g('swiglu_clamp_shexp') || [],
    eps: g('attention.layer_norm_rms_epsilon'), contextLength: g('context_length'),
    vocab: kv['tokenizer.ggml.tokens'].length, bos: kv['tokenizer.ggml.bos_token_id'], eos: kv['tokenizer.ggml.eos_token_id'],
    // Base-class fields the pool and readback size from.
    kvHeads: 1, headDim: g('attention.key_length_mla'),
  };
}

// ── Store layout ──
// One expert record = 256-byte guS and dS (unused), down rows (dQ), then gate rows and up rows (Q4_K, guQ). Down is
// Q6_K on 17 layers and Q4_K on 23, so dQ is sized for Q6_K and a Q4_K layer leaves a gap after its down rows; guQ
// last means every record ends in written bytes, so the file reaches its full length. Dense tensors are raw copies;
// the MTP layer is skipped.
const KEEP_TYPES = new Set([GGML.F32, QTYPES.Q4_K.id, QTYPES.Q6_K.id, QTYPES.Q5_0.id]);
const typeName = (id) => (id === GGML.F32 ? 'f32' : QTYPE_BY_ID[id]);
const nBytes = (t) => { const n = t.dims.reduce((x, y) => x * y, 1); return t.type === GGML.F32 ? n * 4 : (n / QTYPES[QTYPE_BY_ID[t.type]].qk) * QTYPES[QTYPE_BY_ID[t.type]].block; };

export function planLayoutLing(gguf) {
  const cfg = configFromGgufLing(gguf.kv), H = cfg.hidden, F = cfg.expertFf;
  const gu = 2 * F * rowBytes('Q4_K', H), dn = Math.max(H * rowBytes('Q6_K', F), H * rowBytes('Q4_K', F));
  const parts = { guS: { off: 0, bytes: 256 }, dS: { off: 256, bytes: 256 }, dQ: { off: 512, bytes: dn }, guQ: { off: 512 + dn, bytes: gu } };
  const record = parts.guQ.off + parts.guQ.bytes;
  const dense = {}, downType = [];
  let off = 0;
  const take = (n) => { const o = off; off += Math.ceil(n / 256) * 256; return o; };
  for (const t of gguf.tensors) {
    const layer = /^blk\.(\d+)\./.exec(t.name);
    if (layer && Number(layer[1]) >= cfg.modelLayers) continue;          // the MTP head
    if (!KEEP_TYPES.has(t.type)) throw new Error(`${t.name}: unsupported type ${t.type} (this engine reads inclusionAI's Q4_K_M file)`);
    const m = /^blk\.(\d+)\.ffn_(gate|up|down)_exps\.weight$/.exec(t.name);
    if (m) {
      const want = m[2] === 'down' ? null : QTYPES.Q4_K.id;
      if (want !== null && t.type !== want) throw new Error(`${t.name}: experts gate/up must be Q4_K`);
      if (m[2] === 'down') downType[Number(m[1]) - cfg.lead] = typeName(t.type);
      continue;
    }
    const n = nBytes(t);
    dense[t.name] = { type: typeName(t.type), dims: t.dims, raw: { off: take(n), bytes: n } };
  }
  for (let l = 0; l < cfg.layers; l++) if (!downType[l]) throw new Error(`bailingmoe3: no ffn_down_exps for layer ${l + cfg.lead}`);
  return {
    config: cfg, downType,
    experts: { file: 'experts.bin', record, parts, layers: cfg.layers, perLayer: cfg.experts, bytes: record * cfg.layers * cfg.experts },
    dense: { file: 'dense.bin', bytes: off, tensors: dense },
  };
}

// Every unit is a raw copy: expert slices to their record, dense tensors in bands of at most 8 MB.
export function planUnitsLing(gguf, layout) {
  const units = [];
  const { record, parts, perLayer } = layout.experts, { lead, modelLayers, hidden: H, expertFf: F } = layout.config;
  const gateBytes = F * rowBytes('Q4_K', H), band = 8 << 20;
  for (const t of gguf.tensors) {
    const abs = gguf.dataStart + t.offset;
    const layer = /^blk\.(\d+)\./.exec(t.name);
    if (layer && Number(layer[1]) >= modelLayers) continue;
    const m = /^blk\.(\d+)\.ffn_(gate|up|down)_exps\.weight$/.exec(t.name);
    if (m) {
      const l = Number(m[1]) - lead, slice = nBytes(t) / perLayer;
      const dst = m[2] === 'down' ? parts.dQ.off : parts.guQ.off + (m[2] === 'up' ? gateBytes : 0);
      for (let e = 0; e < perLayer; e++) units.push({ src: abs + e * slice, len: slice, file: 'experts', raw: (l * perLayer + e) * record + dst });
      continue;
    }
    const d = layout.dense.tensors[t.name];
    for (let o = 0; o < d.raw.bytes; o += band) units.push({ src: abs + o, len: Math.min(band, d.raw.bytes - o), file: 'dense', raw: d.raw.off + o });
  }
  units.sort((a, b) => a.src - b.src);
  return units;
}

// ── Tokenizer: byte-level BPE, llama.cpp LLAMA_VOCAB_PRE_TYPE_BAILINGMOE (tokenizer.ggml.pre = bailingmoe2): the Qwen2
// split with its newline piece written \s*[\r\n] (Qwen2: \s*[\r\n]+). Possessive quantifiers spelled greedy, as llama.cpp.
const BAILING_PRE = /(?:'[sSdDmMtT]|'[lL][lL]|'[vV][eE]|'[rR][eE])|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s*[\r\n]|\s+(?!\S)|\s+/gu;
export class LingTokenizer extends BpeTokenizer {
  constructor(kv) { super(kv); this.preRe = BAILING_PRE; }
}

// The GGUF's Bailing V3 template (no tools): '<role>SYSTEM</role>' + system text + 'detailed thinking on|off' +
// '<|role_end|>', then '<role>HUMAN</role>…<|role_end|>' and '<role>ASSISTANT</role>\n<think>…</think>…<|role_end|>',
// ending in '<role>ASSISTANT</role>\n<think>' (thinking on) or '…\n<think></think>' (off). Earlier replies keep their
// reasoning (preserved_thinking).
export function lingChatPrompt(messages, { enableThinking = true } = {}) {
  const opt = enableThinking ? 'on' : 'off';
  const first = messages[0] && messages[0].role === 'system' ? messages[0] : null;
  const text = (c) => (typeof c === 'string' ? c : '');
  let s = '<role>SYSTEM</role>';
  if (first && /detailed thinking (on|off)/.test(text(first.content))) s += text(first.content) + '<|role_end|>';
  else s += (first ? text(first.content) + '\n' : '') + `detailed thinking ${opt}<|role_end|>`;
  for (let i = first ? 1 : 0; i < messages.length; i++) {
    const m = messages[i], c = text(m.content);
    if (m.role === 'user') s += '<role>HUMAN</role>' + c + '<|role_end|>';
    else if (m.role === 'system') s += '<role>SYSTEM</role>' + c + '<|role_end|>';
    else if (m.role === 'assistant') {
      let reasoning = typeof m.reasoning_content === 'string' ? m.reasoning_content : '', content = c;
      if (!reasoning && content.includes('</think>')) {
        reasoning = content.split('</think>')[0].replace(/\n+$/, '').split('<think>').pop().replace(/^\n+/, '');
        content = content.split('</think>').pop().replace(/^\n+/, '');
      }
      s += reasoning ? '<role>ASSISTANT</role>\n<think>' + reasoning.replace(/^\n+|\n+$/g, '') + '</think>' + content.replace(/^\n+/, '')
        : '<role>ASSISTANT</role>\n<think></think>' + content;
      s += '<|role_end|>';
    } else if (m.role === 'tool') {
      if (i === 0 || messages[i - 1].role !== 'tool') s += '<role>OBSERVATION</role>';
      s += '\n<tool_response>\n' + c + '\n</tool_response>';
      if (i === messages.length - 1 || messages[i + 1].role !== 'tool') s += '<|role_end|>';
    }
  }
  return s + '<role>ASSISTANT</role>' + (enableThinking ? '\n<think>' : '\n<think></think>');
}

// ── Kernels ──
const SIGM = 'fn sigm(x: f32) -> f32 { return 1.0 / (1.0 + exp(-x)); }';
const LK = {
  // x += a (n values); also used for the shared expert's output.
  addInPlace: `
struct P { n: u32 }
@group(0) @binding(0) var<storage, read_write> x: array<f32>;
@group(0) @binding(1) var<storage, read> a: array<f32>;
@group(0) @binding(2) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) { if (g.x < p.n) { x[g.x] = x[g.x] + a[g.x]; } }`,
  // act[z·F + j] = min(silu(g), L)·clamp(u, -L, L) with g = gu[z·2F + j], u = gu[z·2F + F + j]; L = 0 means no clamp.
  swiglu: `
struct P { F: u32, k: u32, L: f32, pad: u32 }
@group(0) @binding(0) var<storage, read> gu: array<f32>;
@group(0) @binding(1) var<storage, read_write> act: array<f32>;
@group(0) @binding(2) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; if (i >= p.k * p.F) { return; }
  let z = i / p.F; let j = i % p.F;
  let g0 = gu[z * 2u * p.F + j]; var u = gu[z * 2u * p.F + p.F + j];
  var sg = g0 / (1.0 + exp(-g0));
  if (p.L > 0.0) { u = clamp(u, -p.L, p.L); sg = min(sg, p.L); }
  act[i] = sg * u;
}`,
  // x[h] += Σ_j w_j · out[j·H + h] + shared[h]; weights are the selection's second half.
  moeAccum: `
struct P { H: u32, k: u32 }
@group(0) @binding(0) var<storage, read> out: array<f32>;
@group(0) @binding(1) var<storage, read> sel: array<u32>;
@group(0) @binding(2) var<storage, read> sh: array<f32>;
@group(0) @binding(3) var<storage, read_write> x: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let h = g.x; if (h >= p.H) { return; }
  var acc = 0.0;
  for (var j = 0u; j < p.k; j++) { acc += bitcast<f32>(sel[p.k + j]) * out[j * p.H + h]; }
  x[h] = x[h] + (acc + sh[h]);
}`,
  // Group-limited sigmoid routing (build_moe_ffn with exp_probs_b and n_expert_groups). 512 experts, 2 per thread.
  // sel[0..k) = expert ids, sel[k..2k) = weights (f32 bits).
  routeLing: `
struct P { n: u32, k: u32, groups: u32, used: u32, scale: f32, pad0: u32, pad1: u32, pad2: u32 }
@group(0) @binding(0) var<storage, read> lg: array<f32>;
@group(0) @binding(1) var<storage, read> bias: array<f32>;
@group(0) @binding(2) var<storage, read_write> sel: array<u32>;
@group(0) @binding(3) var<uniform> p: P;
${SIGM}
var<workgroup> sc: array<f32, 512>;
var<workgroup> gs: array<f32, 16>;
var<workgroup> keep: array<u32, 16>;
var<workgroup> red: array<f32, 256>;
var<workgroup> bi: array<u32, 256>;
var<workgroup> picks: array<u32, 32>;
@compute @workgroup_size(256) fn main(@builtin(local_invocation_id) l: vec3<u32>) {
  let t = l.x; let per = p.n / p.groups;
  for (var e = t; e < p.n; e += 256u) { sc[e] = sigm(lg[e]) + bias[e]; }
  workgroupBarrier();
  if (t < p.groups) {
    var a = -3.4e38; var b = -3.4e38;
    for (var e = t * per; e < (t + 1u) * per; e++) { let v = sc[e]; if (v > a) { b = a; a = v; } else if (v > b) { b = v; } }
    gs[t] = a + b; keep[t] = 0u;
  }
  workgroupBarrier();
  if (t == 0u) {
    for (var j = 0u; j < p.used; j++) {
      var best = 0u; var bv = -3.4e38;
      for (var q = 0u; q < p.groups; q++) { if (keep[q] == 0u && gs[q] > bv) { bv = gs[q]; best = q; } }
      keep[best] = 1u;
    }
  }
  workgroupBarrier();
  var m0 = select(-3.4e38, sc[t], keep[t / per] == 1u);
  var m1 = select(-3.4e38, sc[t + 256u], keep[(t + 256u) / per] == 1u);
  for (var j = 0u; j < p.k; j++) {
    if (m0 >= m1) { red[t] = m0; bi[t] = t; } else { red[t] = m1; bi[t] = t + 256u; }
    workgroupBarrier();
    for (var s = 128u; s > 0u; s >>= 1u) {
      if (t < s) { let o = red[t + s]; if (o > red[t] || (o == red[t] && bi[t + s] < bi[t])) { red[t] = o; bi[t] = bi[t + s]; } }
      workgroupBarrier();
    }
    if (t == 0u) { picks[j] = bi[0]; }
    workgroupBarrier();
    if (picks[j] == t) { m0 = -3.4e38; }
    if (picks[j] == t + 256u) { m1 = -3.4e38; }
    workgroupBarrier();
  }
  if (t == 0u) {
    var wsum = 0.0;
    for (var j = 0u; j < p.k; j++) { wsum += sigm(lg[picks[j]]); }
    wsum = max(wsum, 6.103515625e-5);
    for (var j = 0u; j < p.k; j++) { sel[j] = picks[j]; sel[p.k + j] = bitcast<u32>((sigm(lg[picks[j]]) / wsum) * p.scale); }
  }
}`,
  // KDA short conv, one token: for channel c, y = silu(Σ_{i<3} w[4c+i]·st[3c+i] + w[4c+3]·x[c]); st shifts by one.
  convStep: `
struct P { n: u32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read_write> st: array<f32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let c = g.x; if (c >= p.n) { return; }
  let s0 = st[3u * c]; let s1 = st[3u * c + 1u]; let s2 = st[3u * c + 2u]; let xc = x[c];
  let a = w[4u * c] * s0 + w[4u * c + 1u] * s1 + w[4u * c + 2u] * s2 + w[4u * c + 3u] * xc;
  st[3u * c] = s1; st[3u * c + 1u] = s2; st[3u * c + 2u] = xc;
  y[c] = a / (1.0 + exp(-a));
}`,
  // KDA gates: g[c] = lo·sigmoid(a[c / hd]·(fa[c] + dtb[c])) (c < H·hd), beta[h] = sigmoid(bl[h]) (stored after g).
  kdaGates: `
struct P { n: u32, hd: u32, heads: u32, lo: f32 }
@group(0) @binding(0) var<storage, read> fa: array<f32>;
@group(0) @binding(1) var<storage, read> dtb: array<f32>;
@group(0) @binding(2) var<storage, read> A: array<f32>;
@group(0) @binding(3) var<storage, read> bl: array<f32>;
@group(0) @binding(4) var<storage, read_write> gb: array<f32>;
@group(0) @binding(5) var<uniform> p: P;
${SIGM}
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let c = g.x;
  if (c < p.n) { gb[c] = p.lo * sigm(A[c / p.hd] * (fa[c] + dtb[c])); }
  if (c < p.heads) { gb[p.n + c] = sigm(bl[c]); }
}`,
  // KDA delta rule, one token; one workgroup of 128 per head, lane j owns column j of S (st[h][j][i] = S[i][j]).
  // q and k are L2-normalised here (x / √(Σx² + eps)); gb holds g (H·hd) then β (H).
  kdaStep: `
struct P { hd: u32, n: u32, eps: f32, scale: f32 }
@group(0) @binding(0) var<storage, read> q: array<f32>;
@group(0) @binding(1) var<storage, read> k: array<f32>;
@group(0) @binding(2) var<storage, read> v: array<f32>;
@group(0) @binding(3) var<storage, read> gb: array<f32>;
@group(0) @binding(4) var<storage, read_write> st: array<f32>;
@group(0) @binding(5) var<storage, read_write> o: array<f32>;
@group(0) @binding(6) var<uniform> p: P;
var<workgroup> qs: array<f32, 128>;
var<workgroup> ks: array<f32, 128>;
var<workgroup> eg: array<f32, 128>;
var<workgroup> red: array<f32, 128>;
var<workgroup> red2: array<f32, 128>;
@compute @workgroup_size(128) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let h = wg.x; let j = l.x; let b = h * 128u;
  let qv = q[b + j]; let kv = k[b + j];
  red[j] = qv * qv; red2[j] = kv * kv; workgroupBarrier();
  for (var s = 64u; s > 0u; s >>= 1u) { if (j < s) { red[j] += red[j + s]; red2[j] += red2[j + s]; } workgroupBarrier(); }
  qs[j] = qv / sqrt(red[0] + p.eps); ks[j] = kv / sqrt(red2[0] + p.eps); eg[j] = exp(gb[b + j]);
  workgroupBarrier();
  let beta = gb[p.n + h];
  let row = (h * 128u + j) * 128u;
  var sk = 0.0;
  for (var i = 0u; i < 128u; i++) { let m = st[row + i] * eg[i]; st[row + i] = m; sk += m * ks[i]; }
  let d = (v[b + j] - sk) * beta;
  var acc = 0.0;
  for (var i = 0u; i < 128u; i++) { let m = st[row + i] + ks[i] * d; st[row + i] = m; acc += m * qs[i]; }
  o[b + j] = acc * p.scale;
}`,
  // y = RMSNorm(o_h)·w · sigmoid(gz) per head of hd (one workgroup of 128 per head).
  headNormGate: `
struct P { hd: u32, eps: f32 }
@group(0) @binding(0) var<storage, read> o: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read> gz: array<f32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
${SIGM}
var<workgroup> red: array<f32, 128>;
@compute @workgroup_size(128) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let i = wg.x * p.hd + l.x; let v = o[i];
  red[l.x] = v * v; workgroupBarrier();
  for (var s = 64u; s > 0u; s >>= 1u) { if (l.x < s) { red[l.x] += red[l.x + s]; } workgroupBarrier(); }
  y[i] = (v / sqrt(red[0] / f32(p.hd) + p.eps)) * w[l.x] * sigm(gz[i]);
}`,
  // MLA: the cache row for this token: c = RMSNorm(kva[0..R))·w, k_pe = RoPE(kva[R..R+nRot)); one workgroup.
  mlaKv: `
${TOK}
struct P { R: u32, nRot: u32, eps: f32, pad: u32 }
@group(0) @binding(0) var<storage, read> kva: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read> rope: array<f32>;
@group(0) @binding(3) var<storage, read_write> cache: array<f32>;
@group(0) @binding(4) var<uniform> tok: Tok;
@group(0) @binding(5) var<uniform> p: P;
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256) fn main(@builtin(local_invocation_id) l: vec3<u32>) {
  let t = l.x; var acc = 0.0;
  for (var i = t; i < p.R; i += 256u) { let v = kva[i]; acc += v * v; }
  red[t] = acc; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  let scale = 1.0 / sqrt(red[0] / f32(p.R) + p.eps);
  let base = tok.pos * (p.R + p.nRot);
  for (var i = t; i < p.R; i += 256u) { cache[base + i] = (kva[i] * scale) * w[i]; }
  if (t < p.nRot / 2u) {
    let a = kva[p.R + 2u * t]; let b = kva[p.R + 2u * t + 1u]; let c = rope[t]; let sn = rope[p.nRot / 2u + t];
    cache[base + p.R + 2u * t] = a * c - b * sn;
    cache[base + p.R + 2u * t + 1u] = a * sn + b * c;
  }
}`,
  // MLA query: qa[h][r] = Σ_d wkb[h][r][d]·q[h·qk + d] (d < nope), and the RoPE'd q_pe[h] after it: qa row = R + nRot.
  // One thread per (h, r) for r < R; threads r < nRot/2 of row R.. rotate the q_pe pairs.
  mlaQ: `
struct P { heads: u32, R: u32, nope: u32, nRot: u32 }
@group(0) @binding(0) var<storage, read> q: array<f32>;
@group(0) @binding(1) var<storage, read> wkb: array<f32>;
@group(0) @binding(2) var<storage, read> rope: array<f32>;
@group(0) @binding(3) var<storage, read_write> qa: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let h = wg.y; let r = wg.x * 256u + l.x; let qk = p.nope + p.nRot; let qb = h * qk; let ob = h * (p.R + p.nRot);
  if (r < p.R) {
    var acc = 0.0; let wb = (h * p.R + r) * p.nope;
    for (var d = 0u; d < p.nope; d++) { acc += wkb[wb + d] * q[qb + d]; }
    qa[ob + r] = acc;
  } else if (r < p.R + p.nRot / 2u) {
    let i = r - p.R;
    let a = q[qb + p.nope + 2u * i]; let b = q[qb + p.nope + 2u * i + 1u]; let c = rope[i]; let sn = rope[p.nRot / 2u + i];
    qa[ob + p.R + 2u * i] = a * c - b * sn;
    qa[ob + p.R + 2u * i + 1u] = a * sn + b * c;
  }
}`,
  // Scores sc[h·S + t] = qa[h]·cache[t] · scale over the R + nRot latent dims, t < seqLen. One thread per (h, t).
  mlaScore: `
${TOK}
struct P { heads: u32, D: u32, S: u32, scale: f32 }
@group(0) @binding(0) var<storage, read> qa: array<f32>;
@group(0) @binding(1) var<storage, read> cache: array<f32>;
@group(0) @binding(2) var<storage, read_write> sc: array<f32>;
@group(0) @binding(3) var<uniform> tok: Tok;
@group(0) @binding(4) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let i = (wg.y * ng.x + wg.x) * 256u + l.x; let h = i / tok.seqLen; let t = i % tok.seqLen;
  if (h >= p.heads) { return; }
  var acc = 0.0; let qb = h * p.D; let cb = t * p.D;
  for (var d = 0u; d < p.D; d++) { acc += qa[qb + d] * cache[cb + d]; }
  sc[h * p.S + t] = acc * p.scale;
}`,
  // Softmax over sc[h·S .. h·S + seqLen) in place; one workgroup per head.
  softmaxS: `
${TOK}
struct P { S: u32 }
@group(0) @binding(0) var<storage, read_write> sc: array<f32>;
@group(0) @binding(1) var<uniform> tok: Tok;
@group(0) @binding(2) var<uniform> p: P;
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let b = wg.x * p.S; let n = tok.seqLen; let t = l.x;
  var mx = -3.4e38; for (var i = t; i < n; i += 256u) { mx = max(mx, sc[b + i]); }
  red[t] = mx; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] = max(red[t], red[t + s]); } workgroupBarrier(); }
  let m = red[0]; workgroupBarrier();
  var sum = 0.0; for (var i = t; i < n; i += 256u) { let e = exp(sc[b + i] - m); sc[b + i] = e; sum += e; }
  red[t] = sum; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  let inv = 1.0 / red[0];
  for (var i = t; i < n; i += 256u) { sc[b + i] = sc[b + i] * inv; }
}`,
  // ol[h][r] = Σ_t sc[h·S + t]·cache[t][r], r < R. One thread per (h, r).
  mlaMix: `
${TOK}
struct P { heads: u32, R: u32, D: u32, S: u32 }
@group(0) @binding(0) var<storage, read> sc: array<f32>;
@group(0) @binding(1) var<storage, read> cache: array<f32>;
@group(0) @binding(2) var<storage, read_write> ol: array<f32>;
@group(0) @binding(3) var<uniform> tok: Tok;
@group(0) @binding(4) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let h = wg.y; let r = wg.x * 256u + l.x; if (r >= p.R) { return; }
  var acc = 0.0;
  for (var t = 0u; t < tok.seqLen; t++) { acc += sc[h * p.S + t] * cache[t * p.D + r]; }
  ol[h * p.R + r] = acc;
}`,
  // o[h·vd + d] = sigmoid(gt[h]) · Σ_r wvb[h][d][r]·ol[h][r]. One thread per (h, d).
  mlaOut: `
struct P { heads: u32, R: u32, vd: u32, pad: u32 }
@group(0) @binding(0) var<storage, read> ol: array<f32>;
@group(0) @binding(1) var<storage, read> wvb: array<f32>;
@group(0) @binding(2) var<storage, read> gt: array<f32>;
@group(0) @binding(3) var<storage, read_write> o: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
${SIGM}
@compute @workgroup_size(128) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let h = wg.x; let d = l.x; if (d >= p.vd) { return; }
  var acc = 0.0; let wb = (h * p.vd + d) * p.R; let ob = h * p.R;
  for (var r = 0u; r < p.R; r++) { acc += wvb[wb + r] * ol[ob + r]; }
  o[h * p.vd + d] = acc * sigm(gt[h]);
}`,
};

// Expert matvec over the pool: z = workgroup_id.z picks the expert, slot = slots[z]; rows start at slot·slotBytes;
// x is shared (xStride 0, gate‖up) or per expert (xStride F, down). y[z·M + m]. Generated per block type.
function expertKernel(type) {
  const CPB = QTYPES[type].qk / 32;
  return `
struct P { M: u32, N: u32, rowBytes: u32, slotBytes: u32, xStride: u32, pad0: u32, pad1: u32, pad2: u32 }
@group(0) @binding(0) var<storage, read> xa: array<f32>;
@group(0) @binding(1) var<storage, read> wq: array<u32>;
@group(0) @binding(2) var<storage, read> grid: array<u32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@group(0) @binding(5) var<storage, read> slots: array<u32>;
${deqFn(type)}
const R = 16u;
var<workgroup> red: array<f32, 1024>;
@compute @workgroup_size(64) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  _ = grid[0];
  let z = wg.z; let m0 = wg.x * R; let t = l.x; let nc = p.N / 32u;
  let base = slots[z] * p.slotBytes; let xo = z * p.xStride;
  var acc: array<f32, 16>;
  for (var c = t; c < nc; c += 64u) {
    var xv: array<f32, 32>;
    for (var i = 0u; i < 32u; i++) { xv[i] = xa[xo + c * 32u + i]; }
    let bo = (c / ${CPB}u) * ${gpuBlock(type)}u; let s = c % ${CPB}u;
    for (var r = 0u; r < R; r++) {
      let B = base + min(m0 + r, p.M - 1u) * p.rowBytes + bo;
      var a = 0.0;
      for (var g = 0u; g < 4u; g++) {
        let v = deq8(B, s, g);
        for (var j = 0u; j < 8u; j++) { a += v[j] * xv[8u * g + j]; }
      }
      acc[r] += a;
    }
  }
  for (var r = 0u; r < R; r++) { red[r * 64u + t] = acc[r]; }
  workgroupBarrier();
  for (var st = 32u; st > 0u; st >>= 1u) {
    if (t < st) { for (var r = 0u; r < R; r++) { red[r * 64u + t] += red[r * 64u + t + st]; } }
    workgroupBarrier();
  }
  if (t < R && m0 + t < p.M) { y[z * p.M + m0 + t] = red[t * 64u]; }
}`;
}

// Whole tensor → f32 (W_k_b, W_v_b at upload): thread i writes values 8i..8i+7 of the flat block sequence.
function deqAllKernel(type) {
  const CPB = QTYPES[type].qk / 32;
  return `
struct P { n8: u32 }
@group(0) @binding(0) var<storage, read> wq: array<u32>;
@group(0) @binding(1) var<storage, read> grid: array<u32>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
${deqFn(type)}
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  _ = grid[0];
  let i = (wg.y * ng.x + wg.x) * 256u + l.x; if (i >= p.n8) { return; }
  let c = i >> 2u; let g = i & 3u;
  let v = deq8((c / ${CPB}u) * ${gpuBlock(type)}u, c % ${CPB}u, g);
  for (var j = 0u; j < 8u; j++) { y[i * 8u + j] = v[j]; }
}`;
}

const TYPES = ['Q4_K', 'Q6_K', 'Q5_0'];

export class LingMoeSsd extends Qwen3MoeSsd {
  static configFrom(kv) { return configFromGgufLing(kv); }
  static tokenizerFrom(kv) { return new LingTokenizer(kv); }

  // Reads part 2's tensor table first, then ingests both parts as one file (splitFetch) with a plan over all tensors.
  // opts.url alone: one GGUF (a truncated test file), ingested as it is. opts.urls: the parts from elsewhere.
  static async load(modelId = null, opts = {}) {
    const src = opts.source || LING_FLASH;
    const baseFetch = opts.fetch || ((u, i) => fetch(u, i));
    if (opts.url && !opts.urls) {
      const One = class extends this { static get ingestPlan() { return { layout: planLayoutLing, units: planUnitsLing }; } };
      return Qwen3MoeSsd.load.call(One, modelId, { ...opts, source: { repo: src.repo, file: opts.url.split('/').pop(), revision: src.revision } });
    }
    const urls = opts.urls || src.parts.map((p) => `https://huggingface.co/${src.repo}/resolve/${src.revision}/${p.file}`);
    const sizes = src.parts.map((p) => p.size);
    const fetchFn = splitFetch(urls, sizes, baseFetch);
    let extra = null, partErr = null;
    const all = (gguf) => { if (!extra) throw partErr || new Error('Ling: part 2 header not read'); return { ...gguf, tensors: [...gguf.tensors, ...extra] }; };
    const plan = {
      layout: (gguf) => planLayoutLing(all(gguf)),
      units: (gguf, layout) => planUnitsLing(all(gguf), layout),
    };
    const self = this;
    const Sub = class extends self {
      static get ingestPlan() { return plan; }
      static async open(id, o) {
        // Part 2's tensors are needed only to ingest. Offline, a complete store still loads: the read fails, and the
        // plan (never called for a complete store) throws only if an ingest is needed.
        if (!extra) {
          try {
            const h = await baseFetch(urls[0], { headers: { Range: 'bytes=0-16777215' }, cache: 'no-store' });
            const g1 = parseGguf(new Uint8Array(await h.arrayBuffer()));
            extra = await readPartTensors(urls[1], sizes[0], g1.dataStart, baseFetch);
          } catch (e) { partErr = e; }
        }
        return super.open(id, o);
      }
    };
    return Qwen3MoeSsd.load.call(Sub, modelId, { ...opts, fetch: fetchFn, url: 'split:' + urls[0], key: opts.key || 'ling-3.0-flash-q4_k_m', source: { repo: src.repo, file: src.file, revision: src.revision, size: src.size } });
  }

  chatPrompt(messages, opts) { return lingChatPrompt(messages, opts); }
  get stopTokenIds() { return [this.cfg.eos, this.tokenizer.ids.get('<|endoftext|>')].filter((t) => t !== undefined); }
  get thinkOpenTokenId() { return this.tokenizer.ids.get('<think>') ?? null; }
  get thinkCloseTokenId() { return this.tokenizer.ids.get('</think>') ?? null; }
  get thinkInPrompt() { return true; }
  get alwaysThinks() { return false; }
  get thinkPreamble() { return ''; }

  get kernels() {
    if (!this._kernels) {
      const k = { rmsnorm: super.kernels.rmsnorm, matmulF32: super.kernels.matmulF32, argmax: super.kernels.argmax, ...LK };
      for (const t of TYPES) { k[`mv_${t}`] = mvKernel(t); k[`ex_${t}`] = expertKernel(t); k[`deq_${t}`] = deqAllKernel(t); }
      k.embed = embedKernel('Q4_K');
      this._kernels = k;
    }
    return this._kernels;
  }

  // The MLA cache (f32 [c | k_pe] per token on 7 layers) and the KDA state (f32 128×128 per head, 35 layers).
  kvBytes() {
    const c = this.cfg, D = c.kvRank + c.nRot, nMla = c.mla.filter(Boolean).length, nKda = c.modelLayers - nMla;
    return nMla * this.maxCtx * D * 4 + nKda * (c.heads * c.kdaHd * c.kdaHd + 3 * 3 * c.heads * c.kdaHd) * 4;
  }

  // Dense raw copies to the GPU, then W_k_b and W_v_b dequantized to f32 once (they serve per-head matvecs).
  async uploadDense(onProgress) {
    await super.uploadDense(onProgress);
    this.grid = this.buffer(gridData().byteLength, STORAGE | COPY_DST, 'dense');
    this.device.queue.writeBuffer(this.grid, 0, gridData());
    const enc = this.device.createCommandEncoder(), pass = enc.beginComputePass();
    this.f32 = {};
    for (const [name, d] of Object.entries(this.manifest.dense.tensors)) {
      if (!/attn_(k|v)_b\.weight$/.test(name)) continue;
      const n = d.dims.reduce((a, b) => a * b, 1), out = this.buffer(n * 4, STORAGE, 'dense');
      const t = d.type, gr = this.bind(`deq_${t}`, [this.w[name].raw, this.grid, out, this.uniform([n / 8])]);
      this.dispatch(pass, `deq_${t}`, gr, Math.ceil(n / 8 / 256));
      this.f32[name] = out;
    }
    pass.end(); this.device.queue.submit([enc.finish()]);
    await this.device.queue.onSubmittedWorkDone();
  }

  // A matvec on a dense tensor of any kept type: { name, group, x } for encode.
  mv(name, x, y) {
    const d = this.manifest.dense.tensors[name];
    if (!d) throw new Error(`no tensor ${name}`);
    const [N, M] = d.dims;
    if (d.type === 'f32') return { k: 'matmulF32', g: this.bind('matmulF32', [x, this.w[name].raw, y, this.uniform([M, N])]), n: M };
    return { k: `mv_${d.type}`, g: this.bind(`mv_${d.type}`, [x, this.w[name].raw, this.grid, y, this.uniform([M, N, rowBytes(d.type, N), 0])]), n: Math.ceil(M / 16) };
  }

  initBuffers() {
    const c = this.cfg, H = c.hidden, K = c.topK, F = c.expertFf, hd = c.kdaHd, NK = c.heads * hd;
    const D = c.kvRank + c.nRot, R = c.kvRank, nope = c.qkHd - c.nRot;
    if (c.experts > 512 || c.topK > 32) throw new Error(`${c.experts} experts / top-${c.topK}: the router handles at most 512 / 32`);
    const A = (n) => this.buffer(n * 4, STORAGE | COPY_SRC | COPY_DST);
    const a = this.a = {
      x: A(H), xn: A(H), o: A(H), sh: A(H), pxn: A(H),
      q: A(Math.max(NK, c.heads * c.qkHd)), k: A(NK), v: A(NK), qc: A(NK), kc: A(NK), vc: A(NK), fa: A(NK), gz: A(NK), gb: A(NK + c.heads),
      bl: A(c.heads), att: A(Math.max(NK, c.heads * c.vHd)), att2: A(NK),
      kva: A(D), qa: A(c.heads * D), sc: A(c.heads * this.maxCtx), ol: A(c.heads * R), gt: A(c.heads),
      ffgu: A(2 * Math.max(c.denseFf, c.shexpFf)), ffact: A(Math.max(c.denseFf, c.shexpFf)),
      rl: A(c.experts), sel: A(2 * K), prl: A(c.experts), psel: A(64 * this.lookahead), slots: A(K),
      gu: A(K * 2 * F), act: A(K * F), dn: A(K * H), logits: A(c.vocab), am: A(4), rope: A(c.nRot),
    };
    this.tok = this.buffer(16, 0x40 | COPY_DST);
    this.rbSel = this.buffer(256 * (1 + this.lookahead), MAP_READ | COPY_DST);
    this.rbLogits = this.buffer(c.vocab * 4, MAP_READ | COPY_DST);
    this.rbArg = this.buffer(16, MAP_READ | COPY_DST);
    // Recurrent state and MLA caches, per model layer.
    this.state = []; this.convSt = []; this.cache = [];
    for (let l = 0; l < c.modelLayers; l++) {
      if (c.mla[l]) { this.cache[l] = this.buffer(this.maxCtx * D * 4, STORAGE, 'kv'); continue; }
      this.state[l] = this.buffer(c.heads * hd * hd * 4, STORAGE | COPY_DST, 'kv');
      this.convSt[l] = ['q', 'k', 'v'].map(() => this.buffer(3 * NK * 4, STORAGE | COPY_DST, 'kv'));
    }
    const W = this.w, P = (l, n) => `blk.${l}.${n}`, raw = (n) => W[n].raw;
    const u = {
      rmsH: this.uniform([H, { f: c.eps }]), nH: this.uniform([H]), nNK: this.uniform([NK]),
      gates: this.uniform([NK, hd, c.heads, { f: c.gateLow }]), kda: this.uniform([hd, NK, { f: c.eps }, { f: 1 / Math.sqrt(hd) }]),
      hng: this.uniform([hd, { f: c.eps }]), kv: this.uniform([R, c.nRot, { f: c.eps }, 0]),
      mq: this.uniform([c.heads, R, nope, c.nRot]), ms: this.uniform([c.heads, D, this.maxCtx, { f: 1 / Math.sqrt(c.qkHd) }]),
      soft: this.uniform([this.maxCtx]), mix: this.uniform([c.heads, R, D, this.maxCtx]), mo: this.uniform([c.heads, R, c.vHd, 0]),
      route: this.uniform([c.experts, K, c.groups, c.groupsUsed, { f: c.expScale }, 0, 0, 0]),
      acc: this.uniform([H, K]), am: this.uniform([c.vocab]),
    };
    this.u = u;
    const swi = (Fn, k, L) => this.uniform([Fn, k, { f: L || 0 }, 0]);
    const embd = this.manifest.dense.tensors['token_embd.weight'];
    this.g = { embed: this.bind('embed', [raw('token_embd.weight'), this.grid, a.x, this.tok, this.uniform([H, rowBytes(embd.type, H)])]) };
    this.trunk = [];
    for (let l = 0; l < c.modelLayers; l++) {
      const t = { rmsA: this.bind('rmsnorm', [a.x, raw(P(l, 'attn_norm.weight')), a.xn, u.rmsH]), mla: c.mla[l] };
      if (c.mla[l]) {
        t.q = this.mv(P(l, 'attn_q.weight'), a.xn, a.q);
        t.kva = this.mv(P(l, 'attn_kv_a_mqa.weight'), a.xn, a.kva);
        t.gate = this.mv(P(l, 'attn_gate.weight'), a.xn, a.gt);
        t.kv = this.bind('mlaKv', [a.kva, raw(P(l, 'attn_kv_a_norm.weight')), a.rope, this.cache[l], this.tok, u.kv]);
        t.mq = this.bind('mlaQ', [a.q, this.f32[P(l, 'attn_k_b.weight')], a.rope, a.qa, u.mq]);
        t.score = this.bind('mlaScore', [a.qa, this.cache[l], a.sc, this.tok, u.ms]);
        t.soft = this.bind('softmaxS', [a.sc, this.tok, u.soft]);
        t.mix = this.bind('mlaMix', [a.sc, this.cache[l], a.ol, this.tok, u.mix]);
        t.mo = this.bind('mlaOut', [a.ol, this.f32[P(l, 'attn_v_b.weight')], a.gt, a.att, u.mo]);
      } else {
        t.q = this.mv(P(l, 'attn_q.weight'), a.xn, a.q); t.k = this.mv(P(l, 'attn_k.weight'), a.xn, a.k); t.v = this.mv(P(l, 'attn_v.weight'), a.xn, a.v);
        t.fa = this.mv(P(l, 'ssm_f_a.weight'), a.xn, a.fa); t.gz = this.mv(P(l, 'ssm_g_a.weight'), a.xn, a.gz); t.bl = this.mv(P(l, 'ssm_beta.weight'), a.xn, a.bl);
        t.conv = [['q', a.q, a.qc], ['k', a.k, a.kc], ['v', a.v, a.vc]].map(([n, x, y], i) =>
          this.bind('convStep', [x, raw(P(l, `ssm_conv1d_${n}.weight`)), this.convSt[l][i], y, u.nNK]));
        t.gates = this.bind('kdaGates', [a.fa, raw(P(l, 'ssm_dt.bias')), raw(P(l, 'ssm_a')), a.bl, a.gb, u.gates]);
        t.delta = this.bind('kdaStep', [a.qc, a.kc, a.vc, a.gb, this.state[l], a.att2, u.kda]);
        t.hng = this.bind('headNormGate', [a.att2, raw(P(l, 'ssm_norm.weight')), a.gz, a.att, u.hng]);
      }
      t.o = this.mv(P(l, 'attn_output.weight'), a.att, a.o);
      t.addO = this.bind('addInPlace', [a.x, a.o, u.nH]);
      t.rmsF = this.bind('rmsnorm', [a.x, raw(P(l, 'ffn_norm.weight')), a.xn, u.rmsH]);
      const ffn = (gate, up, down, Fn, L) => ({
        g: this.mv(P(l, gate), a.xn, a.ffgu), u: this.muOff(P(l, up), a.xn, a.ffgu, Fn),
        act: this.bind('swiglu', [a.ffgu, a.ffact, swi(Fn, 1, L)]), d: this.mv(P(l, down), a.ffact, a.sh), F: Fn,
      });
      if (l < c.lead) {
        t.ffn = ffn('ffn_gate.weight', 'ffn_up.weight', 'ffn_down.weight', c.denseFf, 0);
        t.addF = this.bind('addInPlace', [a.x, a.sh, u.nH]);
      } else {
        t.shexp = ffn('ffn_gate_shexp.weight', 'ffn_up_shexp.weight', 'ffn_down_shexp.weight', c.shexpFf, c.clampShexp[l]);
        t.router = this.mv(P(l, 'ffn_gate_inp.weight'), a.xn, a.rl);
        t.route = this.bind('routeLing', [a.rl, raw(P(l, 'exp_probs_b.bias')), a.sel, u.route]);
      }
      this.trunk.push(t);
    }
    // MoE layer view for the base step loop: layer l = model layer lead + l.
    const xp = this.manifest.experts, slotGu = xp.parts.guQ.bytes, slotDn = xp.parts.dQ.bytes, Hb = rowBytes('Q4_K', H);
    this.layers = [];
    for (let l = 0; l < c.layers; l++) {
      const ml = c.lead + l, dt = this.manifest.downType[l];
      this.layers.push({
        pf: Array.from({ length: Math.min(this.lookahead, c.layers - 1 - l) }, (_, i) => {
          const nl = ml + 1 + i;
          return {
            rms: this.bind('rmsnorm', [a.x, raw(P(nl, 'ffn_norm.weight')), a.pxn, u.rmsH]),
            router: this.mv(P(nl, 'ffn_gate_inp.weight'), a.pxn, a.prl),
            route: this.device.createBindGroup({ layout: this.pipeline('routeLing').getBindGroupLayout(0), entries: [
              { binding: 0, resource: { buffer: a.prl } }, { binding: 1, resource: { buffer: raw(P(nl, 'exp_probs_b.bias')) } },
              { binding: 2, resource: { buffer: a.psel, offset: 256 * i, size: 8 * K } }, { binding: 3, resource: { buffer: u.route } },
            ] }),
          };
        }),
        gu: this.bind('ex_Q4_K', [a.xn, this.pool.guQ, this.grid, a.gu, this.uniform([2 * F, H, Hb, slotGu, 0, 0, 0, 0]), a.slots]),
        act: this.bind('swiglu', [a.gu, a.act, swi(F, K, c.clampExp[ml])]),
        dn: this.bind(`ex_${dt}`, [a.act, this.pool.dQ, this.grid, a.dn, this.uniform([H, F, rowBytes(dt, F), slotDn, F, 0, 0, 0]), a.slots]),
        dk: `ex_${dt}`,
        acc: this.bind('moeAccum', [a.dn, a.sel, a.sh, a.x, u.acc]),
      });
    }
    this.g.rmsOut = this.bind('rmsnorm', [a.x, raw('output_norm.weight'), a.xn, u.rmsH]);
    this.g.lm = this.mv('output.weight', a.xn, a.logits);
    this.g.am = this.bind('argmax', [a.logits, a.am, u.am]);
    this.clearState();
  }

  // The up half of a gate‖up buffer: the same matvec written Fn floats in (a bind group over y at an offset).
  muOff(name, x, y, Fn) {
    const d = this.manifest.dense.tensors[name], [N, M] = d.dims;
    const g = this.device.createBindGroup({ layout: this.pipeline(`mv_${d.type}`).getBindGroupLayout(0), entries: [
      { binding: 0, resource: { buffer: x } }, { binding: 1, resource: { buffer: this.w[name].raw } }, { binding: 2, resource: { buffer: this.grid } },
      { binding: 3, resource: { buffer: y, offset: Fn * 4, size: M * 4 } }, { binding: 4, resource: { buffer: this.uniform([M, N, rowBytes(d.type, N), 0]) } },
    ] });
    return { k: `mv_${d.type}`, g, n: Math.ceil(M / 16) };
  }

  clearState() {
    const enc = this.device.createCommandEncoder();
    for (const s of this.state) if (s) enc.clearBuffer(s);
    for (const cs of this.convSt) if (cs) for (const b of cs) enc.clearBuffer(b);
    this.device.queue.submit([enc.finish()]);
  }

  // ── forward ──
  run(pass, m) { this.dispatch(pass, m.k, m.g, m.n); }
  encodeFfn(pass, f) {
    const d = (n, g, x, y, z) => this.dispatch(pass, n, g, x, y, z);
    this.run(pass, f.g); this.run(pass, f.u);
    d('swiglu', f.act, Math.ceil(f.F / 256));
    this.run(pass, f.d);
  }
  // Model layer ml's attention block, then (MoE layers) its FFN norm, shared expert, router and the prefetch guesses.
  encodeTrunk(pass, ml, seqLen, pf) {
    const c = this.cfg, t = this.trunk[ml], d = (n, g, x, y, z) => this.dispatch(pass, n, g, x, y, z), H = c.hidden, NK = c.heads * c.kdaHd;
    d('rmsnorm', t.rmsA, 1);
    if (t.mla) {
      this.run(pass, t.q); this.run(pass, t.kva); this.run(pass, t.gate);
      d('mlaKv', t.kv, 1);
      d('mlaQ', t.mq, Math.ceil((c.kvRank + c.nRot / 2) / 256), c.heads);
      d('mlaScore', t.score, Math.ceil(c.heads * seqLen / 256));
      d('softmaxS', t.soft, c.heads);
      d('mlaMix', t.mix, Math.ceil(c.kvRank / 256), c.heads);
      d('mlaOut', t.mo, c.heads);
    } else {
      this.run(pass, t.q); this.run(pass, t.k); this.run(pass, t.v); this.run(pass, t.fa); this.run(pass, t.gz); this.run(pass, t.bl);
      for (const g of t.conv) d('convStep', g, Math.ceil(NK / 256));
      d('kdaGates', t.gates, Math.ceil(NK / 256));
      d('kdaStep', t.delta, c.heads);
      d('headNormGate', t.hng, c.heads);
    }
    this.run(pass, t.o);
    d('addInPlace', t.addO, Math.ceil(H / 256));
    d('rmsnorm', t.rmsF, 1);
    if (t.ffn) { this.encodeFfn(pass, t.ffn); d('addInPlace', t.addF, Math.ceil(H / 256)); return; }
    if (this.prefetch && pf) for (const p of pf) { d('rmsnorm', p.rms, 1); this.run(pass, p.router); d('routeLing', p.route, 1); }
    this.encodeFfn(pass, t.shexp);
    this.run(pass, t.router);
    d('routeLing', t.route, 1);
  }
  // The base loop's attention hook for MoE layer l: the dense lead layers go first with layer 0.
  encodeAttention(pass, l, seqLen) {
    if (l === 0) for (let ml = 0; ml < this.cfg.lead; ml++) this.encodeTrunk(pass, ml, seqLen, null);
    this.encodeTrunk(pass, this.cfg.lead + l, seqLen, this.layers[l].pf);
  }
  encodeExperts(pass, l) {
    const c = this.cfg, g = this.layers[l], d = (n, gr, x, y, z) => this.dispatch(pass, n, gr, x, y, z);
    d('ex_Q4_K', g.gu, Math.ceil(2 * c.expertFf / 16), 1, c.topK);
    d('swiglu', g.act, Math.ceil(c.topK * c.expertFf / 256));
    d(g.dk, g.dn, Math.ceil(c.hidden / 16), 1, c.topK);
    d('moeAccum', g.acc, Math.ceil(c.hidden / 256));
  }
  encodeEmbed(pass) { this.dispatch(pass, 'embed', this.g.embed, Math.ceil(this.cfg.hidden / 8 / 256)); }
  encodeHead(pass, want) {
    this.dispatch(pass, 'rmsnorm', this.g.rmsOut, 1);
    this.run(pass, this.g.lm);
    if (want === 'argmax') this.dispatch(pass, 'argmax', this.g.am, 1);
  }

  writeTokenUniforms(token, pos) {
    const c = this.cfg;
    this.device.queue.writeBuffer(this.tok, 0, new Uint32Array([token, pos, pos + 1, 0]));
    // GGML NORM RoPE angles: pair i turns by pos · base^(-2i/nRot); cos then sin.
    const half = c.nRot / 2, r = new Float32Array(c.nRot), inv = Math.fround(-1 / c.nRot);
    for (let i = 0; i < half; i++) {
      const th = Math.fround(pos * Math.fround(Math.pow(c.ropeTheta, Math.fround(inv * 2 * i))));
      r[i] = Math.cos(th); r[half + i] = Math.sin(th);
    }
    this.device.queue.writeBuffer(this.a.rope, 0, r);
  }

  reset() { super.reset(); if (this.state) this.clearState(); }
  // The KDA state cannot step back: a prompt that extends the cached tokens continues, any other starts over.
  async prefill(ids, want = 'argmax') {
    let common = 0;
    while (common < ids.length - 1 && common < this.cached.length && this.cached[common] === ids[common]) common++;
    if (common < this.cached.length) { this.reset(); common = 0; }
    let r = null;
    for (let i = common; i < ids.length; i++) r = await this.step(ids[i], i === ids.length - 1 ? want : 'none');
    return r;
  }
}
