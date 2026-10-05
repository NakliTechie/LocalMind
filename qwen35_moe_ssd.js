/* qwen35_moe_ssd.js — Qwen3.5/3.6 MoE (Qwen3.6-35B-A3B, GGUF arch `qwen35moe`) in a browser tab,
 * larger than RAM: rung 2b of the SSD-streaming ladder. The routed experts stream from OPFS into
 * a GPU slot pool exactly as in rung 2a (qwen3_moe_ssd.js, which this module extends); what is new
 * is the hybrid trunk:
 *   - 3 of every 4 layers are Gated DeltaNet (linear attention): a 4-tap causal conv over the
 *     q|k|v projection, L2-normalised q and k, and the gated delta rule on a 128×128 state per
 *     value head; output = RMSNorm(o)·w · SiLU(z), then a projection.
 *   - every 4th layer is full attention with a per-head output gate (the q projection carries
 *     q and gate per head), q/k RMSNorm and NeoX RoPE on the first 64 of 256 dims.
 *   - each MoE block adds a shared expert, scaled by sigmoid(x·w_gate).
 * The math follows llama.cpp's qwen35moe graph and its CPU ops (ggml_gated_delta_net, ssm_conv,
 * rope_multi with text positions), so greedy output can be gated against llama-server on the
 * same GGUF. Decode is one token at a time (prefill feeds tokens through the same step).
 *
 *   const m = await Qwen35MoeSsd.load(null, { url: '…/Qwen3.6-35B-A3B-Q8_0.gguf', poolBytes });
 */

import { Qwen3MoeSsd, STORAGE, COPY_SRC, COPY_DST, MAP_READ, UNIFORM, I8 } from './qwen3_moe_ssd.js';

export const QWEN36_35B_A3B = {
  repo: 'unsloth/Qwen3.6-35B-A3B-GGUF',
  file: 'Qwen3.6-35B-A3B-Q8_0.gguf',
  revision: 'a483e9e6cbd595906af30beda3187c2663a1118c',
  sha256: 'd1a395809f65a43a13ad119eb4e7acdef1ac6d68120f39902c8ab96e72794a59',
  size: 36903140320,
};

const SIGMOID = 'fn sigm(x: f32) -> f32 { return 1.0 / (1.0 + exp(-x)); }';

const KERNELS = {
  // Per-head RMSNorm (QK-norm), then NeoX RoPE on the first nRot dims (pairs i, i + nRot/2);
  // dims ≥ nRot keep the normed value. src rows are srcStride apart (the q projection holds
  // [q hd | gate hd] per head); with gate = 1 the gate half is copied to gout. One workgroup per head.
  qkNormRopeP: `
struct P { hd: u32, srcStride: u32, nRot: u32, gate: u32, eps: f32 }
@group(0) @binding(0) var<storage, read> src: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read> rope: array<f32>;
@group(0) @binding(3) var<storage, read_write> dst: array<f32>;
@group(0) @binding(4) var<storage, read_write> gout: array<f32>;
@group(0) @binding(5) var<uniform> p: P;
var<workgroup> red: array<f32, 64>;
@compute @workgroup_size(64) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let sb = wg.x * p.srcStride; let ob = wg.x * p.hd; let t = l.x; let half = p.nRot / 2u;
  var acc = 0.0;
  for (var i = t; i < p.hd; i += 64u) { let v = src[sb + i]; acc += v * v; }
  red[t] = acc; workgroupBarrier();
  for (var s = 32u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  let scale = 1.0 / sqrt(red[0] / f32(p.hd) + p.eps);
  for (var i = t; i < p.hd; i += 64u) {
    if (i < half) {
      let a = (src[sb + i] * scale) * w[i];
      let b = (src[sb + i + half] * scale) * w[i + half];
      let c = rope[i]; let sn = rope[half + i];
      dst[ob + i] = a * c - b * sn;
      dst[ob + i + half] = a * sn + b * c;
    } else if (i >= p.nRot) {
      dst[ob + i] = (src[sb + i] * scale) * w[i];
    }
    if (p.gate == 1u) { gout[ob + i] = src[sb + p.hd + i]; }
  }
}`,
  // x[i] *= sigmoid(g[i]) — the full-attention output gate.
  sigmoidMul: `
struct P { n: u32 }
@group(0) @binding(0) var<storage, read_write> x: array<f32>;
@group(0) @binding(1) var<storage, read> g: array<f32>;
@group(0) @binding(2) var<uniform> p: P;
${SIGMOID}
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) gi: vec3<u32>) {
  let i = gi.x; if (i < p.n) { x[i] = x[i] * sigm(g[i]); }
}`,
  // Causal depthwise conv, kernel 4, over the q|k|v projection, then SiLU. state holds each
  // channel's previous 3 inputs, oldest first (llama.cpp's conv state), and rolls forward.
  gdnConv: `
struct P { n: u32 }
@group(0) @binding(0) var<storage, read> mixed: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read_write> st: array<f32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) gi: vec3<u32>) {
  let c = gi.x; if (c >= p.n) { return; }
  let s0 = st[c * 3u]; let s1 = st[c * 3u + 1u]; let s2 = st[c * 3u + 2u]; let x = mixed[c];
  var sum = 0.0;
  sum += s0 * w[c * 4u]; sum += s1 * w[c * 4u + 1u]; sum += s2 * w[c * 4u + 2u]; sum += x * w[c * 4u + 3u];
  y[c] = sum / (1.0 + exp(-sum));
  st[c * 3u] = s1; st[c * 3u + 1u] = s2; st[c * 3u + 2u] = x;
}`,
  // The gated delta rule for one token. Workgroup h = value head, thread j = value row j of the
  // head's state M (M[j][i] = S[i][j], llama.cpp's layout; i runs over the key dim). k-head = h % kH.
  //   q, k ← L2-normalised (x / sqrt(Σx² + eps));  beta = σ(b);  g = softplus(a + dt) · A
  //   M ← M·e^g;  d_j = β (v_j − Σ_i M[j][i] k_i);  M[j][i] += k_i d_j;  o_j = (Σ_i M[j][i] q_i) / √dS
  gdnStep: `
struct P { kH: u32, dS: u32, keyDim: u32, pad: u32, eps: f32, scale: f32 }
@group(0) @binding(0) var<storage, read> cv: array<f32>;
@group(0) @binding(1) var<storage, read> bb: array<f32>;
@group(0) @binding(2) var<storage, read> al: array<f32>;
@group(0) @binding(3) var<storage, read> dt: array<f32>;
@group(0) @binding(4) var<storage, read> aa: array<f32>;
@group(0) @binding(5) var<storage, read_write> M: array<f32>;
@group(0) @binding(6) var<storage, read_write> o: array<f32>;
@group(0) @binding(7) var<uniform> p: P;
${SIGMOID}
var<workgroup> kq: array<f32, 128>;
var<workgroup> qq: array<f32, 128>;
var<workgroup> rq: array<f32, 128>;
var<workgroup> rk: array<f32, 128>;
fn log1p_(u: f32) -> f32 { let y = 1.0 + u; return log(y) - ((y - 1.0) - u) / y; }
@compute @workgroup_size(128) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let h = wg.x; let j = l.x; let dS = p.dS; let kh = h % p.kH;
  let qv = cv[kh * dS + j]; let kv = cv[p.keyDim + kh * dS + j]; let vv = cv[2u * p.keyDim + h * dS + j];
  rq[j] = qv * qv; rk[j] = kv * kv; workgroupBarrier();
  for (var s = 64u; s > 0u; s >>= 1u) { if (j < s) { rq[j] += rq[j + s]; rk[j] += rk[j + s]; } workgroupBarrier(); }
  let n = f32(dS); let inv = 1.0 / sqrt(n);
  qq[j] = (qv * (1.0 / sqrt(rq[0] / n + p.eps / n))) * inv;
  kq[j] = (kv * (1.0 / sqrt(rk[0] / n + p.eps / n))) * inv;
  workgroupBarrier();
  let beta = sigm(bb[h]);
  let x = al[h] + dt[h];
  let sp = select(log1p_(exp(x)), x, x > 20.0);
  let decay = exp(sp * aa[h]);
  let row = (h * dS + j) * dS;
  var sk = 0.0;
  for (var i = 0u; i < dS; i++) { let m = M[row + i] * decay; M[row + i] = m; sk += m * kq[i]; }
  let d = (vv - sk) * beta;
  var acc = 0.0;
  for (var i = 0u; i < dS; i++) { let m = M[row + i] + kq[i] * d; M[row + i] = m; acc += m * qq[i]; }
  o[h * dS + j] = acc * p.scale;
}`,
  // Per value head: RMSNorm(o)·w · SiLU(z).
  gdnNormGate: `
struct P { dS: u32, eps: f32 }
@group(0) @binding(0) var<storage, read> o: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read> z: array<f32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
var<workgroup> red: array<f32, 128>;
@compute @workgroup_size(128) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let h = wg.x; let j = l.x; let i = h * p.dS + j;
  let v = o[i]; red[j] = v * v; workgroupBarrier();
  for (var s = 64u; s > 0u; s >>= 1u) { if (j < s) { red[j] += red[j + s]; } workgroupBarrier(); }
  let scale = 1.0 / sqrt(red[0] / f32(p.dS) + p.eps);
  let zz = z[i];
  y[i] = ((v * scale) * w[j]) * (zz / (1.0 + exp(-zz)));
}`,
  // x[h] = (Σ_j w_j·out[j·H + h] + sh[h]·σ(sg)) + x[h]: routed experts, the gated shared expert,
  // then the residual — llama.cpp's order.
  moeAccumShared: `
struct P { H: u32, k: u32 }
@group(0) @binding(0) var<storage, read> out: array<f32>;
@group(0) @binding(1) var<storage, read> sel: array<u32>;
@group(0) @binding(2) var<storage, read> sh: array<f32>;
@group(0) @binding(3) var<storage, read> sg: array<f32>;
@group(0) @binding(4) var<storage, read_write> x: array<f32>;
@group(0) @binding(5) var<uniform> p: P;
${SIGMOID}
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) gi: vec3<u32>) {
  let h = gi.x; if (h >= p.H) { return; }
  var acc = 0.0;
  for (var j = 0u; j < p.k; j++) { acc += bitcast<f32>(sel[p.k + j]) * out[j * p.H + h]; }
  x[h] = (acc + sh[h] * sigm(sg[0])) + x[h];
}`,
};


// ── Batched prefill: a chunk of T prompt tokens per layer ───────────────────────────────────
// Every batched buffer is token-major (row t holds token pos0 + t). Q is the per-chunk uniform.
const QB = 'struct Q { T: u32, pos0: u32, S: u32, pad: u32 }';
const BATCH_KERNELS = {
  embedQ8B: `enable f16;
struct P { n: u32 }
${QB}
@group(0) @binding(0) var<storage, read> q: array<u32>;
@group(0) @binding(1) var<storage, read> s: array<f16>;
@group(0) @binding(2) var<storage, read> ids: array<u32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@group(0) @binding(5) var<uniform> qd: Q;
${I8}
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; let t = g.y; if (i >= p.n || t >= qd.T) { return; }
  let e = ids[t] * p.n + i;
  y[t * p.n + i] = i8at(q[e >> 2u], e & 3u) * f32(s[e >> 5u]);
}`,
  // One workgroup per token row.
  rmsnormB: `
struct P { n: u32, eps: f32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let b = wg.x * p.n; let t = l.x; var acc = 0.0;
  for (var i = t; i < p.n; i += 256u) { let v = x[b + i]; acc += v * v; }
  red[t] = acc; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  let scale = 1.0 / sqrt(red[0] / f32(p.n) + p.eps);
  for (var i = t; i < p.n; i += 256u) { y[b + i] = (x[b + i] * scale) * w[i]; }
}`,
  // Tiled Q8_0 GEMM: y[t·M + m] = Σ_k x[t·N + k]·W[m][k]. A workgroup computes 16 rows × 16 tokens;
  // each 32-wide k block (one Q8_0 block) of W and x goes through shared memory, so every weight
  // byte read serves 16 tokens. Dispatch (ceil(M/16), ceil(T/16)).
  matmulQ8T: `enable f16;
struct P { M: u32, N: u32 }
${QB}
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> qw: array<u32>;
@group(0) @binding(2) var<storage, read> qs: array<f16>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@group(0) @binding(5) var<uniform> qd: Q;
${I8}
var<workgroup> ws: array<f32, 512>;
var<workgroup> xs: array<f32, 512>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let m0 = wg.x * 16u; let t0 = wg.y * 16u; let r = l.x / 16u; let c = l.x % 16u;
  let nb = p.N / 32u; var acc = 0.0;
  for (var b = 0u; b < nb; b++) {
    for (var i = l.x; i < 512u; i += 256u) {
      let rr = i / 32u; let kk = i % 32u;
      let m = m0 + rr; var wv = 0.0;
      if (m < p.M) { let e = m * p.N + b * 32u + kk; wv = i8at(qw[e >> 2u], e & 3u) * f32(qs[m * nb + b]); }
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
  // F32 matrix × T vectors, one workgroup per (row, token). Dispatch (M, T).
  matmulF32T: `
struct P { M: u32, N: u32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let m = wg.x; let t = wg.y; let i = l.x; var acc = 0.0;
  for (var k = i; k < p.N; k += 256u) { acc += w[m * p.N + k] * x[t * p.N + k]; }
  red[i] = acc; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (i < s) { red[i] += red[i + s]; } workgroupBarrier(); }
  if (i == 0u) { y[t * p.M + m] = red[0]; }
}`,
  // The router top-k for token wg.x (same picks and weights as the one-token kernel).
  topkB: `
struct P { n: u32, k: u32 }
@group(0) @binding(0) var<storage, read> lg: array<f32>;
@group(0) @binding(1) var<storage, read_write> sel: array<u32>;
@group(0) @binding(2) var<uniform> p: P;
var<workgroup> red: array<f32, 256>;
var<workgroup> bi: array<u32, 256>;
var<workgroup> gmax: f32;
var<workgroup> gsum: f32;
var<workgroup> picks: array<u32, 32>;
var<workgroup> probs: array<f32, 32>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let t = l.x; let n = p.n; let lb = wg.x * n; let sb = wg.x * 2u * p.k;
  red[t] = select(-3.4e38, lg[lb + min(t, n - 1u)], t < n); workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] = max(red[t], red[t + s]); } workgroupBarrier(); }
  if (t == 0u) { gmax = red[0]; } workgroupBarrier();
  red[t] = select(0.0, exp(lg[lb + min(t, n - 1u)] - gmax), t < n); workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  if (t == 0u) { gsum = red[0]; } workgroupBarrier();
  var mine = select(-1.0, exp(lg[lb + min(t, n - 1u)] - gmax) / gsum, t < n);
  for (var j = 0u; j < p.k; j++) {
    red[t] = mine; bi[t] = t; workgroupBarrier();
    for (var s = 128u; s > 0u; s >>= 1u) {
      if (t < s) { let o = red[t + s]; if (o > red[t] || (o == red[t] && bi[t + s] < bi[t])) { red[t] = o; bi[t] = bi[t + s]; } }
      workgroupBarrier();
    }
    if (t == 0u) { picks[j] = bi[0]; probs[j] = red[0]; }
    workgroupBarrier();
    if (t == picks[j]) { mine = -1.0; }
    workgroupBarrier();
  }
  if (t == 0u) {
    var wsum = 0.0;
    for (var j = 0u; j < p.k; j++) { wsum += probs[j]; }
    for (var j = 0u; j < p.k; j++) { sel[sb + j] = picks[j]; sel[sb + p.k + j] = bitcast<u32>(probs[j] / wsum); }
  }
}`,
  // The 4-tap conv over T tokens in order, rolling the state.
  gdnConvB: `
struct P { n: u32 }
${QB}
@group(0) @binding(0) var<storage, read> mixed: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read_write> st: array<f32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@group(0) @binding(5) var<uniform> qd: Q;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) gi: vec3<u32>) {
  let c = gi.x; if (c >= p.n) { return; }
  var s0 = st[c * 3u]; var s1 = st[c * 3u + 1u]; var s2 = st[c * 3u + 2u];
  let w0 = w[c * 4u]; let w1 = w[c * 4u + 1u]; let w2 = w[c * 4u + 2u]; let w3 = w[c * 4u + 3u];
  for (var t = 0u; t < qd.T; t++) {
    let x = mixed[t * p.n + c];
    var sum = 0.0;
    sum += s0 * w0; sum += s1 * w1; sum += s2 * w2; sum += x * w3;
    y[t * p.n + c] = sum / (1.0 + exp(-sum));
    s0 = s1; s1 = s2; s2 = x;
  }
  st[c * 3u] = s0; st[c * 3u + 1u] = s1; st[c * 3u + 2u] = s2;
}`,
  // The gated delta rule over T tokens in order (one workgroup per value head, as gdnStep).
  gdnStepB: `
struct P { kH: u32, dS: u32, keyDim: u32, convDim: u32, vH: u32, pad: u32, eps: f32, scale: f32 }
${QB}
@group(0) @binding(0) var<storage, read> cv: array<f32>;
@group(0) @binding(1) var<storage, read> bb: array<f32>;
@group(0) @binding(2) var<storage, read> al: array<f32>;
@group(0) @binding(3) var<storage, read> dt: array<f32>;
@group(0) @binding(4) var<storage, read> aa: array<f32>;
@group(0) @binding(5) var<storage, read_write> M: array<f32>;
@group(0) @binding(6) var<storage, read_write> o: array<f32>;
@group(0) @binding(7) var<uniform> p: P;
@group(0) @binding(8) var<uniform> qd: Q;
${SIGMOID}
var<workgroup> kq: array<f32, 128>;
var<workgroup> qq: array<f32, 128>;
var<workgroup> rq: array<f32, 128>;
var<workgroup> rk: array<f32, 128>;
fn log1p_(u: f32) -> f32 { let y = 1.0 + u; return log(y) - ((y - 1.0) - u) / y; }
@compute @workgroup_size(128) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let h = wg.x; let j = l.x; let dS = p.dS; let kh = h % p.kH;
  let n = f32(dS); let inv = 1.0 / sqrt(n);
  let row = (h * dS + j) * dS;
  let dth = dt[h]; let aah = aa[h];
  for (var t = 0u; t < qd.T; t++) {
    let cb = t * p.convDim;
    let qv = cv[cb + kh * dS + j]; let kv = cv[cb + p.keyDim + kh * dS + j]; let vv = cv[cb + 2u * p.keyDim + h * dS + j];
    rq[j] = qv * qv; rk[j] = kv * kv; workgroupBarrier();
    for (var s = 64u; s > 0u; s >>= 1u) { if (j < s) { rq[j] += rq[j + s]; rk[j] += rk[j + s]; } workgroupBarrier(); }
    qq[j] = (qv * (1.0 / sqrt(rq[0] / n + p.eps / n))) * inv;
    kq[j] = (kv * (1.0 / sqrt(rk[0] / n + p.eps / n))) * inv;
    workgroupBarrier();
    let beta = sigm(bb[t * p.vH + h]);
    let x = al[t * p.vH + h] + dth;
    let sp = select(log1p_(exp(x)), x, x > 20.0);
    let decay = exp(sp * aah);
    var sk = 0.0;
    for (var i = 0u; i < dS; i++) { let m = M[row + i] * decay; M[row + i] = m; sk += m * kq[i]; }
    let d = (vv - sk) * beta;
    var acc = 0.0;
    for (var i = 0u; i < dS; i++) { let m = M[row + i] + kq[i] * d; M[row + i] = m; acc += m * qq[i]; }
    o[t * p.vH * dS + h * dS + j] = acc * p.scale;
    workgroupBarrier();
  }
}`,
  // RMSNorm(o)·w·SiLU(z) for (value head wg.x, token wg.y).
  gdnNormGateB: `
struct P { dS: u32, dInner: u32, eps: f32 }
@group(0) @binding(0) var<storage, read> o: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read> z: array<f32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
var<workgroup> red: array<f32, 128>;
@compute @workgroup_size(128) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let j = l.x; let i = wg.y * p.dInner + wg.x * p.dS + j;
  let v = o[i]; red[j] = v * v; workgroupBarrier();
  for (var s = 64u; s > 0u; s >>= 1u) { if (j < s) { red[j] += red[j + s]; } workgroupBarrier(); }
  let scale = 1.0 / sqrt(red[0] / f32(p.dS) + p.eps);
  let zz = z[i];
  y[i] = ((v * scale) * w[j]) * (zz / (1.0 + exp(-zz)));
}`,
  // qkNormRopeP for (head wg.x, token wg.y); rope holds nRot values per token.
  qkNormRopePB: `
struct P { hd: u32, srcStride: u32, srcRow: u32, dstRow: u32, nRot: u32, gate: u32, eps: f32 }
@group(0) @binding(0) var<storage, read> src: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read> rope: array<f32>;
@group(0) @binding(3) var<storage, read_write> dst: array<f32>;
@group(0) @binding(4) var<storage, read_write> gout: array<f32>;
@group(0) @binding(5) var<uniform> p: P;
var<workgroup> red: array<f32, 64>;
@compute @workgroup_size(64) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let tk = wg.y; let sb = tk * p.srcRow + wg.x * p.srcStride; let ob = tk * p.dstRow + wg.x * p.hd; let rb = tk * p.nRot;
  let t = l.x; let half = p.nRot / 2u;
  var acc = 0.0;
  for (var i = t; i < p.hd; i += 64u) { let v = src[sb + i]; acc += v * v; }
  red[t] = acc; workgroupBarrier();
  for (var s = 32u; s > 0u; s >>= 1u) { if (t < s) { red[t] += red[t + s]; } workgroupBarrier(); }
  let scale = 1.0 / sqrt(red[0] / f32(p.hd) + p.eps);
  for (var i = t; i < p.hd; i += 64u) {
    if (i < half) {
      let a = (src[sb + i] * scale) * w[i];
      let b = (src[sb + i + half] * scale) * w[i + half];
      let c = rope[rb + i]; let sn = rope[rb + half + i];
      dst[ob + i] = a * c - b * sn;
      dst[ob + i + half] = a * sn + b * c;
    } else if (i >= p.nRot) {
      dst[ob + i] = (src[sb + i] * scale) * w[i];
    }
    if (p.gate == 1u) { gout[ob + i] = src[sb + p.hd + i]; }
  }
}`,
  kvStoreB: `enable f16;
struct P { n: u32 }
${QB}
@group(0) @binding(0) var<storage, read> k: array<f32>;
@group(0) @binding(1) var<storage, read> v: array<f32>;
@group(0) @binding(2) var<storage, read_write> kc: array<f16>;
@group(0) @binding(3) var<storage, read_write> vc: array<f16>;
@group(0) @binding(4) var<uniform> p: P;
@group(0) @binding(5) var<uniform> qd: Q;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; let t = g.y; if (i >= p.n || t >= qd.T) { return; }
  let pos = qd.pos0 + t;
  kc[pos * p.n + i] = f16(k[t * p.n + i]);
  vc[pos * p.n + i] = f16(v[t * p.n + i]);
}`,
  // Causal scores for T queries over S = pos0 + T keys; masked keys get -3.4e38.
  attnScoreB: `enable f16;
struct P { heads: u32, kvHeads: u32, hd: u32, scale: f32 }
${QB}
@group(0) @binding(0) var<storage, read> q: array<f32>;
@group(0) @binding(1) var<storage, read> kc: array<f16>;
@group(0) @binding(2) var<storage, read_write> sc: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
@group(0) @binding(4) var<uniform> qd: Q;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>) {
  let idx = g.y * ng.x * 256u + g.x; let S = qd.S; let T = qd.T;
  if (idx >= p.heads * T * S) { return; }
  let h = idx / (T * S); let rem = idx % (T * S); let t = rem / S; let pos = rem % S;
  if (pos > qd.pos0 + t) { sc[idx] = -3.4e38; return; }
  let kvh = h / (p.heads / p.kvHeads);
  let qo = t * p.heads * p.hd + h * p.hd; let ko = pos * p.kvHeads * p.hd + kvh * p.hd;
  var acc = 0.0;
  for (var d = 0u; d < p.hd; d++) { acc += q[qo + d] * f32(kc[ko + d]); }
  sc[idx] = acc * p.scale;
}`,
  softmaxB: `
${QB}
@group(0) @binding(0) var<storage, read_write> sc: array<f32>;
@group(0) @binding(1) var<uniform> qd: Q;
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let n = qd.S; let base = wg.x * n; let t = l.x;
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
  attnOutB: `enable f16;
struct P { heads: u32, kvHeads: u32, hd: u32, pad: u32 }
${QB}
@group(0) @binding(0) var<storage, read> pr: array<f32>;
@group(0) @binding(1) var<storage, read> vc: array<f16>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
@group(0) @binding(4) var<uniform> qd: Q;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let QN = p.heads * p.hd; let idx = g.x; let t = g.y;
  if (idx >= QN || t >= qd.T) { return; }
  let h = idx / p.hd; let d = idx % p.hd; let kvh = h / (p.heads / p.kvHeads);
  let stride = p.kvHeads * p.hd; let rb = (h * qd.T + t) * qd.S; let last = qd.pos0 + t;
  var acc = 0.0;
  for (var pos = 0u; pos <= last; pos++) { acc += pr[rb + pos] * f32(vc[pos * stride + kvh * p.hd + d]); }
  y[t * QN + idx] = acc;
}`,
  sigmoidMulB: `
struct P { n: u32 }
${QB}
@group(0) @binding(0) var<storage, read_write> x: array<f32>;
@group(0) @binding(1) var<storage, read> g: array<f32>;
@group(0) @binding(2) var<uniform> p: P;
@group(0) @binding(3) var<uniform> qd: Q;
${SIGMOID}
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) gi: vec3<u32>) {
  let i = gi.x; let t = gi.y; if (i >= p.n || t >= qd.T) { return; }
  let k = t * p.n + i; x[k] = x[k] * sigm(g[k]);
}`,
  addInPlaceB: `
struct P { n: u32 }
${QB}
@group(0) @binding(0) var<storage, read_write> x: array<f32>;
@group(0) @binding(1) var<storage, read> y: array<f32>;
@group(0) @binding(2) var<uniform> p: P;
@group(0) @binding(3) var<uniform> qd: Q;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) gi: vec3<u32>) {
  let i = gi.x; let t = gi.y; if (i >= p.n || t >= qd.T) { return; }
  let k = t * p.n + i; x[k] = x[k] + y[k];
}`,
  // Routed experts for all (token, pick) pairs: z = t·K + j, slots[z] its pool slot. Input is the
  // token's row (gate/up, inputMode 0) or the pair's own row (down, inputMode 1).
  expertQ8B: `enable f16;
struct P { M: u32, N: u32, rowsPerExpert: u32, inputMode: u32, K: u32 }
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
  let xb = select((z / p.K) * N, z * N, p.inputMode == 1u);
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
  // act = SiLU(g)·u, elementwise over T × n (the shared expert's separate gate and up).
  siluMul2B: `
struct P { n: u32 }
${QB}
@group(0) @binding(0) var<storage, read> g: array<f32>;
@group(0) @binding(1) var<storage, read> u: array<f32>;
@group(0) @binding(2) var<storage, read_write> act: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
@group(0) @binding(4) var<uniform> qd: Q;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) gi: vec3<u32>) {
  let i = gi.x; let t = gi.y; if (i >= p.n || t >= qd.T) { return; }
  let k = t * p.n + i; let gv = g[k];
  act[k] = (gv / (1.0 + exp(-gv))) * u[k];
}`,
  moeAccumSharedB: `
struct P { H: u32, k: u32 }
${QB}
@group(0) @binding(0) var<storage, read> out: array<f32>;
@group(0) @binding(1) var<storage, read> sel: array<u32>;
@group(0) @binding(2) var<storage, read> sh: array<f32>;
@group(0) @binding(3) var<storage, read> sg: array<f32>;
@group(0) @binding(4) var<storage, read_write> x: array<f32>;
@group(0) @binding(5) var<uniform> p: P;
@group(0) @binding(6) var<uniform> qd: Q;
${SIGMOID}
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) gi: vec3<u32>) {
  let h = gi.x; let t = gi.y; if (h >= p.H || t >= qd.T) { return; }
  let sb = t * 2u * p.k; var acc = 0.0;
  for (var j = 0u; j < p.k; j++) { acc += bitcast<f32>(sel[sb + p.k + j]) * out[(t * p.k + j) * p.H + h]; }
  let r = t * p.H + h;
  x[r] = (acc + sh[r] * sigm(sg[t])) + x[r];
}`,
};

// ── Subgroup Q8_0 GEMV (the LFM2.5 / Gemma 4 kernels' pattern) ──────────────────────────────
// One 32-lane subgroup per output row, 4 rows per 128-thread workgroup (the same dispatch
// geometry as matmulQ8/expertQ8). Each lane takes whole Q8_0 blocks: two vec4<u32> of int8
// codes, unpack4xI8, vec4 dot products against the activations, the block scale applied once;
// one subgroupAdd reduces the row. Used only when the adapter's subgroups are exactly 32 wide.
const SG_KERNELS = {
  matmulQ8: `enable f16;
enable subgroups;
struct P { M: u32, N: u32 }
@group(0) @binding(0) var<storage, read> x: array<vec4<f32>>;
@group(0) @binding(1) var<storage, read> qw: array<vec4<u32>>;
@group(0) @binding(2) var<storage, read> qs: array<f16>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@compute @workgroup_size(128) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let m = (wg.y * ng.x + wg.x) * 4u + l.x / 32u; let lane = l.x % 32u;
  let nb = p.N / 32u; let mr = min(m, p.M - 1u);
  let wb = mr * nb * 2u; let sb = mr * nb;
  var acc = 0.0;
  for (var b = lane; b < nb; b += 32u) {
    let w0 = qw[wb + b * 2u]; let w1 = qw[wb + b * 2u + 1u]; let xb = b * 8u;
    var s = dot(vec4<f32>(unpack4xI8(w0.x)), x[xb]) + dot(vec4<f32>(unpack4xI8(w0.y)), x[xb + 1u]);
    s += dot(vec4<f32>(unpack4xI8(w0.z)), x[xb + 2u]) + dot(vec4<f32>(unpack4xI8(w0.w)), x[xb + 3u]);
    s += dot(vec4<f32>(unpack4xI8(w1.x)), x[xb + 4u]) + dot(vec4<f32>(unpack4xI8(w1.y)), x[xb + 5u]);
    s += dot(vec4<f32>(unpack4xI8(w1.z)), x[xb + 6u]) + dot(vec4<f32>(unpack4xI8(w1.w)), x[xb + 7u]);
    acc += s * f32(qs[sb + b]);
  }
  let total = subgroupAdd(acc);
  if (lane == 0u && m < p.M) { y[m] = total; }
}`,
  expertQ8: `enable f16;
enable subgroups;
struct P { M: u32, N: u32, rowsPerExpert: u32, inputPerSlot: u32 }
@group(0) @binding(0) var<storage, read> x: array<vec4<f32>>;
@group(0) @binding(1) var<storage, read> qw: array<vec4<u32>>;
@group(0) @binding(2) var<storage, read> qs: array<f16>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@group(0) @binding(5) var<storage, read> slots: array<u32>;
@compute @workgroup_size(128) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let z = wg.z; let m = (wg.y * ng.x + wg.x) * 4u + l.x / 32u; let lane = l.x % 32u;
  let nb = p.N / 32u; let r = slots[z] * p.rowsPerExpert + min(m, p.M - 1u);
  let wb = r * nb * 2u; let sb = r * nb;
  let xo = select(0u, z * p.N / 4u, p.inputPerSlot == 1u);
  var acc = 0.0;
  for (var b = lane; b < nb; b += 32u) {
    let w0 = qw[wb + b * 2u]; let w1 = qw[wb + b * 2u + 1u]; let xb = xo + b * 8u;
    var s = dot(vec4<f32>(unpack4xI8(w0.x)), x[xb]) + dot(vec4<f32>(unpack4xI8(w0.y)), x[xb + 1u]);
    s += dot(vec4<f32>(unpack4xI8(w0.z)), x[xb + 2u]) + dot(vec4<f32>(unpack4xI8(w0.w)), x[xb + 3u]);
    s += dot(vec4<f32>(unpack4xI8(w1.x)), x[xb + 4u]) + dot(vec4<f32>(unpack4xI8(w1.y)), x[xb + 5u]);
    s += dot(vec4<f32>(unpack4xI8(w1.z)), x[xb + 6u]) + dot(vec4<f32>(unpack4xI8(w1.w)), x[xb + 7u]);
    acc += s * f32(qs[sb + b]);
  }
  let total = subgroupAdd(acc);
  if (lane == 0u && m < p.M) { y[z * p.M + m] = total; }
}`,
};

// Routing on the GPU (decode): after layer l's top-k, look each pick up in the pool's residency
// map. All resident → write the slots and carry on; any absent → record l+1 in `st`, after which
// every guarded kernel returns at once, so the rest of the token costs dispatches, not math.
const ROUTE_KERNEL = `
struct P { l: u32, E: u32, K: u32, pad: u32 }
@group(0) @binding(0) var<storage, read> sel: array<u32>;
@group(0) @binding(1) var<storage, read> rmap: array<u32>;
@group(0) @binding(2) var<storage, read_write> slots: array<u32>;
@group(0) @binding(3) var<storage, read_write> st: array<u32>;
@group(0) @binding(4) var<storage, read_write> used: array<u32>;
@group(0) @binding(5) var<uniform> p: P;
@compute @workgroup_size(1) fn main() {
  if (st[0] != 0u) { return; }
  var miss = false;
  for (var j = 0u; j < p.K; j++) {
    let e = sel[j]; let s = rmap[p.l * p.E + e];
    used[p.l * p.K + j] = e;
    if (s == 0xffffffffu) { miss = true; } else { slots[j] = s; }
  }
  if (miss) { st[0] = p.l + 1u; }
}`;
const ABSENT = 0xffffffff;

// Adds a read-only `stopF` binding after a kernel's last binding and an early return while it is
// set. A read-only storage value is uniform, so the return keeps barriers and subgroup ops legal.
function guarded(src) {
  let last = -1;
  for (const m of src.matchAll(/@binding\((\d+)\)/g)) last = Math.max(last, +m[1]);
  const at = src.indexOf('@compute');
  const out = `${src.slice(0, at)}@group(0) @binding(${last + 1}) var<storage, read> stopF: array<u32>;\n${src.slice(at)}`;
  const withReturn = out.replace(/(@compute[^{]*?\bfn main\([\s\S]*?\)\s*\{)/, '$1\n  if (stopF[0] != 0u) { return; }');
  if (withReturn === out) throw new Error('guarded(): no compute entry point');
  return withReturn;
}

export class Qwen35MoeSsd extends Qwen3MoeSsd {
  // Without a url, the pinned Hugging Face file; with one (a local serve, a layer cut), the OPFS
  // directory is named after the file, never after rung 2a's model.
  static async load(modelId = null, opts = {}) {
    const source = opts.source || (opts.url ? { repo: null, file: opts.url.split('/').pop(), revision: null } : QWEN36_35B_A3B);
    return super.load(modelId, { ...opts, source });
  }

  constructor(device, manifest, gguf, opts) {
    super(device, manifest, gguf, opts);
    const c = this.cfg;
    if (c.arch !== 'qwen35moe') throw new Error(`Qwen35MoeSsd needs a qwen35moe GGUF, got ${c.arch}`);
    if (c.ssm.dConv !== 4) throw new Error(`gdnConv assumes a 4-tap conv, got ${c.ssm.dConv}`);
    if (c.ssm.dState !== 128 || c.ssm.dInner !== c.ssm.vHeads * c.ssm.dState) throw new Error('gdnStep assumes 128-wide heads');
    this.recurrent = Array.from({ length: c.layers }, (_, l) => (l + 1) % c.attnInterval !== 0);
    // Prompts go through in chunks of up to chunkTokens tokens per layer (one routing readback per
    // layer per chunk); decode stays one token at a time.
    this.batchPrefill = opts.batchPrefill ?? true;
    this.chunkTokens = Math.max(2, Math.floor(opts.prefillChunk || 256));
    // gpuRouting: decode syncs with the CPU only at a layer whose experts are not all in the pool
    // (and every routeWindow layers), instead of after every layer's routing. Opt-in at load: it
    // compiles every one-token kernel with a stop guard. Off by default until it is timed on a
    // quiet machine; at 2026-10-04's miss rate (~18 of 40 layers per token need a load) the counts
    // put the gain near 5%. Output is token-identical either way.
    this.routeGuards = !!opts.gpuRouting;
    this.gpuRouting = this.routeGuards;
    // A submit runs at most this many layers' experts. After a stop every kernel left in it still
    // dispatches (about 7 ms for a whole token's worth), so a long submit mostly runs no-ops.
    // Full model, 48 tokens: window 2 → 29.1 syncs and 17.6 no-op layers per token; 3 → 26.2, 36.6.
    this.routeWindow = Math.max(1, Math.floor(opts.routeWindow ?? 2));
  }

  // Subgroup GEMVs replace the scalar ones when subgroups are exactly 32 wide (Apple, most others).
  get subgroupKernels() {
    const i = this.device.adapterInfo || this.opts.adapterInfo || {};
    return this.opts.subgroups !== false && this.device.features.has('subgroups') && i.subgroupMinSize === 32 && i.subgroupMaxSize === 32;
  }
  // With gpuRouting, every one-token kernel carries the stop guard (chunked prefill's do not).
  get kernels() {
    if (!this._kernels) {
      const k = { ...super.kernels, ...KERNELS, ...(this.subgroupKernels ? SG_KERNELS : {}) };
      if (this.routeGuards) for (const n of Object.keys(k)) k[n] = guarded(k[n]);
      this._kernels = { ...k, ...BATCH_KERNELS, route: ROUTE_KERNEL };
    }
    return this._kernels;
  }
  isGuarded(name) { return this.routeGuards && name !== 'route' && !(name in BATCH_KERNELS); }

  bind(name, buffers) { return super.bind(name, this.isGuarded(name) ? [...buffers, this.a.stop] : buffers); }
  // Like bind(), but a resource may be { buffer, offset, size }.
  bindR(name, resources) {
    const all = this.isGuarded(name) ? [...resources, this.a.stop] : resources;
    return this.device.createBindGroup({
      layout: this.pipeline(name).getBindGroupLayout(0),
      entries: all.map((r, i) => ({ binding: i, resource: r instanceof GPUBuffer ? { buffer: r } : r })),
    });
  }

  // For the GPU budget: f16 KV for the attention layers, conv + delta-rule state for the DeltaNet layers.
  kvBytes() {
    const c = this.cfg, s = c.ssm, convDim = 2 * s.kHeads * s.dState + s.dInner;
    return this.recurrent.reduce((sum, r) => sum + (r ? 3 * convDim * 4 + s.vHeads * s.dState * s.dState * 4 : 2 * 2 * this.maxCtx * c.kvHeads * c.headDim), 0);
  }

  initBuffers() {
    const c = this.cfg, s = c.ssm;
    const H = c.hidden, hd = c.headDim, QN = c.heads * hd, kvn = c.kvHeads * hd, F = c.expertFf, SF = c.shexpFf, K = c.topK;
    const keyDim = s.kHeads * s.dState, convDim = 2 * keyDim + s.dInner;
    if (2 * K * 4 > 256) throw new Error(`top-k ${K} > 32: selections would overlap their 256-byte readback regions`);
    if (c.experts > 256) throw new Error(`${c.experts} experts: the router top-k kernel handles at most 256`);
    if ((SF * 4) % 256) throw new Error('shared expert gate/up halves must be 256-byte aligned');

    // KV cache (f16) for the attention layers; conv + delta-rule state for the DeltaNet layers.
    this.kc = []; this.vc = []; this.conv = []; this.ssm = [];
    for (let l = 0; l < c.layers; l++) {
      if (this.recurrent[l]) {
        this.conv[l] = this.buffer(3 * convDim * 4, STORAGE | COPY_DST, 'state');
        this.ssm[l] = this.buffer(s.vHeads * s.dState * s.dState * 4, STORAGE | COPY_DST, 'state');
      } else {
        this.kc[l] = this.buffer(this.maxCtx * kvn * 2, STORAGE, 'kv');
        this.vc[l] = this.buffer(this.maxCtx * kvn * 2, STORAGE, 'kv');
      }
    }
    const A = (n) => this.buffer(n * 4, STORAGE | COPY_SRC | COPY_DST);
    this.a = {
      x: A(H), xn: A(H), qg: A(2 * QN), q: A(QN), gate: A(QN), k: A(kvn), kr: A(kvn), v: A(kvn), att: A(QN), o: A(H),
      sc: A(c.heads * this.maxCtx), mixed: A(convDim), cv: A(convDim), z: A(s.dInner), bb: A(s.vHeads), al: A(s.vHeads),
      go: A(s.dInner), gn: A(s.dInner), dummy: A(4),
      rl: A(c.experts), sel: A(2 * K), pxn: A(H), prl: A(c.experts), psel: A(64 * this.lookahead), slots: A(K),
      gu: A(K * 2 * F), act: A(K * F), dn: A(K * H), shgu: A(2 * SF), shact: A(SF), sh: A(H), sg: A(4),
      logits: A(c.vocab), am: A(4), rope: A(c.ropeDims),
      stop: A(4), used: A(c.layers * K), rmap: A(c.layers * c.experts),
    };
    this.tok = this.buffer(16, UNIFORM | COPY_DST);
    this.rbSel = this.buffer(256 * (1 + this.lookahead), MAP_READ | COPY_DST);
    this.rbLogits = this.buffer(c.vocab * 4, MAP_READ | COPY_DST);
    this.rbArg = this.buffer(16, MAP_READ | COPY_DST);
    // One readback per decode sync: [stop | layer's sel | guesses | every layer's picks | argmax].
    this.seg = { sel: 256, psel: 512, used: 512 + 256 * this.lookahead };
    this.seg.am = this.seg.used + Math.ceil(c.layers * K * 4 / 16) * 16;
    this.seg.bytes = this.seg.am + 16;
    this.rbSeg = this.buffer(this.seg.bytes, MAP_READ | COPY_DST);
    this.routeMap = new Uint32Array(c.layers * c.experts);

    const U = (w) => this.uniform(w), eps = { f: c.eps };
    const u = {
      nH: U([H]), rmsH: U([H, eps]),
      qg: U([2 * QN, H]), kv: U([kvn, H]), o: U([H, QN]),
      ropeQ: U([hd, 2 * hd, c.ropeDims, 1, eps]), ropeK: U([hd, hd, c.ropeDims, 0, eps]), kvn: U([kvn]),
      att: U([c.heads, c.kvHeads, hd, { f: 1 / Math.sqrt(hd) }]), attOut: U([c.heads, c.kvHeads, hd, 0]), gate: U([QN]),
      qkv: U([convDim, H]), z: U([s.dInner, H]), ab: U([s.vHeads, H]), gout: U([H, s.dInner]),
      conv: U([convDim]), step: U([s.kHeads, s.dState, keyDim, 0, eps, { f: 1 / Math.sqrt(s.dState) }]), ng: U([s.dState, eps]),
      router: U([c.experts, H]), topk: U([c.experts, K]),
      gu: U([2 * F, H, 2 * F, 0]), dn: U([H, F, H, 1]), silu: U([F, K]), acc: U([H, K]),
      shgu: U([SF, H]), shsilu: U([SF, 1]), shd: U([H, SF]), shgate: U([1, H]),
      lm: U([c.vocab, H]), am: U([c.vocab]),
    };
    const a = this.a, W = this.w;
    const q8 = (name, x, y, uni) => { const t = W[name]; if (!t || !t.q) throw new Error(`missing Q8_0 tensor ${name}`); return this.bind('matmulQ8', [x, t.q, t.s, y, uni]); };
    const raw = (name) => { const t = W[name]; if (!t || !t.raw) throw new Error(`missing F32 tensor ${name}`); return t.raw; };
    this.g = { embed: this.bind('embedQ8', [W['token_embd.weight'].q, W['token_embd.weight'].s, a.x, this.tok, u.nH]) };
    this.layers = [];
    for (let l = 0; l < c.layers; l++) {
      const n = (t) => `blk.${l}.${t}`;
      const g = { recur: this.recurrent[l], rmsA: this.bind('rmsnorm', [a.x, raw(n('attn_norm.weight')), a.xn, u.rmsH]) };
      if (g.recur) {
        Object.assign(g, {
          qkv: q8(n('attn_qkv.weight'), a.xn, a.mixed, u.qkv),
          z: q8(n('attn_gate.weight'), a.xn, a.z, u.z),
          beta: q8(n('ssm_beta.weight'), a.xn, a.bb, u.ab),
          alpha: q8(n('ssm_alpha.weight'), a.xn, a.al, u.ab),
          conv: this.bind('gdnConv', [a.mixed, raw(n('ssm_conv1d.weight')), this.conv[l], a.cv, u.conv]),
          step: this.bind('gdnStep', [a.cv, a.bb, a.al, raw(n('ssm_dt.bias')), raw(n('ssm_a')), this.ssm[l], a.go, u.step]),
          norm: this.bind('gdnNormGate', [a.go, raw(n('ssm_norm.weight')), a.z, a.gn, u.ng]),
          out: q8(n('ssm_out.weight'), a.gn, a.o, u.gout),
        });
      } else {
        Object.assign(g, {
          q: q8(n('attn_q.weight'), a.xn, a.qg, u.qg),
          k: q8(n('attn_k.weight'), a.xn, a.k, u.kv),
          v: q8(n('attn_v.weight'), a.xn, a.v, u.kv),
          ropeQ: this.bind('qkNormRopeP', [a.qg, raw(n('attn_q_norm.weight')), a.rope, a.q, a.gate, u.ropeQ]),
          ropeK: this.bind('qkNormRopeP', [a.k, raw(n('attn_k_norm.weight')), a.rope, a.kr, a.dummy, u.ropeK]),
          kv: this.bind('kvStore', [a.kr, a.v, this.kc[l], this.vc[l], this.tok, u.kvn]),
          score: this.bind('attnScore', [a.q, this.kc[l], a.sc, this.tok, u.att]),
          soft: this.bind('softmax', [a.sc, this.tok]),
          attOut: this.bind('attnOut', [a.sc, this.vc[l], a.att, this.tok, u.attOut]),
          gate: this.bind('sigmoidMul', [a.att, a.gate, u.gate]),
          o: q8(n('attn_output.weight'), a.att, a.o, u.o),
        });
      }
      Object.assign(g, {
        addO: this.bind('addInPlace', [a.x, a.o, u.nH]),
        rmsF: this.bind('rmsnorm', [a.x, raw(n('post_attention_norm.weight')), a.xn, u.rmsH]),
        router: this.bind('matmulF32', [a.xn, raw(n('ffn_gate_inp.weight')), a.rl, u.router]),
        topk: this.bind('topk', [a.rl, a.sel, u.topk]),
        pf: Array.from({ length: Math.min(this.lookahead, c.layers - 1 - l) }, (_, i) => {
          const at = (t) => `blk.${l + 1 + i}.${t}`;
          return {
            rms: this.bind('rmsnorm', [a.x, raw(at('post_attention_norm.weight')), a.pxn, u.rmsH]),
            router: this.bind('matmulF32', [a.pxn, raw(at('ffn_gate_inp.weight')), a.prl, u.router]),
            topk: this.bindR('topk', [a.prl, { buffer: a.psel, offset: 256 * i, size: 8 * K }, u.topk]),
          };
        }),
        // Shared expert: [gate | up] into shgu, SiLU·up, down; its scalar gate logit into sg.
        shg: this.bindR('matmulQ8', [a.xn, W[n('ffn_gate_shexp.weight')].q, W[n('ffn_gate_shexp.weight')].s, { buffer: a.shgu, offset: 0, size: SF * 4 }, u.shgu]),
        shu: this.bindR('matmulQ8', [a.xn, W[n('ffn_up_shexp.weight')].q, W[n('ffn_up_shexp.weight')].s, { buffer: a.shgu, offset: SF * 4, size: SF * 4 }, u.shgu]),
        shsilu: this.bind('siluMulMoe', [a.shgu, a.shact, u.shsilu]),
        shd: q8(n('ffn_down_shexp.weight'), a.shact, a.sh, u.shd),
        shgate: this.bind('matmulF32', [a.xn, raw(n('ffn_gate_inp_shexp.weight')), a.sg, u.shgate]),
        gu: this.bind('expertQ8', [a.xn, this.pool.guQ, this.pool.guS, a.gu, u.gu, a.slots]),
        silu: this.bind('siluMulMoe', [a.gu, a.act, u.silu]),
        dn: this.bind('expertQ8', [a.act, this.pool.dQ, this.pool.dS, a.dn, u.dn, a.slots]),
        acc: this.bind('moeAccumShared', [a.dn, a.sel, a.sh, a.sg, a.x, u.acc]),
        route: this.bind('route', [a.sel, a.rmap, a.slots, a.stop, a.used, U([l, c.experts, K, 0])]),
      });
      this.layers.push(g);
    }
    this.g.rmsOut = this.bind('rmsnorm', [a.x, raw('output_norm.weight'), a.xn, u.rmsH]);
    this.g.lm = this.bind('matmulQ8', [a.xn, W['output.weight'].q, W['output.weight'].s, a.logits, u.lm]);
    this.g.am = this.bind('argmax', [a.logits, a.am, u.am]);
    // A chunk pins min(experts, T·K) experts per layer at once; keep that under half the pool.
    if (Math.min(c.experts, this.chunkTokens * K) > this.poolSlots / 2) this.chunkTokens = Math.max(2, Math.floor(this.poolSlots / 2 / K));
    if (this.batchPrefill) this.initBatch();
  }

  // Buffers and bind groups for chunked prefill (rows = tokens of the chunk, token-major).
  initBatch() {
    const c = this.cfg, s = c.ssm, B = this.chunkTokens, a = this.a, W = this.w;
    const H = c.hidden, hd = c.headDim, QN = c.heads * hd, kvn = c.kvHeads * hd, F = c.expertFf, SF = c.shexpFf, K = c.topK;
    const keyDim = s.kHeads * s.dState, convDim = 2 * keyDim + s.dInner;
    const A = (n) => this.buffer(n * 4, STORAGE | COPY_SRC | COPY_DST, 'batch');
    const b = this.b = {
      ids: A(B), x: A(B * H), xn: A(B * H), qg: A(B * 2 * QN), q: A(B * QN), gate: A(B * QN), k: A(B * kvn), kr: A(B * kvn), v: A(B * kvn),
      att: A(B * QN), o: A(B * H), sc: A(c.heads * B * this.maxCtx), mixed: A(B * convDim), cv: A(B * convDim), z: A(B * s.dInner),
      bb: A(B * s.vHeads), al: A(B * s.vHeads), go: A(B * s.dInner), gn: A(B * s.dInner),
      rl: A(B * c.experts), sel: A(B * 2 * K), slots: A(B * K), gu: A(B * K * 2 * F), act: A(B * K * F), dn: A(B * K * H),
      shg: A(B * SF), shu: A(B * SF), shact: A(B * SF), sh: A(B * H), sg: A(B), rope: A(B * c.ropeDims), dummy: A(4),
    };
    this.qb = this.buffer(16, UNIFORM | COPY_DST, 'batch');
    this.rbSelB = this.buffer(B * 2 * K * 4, MAP_READ | COPY_DST, 'batch');
    const U = (w) => this.uniform(w), eps = { f: c.eps }, qb = this.qb;
    const u = {
      nH: U([H]), rmsH: U([H, eps]), qg: U([2 * QN, H]), kv: U([kvn, H]), o: U([H, QN]),
      ropeQ: U([hd, 2 * hd, 2 * QN, QN, c.ropeDims, 1, eps]), ropeK: U([hd, hd, kvn, kvn, c.ropeDims, 0, eps]), kvn: U([kvn]),
      att: U([c.heads, c.kvHeads, hd, { f: 1 / Math.sqrt(hd) }]), attOut: U([c.heads, c.kvHeads, hd, 0]), gate: U([QN]),
      qkv: U([convDim, H]), z: U([s.dInner, H]), ab: U([s.vHeads, H]), gout: U([H, s.dInner]), conv: U([convDim]),
      step: U([s.kHeads, s.dState, keyDim, convDim, s.vHeads, 0, eps, { f: 1 / Math.sqrt(s.dState) }]), ng: U([s.dState, s.dInner, eps]),
      router: U([c.experts, H]), topk: U([c.experts, K]),
      gu: U([2 * F, H, 2 * F, 0, K]), dn: U([H, F, H, 1, K]), silu: U([F, B * K]), acc: U([H, K]),
      shgu: U([SF, H]), shd: U([H, SF]), sh2: U([SF]), shgate: U([1, H]),
    };
    const raw = (name) => W[name].raw;
    const q8 = (name, x, y, uni) => this.bind('matmulQ8T', [x, W[name].q, W[name].s, y, uni, qb]);
    this.gB = { embed: this.bind('embedQ8B', [W['token_embd.weight'].q, W['token_embd.weight'].s, b.ids, b.x, u.nH, qb]) };
    for (let l = 0; l < c.layers; l++) {
      const n = (t) => `blk.${l}.${t}`, g = { rmsA: this.bind('rmsnormB', [b.x, raw(n('attn_norm.weight')), b.xn, u.rmsH]) };
      if (this.recurrent[l]) {
        Object.assign(g, {
          qkv: q8(n('attn_qkv.weight'), b.xn, b.mixed, u.qkv), z: q8(n('attn_gate.weight'), b.xn, b.z, u.z),
          beta: q8(n('ssm_beta.weight'), b.xn, b.bb, u.ab), alpha: q8(n('ssm_alpha.weight'), b.xn, b.al, u.ab),
          conv: this.bind('gdnConvB', [b.mixed, raw(n('ssm_conv1d.weight')), this.conv[l], b.cv, u.conv, qb]),
          step: this.bind('gdnStepB', [b.cv, b.bb, b.al, raw(n('ssm_dt.bias')), raw(n('ssm_a')), this.ssm[l], b.go, u.step, qb]),
          norm: this.bind('gdnNormGateB', [b.go, raw(n('ssm_norm.weight')), b.z, b.gn, u.ng]),
          out: q8(n('ssm_out.weight'), b.gn, b.o, u.gout),
        });
      } else {
        Object.assign(g, {
          q: q8(n('attn_q.weight'), b.xn, b.qg, u.qg), k: q8(n('attn_k.weight'), b.xn, b.k, u.kv), v: q8(n('attn_v.weight'), b.xn, b.v, u.kv),
          ropeQ: this.bind('qkNormRopePB', [b.qg, raw(n('attn_q_norm.weight')), b.rope, b.q, b.gate, u.ropeQ]),
          ropeK: this.bind('qkNormRopePB', [b.k, raw(n('attn_k_norm.weight')), b.rope, b.kr, b.dummy, u.ropeK]),
          kv: this.bind('kvStoreB', [b.kr, b.v, this.kc[l], this.vc[l], u.kvn, qb]),
          score: this.bind('attnScoreB', [b.q, this.kc[l], b.sc, u.att, qb]),
          soft: this.bind('softmaxB', [b.sc, qb]),
          attOut: this.bind('attnOutB', [b.sc, this.vc[l], b.att, u.attOut, qb]),
          gate: this.bind('sigmoidMulB', [b.att, b.gate, u.gate, qb]),
          o: q8(n('attn_output.weight'), b.att, b.o, u.o),
        });
      }
      Object.assign(g, {
        addO: this.bind('addInPlaceB', [b.x, b.o, u.nH, qb]),
        rmsF: this.bind('rmsnormB', [b.x, raw(n('post_attention_norm.weight')), b.xn, u.rmsH]),
        router: this.bind('matmulF32T', [b.xn, raw(n('ffn_gate_inp.weight')), b.rl, u.router]),
        topk: this.bind('topkB', [b.rl, b.sel, u.topk]),
        shg: q8(n('ffn_gate_shexp.weight'), b.xn, b.shg, u.shgu), shu: q8(n('ffn_up_shexp.weight'), b.xn, b.shu, u.shgu),
        shact: this.bind('siluMul2B', [b.shg, b.shu, b.shact, u.sh2, qb]),
        shd: q8(n('ffn_down_shexp.weight'), b.shact, b.sh, u.shd),
        shgate: this.bind('matmulF32T', [b.xn, raw(n('ffn_gate_inp_shexp.weight')), b.sg, u.shgate]),
        gu: this.bind('expertQ8B', [b.xn, this.pool.guQ, this.pool.guS, b.gu, u.gu, b.slots]),
        silu: this.bind('siluMulMoe', [b.gu, b.act, u.silu]),
        dn: this.bind('expertQ8B', [b.act, this.pool.dQ, this.pool.dS, b.dn, u.dn, b.slots]),
        acc: this.bind('moeAccumSharedB', [b.dn, b.sel, b.sh, b.sg, b.x, u.acc, qb]),
      });
      this.layers[l].B = g;
    }
  }

  // Layer l over the chunk's T tokens up to its routing (the batched twin of encodeAttention).
  encodeTrunkB(pass, l, T, S) {
    const c = this.cfg, s = c.ssm, g = this.layers[l].B, d = (nm, gr, x, y, z) => this.dispatch(pass, nm, gr, x, y, z);
    const H = c.hidden, QN = c.heads * c.headDim, kvn = c.kvHeads * c.headDim, convDim = 2 * s.kHeads * s.dState + s.dInner;
    const tt = Math.ceil(T / 16), mm = (n) => Math.ceil(n / 16);
    d('rmsnormB', g.rmsA, T);
    if (this.recurrent[l]) {
      d('matmulQ8T', g.qkv, mm(convDim), tt); d('matmulQ8T', g.z, mm(s.dInner), tt);
      d('matmulQ8T', g.beta, mm(s.vHeads), tt); d('matmulQ8T', g.alpha, mm(s.vHeads), tt);
      d('gdnConvB', g.conv, Math.ceil(convDim / 256));
      d('gdnStepB', g.step, s.vHeads);
      d('gdnNormGateB', g.norm, s.vHeads, T);
      d('matmulQ8T', g.out, mm(H), tt);
    } else {
      d('matmulQ8T', g.q, mm(2 * QN), tt); d('matmulQ8T', g.k, mm(kvn), tt); d('matmulQ8T', g.v, mm(kvn), tt);
      d('qkNormRopePB', g.ropeQ, c.heads, T); d('qkNormRopePB', g.ropeK, c.kvHeads, T);
      d('kvStoreB', g.kv, Math.ceil(kvn / 256), T);
      d('attnScoreB', g.score, Math.ceil(c.heads * T * S / 256));
      d('softmaxB', g.soft, c.heads * T);
      d('attnOutB', g.attOut, Math.ceil(QN / 256), T);
      d('sigmoidMulB', g.gate, Math.ceil(QN / 256), T);
      d('matmulQ8T', g.o, mm(H), tt);
    }
    d('addInPlaceB', g.addO, Math.ceil(H / 256), T);
    d('rmsnormB', g.rmsF, T);
    d('matmulF32T', g.router, c.experts, T);
    d('topkB', g.topk, T);
    d('matmulQ8T', g.shg, mm(c.shexpFf), tt); d('matmulQ8T', g.shu, mm(c.shexpFf), tt);
    d('siluMul2B', g.shact, Math.ceil(c.shexpFf / 256), T);
    d('matmulQ8T', g.shd, mm(H), tt);
    d('matmulF32T', g.shgate, 1, T);
  }

  encodeExpertsB(pass, l, T) {
    const c = this.cfg, g = this.layers[l].B, d = (nm, gr, x, y, z) => this.dispatch(pass, nm, gr, x, y, z);
    d('expertQ8B', g.gu, Math.ceil(2 * c.expertFf / 4), 1, T * c.topK);
    d('siluMulMoe', g.silu, Math.ceil(T * c.topK * c.expertFf / 256));
    d('expertQ8B', g.dn, Math.ceil(c.hidden / 4), 1, T * c.topK);
    d('moeAccumSharedB', g.acc, Math.ceil(c.hidden / 256), T);
  }

  // Feeds T = ids.length tokens at this.position through every layer: one routing readback per
  // layer, the union of the chunk's experts loaded once. want: 'none' | 'argmax' | 'logits' for
  // the last token, as in step().
  async prefillChunk(ids, want = 'none') {
    const c = this.cfg, dev = this.device, K = c.topK, H = c.hidden, T = ids.length, pos0 = this.position, S = pos0 + T;
    if (T > this.chunkTokens) throw new Error(`chunk of ${T} > ${this.chunkTokens}`);
    if (S > this.maxCtx) throw new Error(`context full (${this.maxCtx} tokens)`);
    const tStart = performance.now();
    dev.queue.writeBuffer(this.a.stop, 0, new Uint32Array(4));   // the head below uses guarded kernels
    dev.queue.writeBuffer(this.b.ids, 0, Uint32Array.from(ids));
    dev.queue.writeBuffer(this.qb, 0, new Uint32Array([T, pos0, S, 0]));
    const nRot = c.ropeDims, half = nRot / 2, r = new Float32Array(T * nRot), stepR = Math.fround(Math.pow(c.ropeTheta, -2 / nRot));
    for (let t = 0; t < T; t++) {
      let th = Math.fround(pos0 + t);
      for (let i = 0; i < half; i++) { r[t * nRot + i] = Math.cos(th); r[t * nRot + half + i] = Math.sin(th); th = Math.fround(th * stepR); }
    }
    dev.queue.writeBuffer(this.b.rope, 0, r);
    const selBytes = T * 2 * K * 4;
    let enc = dev.createCommandEncoder(), pass = enc.beginComputePass();
    this.dispatch(pass, 'embedQ8B', this.gB.embed, Math.ceil(H / 256), T);
    this.encodeTrunkB(pass, 0, T, S);
    pass.end();
    enc.copyBufferToBuffer(this.b.sel, 0, this.rbSelB, 0, selBytes);
    dev.queue.submit([enc.finish()]);
    for (let l = 0; l < c.layers; l++) {
      const t0 = performance.now();
      await this.rbSelB.mapAsync(1, 0, selBytes);
      this.counters.gpuWaitMs += performance.now() - t0;
      const sel = new Uint32Array(this.rbSelB.getMappedRange(0, selBytes).slice(0));
      this.rbSelB.unmap();
      const pairs = new Uint32Array(T * K);
      for (let t = 0; t < T; t++) for (let j = 0; j < K; j++) pairs[t * K + j] = sel[t * 2 * K + j];
      const unique = [...new Set(pairs)];
      const tq = performance.now();
      const slotsU = await this.xs.ensure(l, unique);
      this.counters.ensureMs += performance.now() - tq;
      const slotOf = new Map(unique.map((e, i) => [e, slotsU[i]]));
      const pairSlots = pairs.map((e) => slotOf.get(e));
      dev.queue.writeBuffer(this.b.slots, 0, pairSlots);
      enc = dev.createCommandEncoder(); pass = enc.beginComputePass();
      this.encodeExpertsB(pass, l, T);
      if (l + 1 < c.layers) {
        this.encodeTrunkB(pass, l + 1, T, S);
        pass.end();
        enc.copyBufferToBuffer(this.b.sel, 0, this.rbSelB, 0, selBytes);
      } else {
        pass.end();
        enc.copyBufferToBuffer(this.b.x, (T - 1) * H * 4, this.a.x, 0, H * 4);
        if (want !== 'none') {
          pass = enc.beginComputePass();
          this.dispatch(pass, 'rmsnorm', this.g.rmsOut, 1);
          this.dispatch(pass, 'matmulQ8', this.g.lm, Math.ceil(c.vocab / 4));
          if (want === 'argmax') this.dispatch(pass, 'argmax', this.g.am, 1);
          pass.end();
          if (want === 'argmax') enc.copyBufferToBuffer(this.a.am, 0, this.rbArg, 0, 4);
          if (want === 'logits') enc.copyBufferToBuffer(this.a.logits, 0, this.rbLogits, 0, c.vocab * 4);
        }
      }
      dev.queue.submit([enc.finish()]);
      this.xs.release(slotsU);
    }
    this.position += T;
    this.cached.push(...ids);
    let result = null;
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
    this.counters.tokens += T;
    this.counters.wallMs += performance.now() - tStart;
    return result;
  }

  // Layer l up to its routing: the trunk (DeltaNet or gated attention), residual, post-norm,
  // router + top-k (and the prefetch guesses), and the shared expert, which needs no routing.
  encodeAttention(pass, l, seqLen) {
    const c = this.cfg, s = c.ssm, g = this.layers[l], d = (nm, gr, x, y, z) => this.dispatch(pass, nm, gr, x, y, z);
    const H = c.hidden, QN = c.heads * c.headDim, kvn = c.kvHeads * c.headDim, convDim = 2 * s.kHeads * s.dState + s.dInner;
    d('rmsnorm', g.rmsA, 1);
    if (g.recur) {
      d('matmulQ8', g.qkv, Math.ceil(convDim / 4)); d('matmulQ8', g.z, Math.ceil(s.dInner / 4));
      d('matmulQ8', g.beta, Math.ceil(s.vHeads / 4)); d('matmulQ8', g.alpha, Math.ceil(s.vHeads / 4));
      d('gdnConv', g.conv, Math.ceil(convDim / 256));
      d('gdnStep', g.step, s.vHeads);
      d('gdnNormGate', g.norm, s.vHeads);
      d('matmulQ8', g.out, Math.ceil(H / 4));
    } else {
      d('matmulQ8', g.q, Math.ceil(2 * QN / 4)); d('matmulQ8', g.k, Math.ceil(kvn / 4)); d('matmulQ8', g.v, Math.ceil(kvn / 4));
      d('qkNormRopeP', g.ropeQ, c.heads); d('qkNormRopeP', g.ropeK, c.kvHeads);
      d('kvStore', g.kv, Math.ceil(kvn / 256));
      d('attnScore', g.score, Math.ceil(c.heads * seqLen / 256));
      d('softmax', g.soft, c.heads);
      d('attnOut', g.attOut, Math.ceil(QN / 256));
      d('sigmoidMul', g.gate, Math.ceil(QN / 256));
      d('matmulQ8', g.o, Math.ceil(H / 4));
    }
    d('addInPlace', g.addO, Math.ceil(H / 256));
    if (this.prefetch) for (const p of g.pf) { d('rmsnorm', p.rms, 1); d('matmulF32', p.router, c.experts); d('topk', p.topk, 1); }
    d('rmsnorm', g.rmsF, 1);
    d('matmulF32', g.router, c.experts);
    d('topk', g.topk, 1);
    d('matmulQ8', g.shg, Math.ceil(c.shexpFf / 4)); d('matmulQ8', g.shu, Math.ceil(c.shexpFf / 4));
    d('siluMulMoe', g.shsilu, Math.ceil(c.shexpFf / 256));
    d('matmulQ8', g.shd, Math.ceil(H / 4));
    d('matmulF32', g.shgate, 1);
  }

  encodeExperts(pass, l) {
    const c = this.cfg, g = this.layers[l], d = (nm, gr, x, y, z) => this.dispatch(pass, nm, gr, x, y, z);
    d('expertQ8', g.gu, Math.ceil(2 * c.expertFf / 4), 1, c.topK);
    d('siluMulMoe', g.silu, Math.ceil(c.topK * c.expertFf / 256));
    d('expertQ8', g.dn, Math.ceil(c.hidden / 4), 1, c.topK);
    d('moeAccumShared', g.acc, Math.ceil(c.hidden / 256));
  }

  // The pool's residency as the route kernel reads it: slot of (layer, expert), or ABSENT. Built
  // from the streamer's slot keys, which are set only once an expert's upload has been submitted.
  // Queue order keeps it safe: an upload into a slot runs after every submit made before it.
  writeRouteMap() {
    const map = this.routeMap, key = this.xs.slotKey;
    map.fill(ABSENT);
    for (let s = 0; s < key.length; s++) if (key[s] >= 0) map[key[s]] = s;
    this.device.queue.writeBuffer(this.a.rmap, 0, map);
  }

  // One token with routing on the GPU. Each submit runs up to routeWindow layers and routes the
  // layer after them; the route kernel stops it early at the first layer with an expert outside
  // the pool. Either way the CPU then ensures the next layer's experts (loading any absent ones and
  // prefetching the guesses for the layers after it) and resumes at that layer's experts:
  // everything it computed before routing (x, xn, sel, shared expert) is still in place, since
  // every kernel after a stop returns without writing.
  async step(token, want = 'argmax') {
    if (!this.gpuRouting) return super.step(token, want);
    const c = this.cfg, dev = this.device, K = c.topK, L = c.layers, seg = this.seg;
    if (this.position >= this.maxCtx) throw new Error(`context full (${this.maxCtx} tokens)`);
    const tStart = performance.now();
    const pos = this.position, seqLen = pos + 1;
    this.writeTokenUniforms(token, pos);
    // resume: -1 starts at the embedding; l ≥ 0 resumes at layer l's experts (its trunk already ran,
    // and a DeltaNet trunk must not run twice: it advances the recurrent state).
    let resume = -1, slots = null, result = null;
    for (;;) {
      const te = performance.now();
      this.writeRouteMap();
      dev.queue.writeBuffer(this.a.stop, 0, new Uint32Array(4));
      if (slots) dev.queue.writeBuffer(this.a.slots, 0, slots);
      const enc = dev.createCommandEncoder(), pass = enc.beginComputePass();
      if (resume < 0) {
        this.dispatch(pass, 'embedQ8', this.g.embed, Math.ceil(c.hidden / 256));
        this.encodeAttention(pass, 0, seqLen);
        this.dispatch(pass, 'route', this.layers[0].route, 1);
      }
      const first = Math.max(0, resume), last = Math.min(L - 1, first + this.routeWindow - 1);
      for (let l = first; l <= last; l++) {
        this.encodeExperts(pass, l);
        if (l + 1 < L) { this.encodeAttention(pass, l + 1, seqLen); this.dispatch(pass, 'route', this.layers[l + 1].route, 1); }
      }
      if (last === L - 1 && want !== 'none') {
        this.dispatch(pass, 'rmsnorm', this.g.rmsOut, 1);
        this.dispatch(pass, 'matmulQ8', this.g.lm, Math.ceil(c.vocab / 4));
        if (want === 'argmax') this.dispatch(pass, 'argmax', this.g.am, 1);
      }
      pass.end();
      enc.copyBufferToBuffer(this.a.stop, 0, this.rbSeg, 0, 16);
      enc.copyBufferToBuffer(this.a.sel, 0, this.rbSeg, seg.sel, 8 * K);
      if (this.prefetch) enc.copyBufferToBuffer(this.a.psel, 0, this.rbSeg, seg.psel, 256 * this.lookahead);
      enc.copyBufferToBuffer(this.a.used, 0, this.rbSeg, seg.used, L * K * 4);
      if (last === L - 1 && want === 'argmax') enc.copyBufferToBuffer(this.a.am, 0, this.rbSeg, seg.am, 4);
      if (last === L - 1 && want === 'logits') enc.copyBufferToBuffer(this.a.logits, 0, this.rbLogits, 0, c.vocab * 4);
      dev.queue.submit([enc.finish()]);
      if (slots) { this.xs.release(slots); slots = null; }
      this.counters.encodeMs += performance.now() - te;
      this.counters.syncs++;
      this.counters.layersEncoded += last - first + 1;

      const tw = performance.now();
      await this.rbSeg.mapAsync(1, 0, seg.bytes);
      this.counters.gpuWaitMs += performance.now() - tw;
      const u = new Uint32Array(this.rbSeg.getMappedRange(0, seg.bytes).slice(0));
      this.rbSeg.unmap();
      const stopL = u[0] ? u[0] - 1 : last + 1;
      // Layers this submit routed and ran on the GPU: refresh them in the LRU. (A resumed layer went
      // through ensure() already.)
      for (let l = resume + 1; l < stopL; l++) this.xs.touchUsed(l, u.subarray(seg.used / 4 + l * K, seg.used / 4 + (l + 1) * K));
      if (stopL === L) {
        if (want === 'argmax') result = u[seg.am / 4];
        break;
      }
      const ids = u.slice(seg.sel / 4, seg.sel / 4 + K);
      const tq = performance.now();
      const ensuring = this.xs.ensure(stopL, ids);
      if (this.prefetch) {
        const n = this.layers[stopL].pf.length;
        for (let i = 0; i < n; i++) this.xs.prefetch(stopL + 1 + i, u.subarray(seg.psel / 4 + 64 * i, seg.psel / 4 + 64 * i + K));
      }
      slots = await ensuring;
      this.counters.ensureMs += performance.now() - tq;
      resume = stopL;
    }
    if (want === 'logits') {
      const tw = performance.now();
      await this.rbLogits.mapAsync(1);
      this.counters.gpuWaitMs += performance.now() - tw;
      result = new Float32Array(this.rbLogits.getMappedRange().slice(0));
      this.rbLogits.unmap();
    }
    this.position++;
    this.cached.push(token);
    this.counters.tokens++;
    this.counters.wallMs += performance.now() - tStart;
    return result;
  }

  resetCounters() { super.resetCounters(); this.counters.syncs = 0; this.counters.layersEncoded = 0; }
  // layersEncodedPerToken − layers = expert blocks dispatched after a stop (no-ops).
  stats() {
    const n = Math.max(1, this.counters.tokens);
    return { ...super.stats(), gpuRouting: this.gpuRouting, routeWindow: this.routeWindow, syncsPerToken: this.counters.syncs / n, layersEncodedPerToken: this.counters.layersEncoded / n };
  }

  // RoPE angles as ggml's CPU rope cache forms them for text positions (all M-RoPE sections at
  // the token position): θ = pos, multiplied by base^(-2/nRot) once per pair, in f32.
  writeTokenUniforms(token, pos) {
    const c = this.cfg, nRot = c.ropeDims, half = nRot / 2;
    this.device.queue.writeBuffer(this.tok, 0, new Uint32Array([token, pos, pos + 1, 0]));
    const r = new Float32Array(nRot), step = Math.fround(Math.pow(c.ropeTheta, -2 / nRot));
    let th = Math.fround(pos);
    for (let i = 0; i < half; i++) { r[i] = Math.cos(th); r[half + i] = Math.sin(th); th = Math.fround(th * step); }
    this.device.queue.writeBuffer(this.a.rope, 0, r);
  }

  // Qwen3.5/3.6's template opens the reasoning block in the generation prompt when thinking is on.
  chatPrompt(messages, { enableThinking = true } = {}) {
    let p = '';
    for (const m of messages) p += `<|im_start|>${m.role}\n${m.content}<|im_end|>\n`;
    return p + '<|im_start|>assistant\n' + (enableThinking ? '<think>\n' : '<think>\n\n</think>\n\n');
  }

  // The recurrent state cannot rewind to an earlier position, so any change before the cached
  // end restarts from token 0.
  reset() {
    super.reset();
    if (!this.conv) return;
    const enc = this.device.createCommandEncoder();
    for (let l = 0; l < this.cfg.layers; l++) if (this.recurrent[l]) { enc.clearBuffer(this.conv[l]); enc.clearBuffer(this.ssm[l]); }
    this.device.queue.submit([enc.finish()]);
  }

  async prefill(ids, want = 'argmax') {
    let common = 0;
    while (common < ids.length - 1 && common < this.cached.length && this.cached[common] === ids[common]) common++;
    if (common < this.cached.length) this.reset();
    const rest = ids.slice(this.cached.length);
    if (!this.batchPrefill || rest.length < 2) return super.prefill(ids, want);
    let r = null;
    for (let i = 0; i < rest.length; i += this.chunkTokens) {
      r = await this.prefillChunk(rest.slice(i, i + this.chunkTokens), i + this.chunkTokens >= rest.length ? want : 'none');
    }
    return r;
  }
}

// For kernel tests (scripts): the WGSL this module adds.
export { KERNELS as QWEN35_KERNELS, BATCH_KERNELS as QWEN35_BATCH_KERNELS, SG_KERNELS as QWEN35_SG_KERNELS };
