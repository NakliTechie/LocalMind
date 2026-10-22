/* flashmap_drafter.js — FlashMap speculative decoding (Shen et al., arXiv:2610.24365) for Qwen3Dense: the flow-map
 * drafter j-shen/FlashMap-Qwen3-4B (475M parameters, bf16, Apache-2.0) in WGSL, and the speculative generate loop.
 * Output is the target's own greedy decoding; the drafter only proposes.
 *
 * The math follows the drafter's modeling_flashmap.py (rev 4e8d6a3). The drafter drafts the 16 tokens after the last
 * verified token (the anchor) in one network evaluation, a jump of a flow map from noise (s = 0) to tokens (t = 1):
 *   context: the target's hidden states at layers 1, 9, 17, 25, 33 (concatenated, 12800) of every verified position →
 *     fc (12800 → 2048) → RMSNorm, then each DiT layer's cross-attention keys (k_proj, per-head RMSNorm, RoPE) and
 *     values (v_proj), cached; the anchor's slot gets anchor_norm(anchor_proj(E[anchor])) the same way.
 *   input: zero noise, so every slot starts from state_norm(uniform_embeds) (uniform_embeds = the mean row of the target's
 *     token table E); x_embed (2560 → 2048). The noise term noise_norm(z·Lᵀ) of a random draft is zero at z = 0, which
 *     also removes the Cholesky factor of EᵀE (zero noise matched random noise on acceptance: plan/2026-10-22-flashmap).
 *   6 DiT layers, each: x += gate·self_attn(LN(x)·(1+scale)+shift) over the 16 slots (no mask); x += gate·cross_attn(…)
 *     over the cached context; x += gate·MLP(…) (fc1, exact GELU, fc2). scale/shift/gate per norm come from the time
 *     conditioning of the jump (0 → 1), constant, computed once here in JS. Attention: 16 heads × 128, RMSNorm on q and
 *     k, RoPE on interleaved channel pairs (2i, 2i+1), base 10000, softmax(qkᵀ/√128).
 *   output: final LN·(1+scale)+shift, head (2048 → 2560), then the target's lm_head (here: the tied Q8_0 token table
 *     through Qwen3Dense's GEMM) and an argmax per slot.
 * Weights stay bf16 on the GPU (the safetensors bytes as they are) and are decoded in the kernels; activations are f32.
 *
 *   const target = await Qwen3Dense.load(null, { captureLayers: FLASHMAP_QWEN3_4B_LAYERS, … });
 *   const drafter = await FlashMapDrafter.load(target, { url });
 *   for await (const step of specGenerate(target, drafter, promptIds, { maxNewTokens })) …
 */

import { STORAGE, COPY_SRC, COPY_DST, MAP_READ, UNIFORM } from './qwen3_moe_ssd.js';
import { MM_TILE, MM_SG_TOKENS, MVT_ROWS, gpuRowBytes } from './iq_quants.js';

export const FLASHMAP_QWEN3_4B = {
  repo: 'j-shen/FlashMap-Qwen3-4B',
  file: 'model.safetensors',
  revision: '4e8d6a39a84ad108c5b60cb59072eb3f968c98cd',
  size: 949897866,
};
export const FLASHMAP_QWEN3_4B_LAYERS = [1, 9, 17, 25, 33];
const CFG = { dim: 2048, heads: 16, hd: 128, layers: 6, ff: 8192, block: 16, targetDim: 2560, cond: 256, timeDim: 256,
  timeScale: 1000, theta: 10000, lnEps: 1e-6, rmsEps: 1e-6, qkEps: 1e-5 };

// ── WGSL ────────────────────────────────────────────────────────────────────
const BF = 'fn bf(w: u32, hi: bool) -> f32 { return bitcast<f32>(select(w << 16u, w & 0xffff0000u, hi)); }';
const KS = {
  // y[t·M + m] = Σ_k x[t·N + k]·W[m][k] (+ b[m]); W bf16 [M][N]. 16 rows × 16 tokens per workgroup, 32-wide k tiles
  // through shared memory. Dispatch (ceil(M / 16), ceil(T / 16)).
  gemmBf16: `
struct P { M: u32, N: u32, T: u32, bias: u32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<u32>;
@group(0) @binding(2) var<storage, read> b: array<u32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
${BF}
var<workgroup> ws: array<f32, 512>;
var<workgroup> xs: array<f32, 512>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let m0 = wg.x * 16u; let t0 = wg.y * 16u; let r = l.x / 16u; let c = l.x % 16u;
  var acc = 0.0;
  for (var k0 = 0u; k0 < p.N; k0 += 32u) {
    for (var i = l.x; i < 512u; i += 256u) {
      let rr = i / 32u; let kk = i % 32u; let m = m0 + rr; let t = t0 + rr; let k = k0 + kk;
      var wv = 0.0;
      if (m < p.M && k < p.N) { let e = m * p.N + k; wv = bf(w[e >> 1u], (e & 1u) == 1u); }
      ws[i] = wv;
      var xv = 0.0;
      if (t < p.T && k < p.N) { xv = x[t * p.N + k]; }
      xs[i] = xv;
    }
    workgroupBarrier();
    for (var kk = 0u; kk < 32u; kk++) { acc += ws[r * 32u + kk] * xs[c * 32u + kk]; }
    workgroupBarrier();
  }
  let m = m0 + r; let t = t0 + c;
  if (m < p.M && t < p.T) {
    var v = acc;
    if (p.bias == 1u) { v += bf(b[m >> 1u], (m & 1u) == 1u); }
    y[t * p.M + m] = v;
  }
}`,
  // The same product for a few tokens (T ≤ TT: the draft's 16 slots, a verify's accepted rows, the anchor): one row per
  // lane, 256 rows per workgroup, each weight read once; per 256-wide k block the T activation rows go through shared
  // memory (broadcast reads). The token loop has a constant trip count so the sums stay in registers. N must be a
  // multiple of 256. Dispatch (ceil(M / 256)).
  gemvT17: gemvT(17),
  gemvT1: gemvT(1),
  // y = x · (w · rsqrt(mean(x²) + eps)) per row of D; one workgroup per row.
  rmsRows: `
struct P { D: u32, eps: f32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<u32>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
${BF}
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let base = wg.x * p.D; let t = l.x;
  var a = 0.0;
  for (var i = t; i < p.D; i += 256u) { let v = x[base + i]; a += v * v; }
  red[t] = a; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  let r = 1.0 / sqrt(red[0] / f32(p.D) + p.eps);
  for (var i = t; i < p.D; i += 256u) { y[base + i] = x[base + i] * (bf(w[i >> 1u], (i & 1u) == 1u) * r); }
}`,
  // y = LayerNorm(x) (no affine) · (1 + scale) + shift per row of D; scale/shift at md[off], md[off + D] (`mod` is a
  // reserved word in WGSL).
  lnMod: `
struct P { D: u32, off: u32, eps: f32, pad: u32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> md: array<f32>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let base = wg.x * p.D; let t = l.x;
  var a = 0.0;
  for (var i = t; i < p.D; i += 256u) { a += x[base + i]; }
  red[t] = a; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  let mu = red[0] / f32(p.D); workgroupBarrier();
  var q = 0.0;
  for (var i = t; i < p.D; i += 256u) { let d = x[base + i] - mu; q += d * d; }
  red[t] = q; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  let r = 1.0 / sqrt(red[0] / f32(p.D) + p.eps);
  for (var i = t; i < p.D; i += 256u) { y[base + i] = (x[base + i] - mu) * r * (1.0 + md[p.off + i]) + md[p.off + p.D + i]; }
}`,
  // In place, per (head wg.x, row wg.y): RMSNorm over hd with weight w, then RoPE on interleaved pairs (2i, 2i+1) with
  // the row's [cos hd/2 | sin hd/2] in rope.
  headNormRope: `
struct P { hd: u32, row: u32, eps: f32, pad: u32 }
@group(0) @binding(0) var<storage, read_write> x: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<u32>;
@group(0) @binding(2) var<storage, read> rope: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
${BF}
var<workgroup> red: array<f32, 64>;
@compute @workgroup_size(64) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let base = wg.y * p.row + wg.x * p.hd; let t = l.x; let half = p.hd / 2u; let rb = wg.y * p.hd;
  var a = 0.0;
  for (var i = t; i < p.hd; i += 64u) { let v = x[base + i]; a += v * v; }
  red[t] = a; workgroupBarrier();
  for (var s = 32u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  let r = 1.0 / sqrt(red[0] / f32(p.hd) + p.eps);
  workgroupBarrier();
  for (var i = t; i < half; i += 64u) {
    let a0 = x[base + 2u * i] * (bf(w[i], false) * r);
    let a1 = x[base + 2u * i + 1u] * (bf(w[i], true) * r);
    let c = rope[rb + i]; let sn = rope[rb + half + i];
    x[base + 2u * i] = a0 * c - a1 * sn;
    x[base + 2u * i + 1u] = a1 * c + a0 * sn;
  }
}`,
  // Attention without a mask: query row wg.y, head wg.x, over keys [0, L) of k/v (f32 rows of D); scores in shared
  // memory (L ≤ 4096).
  attnF32: attn('f32', ''),
  // The same over the f16 context cache.
  attnF16: attn('f16', 'enable f16;'),
  // cache[(start + t)·D + i] = f16(x[t·D + i]) for both k and v. Dispatch (ceil(D / 256), T).
  kvWrite: `enable f16;
struct P { D: u32, start: u32, T: u32, pad: u32 }
@group(0) @binding(0) var<storage, read> k: array<f32>;
@group(0) @binding(1) var<storage, read> v: array<f32>;
@group(0) @binding(2) var<storage, read_write> kc: array<f16>;
@group(0) @binding(3) var<storage, read_write> vc: array<f16>;
@group(0) @binding(4) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; let t = g.y; if (i >= p.D || t >= p.T) { return; }
  kc[(p.start + t) * p.D + i] = f16(k[t * p.D + i]); vc[(p.start + t) * p.D + i] = f16(v[t * p.D + i]);
}`,
  // x = x · Φ(x) (exact GELU; erf from Abramowitz–Stegun 7.1.26, |error| ≤ 1.5e-7).
  gelu: `
struct P { n: u32 }
@group(0) @binding(0) var<storage, read_write> x: array<f32>;
@group(0) @binding(1) var<uniform> p: P;
fn erf_(z: f32) -> f32 {
  let s = sign(z); let a = abs(z); let t = 1.0 / (1.0 + 0.3275911 * a);
  let y = 1.0 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * exp(-a * a);
  return s * y;
}
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>) {
  let i = g.y * ng.x * 256u + g.x; if (i >= p.n) { return; }
  let v = x[i]; x[i] = 0.5 * v * (1.0 + erf_(v * 0.70710678118654752));
}`,
  // x[t·D + i] += md[off + i] · y[t·D + i] (the gated residual). Dispatch (ceil(D / 256), T).
  gateAdd: `
struct P { D: u32, off: u32, T: u32, pad: u32 }
@group(0) @binding(0) var<storage, read_write> x: array<f32>;
@group(0) @binding(1) var<storage, read> y: array<f32>;
@group(0) @binding(2) var<storage, read> md: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; let t = g.y; if (i >= p.D || t >= p.T) { return; }
  x[t * p.D + i] += md[p.off + i] * y[t * p.D + i];
}`,
  // x[t·D + i] = r[i] for t < T (every slot starts from the same input at zero noise).
  broadcast: `
struct P { D: u32, T: u32 }
@group(0) @binding(0) var<storage, read> r: array<f32>;
@group(0) @binding(1) var<storage, read_write> x: array<f32>;
@group(0) @binding(2) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; let t = g.y; if (i >= p.D || t >= p.T) { return; }
  x[t * p.D + i] = r[i];
}`,
  // The mean row of the target's Q8_0 token table in Qwen3Dense's padded layout (36-byte blocks: f16 d, 2 pad bytes,
  // 32 int8): one thread per column; uniform_embeds = (1/V)·1ᵀE.
  colMeanQ8: `
struct P { V: u32, H: u32, rowWords: u32, pad: u32 }
@group(0) @binding(0) var<storage, read> e: array<u32>;
@group(0) @binding(1) var<storage, read_write> y: array<f32>;
@group(0) @binding(2) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; if (i >= p.H) { return; }
  let blk = i / 32u; let j = i % 32u; var acc = 0.0;
  for (var r = 0u; r < p.V; r++) {
    let w0 = r * p.rowWords + blk * 9u;
    let d = unpack2x16float(e[w0]).x;
    let q = (e[w0 + 1u + j / 4u] >> ((j % 4u) * 8u)) & 0xffu;
    acc += d * f32(select(i32(q), i32(q) - 256, q >= 128u));
  }
  y[i] = acc / f32(p.V);
}`,
};
function gemvT(TT) {
  return `
struct P { M: u32, N: u32, T: u32, bias: u32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<u32>;
@group(0) @binding(2) var<storage, read> b: array<u32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
${BF}
const TT = ${TT}u;
var<workgroup> xs: array<vec4<f32>, ${TT * 64}>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let t = l.x; let row = wg.x * 256u + t; let rr = min(row, p.M - 1u); let T = min(p.T, TT); let rowW = p.N / 2u;
  var acc: array<f32, ${TT}>;
  for (var kb = 0u; kb < p.N; kb += 256u) {
    workgroupBarrier();
    for (var i = t; i < TT * 64u; i += 256u) {
      let tk = i / 64u; let o = tk * p.N + kb + (i % 64u) * 4u;
      xs[i] = select(vec4<f32>(0.0), vec4<f32>(x[o], x[o + 1u], x[o + 2u], x[o + 3u]), tk < T);
    }
    workgroupBarrier();
    let base = rr * rowW + kb / 2u;
    for (var j = 0u; j < 32u; j++) {
      let u0 = w[base + 4u * j]; let u1 = w[base + 4u * j + 1u]; let u2 = w[base + 4u * j + 2u]; let u3 = w[base + 4u * j + 3u];
      let w0 = vec4<f32>(bf(u0, false), bf(u0, true), bf(u1, false), bf(u1, true));
      let w1 = vec4<f32>(bf(u2, false), bf(u2, true), bf(u3, false), bf(u3, true));
      for (var tk = 0u; tk < TT; tk++) { acc[tk] += dot(w0, xs[tk * 64u + 2u * j]) + dot(w1, xs[tk * 64u + 2u * j + 1u]); }
    }
  }
  if (row < p.M) {
    var bv = 0.0;
    if (p.bias == 1u) { bv = bf(b[row >> 1u], (row & 1u) == 1u); }
    for (var tk = 0u; tk < TT; tk++) { if (tk < T) { y[tk * p.M + row] = acc[tk] + bv; } }
  }
}`;
}
function attn(kt, en) {
  return `${en}
struct P { heads: u32, hd: u32, L: u32, scale: f32 }
@group(0) @binding(0) var<storage, read> q: array<f32>;
@group(0) @binding(1) var<storage, read> k: array<${kt}>;
@group(0) @binding(2) var<storage, read> v: array<${kt}>;
@group(0) @binding(3) var<storage, read_write> o: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
var<workgroup> sc: array<f32, 4096>;
var<workgroup> red: array<f32, 256>;
var<workgroup> qs: array<f32, 128>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let h = wg.x; let row = wg.y; let t = l.x; let D = p.heads * p.hd; let qb = row * D + h * p.hd;
  if (t < p.hd) { qs[t] = q[qb + t]; }
  workgroupBarrier();
  var mx = -3.4e38;
  for (var j = t; j < p.L; j += 256u) {
    var s = 0.0; let kb = j * D + h * p.hd;
    for (var d = 0u; d < p.hd; d++) { s += qs[d] * f32(k[kb + d]); }
    s = s * p.scale; sc[j] = s; mx = max(mx, s);
  }
  red[t] = mx; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] = max(red[t], red[t + s]); } workgroupBarrier(); }
  let m = red[0]; workgroupBarrier();
  var sum = 0.0;
  for (var j = t; j < p.L; j += 256u) { let e = exp(sc[j] - m); sc[j] = e; sum += e; }
  red[t] = sum; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  let inv = 1.0 / red[0];
  if (t < p.hd) {
    var acc = 0.0;
    for (var j = 0u; j < p.L; j++) { acc += sc[j] * f32(v[j * D + h * p.hd + t]); }
    o[qb + t] = acc * inv;
  }
}`;
}

// ── safetensors ─────────────────────────────────────────────────────────────
async function readSafetensors(url, fetchFn) {
  const r0 = await fetchFn(url, { headers: { Range: 'bytes=0-7' } });
  if (!r0.ok && r0.status !== 206) throw new Error(`drafter: HTTP ${r0.status}`);
  const n = Number(new DataView(await r0.arrayBuffer()).getBigUint64(0, true));
  const r1 = await fetchFn(url, { headers: { Range: `bytes=8-${8 + n - 1}` } });
  const header = JSON.parse(new TextDecoder().decode(await r1.arrayBuffer()));
  delete header.__metadata__;
  for (const t of Object.values(header)) if (t.dtype !== 'BF16') throw new Error(`drafter: ${t.dtype} tensor, expected BF16`);
  return { header, dataStart: 8 + n };
}
const bf16ToF32 = (u16) => { const out = new Float32Array(u16.length), u = new Uint32Array(out.buffer); for (let i = 0; i < u16.length; i++) u[i] = u16[i] << 16; return out; };

// The time conditioning of the jump s → t (FlashMapDraftModel.time_conditioning) in f32: per DiT layer (self, cross,
// MLP) and the final norm, each [scale D | shift D | gate D]. Small linears, computed once on the CPU.
function timeConditioning(cpu, s, t) {
  const lin = (name, x) => {
    const w = cpu[`${name}.weight`], b = cpu[`${name}.bias`], [M, N] = w.shape, y = new Float32Array(M);
    for (let m = 0; m < M; m++) { let a = b ? b.data[m] : 0; for (let k = 0; k < N; k++) a += w.data[m * N + k] * x[k]; y[m] = Math.fround(a); }
    return y;
  };
  const silu = (x) => x.map((v) => v / (1 + Math.exp(-v)));
  const embed = (prefix, time) => {
    const half = CFG.timeDim / 2, e = new Float32Array(CFG.timeDim);
    for (let i = 0; i < half; i++) {
      const f = Math.fround(Math.exp(-Math.log(10000) * i / half)), a = Math.fround(Math.fround(time * CFG.timeScale) * f);
      e[i] = Math.cos(a); e[half + i] = Math.sin(a);
    }
    return lin(`${prefix}.linear_2`, silu(lin(`${prefix}.linear_1`, e)));
  };
  const ts = embed('time_embed', s), tj = embed('jump_embed', t), cond = silu(ts.map((v, i) => v + tj[i]));
  const out = new Float32Array((CFG.layers * 3 + 1) * 3 * CFG.dim);
  let o = 0;
  for (let l = 0; l < CFG.layers; l++) for (const n of ['self_attn_adaln', 'cross_attn_adaln', 'mlp_adaln']) { out.set(lin(`layers.${l}.${n}.linear`, cond), o); o += 3 * CFG.dim; }
  out.set(lin('final_adaln.linear', cond), o);
  return out;
}
// RoPE tables for rows at positions pos0 … pos0 + n − 1: [cos hd/2 | sin hd/2] per row (rope_tables: f32 angles).
function ropeRows(pos0, n) {
  const half = CFG.hd / 2, r = new Float32Array(n * CFG.hd);
  const inv = Array.from({ length: half }, (_, i) => Math.fround(1 / Math.fround(Math.pow(CFG.theta, Math.fround(2 * i / CFG.hd)))));
  for (let t = 0; t < n; t++) for (let i = 0; i < half; i++) { const a = Math.fround((pos0 + t) * inv[i]); r[t * CFG.hd + i] = Math.cos(a); r[t * CFG.hd + half + i] = Math.sin(a); }
  return r;
}

// ── drafter ─────────────────────────────────────────────────────────────────
export class FlashMapDrafter {
  // target: a loaded Qwen3Dense with opts.captureLayers = FLASHMAP_QWEN3_4B_LAYERS (it shares the device, the token
  // table, the lm_head GEMM and the feature rows). opts.url: the safetensors file (default: Hugging Face, pinned).
  static async load(target, opts = {}) {
    const src = opts.source || FLASHMAP_QWEN3_4B;
    const url = opts.url || `https://huggingface.co/${src.repo}/resolve/${src.revision}/${src.file}`;
    const fetchFn = opts.fetch || ((u, i) => fetch(u, i));
    const { header, dataStart } = await readSafetensors(url, fetchFn);
    const d = new FlashMapDrafter(target, opts);
    await d.upload(url, fetchFn, header, dataStart, opts.onProgress || (() => {}));
    d.init();
    return d;
  }

  constructor(target, opts) {
    if (!target.capture || target.featWidth !== FLASHMAP_QWEN3_4B_LAYERS.length * CFG.targetDim) throw new Error('FlashMap: load the target with captureLayers = FLASHMAP_QWEN3_4B_LAYERS');
    this.t = target; this.device = target.device; this.opts = opts;
    this.maxCtx = Math.min(target.maxCtx + CFG.block + 1, 4096);
    this.pipelines = {}; this.gpuBytes = 0;
  }
  buffer(size, usage) { const b = this.device.createBuffer({ size: Math.max(16, Math.ceil(size / 4) * 4), usage }); this.gpuBytes += b.size; return b; }
  uniform(words) {
    const ab = new ArrayBuffer(Math.max(16, Math.ceil(words.length / 4) * 16)), u = new Uint32Array(ab), f = new Float32Array(ab);
    words.forEach((w, i) => { if (typeof w === 'object') f[i] = w.f; else u[i] = w; });
    const b = this.device.createBuffer({ size: ab.byteLength, usage: UNIFORM | COPY_DST }); this.device.queue.writeBuffer(b, 0, ab); return b;
  }
  pipeline(name) {
    if (!this.pipelines[name]) {
      const module = this.device.createShaderModule({ code: KS[name], label: `flashmap ${name}` });
      this.pipelines[name] = this.device.createComputePipeline({ layout: 'auto', compute: { module, entryPoint: 'main' }, label: `flashmap ${name}` });
    }
    return this.pipelines[name];
  }
  bind(name, res) {
    return this.device.createBindGroup({ layout: this.pipeline(name).getBindGroupLayout(0), entries: res.map((r, i) => ({ binding: i, resource: r instanceof GPUBuffer ? { buffer: r } : r })) });
  }
  run(pass, name, group, x, y = 1) { pass.setPipeline(this.pipeline(name)); pass.setBindGroup(0, group); pass.dispatchWorkgroups(x, y); }

  // Every tensor to its own GPU buffer, bf16 bytes as they are; the time-conditioning linears and the noise gate also to
  // the CPU. Reads the data section in ranges of up to 64 MB.
  async upload(url, fetchFn, header, dataStart, onProgress) {
    const names = Object.keys(header).sort((a, b) => header[a].data_offsets[0] - header[b].data_offsets[0]);
    const cpuWanted = (n) => /^(time_embed|jump_embed)\.|adaln\.linear\.|^noise_gate$/.test(n);
    this.w = {}; this.cpu = {};
    const total = header[names[names.length - 1]].data_offsets[1];
    const CH = 64 << 20;
    let i = 0, done = 0;
    while (i < names.length) {
      const start = header[names[i]].data_offsets[0];
      let j = i, end = start;
      while (j < names.length && (header[names[j]].data_offsets[1] - start <= CH || j === i)) { end = header[names[j]].data_offsets[1]; j++; }
      const r = await fetchFn(url, { headers: { Range: `bytes=${dataStart + start}-${dataStart + end - 1}` } });
      if (!r.ok && r.status !== 206) throw new Error(`drafter: HTTP ${r.status} reading weights`);
      const buf = new Uint8Array(await r.arrayBuffer());
      if (buf.byteLength !== end - start) throw new Error(`drafter: short read ${buf.byteLength} of ${end - start}`);
      for (let k = i; k < j; k++) {
        const n = names[k], [a, b] = header[n].data_offsets, bytes = buf.subarray(a - start, b - start);
        const padded = new Uint8Array(Math.ceil(bytes.byteLength / 4) * 4); padded.set(bytes);
        const g = this.buffer(padded.byteLength, STORAGE | COPY_DST);
        this.device.queue.writeBuffer(g, 0, padded);
        this.w[n] = g;
        if (cpuWanted(n)) this.cpu[n] = { shape: header[n].shape, data: bf16ToF32(new Uint16Array(padded.buffer, 0, bytes.byteLength / 2)) };
      }
      done = end; onProgress({ status: 'drafter', loaded: done, total });
      i = j;
    }
  }

  init() {
    const D = CFG.dim, H = CFG.targetDim, K = CFG.block, F = CFG.ff, t = this.t, dev = this.device;
    for (const k of Object.keys(KS)) this.pipeline(k);   // compile now, not in the first rounds
    const maxRows = Math.max(K, t.chunkTokens), A = (n) => this.buffer(n * 4, STORAGE | COPY_SRC | COPY_DST);
    this.mod = this.buffer((CFG.layers * 3 + 1) * 3 * D * 4, STORAGE | COPY_DST | COPY_SRC);
    dev.queue.writeBuffer(this.mod, 0, timeConditioning(this.cpu, 0, 1));
    this.zero = this.buffer(16, STORAGE);
    this.kc = []; this.vc = [];
    for (let l = 0; l < CFG.layers; l++) { this.kc.push(this.buffer(this.maxCtx * D * 2, STORAGE)); this.vc.push(this.buffer(this.maxCtx * D * 2, STORAGE)); }
    const a = this.a = {
      x: A(K * D), h: A(K * D), q: A(K * D), k: A(K * D), v: A(K * D), o: A(K * D), y: A(K * D), u: A(K * F), out: A(K * H),
      logits: A(K * t.cfg.vocab), am: this.buffer(K * 4, STORAGE | COPY_SRC), rbAm: this.buffer(K * 4, MAP_READ | COPY_DST),
      ctx: A(maxRows * D), ctxN: A(maxRows * D), ck: A(maxRows * D), cv: A(maxRows * D), ropeC: A(maxRows * CFG.hd), ropeS: A(K * CFG.hd), ropeA: A(CFG.hd),
      anchorId: this.buffer(16, STORAGE | COPY_DST), anchorE: A(H), anchorC0: A(D), anchorC: A(D), anchorK: A(D), anchorV: A(D),
      uniform: A(H), inRow: A(H), h0: A(D), qbK: this.buffer(16, UNIFORM | COPY_DST), qbA: this.buffer(16, UNIFORM | COPY_DST),
    };
    dev.queue.writeBuffer(a.qbK, 0, new Uint32Array([K, 0, 0, 0]));
    dev.queue.writeBuffer(a.qbA, 0, new Uint32Array([1, 0, 0, 0]));
    const W = this.w, lw = (l, n) => W[`layers.${l}.${n}`];
    // GEMM ops: { group, M, T }, the y grid is ceil(T / 16).
    const gemm = (x, name, y, M, N, T, bias = true) => {
      const res = [x, W[`${name}.weight`], bias && W[`${name}.bias`] ? W[`${name}.bias`] : this.zero, y, this.uniform([M, N, T, bias && W[`${name}.bias`] ? 1 : 0])];
      return { res, M, N, T };
    };
    this.gemm = gemm;
    const modOff = (n, part) => n * 3 * D + part * D;   // part 0 scale (lnMod reads scale, shift), 2 gate
    const u = {
      rmsD: this.uniform([D, { f: CFG.rmsEps }]), rmsH: this.uniform([H, { f: CFG.rmsEps }]),
      qkK: this.uniform([CFG.hd, D, { f: CFG.qkEps }, 0]), self: this.uniform([CFG.heads, CFG.hd, K, { f: Math.fround(1 / Math.sqrt(CFG.hd)) }]),
      gelu: this.uniform([K * F]), bK: this.uniform([D, K]),
    };
    this.u = u;
    // The target's pieces: its token table (anchor embedding, uniform_embeds) and its lm_head GEMM over 16 slots.
    const emb = t.w['token_embd.weight'].raw, et = t.types['token_embd.weight'], rowBytes = gpuRowBytes(et, H);
    this.g = {
      anchorE: t.bindR(`embedB_${et}`, [emb, t.grid, a.anchorId, a.anchorE, t.uniform([H, rowBytes]), a.qbA]),
      anchorP: gemm(a.anchorE, 'anchor_proj', a.anchorC0, D, H, 1),
      anchorN: this.bind('rmsRows', [a.anchorC0, W['anchor_norm.weight'], a.anchorC, u.rmsD]),
      bcast: this.bind('broadcast', [a.h0, a.x, u.bK]),
      // The 16 slots through the target's head on its verify-block matvec (one read of the table), else its GEMM.
      lm: t.kernels[`mvT_${et}`]
        ? { k: `mvT_${et}`, g: t.bindR(`mvT_${et}`, [a.out, emb, t.grid, a.logits, t.uniform([t.cfg.vocab, H, rowBytes, 0]), a.qbK]), wg: Math.ceil(t.cfg.vocab / MVT_ROWS), small: true }
        : { k: `mm_${et}`, g: t.bindR(`mm_${et}`, [a.out, emb, t.grid, a.logits, t.uniform([t.cfg.vocab, H, rowBytes, 0]), a.qbK]), wg: Math.ceil(t.cfg.vocab / MM_TILE) },
      am: t.bind('argmaxRows', [a.logits, a.am, t.uniform([t.cfg.vocab])]),
      final: this.bind('lnMod', [a.x, this.mod, a.h, this.uniform([D, modOff(CFG.layers * 3, 0), { f: CFG.lnEps }, 0])]),
      head: gemm(a.h, 'head', a.out, H, D, K),
    };
    this.layers = [];
    for (let l = 0; l < CFG.layers; l++) {
      const ln = (n) => this.bind('lnMod', [a.x, this.mod, a.h, this.uniform([D, modOff(3 * l + n, 0), { f: CFG.lnEps }, 0])]);
      const ga = (n) => this.bind('gateAdd', [a.x, a.y, this.mod, this.uniform([D, modOff(3 * l + n, 2), K, 0])]);
      const p = (n) => `layers.${l}.${n}`;
      this.layers.push({
        lnS: ln(0), sq: gemm(a.h, p('self_attn.q_proj'), a.q, D, D, K, false), sk: gemm(a.h, p('self_attn.k_proj'), a.k, D, D, K, false), sv: gemm(a.h, p('self_attn.v_proj'), a.v, D, D, K, false),
        sqn: this.bind('headNormRope', [a.q, lw(l, 'self_attn.q_norm.weight'), a.ropeS, u.qkK]), skn: this.bind('headNormRope', [a.k, lw(l, 'self_attn.k_norm.weight'), a.ropeS, u.qkK]),
        sat: this.bind('attnF32', [a.q, a.k, a.v, a.o, u.self]), so: gemm(a.o, p('self_attn.o_proj'), a.y, D, D, K, false), gaS: ga(0),
        lnC: ln(1), cq: gemm(a.h, p('cross_attn.q_proj'), a.q, D, D, K, false), cqn: this.bind('headNormRope', [a.q, lw(l, 'cross_attn.q_norm.weight'), a.ropeS, u.qkK]),
        co: gemm(a.o, p('cross_attn.o_proj'), a.y, D, D, K, false), gaC: ga(1),
        lnM: ln(2), f1: gemm(a.h, p('mlp.fc1'), a.u, F, D, K), gl: this.bind('gelu', [a.u, u.gelu]), f2: gemm(a.u, p('mlp.fc2'), a.y, D, F, K), gaM: ga(2),
        // The anchor's context slot.
        ak: gemm(a.anchorC, p('cross_attn.k_proj'), a.anchorK, D, D, 1, false), av: gemm(a.anchorC, p('cross_attn.v_proj'), a.anchorV, D, D, 1, false),
        akn: this.bind('headNormRope', [a.anchorK, lw(l, 'cross_attn.k_norm.weight'), a.ropeA, u.qkK]),
      });
    }
    // Constant input of every slot at zero noise: x_embed(state_norm(uniform_embeds)).
    const enc = dev.createCommandEncoder(), pass = enc.beginComputePass();
    const rowWords = rowBytes / 4;
    this.run(pass, 'colMeanQ8', this.bind('colMeanQ8', [emb, a.uniform, this.uniform([t.cfg.vocab, H, rowWords, 0])]), Math.ceil(H / 256));
    this.run(pass, 'rmsRows', this.bind('rmsRows', [a.uniform, W['state_norm.weight'], a.inRow, u.rmsH]), 1);
    this.runGemm(pass, gemm(a.inRow, 'x_embed', a.h0, D, H, 1));
    pass.end(); dev.queue.submit([enc.finish()]);
    this.length = 0;
  }
  // A GEMM op on the kernel its token count suits: gemvT1 / gemvT17 (one read of the weights) for up to 17 tokens, the
  // tiled GEMM for longer runs (a prompt's context rows). Bind groups are made on first use and kept on the op.
  runGemm(pass, op) {
    const T = op.T, k = T <= 1 ? 'gemvT1' : T <= 17 && op.N % 256 === 0 ? 'gemvT17' : 'gemmBf16';
    const g = (op.groups ||= {})[k] ||= this.bind(k, op.res);
    pass.setPipeline(this.pipeline(k)); pass.setBindGroup(0, g);
    if (k === 'gemmBf16') pass.dispatchWorkgroups(Math.ceil(op.M / 16), Math.ceil(T / 16)); else pass.dispatchWorkgroups(Math.ceil(op.M / 256));
  }
  reset() { this.length = 0; }

  // Append the target's feature rows 0 … n − 1 (its b.feat after a chunk) as context positions start … start + n − 1.
  extendContext(n, start) {
    if (start + n + CFG.block + 1 > this.maxCtx) throw new Error('FlashMap: context full');
    const D = CFG.dim, a = this.a, t = this.t, dev = this.device;
    dev.queue.writeBuffer(a.ropeC, 0, ropeRows(start, n));
    const enc = dev.createCommandEncoder(), pass = enc.beginComputePass();
    this.runGemm(pass, this.gemm(t.b.feat, 'fc', a.ctx, D, t.featWidth, n, false));
    this.run(pass, 'rmsRows', this.bind('rmsRows', [a.ctx, this.w['hidden_norm.weight'], a.ctxN, this.u.rmsD]), n);
    for (let l = 0; l < CFG.layers; l++) {
      const p = (x) => `layers.${l}.cross_attn.${x}`;
      this.runGemm(pass, this.gemm(a.ctxN, p('k_proj'), a.ck, D, D, n, false));
      this.runGemm(pass, this.gemm(a.ctxN, p('v_proj'), a.cv, D, D, n, false));
      this.run(pass, 'headNormRope', this.bind('headNormRope', [a.ck, this.w[p('k_norm.weight')], a.ropeC, this.u.qkK]), CFG.heads, n);
      this.run(pass, 'kvWrite', this.bind('kvWrite', [a.ck, a.cv, this.kc[l], this.vc[l], this.uniform([D, start, n, 0])]), Math.ceil(D / 256), n);
    }
    pass.end(); dev.queue.submit([enc.finish()]);
    this.length = start + n;
  }

  // The 16 tokens after `anchor`, which sits at context position `pos` (= the number of verified tokens before it).
  async draft(anchor, pos) {
    const D = CFG.dim, K = CFG.block, a = this.a, t = this.t, dev = this.device, g = this.g;
    dev.queue.writeBuffer(a.anchorId, 0, new Uint32Array([anchor]));
    dev.queue.writeBuffer(a.ropeA, 0, ropeRows(pos, 1));
    dev.queue.writeBuffer(a.ropeS, 0, ropeRows(pos + 1, K));
    const L = pos + 1, cross = this.uniform([CFG.heads, CFG.hd, L, { f: Math.fround(1 / Math.sqrt(CFG.hd)) }]);
    const enc = dev.createCommandEncoder(), pass = enc.beginComputePass();
    // The anchor's context slot at pos.
    t.dispatch(pass, `embedB_${t.types['token_embd.weight']}`, g.anchorE, Math.ceil(CFG.targetDim / 8 / 256), 1);   // the target's kernel
    this.runGemm(pass, g.anchorP); this.run(pass, 'rmsRows', g.anchorN, 1);
    for (let l = 0; l < CFG.layers; l++) {
      const y = this.layers[l];
      this.runGemm(pass, y.ak); this.runGemm(pass, y.av);
      this.run(pass, 'headNormRope', y.akn, CFG.heads, 1);
      this.run(pass, 'kvWrite', this.bind('kvWrite', [a.anchorK, a.anchorV, this.kc[l], this.vc[l], this.uniform([D, pos, 1, 0])]), Math.ceil(D / 256), 1);
    }
    // The jump 0 → 1 from zero noise.
    this.run(pass, 'broadcast', g.bcast, Math.ceil(D / 256), K);
    for (let l = 0; l < CFG.layers; l++) {
      const y = this.layers[l];
      this.run(pass, 'lnMod', y.lnS, K);
      this.runGemm(pass, y.sq); this.runGemm(pass, y.sk); this.runGemm(pass, y.sv);
      this.run(pass, 'headNormRope', y.sqn, CFG.heads, K); this.run(pass, 'headNormRope', y.skn, CFG.heads, K);
      this.run(pass, 'attnF32', y.sat, CFG.heads, K);
      this.runGemm(pass, y.so); this.run(pass, 'gateAdd', y.gaS, Math.ceil(D / 256), K);
      this.run(pass, 'lnMod', y.lnC, K);
      this.runGemm(pass, y.cq); this.run(pass, 'headNormRope', y.cqn, CFG.heads, K);
      this.run(pass, 'attnF16', this.bind('attnF16', [a.q, this.kc[l], this.vc[l], a.o, cross]), CFG.heads, K);
      this.runGemm(pass, y.co); this.run(pass, 'gateAdd', y.gaC, Math.ceil(D / 256), K);
      this.run(pass, 'lnMod', y.lnM, K);
      this.runGemm(pass, y.f1); this.run(pass, 'gelu', y.gl, Math.ceil(K * CFG.ff / 256));
      this.runGemm(pass, y.f2); this.run(pass, 'gateAdd', y.gaM, Math.ceil(D / 256), K);
    }
    this.run(pass, 'lnMod', g.final, K);
    this.runGemm(pass, g.head);
    if (g.lm.small) t.dispatch(pass, g.lm.k, g.lm.g, g.lm.wg);
    else t.dispatch(pass, g.lm.k, g.lm.g, g.lm.wg, Math.ceil(K / (t.matrixKernels ? MM_SG_TOKENS : MM_TILE)));
    t.dispatch(pass, 'argmaxRows', g.am, K);
    pass.end();
    enc.copyBufferToBuffer(a.am, 0, a.rbAm, 0, K * 4);
    dev.queue.submit([enc.finish()]);
    await a.rbAm.mapAsync(1);
    const out = Array.from(new Uint32Array(a.rbAm.getMappedRange().slice(0)));
    a.rbAm.unmap();
    return out;
  }

  // Debug: the 16 slots' DiT output (before the lm_head) of the last draft.
  async readOut() {
    const n = CFG.block * CFG.targetDim * 4, rb = this.device.createBuffer({ size: n, usage: MAP_READ | COPY_DST });
    const enc = this.device.createCommandEncoder(); enc.copyBufferToBuffer(this.a.out, 0, rb, 0, n); this.device.queue.submit([enc.finish()]);
    await rb.mapAsync(1); const v = new Float32Array(rb.getMappedRange().slice(0)); rb.unmap(); rb.destroy(); return v;
  }
  // Debug: the first n values, and counts of NaN and zero, of named working buffers (this.a) or of this.mod.
  async peek(names, n = 6) {
    const out = {};
    for (const name of names) {
      const src = name === 'mod' ? this.mod : this.a[name], size = Math.min(src.size, 1 << 20);
      const rb = this.device.createBuffer({ size, usage: MAP_READ | COPY_DST });
      const enc = this.device.createCommandEncoder(); enc.copyBufferToBuffer(src, 0, rb, 0, size); this.device.queue.submit([enc.finish()]);
      await rb.mapAsync(1); const v = new Float32Array(rb.getMappedRange().slice(0)); rb.unmap(); rb.destroy();
      let nan = 0, zero = 0; for (const x of v) { if (Number.isNaN(x)) nan++; else if (x === 0) zero++; }
      out[name] = { head: Array.from(v.slice(0, n), (x) => +x.toPrecision(5)), nan, zero, of: v.length };
    }
    return out;
  }
  destroy() { for (const b of Object.values(this.w || {})) b.destroy(); }
}

// Lossless speculative greedy decoding: prompt `ids` → yields { tokens, accepted, drafted } per round (tokens: the new
// ones), or { tokens, plain: true } per plain step. The target must be a Qwen3Dense loaded with captureLayers; the
// drafter one from FlashMapDrafter.load.
// verify: how many of the 16 drafts a round checks. 'adaptive' (default) checks 7 (an 8-token verify block, about half
// the cost of 17) while recent rounds accept fewer than 5, else all 16; a number fixes it.
// fallback (default on): when rounds yield fewer tokens than plain steps would in the same time (a slow average under
// 85% of round time over plain-step time, both measured as it runs), decode plainly for probeEvery tokens, with the steps still feeding the
// drafter's context, then try a round again. Chat text drafts poorly; code and maths draft well.
export async function* specGenerate(target, drafter, ids, { maxNewTokens = 256, stopTokenIds = target.stopTokenIds, rounds, verify = 'adaptive', fallback = true, probeEvery = 16 } = {}) {
  const stops = new Set(stopTokenIds || []);
  let ema = 4, emaTokens = 5, roundMs = null, stepMs = 30, plainLeft = 0, featRows = 0, featStart = 0, catchUp = false, nRounds = 0;
  target.reset(); drafter.reset();
  let next = null;
  for (let i = 0; i < ids.length; i += target.chunkTokens) {
    const chunk = ids.slice(i, i + target.chunkTokens), last = i + target.chunkTokens >= ids.length;
    next = await target.prefillChunk(chunk, last ? 'argmax' : 'none');
    drafter.extendContext(chunk.length, i);
  }
  let produced = 1;
  yield { tokens: [next], accepted: 0, drafted: 0, prefill: true };
  if (stops.has(next)) return;
  while (produced < maxNewTokens) {
    if (plainLeft > 0) {
      // A plain step on `next`, its features into the next free feature row.
      if (featRows === 0) featStart = target.position;
      const t0 = performance.now();
      target.stepFeatRow = featRows;
      const tok = await target.step(next, 'argmax');
      target.stepFeatRow = null;
      stepMs = 0.7 * stepMs + 0.3 * (performance.now() - t0);
      featRows++; plainLeft--; produced++; next = tok;
      if (plainLeft === 0 || featRows >= target.chunkTokens || stops.has(tok) || produced >= maxNewTokens) { drafter.extendContext(featRows, featStart); featRows = 0; catchUp = true; }
      yield { tokens: [tok], plain: true };
      if (stops.has(tok)) return;
      continue;
    }
    const pos = target.position, anchor = next, K = verify === 'adaptive' ? (ema >= 5 ? CFG.block : 7) : Math.min(CFG.block, verify);
    const t0 = performance.now();
    const drafts = (await drafter.draft(anchor, pos)).slice(0, K);
    const t1 = performance.now();
    const rows = await target.prefillChunk([anchor, ...drafts], 'rows');
    const t2 = performance.now();
    let acc = 0;
    while (acc < K && drafts[acc] === rows[acc]) acc++;
    let fresh = [...drafts.slice(0, acc), rows[acc]];
    const hit = fresh.findIndex((x) => stops.has(x));
    if (hit >= 0) fresh = fresh.slice(0, hit + 1);
    ema = 0.6 * ema + 0.4 * acc;
    emaTokens = 0.75 * emaTokens + 0.25 * (acc + 1); nRounds++;
    // A round right after a plain stretch also waits for that stretch's context; keep it out of the round time.
    if (!catchUp) roundMs = roundMs == null ? t2 - t0 : 0.6 * roundMs + 0.4 * (t2 - t0);
    catchUp = false;
    drafter.extendContext(acc + 1, pos);
    target.rewind(pos + acc + 1);
    next = fresh[fresh.length - 1];
    produced += fresh.length;
    yield { tokens: fresh, accepted: acc, drafted: K, draftMs: t1 - t0, verifyMs: t2 - t1 };
    if (hit >= 0 || (rounds && --rounds <= 0)) return;
    // Fall back when rounds lose (tokens per round under 85% of break-even, on a slow average over at least 4 rounds),
    // so chat text drops to plain steps while code and maths near break-even keep drafting; after each plain stretch one
    // round probes again on the same average.
    if (fallback && nRounds >= 4 && roundMs != null && emaTokens * stepMs < 0.85 * roundMs) plainLeft = probeEvery;
  }
}
