/* gemma4_moe_ssd.js — Gemma 4 26B-A4B (GGUF arch `gemma4`, MoE) with its routed experts on disk:
 * rung 2c of the SSD-streaming ladder. Reuses rung 2a/2b's OPFS ingest, reader pool and expert streamer
 * (qwen3_moe_ssd.js, moe-expert-stream.js); what differs is the file format and the trunk.
 *
 * The math follows llama.cpp b9830's src/models/gemma4.cpp (notes: LocalMind plan/gemma4-26b-a4b-port-notes.md;
 * a numpy copy of it, scripts/gemma4-ref.py, gives per-layer states to compare against). Per layer:
 *   attention: RMS norm → Q/K/V (Q4_0) → per-head RMS norm on Q and K (weighted) and V (unweighted; full-attention
 *   layers have no V projection and reuse K's) → NeoX RoPE (sliding layers: 256-dim heads, base 1e4; full layers:
 *   512-dim heads, base 1e6, `rope_freqs` leaves all but the first 64 pairs unrotated) → attention with scale 1.0,
 *   sliding layers over the last 1024 positions → output projection → post-norm → residual;
 *   FFN: a dense GELU MLP (2112) beside the MoE block (128 experts, top 8, GELU, a per-expert down scale), the router
 *   on rms_norm(x)·(1/√H)·scale; each branch post-normed, summed, normed again → residual → × layer_output_scale.
 * Embedding: Q6_K rows × √H; head: the same Q6_K table, then a soft cap tanh(l/30)·30.
 *
 * File format (google/gemma-4-26B-A4B-it-qat-q4_0-gguf): matmul weights Q4_0, norms / router / scales F32,
 * the token embedding (tied output head) Q6_K. Experts: fused `ffn_gate_up_exps` [H, 2F, E] (gate rows first)
 * and `ffn_down_exps` [F, H, E], both Q4_0, plus `ffn_down_exps.scale` [E].
 */

import { Qwen3MoeSsd, GGML, Q4_BLOCK, Q6K_BLOCK, tensorBytes, TOK, STORAGE, COPY_SRC, COPY_DST, MAP_READ } from './qwen3_moe_ssd.js';
import { OpfsReaderPool } from './opfs-reader.js';

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

export const GEMMA4_26B_A4B = {
  repo: 'google/gemma-4-26B-A4B-it-qat-q4_0-gguf',
  file: 'gemma-4-26B_q4_0-it.gguf',
  revision: 'd1c082be9cf3c8a514acf63b8761f4b41935842e',
  sha256: '3eca3b8f6d7baf218a7dd6bba5fb59a56ee25fe2d567b6f5f589b4f697eca51d',
  size: 14439363584,
};

// The GGUF's chat template (text turns): <bos>, a system turn when there is a system message or thinking is on
// (<|think|> first), then <|turn>user|model … <turn|> per message, and the model turn opened. With thinking off
// the model turn starts with an empty thought channel. Earlier model turns lose their thought channels.
const stripThinking = (t) => t.split('<channel|>').map((p) => (p.includes('<|channel>') ? p.split('<|channel>')[0] : p)).join('').trim();
export function gemmaChatPrompt(messages, { enableThinking = false } = {}) {
  let s = '<bos>', msgs = messages;
  const sys = msgs.length && msgs[0].role === 'system' ? String(msgs[0].content).trim() : null;
  if (enableThinking || sys !== null) {
    s += '<|turn>system\n' + (enableThinking ? '<|think|>\n' : '') + (sys ?? '') + '<turn|>\n';
    if (sys !== null) msgs = msgs.slice(1);
  }
  for (const m of msgs) {
    const role = m.role === 'assistant' ? 'model' : m.role;
    s += `<|turn>${role}\n${role === 'model' ? stripThinking(String(m.content)) : String(m.content).trim()}<turn|>\n`;
  }
  return s + '<|turn>model\n' + (enableThinking ? '' : '<|channel>thought\n<channel|>');
}

// ── Tokenizer: SentencePiece-style BPE (GGUF tokenizer.ggml.model = gemma4) ──
// As llama.cpp's LLAMA_VOCAB_PRE_TYPE_GEMMA4: spaces become ▁, the text splits only into runs of newlines and
// runs of everything else, merges run on raw UTF-8 characters in rank order (leftmost first on equal ranks),
// and a run made only of newlines that is itself a token stays whole. A character with no token falls back
// to <0xXX> byte tokens (SentencePiece byte fallback; llama.cpp drops it instead).
export class GemmaTokenizer {
  constructor(kv) {
    this.tokens = kv['tokenizer.ggml.tokens'];
    const types = kv['tokenizer.ggml.token_type'] || [];
    const n = this.tokens.length;
    // Three strings appear twice in the vocab ('#', '//', '<?'); llama.cpp's map keeps the later id.
    this.ids = new Map();
    for (let i = 0; i < n; i++) this.ids.set(this.tokens[i], i);
    this.ranks = new Map((kv['tokenizer.ggml.merges'] || []).map((m, i) => [m, i]));
    this.isSpecial = new Uint8Array(n); this.byteOf = new Int16Array(n).fill(-1); this.byteTok = new Int32Array(256).fill(-1);
    const special = [];
    for (let i = 0; i < n; i++) {
      if (types[i] === 3 || types[i] === 4) { special.push(this.tokens[i]); this.isSpecial[i] = 1; }
      const m = types[i] === 6 && /^<0x([0-9A-Fa-f]{2})>$/.exec(this.tokens[i]);
      if (m) { const b = parseInt(m[1], 16); this.byteOf[i] = b; this.byteTok[b] = i; }
    }
    special.sort((a, b) => b.length - a.length);
    const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    this.specialRe = special.length ? new RegExp(`(${special.map(esc).join('|')})`) : null;
    this.utf8 = new TextEncoder();
  }
  encode(text, { parseSpecial = true } = {}) {
    const out = [];
    const pieces = parseSpecial && this.specialRe ? text.split(this.specialRe) : [text];
    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      if (!piece) continue;
      if (parseSpecial && i % 2 === 1) { out.push(this.ids.get(piece)); continue; }
      for (const [run] of piece.replaceAll(' ', '▁').matchAll(/[^\n]+|\n+/g)) {
        const whole = run[0] === '\n' ? this.ids.get(run) : undefined;
        if (whole !== undefined) out.push(whole); else this.bpe(run, out);
      }
    }
    return out;
  }
  // Rank-ordered merges over a linked list of symbols, with a binary heap of candidate pairs.
  bpe(word, out) {
    const text = Array.from(word), n = text.length;
    const prev = Int32Array.from({ length: n }, (_, i) => i - 1), next = Int32Array.from({ length: n }, (_, i) => (i + 1 < n ? i + 1 : -1));
    const heap = [];
    const less = (a, b) => a.rank < b.rank || (a.rank === b.rank && a.left < b.left);
    const push = (e) => { heap.push(e); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (!less(heap[i], heap[p])) break; [heap[i], heap[p]] = [heap[p], heap[i]]; i = p; } };
    const pop = () => {
      const top = heap[0], last = heap.pop();
      if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && less(heap[l], heap[m])) m = l; if (r < heap.length && less(heap[r], heap[m])) m = r; if (m === i) break; [heap[i], heap[m]] = [heap[m], heap[i]]; i = m; } }
      return top;
    };
    const pair = (left, right) => {
      if (left < 0 || right < 0) return;
      const t = text[left] + text[right], rank = this.ranks.get(text[left] + ' ' + text[right]);
      if (rank !== undefined) push({ rank, left, right, t });
    };
    for (let i = 1; i < n; i++) pair(i - 1, i);
    while (heap.length) {
      const b = pop();
      if (!text[b.left] || !text[b.right] || text[b.left] + text[b.right] !== b.t) continue;
      text[b.left] = b.t; text[b.right] = '';
      next[b.left] = next[b.right];
      if (next[b.right] >= 0) prev[next[b.right]] = b.left;
      pair(prev[b.left], b.left);
      pair(b.left, next[b.left]);
    }
    for (let i = 0; i >= 0 && i < n; i = next[i]) {
      if (!text[i]) continue;
      const id = this.ids.get(text[i]);
      if (id !== undefined) { out.push(id); continue; }
      for (const byte of this.utf8.encode(text[i])) if (this.byteTok[byte] >= 0) out.push(this.byteTok[byte]);
    }
    return out;
  }
  tokenBytes(id) {
    if (this.byteOf[id] >= 0) return Uint8Array.of(this.byteOf[id]);
    const t = this.tokens[id];
    return this.utf8.encode(this.isSpecial[id] ? t : t.replaceAll('▁', ' '));
  }
  decode(ids) {
    const chunks = ids.map((id) => this.tokenBytes(id));
    const all = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0));
    let o = 0; for (const c of chunks) { all.set(c, o); o += c.length; }
    return new TextDecoder().decode(all);
  }
}

// ── WGSL ────────────────────────────────────────────────────────────────────
// Q4_0 as two planes (ingest's splitQ4): nibbles, 16 bytes per 32 values (byte j holds values j and j + 16),
// and one f16 scale per 32. Value = (nibble − 8) · scale, as ggml dequantizes it. Each thread reads one u32 of
// nibbles: values 4m..4m+3 (low nibbles) and 16+4m..16+4m+3 (high nibbles) of block b.
const Q4DOT = `
fn q4dot(wd: u32, d: f32, xb: u32) -> f32 {
  let lo = (f32(wd & 15u) - 8.0) * xin[xb] + (f32((wd >> 8u) & 15u) - 8.0) * xin[xb + 1u]
         + (f32((wd >> 16u) & 15u) - 8.0) * xin[xb + 2u] + (f32((wd >> 24u) & 15u) - 8.0) * xin[xb + 3u];
  let hi = (f32((wd >> 4u) & 15u) - 8.0) * xin[xb + 16u] + (f32((wd >> 12u) & 15u) - 8.0) * xin[xb + 17u]
         + (f32((wd >> 20u) & 15u) - 8.0) * xin[xb + 18u] + (f32((wd >> 28u) & 15u) - 8.0) * xin[xb + 19u];
  return d * (lo + hi);
}`;
// Q6_K (ggml block_q6_K, 210 bytes per 256 values: ql[128], qh[64], int8 scales[16], f16 d), read in place
// from the GGUF bytes. Value t of the block at byte `blk`, exactly as dequantize_row_q6_K forms it.
const Q6K = `
fn byteAt(i: u32) -> u32 { return (qk[i >> 2u] >> ((i & 3u) * 8u)) & 0xffu; }
fn q6k(blk: u32, t: u32) -> f32 {
  let n = t >> 7u; let r = t & 127u; let qd = r >> 5u; let l = r & 31u;
  let lo = byteAt(blk + n * 64u + l + (qd & 1u) * 32u);
  let q4 = select(lo & 15u, lo >> 4u, qd >= 2u);
  let h = (byteAt(blk + 128u + n * 32u + l) >> (qd * 2u)) & 3u;
  let s8 = byteAt(blk + 192u + n * 8u + (l >> 4u) + qd * 2u);
  let sc = f32(select(i32(s8), i32(s8) - 256, s8 >= 128u));
  let d = unpack2x16float(byteAt(blk + 208u) | (byteAt(blk + 209u) << 8u)).x;
  return d * sc * f32(i32(q4 | (h << 4u)) - 32);
}`;
// tanh with its argument clamped: tanh(±10) is ±1 in f32, and a naive exp-based tanh would give NaN past ~44.
const TANH = 'fn tanhc(a: f32) -> f32 { return tanh(clamp(a, -10.0, 10.0)); }';
const GELU = `${TANH}
fn gelu(x: f32) -> f32 { return 0.5 * x * (1.0 + tanhc(0.7978845608 * x * (1.0 + 0.044715 * x * x))); }`;
// The window: sliding layers attend to the last `win` positions (llama.cpp masks p_q − p_k ≥ win).
const WIN = 'fn winStart(n: u32, win: u32) -> u32 { return select(0u, n - win, win > 0u && n > win); }';

const G4 = {
  embedQ6K: `
${TOK}
struct P { n: u32, rowBytes: u32, scale: f32 }
@group(0) @binding(0) var<storage, read> qk: array<u32>;
@group(0) @binding(1) var<storage, read_write> y: array<f32>;
@group(0) @binding(2) var<uniform> tok: Tok;
@group(0) @binding(3) var<uniform> p: P;
${Q6K}
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; if (i >= p.n) { return; }
  y[i] = q6k(tok.token * p.rowBytes + (i >> 8u) * 210u, i & 255u) * p.scale;
}`,
  // Logits over the Q6_K table, 4 rows per workgroup; thread t takes value t of every block.
  matmulQ6K: `
struct P { M: u32, N: u32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> qk: array<u32>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
${Q6K}
var<workgroup> part: array<f32, 1024>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let m0 = (wg.y * ng.x + wg.x) * 4u; let t = l.x; let M = p.M; let nb = p.N / 256u; let rb = nb * 210u;
  if (m0 >= M) { return; }
  let r0 = min(m0, M - 1u) * rb; let r1 = min(m0 + 1u, M - 1u) * rb; let r2 = min(m0 + 2u, M - 1u) * rb; let r3 = min(m0 + 3u, M - 1u) * rb;
  var a0 = 0.0; var a1 = 0.0; var a2 = 0.0; var a3 = 0.0;
  for (var b = 0u; b < nb; b++) {
    let xv = x[b * 256u + t]; let o = b * 210u;
    a0 += q6k(r0 + o, t) * xv; a1 += q6k(r1 + o, t) * xv; a2 += q6k(r2 + o, t) * xv; a3 += q6k(r3 + o, t) * xv;
  }
  part[t] = a0; part[256u + t] = a1; part[512u + t] = a2; part[768u + t] = a3;
  workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) {
    if (t < s) { part[t] += part[t + s]; part[256u + t] += part[256u + t + s]; part[512u + t] += part[512u + t + s]; part[768u + t] += part[768u + t + s]; }
    workgroupBarrier();
  }
  if (t < 4u && m0 + t < M) { y[m0 + t] = part[t * 256u]; }
}`,
  // Dense Q4_0 GEMV, 4 output rows per workgroup (2-D dispatch ok).
  matmulQ4: `enable f16;
struct P { M: u32, N: u32 }
@group(0) @binding(0) var<storage, read> xin: array<f32>;
@group(0) @binding(1) var<storage, read> qw: array<u32>;
@group(0) @binding(2) var<storage, read> qs: array<f16>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
${Q4DOT}
var<workgroup> part: array<f32, 1024>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let m0 = (wg.y * ng.x + wg.x) * 4u; let t = l.x; let M = p.M; let nw = p.N / 8u; let nb = p.N / 32u;
  if (m0 >= M) { return; }
  let r0 = min(m0, M - 1u); let r1 = min(m0 + 1u, M - 1u); let r2 = min(m0 + 2u, M - 1u); let r3 = min(m0 + 3u, M - 1u);
  var a0 = 0.0; var a1 = 0.0; var a2 = 0.0; var a3 = 0.0;
  for (var w = t; w < nw; w += 256u) {
    let b = w >> 2u; let xb = b * 32u + (w & 3u) * 4u;
    a0 += q4dot(qw[r0 * nw + w], f32(qs[r0 * nb + b]), xb);
    a1 += q4dot(qw[r1 * nw + w], f32(qs[r1 * nb + b]), xb);
    a2 += q4dot(qw[r2 * nw + w], f32(qs[r2 * nb + b]), xb);
    a3 += q4dot(qw[r3 * nw + w], f32(qs[r3 * nb + b]), xb);
  }
  part[t] = a0; part[256u + t] = a1; part[512u + t] = a2; part[768u + t] = a3;
  workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) {
    if (t < s) { part[t] += part[t + s]; part[256u + t] += part[256u + t + s]; part[512u + t] += part[512u + t + s]; part[768u + t] += part[768u + t + s]; }
    workgroupBarrier();
  }
  if (t < 4u && m0 + t < M) { y[m0 + t] = part[t * 256u]; }
}`,
  // Routed experts, all k at once (workgroup z = top-k position); slots[z] picks the expert's rows in the pool.
  expertQ4: `enable f16;
struct P { M: u32, N: u32, rowsPerExpert: u32, inputPerSlot: u32 }
@group(0) @binding(0) var<storage, read> xin: array<f32>;
@group(0) @binding(1) var<storage, read> qw: array<u32>;
@group(0) @binding(2) var<storage, read> qs: array<f16>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@group(0) @binding(5) var<storage, read> slots: array<u32>;
${Q4DOT}
var<workgroup> part: array<f32, 1024>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let z = wg.z; let m0 = (wg.y * ng.x + wg.x) * 4u; let t = l.x; let M = p.M; let nw = p.N / 8u; let nb = p.N / 32u;
  if (m0 >= M) { return; }
  let rb = slots[z] * p.rowsPerExpert;
  let xo = select(0u, z * p.N, p.inputPerSlot == 1u);
  let r0 = rb + min(m0, M - 1u); let r1 = rb + min(m0 + 1u, M - 1u); let r2 = rb + min(m0 + 2u, M - 1u); let r3 = rb + min(m0 + 3u, M - 1u);
  var a0 = 0.0; var a1 = 0.0; var a2 = 0.0; var a3 = 0.0;
  for (var w = t; w < nw; w += 256u) {
    let b = w >> 2u; let xb = xo + b * 32u + (w & 3u) * 4u;
    a0 += q4dot(qw[r0 * nw + w], f32(qs[r0 * nb + b]), xb);
    a1 += q4dot(qw[r1 * nw + w], f32(qs[r1 * nb + b]), xb);
    a2 += q4dot(qw[r2 * nw + w], f32(qs[r2 * nb + b]), xb);
    a3 += q4dot(qw[r3 * nw + w], f32(qs[r3 * nb + b]), xb);
  }
  part[t] = a0; part[256u + t] = a1; part[512u + t] = a2; part[768u + t] = a3;
  workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) {
    if (t < s) { part[t] += part[t + s]; part[256u + t] += part[256u + t + s]; part[512u + t] += part[512u + t + s]; part[768u + t] += part[768u + t + s]; }
    workgroupBarrier();
  }
  if (t < 4u && m0 + t < M) { y[z * M + m0 + t] = part[t * 256u]; }
}`,
  // gu = k × [gate F | up F] → act = k × F of GELU(gate)·up (ggml_geglu_split).
  geglu: `
struct P { F: u32, k: u32 }
@group(0) @binding(0) var<storage, read> gu: array<f32>;
@group(0) @binding(1) var<storage, read_write> act: array<f32>;
@group(0) @binding(2) var<uniform> p: P;
${GELU}
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; if (i >= p.k * p.F) { return; }
  let z = i / p.F; let j = i % p.F;
  act[i] = gelu(gu[z * 2u * p.F + j]) * gu[z * 2u * p.F + p.F + j];
}`,
  // Per-head RMS norm without a weight (V), from x into y. One workgroup per head.
  vNorm: `
struct P { hd: u32, eps: f32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read_write> y: array<f32>;
@group(0) @binding(2) var<uniform> p: P;
var<workgroup> red: array<f32, 64>;
@compute @workgroup_size(64) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let base = wg.x * p.hd; let t = l.x;
  var acc = 0.0;
  for (var i = t; i < p.hd; i += 64u) { let v = x[base + i]; acc += v * v; }
  red[t] = acc; workgroupBarrier();
  for (var s = 32u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  let scale = 1.0 / sqrt(red[0] / f32(p.hd) + p.eps);
  for (var i = t; i < p.hd; i += 64u) { y[base + i] = x[base + i] * scale; }
}`,
  // y = ((x · rms) · k) · w — the router's input (k = 1/√H, w = ffn_gate_inp.scale).
  rmsnormK: `
struct P { n: u32, eps: f32, k: f32 }
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
  for (var i = t; i < p.n; i += 256u) { y[i] = ((x[i] * scale) * p.k) * w[i]; }
}`,
  // x += rms_norm(y) · w — the post-attention norm and the residual add.
  rmsnormAdd: `
struct P { n: u32, eps: f32 }
@group(0) @binding(0) var<storage, read> y: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read_write> x: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256) fn main(@builtin(local_invocation_id) l: vec3<u32>) {
  let t = l.x; var acc = 0.0;
  for (var i = t; i < p.n; i += 256u) { let v = y[i]; acc += v * v; }
  red[t] = acc; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  let scale = 1.0 / sqrt(red[0] / f32(p.n) + p.eps);
  for (var i = t; i < p.n; i += 256u) { x[i] = (y[i] * scale) * w[i] + x[i]; }
}`,
  // x = (rms_norm(mlp + moe) · w + x) · out_scale — the FFN's last norm, the residual add, the layer scalar.
  postFfn: `
struct P { n: u32, eps: f32 }
@group(0) @binding(0) var<storage, read> mlp: array<f32>;
@group(0) @binding(1) var<storage, read> moe: array<f32>;
@group(0) @binding(2) var<storage, read> w: array<f32>;
@group(0) @binding(3) var<storage, read> os: array<f32>;
@group(0) @binding(4) var<storage, read_write> x: array<f32>;
@group(0) @binding(5) var<uniform> p: P;
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256) fn main(@builtin(local_invocation_id) l: vec3<u32>) {
  let t = l.x; var acc = 0.0;
  for (var i = t; i < p.n; i += 256u) { let v = mlp[i] + moe[i]; acc += v * v; }
  red[t] = acc; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  let scale = 1.0 / sqrt(red[0] / f32(p.n) + p.eps);
  let k = os[0];
  for (var i = t; i < p.n; i += 256u) { x[i] = (((mlp[i] + moe[i]) * scale) * w[i] + x[i]) * k; }
}`,
  // moe[h] = Σ_j (dn[j·H + h] · ds[id_j]) · w_j, added in pick order (llama.cpp: down · scale · weight, then e0 + e1 + …).
  moeSum: `
struct P { H: u32, k: u32 }
@group(0) @binding(0) var<storage, read> dn: array<f32>;
@group(0) @binding(1) var<storage, read> sel: array<u32>;
@group(0) @binding(2) var<storage, read> ds: array<f32>;
@group(0) @binding(3) var<storage, read_write> moe: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let h = g.x; if (h >= p.H) { return; }
  var acc = (dn[h] * ds[sel[0]]) * bitcast<f32>(sel[p.k]);
  for (var j = 1u; j < p.k; j++) { acc = acc + (dn[j * p.H + h] * ds[sel[j]]) * bitcast<f32>(sel[p.k + j]); }
  moe[h] = acc;
}`,
  // Attention with a window: scores, softmax and the weighted sum over positions [start, seqLen); scale 1.0.
  attnScoreW: `enable f16;
${TOK}
struct P { heads: u32, kvHeads: u32, hd: u32, win: u32 }
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
  sc[h * n + j] = acc;
}`,
  softmaxW: `
${TOK}
struct P { heads: u32, kvHeads: u32, hd: u32, win: u32 }
@group(0) @binding(0) var<storage, read_write> sc: array<f32>;
@group(0) @binding(1) var<uniform> tok: Tok;
@group(0) @binding(2) var<uniform> p: P;
${WIN}
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let n = tok.seqLen - winStart(tok.seqLen, p.win); let base = wg.x * n; let t = l.x;
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
  attnOutW: `enable f16;
${TOK}
struct P { heads: u32, kvHeads: u32, hd: u32, win: u32 }
@group(0) @binding(0) var<storage, read> pr: array<f32>;
@group(0) @binding(1) var<storage, read> vc: array<f16>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@group(0) @binding(3) var<uniform> tok: Tok;
@group(0) @binding(4) var<uniform> p: P;
${WIN}
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let idx = g.x; if (idx >= p.heads * p.hd) { return; }
  let st = winStart(tok.seqLen, p.win); let n = tok.seqLen - st;
  let h = idx / p.hd; let d = idx % p.hd; let kvh = h / (p.heads / p.kvHeads);
  let stride = p.kvHeads * p.hd;
  var acc = 0.0;
  for (var j = 0u; j < n; j++) { acc += pr[h * n + j] * f32(vc[(st + j) * stride + kvh * p.hd + d]); }
  y[idx] = acc;
}`,
  // Final logit soft cap, in place: l = tanh(l · (1/cap)) · cap.
  softcap: `
struct P { n: u32, inv: f32, cap: f32 }
@group(0) @binding(0) var<storage, read_write> lg: array<f32>;
@group(0) @binding(1) var<uniform> p: P;
${TANH}
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>) {
  let i = g.y * ng.x * 256u + g.x; if (i >= p.n) { return; }
  lg[i] = tanhc(lg[i] * p.inv) * p.cap;
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

// ── Engine ──────────────────────────────────────────────────────────────────
export class Gemma4MoeSsd extends Qwen3MoeSsd {
  static configFrom(kv) { return configFromGgufGemma4(kv); }
  static get ingestPlan() { return GEMMA4_INGEST_PLAN; }
  static tokenizerFrom(kv) { return new GemmaTokenizer(kv); }
  static load(modelId, opts = {}) { return super.load(modelId, { ...opts, source: opts.source || GEMMA4_26B_A4B }); }

  chatPrompt(messages, opts) { return gemmaChatPrompt(messages, opts); }
  get stopTokenIds() { return [this.cfg.eos, this.tokenizer.ids.get('<turn|>')].filter((t) => t !== undefined); }
  // Thinking: the model writes <|channel>thought\n … <channel|> itself (nothing opens it in the prompt).
  get thinkOpenTokenId() { return this.tokenizer.ids.get('<|channel>') ?? null; }
  get thinkCloseTokenId() { return this.tokenizer.ids.get('<channel|>') ?? null; }
  get thinkInPrompt() { return false; }
  get thinkPreamble() { return 'thought\n'; }

  get kernels() { return (this._kernels ||= { ...super.kernels, ...G4 }); }

  // A bind group whose entries are buffers or { buffer, offset, size } ranges.
  bindR(name, entries) {
    return this.device.createBindGroup({
      layout: this.pipeline(name).getBindGroupLayout(0),
      entries: entries.map((e, i) => ({ binding: i, resource: e.buffer ? e : { buffer: e } })),
    });
  }

  // Dense upload, then the full-attention layers' RoPE frequency factors on the CPU side.
  async uploadDense(onProgress) {
    await super.uploadDense(onProgress);
    const d = this.manifest.dense.tensors['rope_freqs.weight'];
    this.ropeFreqs = null;
    if (d) {
      const r = await OpfsReaderPool.open(`${this.opts.dir}/${this.manifest.dense.file}`, { workers: 1 });
      const got = await r.read(d.raw.off, d.raw.bytes);
      this.ropeFreqs = new Float32Array(got.buf.slice(0, d.raw.bytes));
      await r.close();
    }
  }

  initBuffers() {
    const c = this.cfg, H = c.hidden, K = c.topK, E = c.experts, F = c.expertFf, DF = c.denseFf, Lc = c.layers;
    if (2 * K * 4 > 256) throw new Error(`top-k ${K} > 32`);
    if (E > 256) throw new Error(`${E} experts: the router top-k kernel handles at most 256`);
    const kvn = (l) => c.kvHeads[l] * c.headDim[l], qn = (l) => c.heads * c.headDim[l];
    const QN = Math.max(...c.headDim.map((d) => c.heads * d)), KVN = Math.max(...c.headDim.map((_, l) => kvn(l)));
    const HD = Math.max(...c.headDim);
    this.kc = []; this.vc = [];
    for (let l = 0; l < Lc; l++) {
      this.kc.push(this.buffer(this.maxCtx * kvn(l) * 2, STORAGE, 'kv'));
      this.vc.push(this.buffer(this.maxCtx * kvn(l) * 2, STORAGE, 'kv'));
    }
    const A = (n) => this.buffer(n * 4, STORAGE | COPY_SRC | COPY_DST);
    const gateBytes = DF * 4;
    if (gateBytes % 256) throw new Error(`dense FFN ${DF}: gate/up halves must sit on 256-byte offsets`);
    this.a = {
      x: A(H), xn: A(H), q: A(QN), k: A(KVN), v: A(KVN), vr: A(KVN), att: A(QN), o: A(H), sc: A(c.heads * this.maxCtx),
      mgu: A(2 * DF), ma: A(DF), md: A(H), mlp: A(H), xm: A(H), rt: A(H), moe: A(H), moe2: A(H),
      rl: A(E), sel: A(2 * K), prt: A(H), prl: A(E), psel: A(64 * this.lookahead), slots: A(K),
      gu: A(K * 2 * F), act: A(K * F), dn: A(K * H), logits: A(c.vocab), am: A(4),
      ropeS: A(HD), ropeF: A(HD),
    };
    if (this.opts.capture) this.a.cap = A(2 * Lc * H);
    this.tok = this.buffer(16, 0x40 | COPY_DST);
    this.rbSel = this.buffer(256 * (1 + this.lookahead), MAP_READ | COPY_DST);
    this.rbLogits = this.buffer(c.vocab * 4, MAP_READ | COPY_DST);
    this.rbArg = this.buffer(16, MAP_READ | COPY_DST);

    const f = (v) => ({ f: v });
    const eps = f(c.eps);
    const u = {
      embed: this.uniform([H, (H / 256) * Q6K_BLOCK, f(Math.fround(Math.sqrt(H)))]),
      rmsH: this.uniform([H, eps]), routerK: this.uniform([H, eps, f(Math.fround(1 / Math.fround(Math.sqrt(H))))]),
      mmG: this.uniform([DF, H]), mmD: this.uniform([H, DF]), gegluD: this.uniform([DF, 1]),
      router: this.uniform([E, H]), topk: this.uniform([E, K]),
      gu: this.uniform([2 * F, H, 2 * F, 0]), dn: this.uniform([H, F, H, 1]), gegluE: this.uniform([F, K]), sum: this.uniform([H, K]),
      lm: this.uniform([c.vocab, H]), cap: this.uniform([c.vocab, f(Math.fround(1 / c.softcap)), f(c.softcap)]), am: this.uniform([c.vocab]),
    };
    // Attention uniforms per layer shape (sliding / full).
    const shape = new Map();
    const shapeOf = (l) => {
      const key = `${c.headDim[l]}/${c.kvHeads[l]}/${c.swa[l]}`;
      if (!shape.has(key)) shape.set(key, {
        mmQ: this.uniform([qn(l), H]), mmKV: this.uniform([kvn(l), H]), mmO: this.uniform([H, qn(l)]),
        hd: this.uniform([c.headDim[l], eps]), kvn: this.uniform([kvn(l)]),
        att: this.uniform([c.heads, c.kvHeads[l], c.headDim[l], c.swa[l] ? c.window : 0]),
      });
      return shape.get(key);
    };
    const a = this.a, W = this.w;
    this.g = { embed: this.bind('embedQ6K', [W['token_embd.weight'].raw, a.x, this.tok, u.embed]) };
    this.layers = [];
    for (let l = 0; l < Lc; l++) {
      const p = (n) => W[`blk.${l}.${n}`], s = shapeOf(l), rope = c.swa[l] ? a.ropeS : a.ropeF;
      const hasV = !!p('attn_v.weight');
      const ly = {
        swa: c.swa[l], hasV,
        rmsA: this.bind('rmsnorm', [a.x, p('attn_norm.weight').raw, a.xn, u.rmsH]),
        q: this.bind('matmulQ4', [a.xn, p('attn_q.weight').q, p('attn_q.weight').s, a.q, s.mmQ]),
        k: this.bind('matmulQ4', [a.xn, p('attn_k.weight').q, p('attn_k.weight').s, a.k, s.mmKV]),
        v: hasV ? this.bind('matmulQ4', [a.xn, p('attn_v.weight').q, p('attn_v.weight').s, a.vr, s.mmKV]) : null,
        vn: this.bind('vNorm', [hasV ? a.vr : a.k, a.v, s.hd]),   // no V projection: V is K's projection
        ropeQ: this.bind('qkNormRope', [a.q, p('attn_q_norm.weight').raw, rope, s.hd]),
        ropeK: this.bind('qkNormRope', [a.k, p('attn_k_norm.weight').raw, rope, s.hd]),
        kv: this.bind('kvStore', [a.k, a.v, this.kc[l], this.vc[l], this.tok, s.kvn]),
        score: this.bind('attnScoreW', [a.q, this.kc[l], a.sc, this.tok, s.att]),
        soft: this.bind('softmaxW', [a.sc, this.tok, s.att]),
        attOut: this.bind('attnOutW', [a.sc, this.vc[l], a.att, this.tok, s.att]),
        o: this.bind('matmulQ4', [a.att, p('attn_output.weight').q, p('attn_output.weight').s, a.o, s.mmO]),
        postA: this.bind('rmsnormAdd', [a.o, p('post_attention_norm.weight').raw, a.x, u.rmsH]),
        rmsF: this.bind('rmsnorm', [a.x, p('ffn_norm.weight').raw, a.xn, u.rmsH]),
        mg: this.bindR('matmulQ4', [a.xn, p('ffn_gate.weight').q, p('ffn_gate.weight').s, { buffer: a.mgu, offset: 0, size: gateBytes }, u.mmG]),
        mu: this.bindR('matmulQ4', [a.xn, p('ffn_up.weight').q, p('ffn_up.weight').s, { buffer: a.mgu, offset: gateBytes, size: gateBytes }, u.mmG]),
        mact: this.bind('geglu', [a.mgu, a.ma, u.gegluD]),
        md: this.bind('matmulQ4', [a.ma, p('ffn_down.weight').q, p('ffn_down.weight').s, a.md, u.mmD]),
        mpost: this.bind('rmsnorm', [a.md, p('post_ffw_norm_1.weight').raw, a.mlp, u.rmsH]),
        xm: this.bind('rmsnorm', [a.x, p('pre_ffw_norm_2.weight').raw, a.xm, u.rmsH]),
        rp: this.bind('rmsnormK', [a.x, p('ffn_gate_inp.scale').raw, a.rt, u.routerK]),
        router: this.bind('matmulF32', [a.rt, p('ffn_gate_inp.weight').raw, a.rl, u.router]),
        topk: this.bind('topk', [a.rl, a.sel, u.topk]),
        // Routers of layers l+1..l+lookahead on this layer's post-attention state: the prefetch guesses.
        pf: Array.from({ length: Math.min(this.lookahead, Lc - 1 - l) }, (_, i) => {
          const at = (n) => W[`blk.${l + 1 + i}.${n}`];
          return {
            rp: this.bind('rmsnormK', [a.x, at('ffn_gate_inp.scale').raw, a.prt, u.routerK]),
            router: this.bind('matmulF32', [a.prt, at('ffn_gate_inp.weight').raw, a.prl, u.router]),
            topk: this.bindR('topk', [a.prl, { buffer: a.psel, offset: 256 * i, size: 8 * K }, u.topk]),
          };
        }),
        gu: this.bind('expertQ4', [a.xm, this.pool.guQ, this.pool.guS, a.gu, u.gu, a.slots]),
        act: this.bind('geglu', [a.gu, a.act, u.gegluE]),
        dn: this.bind('expertQ4', [a.act, this.pool.dQ, this.pool.dS, a.dn, u.dn, a.slots]),
        sum: this.bind('moeSum', [a.dn, a.sel, p('ffn_down_exps.scale').raw, a.moe, u.sum]),
        mpost2: this.bind('rmsnorm', [a.moe, p('post_ffw_norm_2.weight').raw, a.moe2, u.rmsH]),
        post: this.bind('postFfn', [a.mlp, a.moe2, p('post_ffw_norm.weight').raw, p('layer_output_scale.weight').raw, a.x, u.rmsH]),
      };
      if (a.cap) {
        ly.capA = this.bind('copyAt', [a.x, a.cap, this.uniform([H, l * H])]);
        ly.capX = this.bind('copyAt', [a.x, a.cap, this.uniform([H, (Lc + l) * H])]);
      }
      this.layers.push(ly);
    }
    this.g.rmsOut = this.bind('rmsnorm', [a.x, W['output_norm.weight'].raw, a.xn, u.rmsH]);
    this.g.lm = this.bind('matmulQ6K', [a.xn, W['token_embd.weight'].raw, a.logits, u.lm]);
    this.g.cap = this.bind('softcap', [a.logits, u.cap]);
    this.g.am = this.bind('argmax', [a.logits, a.am, u.am]);
  }

  encodeEmbed(pass) { this.dispatch(pass, 'embedQ6K', this.g.embed, Math.ceil(this.cfg.hidden / 256)); }
  encodeHead(pass, want) {
    const c = this.cfg;
    this.dispatch(pass, 'rmsnorm', this.g.rmsOut, 1);
    this.dispatch(pass, 'matmulQ6K', this.g.lm, Math.ceil(c.vocab / 4));
    if (c.softcap) this.dispatch(pass, 'softcap', this.g.cap, Math.ceil(c.vocab / 256));
    if (want === 'argmax') this.dispatch(pass, 'argmax', this.g.am, 1);
  }

  // Attention, the dense MLP and the router of layer l (all before the routing readback).
  encodeAttention(pass, l, seqLen) {
    const c = this.cfg, g = this.layers[l], d = (n, gr, x, y, z) => this.dispatch(pass, n, gr, x, y, z);
    const hd = c.headDim[l], QN = c.heads * hd, kvn = c.kvHeads[l] * hd;
    const n = c.swa[l] ? Math.min(seqLen, c.window) : seqLen;
    d('rmsnorm', g.rmsA, 1);
    d('matmulQ4', g.q, Math.ceil(QN / 4)); d('matmulQ4', g.k, Math.ceil(kvn / 4));
    if (g.hasV) d('matmulQ4', g.v, Math.ceil(kvn / 4));
    d('vNorm', g.vn, c.kvHeads[l]);
    d('qkNormRope', g.ropeQ, c.heads); d('qkNormRope', g.ropeK, c.kvHeads[l]);
    d('kvStore', g.kv, Math.ceil(kvn / 256));
    d('attnScoreW', g.score, Math.ceil(c.heads * n / 256));
    d('softmaxW', g.soft, c.heads);
    d('attnOutW', g.attOut, Math.ceil(QN / 256));
    d('matmulQ4', g.o, Math.ceil(c.hidden / 4));
    d('rmsnormAdd', g.postA, 1);
    if (g.capA) d('copyAt', g.capA, Math.ceil(c.hidden / 256));
    d('rmsnorm', g.rmsF, 1);
    d('matmulQ4', g.mg, Math.ceil(c.denseFf / 4)); d('matmulQ4', g.mu, Math.ceil(c.denseFf / 4));
    d('geglu', g.mact, Math.ceil(c.denseFf / 256));
    d('matmulQ4', g.md, Math.ceil(c.hidden / 4));
    d('rmsnorm', g.mpost, 1);
    d('rmsnorm', g.xm, 1);
    if (this.prefetch) for (const p of g.pf) { d('rmsnormK', p.rp, 1); d('matmulF32', p.router, c.experts); d('topk', p.topk, 1); }
    d('rmsnormK', g.rp, 1);
    d('matmulF32', g.router, c.experts);
    d('topk', g.topk, 1);
  }
  encodeExperts(pass, l) {
    const c = this.cfg, g = this.layers[l], d = (n, gr, x, y, z) => this.dispatch(pass, n, gr, x, y, z);
    d('expertQ4', g.gu, Math.ceil(2 * c.expertFf / 4), 1, c.topK);
    d('geglu', g.act, Math.ceil(c.topK * c.expertFf / 256));
    d('expertQ4', g.dn, Math.ceil(c.hidden / 4), 1, c.topK);
    d('moeSum', g.sum, Math.ceil(c.hidden / 256));
    d('rmsnorm', g.mpost2, 1);
    d('postFfn', g.post, 1);
    if (g.capX) d('copyAt', g.capX, Math.ceil(c.hidden / 256));
  }

  // NeoX RoPE angles as llama.cpp's Metal kernel forms them: f32 pos × base^(−2i/d), ÷ the frequency factor
  // on full-attention layers. One table per layer kind; [0, d/2) = cos, [d/2, d) = sin.
  writeTokenUniforms(token, pos) {
    const c = this.cfg;
    this.device.queue.writeBuffer(this.tok, 0, new Uint32Array([token, pos, pos + 1, 0]));
    const table = (d, base, ff) => {
      const half = d / 2, r = new Float32Array(d), inv = Math.fround(-1 / d);
      for (let i = 0; i < half; i++) {
        let th = Math.fround(pos * Math.fround(Math.pow(base, Math.fround(inv * 2 * i))));
        if (ff) th = Math.fround(th / ff[i]);
        r[i] = Math.cos(th); r[half + i] = Math.sin(th);
      }
      return r;
    };
    const ls = c.swa.indexOf(true), lf = c.swa.indexOf(false);
    if (ls >= 0) this.device.queue.writeBuffer(this.a.ropeS, 0, table(c.headDim[ls], c.ropeTheta[ls], null));
    if (lf >= 0) this.device.queue.writeBuffer(this.a.ropeF, 0, table(c.headDim[lf], c.ropeTheta[lf], this.ropeFreqs));
  }

  // Debug: the last step's per-layer states — attn_out (after the attention residual) and each layer's output.
  async readCapture() {
    const c = this.cfg, n = 2 * c.layers * c.hidden * 4;
    const rb = this.device.createBuffer({ size: n, usage: MAP_READ | COPY_DST });
    const enc = this.device.createCommandEncoder();
    enc.copyBufferToBuffer(this.a.cap, 0, rb, 0, n);
    this.device.queue.submit([enc.finish()]);
    await rb.mapAsync(1);
    const all = new Float32Array(rb.getMappedRange().slice(0));
    rb.unmap(); rb.destroy();
    const H = c.hidden, L = c.layers;
    return { attnOut: Array.from({ length: L }, (_, l) => all.subarray(l * H, (l + 1) * H)), layers: Array.from({ length: L }, (_, l) => all.subarray((L + l) * H, (L + l + 1) * H)) };
  }
}
