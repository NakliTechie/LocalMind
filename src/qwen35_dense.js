/* qwen35_dense.js — dense Qwen3.5-family models (GGUF arch `qwen35`, e.g. Qwen3.8-27B) from an imatrix
 * IQ-mix GGUF, in a browser tab. First user: Underdog Saluki 27B 1.0 (ConwayResearch, Apache-2.0), one 7.9 GB
 * GGUF mixing eleven llama.cpp block types.
 *
 * The trunk is the one qwen35_moe_ssd.js runs (llama.cpp's qwen35 graph): 3 of every 4 layers are Gated DeltaNet,
 * every 4th is gated full attention with q/k RMSNorm and partial NeoX RoPE; this module reuses those kernels and
 * replaces the routed experts with the dense SwiGLU MLP. Every weight stays in (nearly) its GGUF block layout on the
 * GPU and is dequantized inside the matvec (iq_quants.js), so the products are llama.cpp's up to summation order.
 *
 * Storage: the GGUF is copied once into OPFS (localmind-ssd/<file>/dense.bin, every tensor byte for byte) by the
 * shared ingest, which resumes an interrupted download and accepts the same file picked from disk; every later
 * load reads it from there into GPU buffers (~7.9 GB of GPU memory for Saluki, plus the KV cache).
 *
 *   const m = await Qwen35Dense.load(null, { maxCtx: 16384, onProgress });
 *   for await (const { text } of m.generate(messages, { maxNewTokens, enableThinking })) …
 */

import { Qwen3MoeSsd, STORAGE, COPY_SRC, COPY_DST, MAP_READ, UNIFORM } from './qwen3_moe_ssd.js';
import { QWEN35_KERNELS, QWEN35_BATCH_KERNELS } from './qwen35_moe_ssd.js';
import { QTYPE_BY_ID, rowBytes, gpuRowBytes, PADDED, MV_ROWS, MM_TILE, MM_SG_TOKENS, gridData, repackKernel, mvKernel, mmKernel, mmSgKernel, embedKernel, embedBKernel } from './iq_quants.js';

export const UNDERDOG_SALUKI_27B = {
  repo: 'ConwayResearch/Underdog-Saluki-27B-1.0',
  file: 'Underdog-Saluki-27B-1.0-IQ2-mix.gguf',
  revision: '1336c0b5d74dfe6ad7f793577092f5effd9f97c6',
  sha256: '4a673518b11b1c4445f9b9a9d3c40356f5ba39f6a6260dcb25f3fbfd475d9efb',
  size: 7898369152,
};
const F32 = 0;

export function configFromGguf(kv) {
  const a = kv['general.architecture'];
  if (a !== 'qwen35') throw new Error(`Qwen35Dense needs a qwen35 GGUF, got ${a}`);
  const g = (k) => kv[`${a}.${k}`];
  return {
    arch: a,
    layers: g('block_count') - (g('nextn_predict_layers') || 0), hidden: g('embedding_length'), ff: g('feed_forward_length'),
    heads: g('attention.head_count'), kvHeads: g('attention.head_count_kv'), headDim: g('attention.key_length'),
    ropeDims: g('rope.dimension_count'), ropeTheta: g('rope.freq_base'), eps: g('attention.layer_norm_rms_epsilon'),
    attnInterval: g('full_attention_interval') || 4, contextLength: g('context_length'),
    ssm: { dConv: g('ssm.conv_kernel'), dInner: g('ssm.inner_size'), dState: g('ssm.state_size'), vHeads: g('ssm.time_step_rank'), kHeads: g('ssm.group_count') },
    vocab: kv['tokenizer.ggml.tokens'].length,
    bos: kv['tokenizer.ggml.bos_token_id'], eos: kv['tokenizer.ggml.eos_token_id'],
  };
}

// OPFS layout: every tensor copied as-is into dense.bin (256-byte aligned); no experts file content.
function planLayout(gguf) {
  const config = configFromGguf(gguf.kv);
  const dense = {};
  let off = 0;
  for (const t of gguf.tensors) {
    if (/^blk\.\d+\.nextn\./.test(t.name)) continue;
    const n = t.dims.reduce((a, b) => a * b, 1);
    let bytes;
    if (t.type === F32) bytes = n * 4;
    else if (QTYPE_BY_ID[t.type]) bytes = rowBytes(QTYPE_BY_ID[t.type], t.dims[0]) * (n / t.dims[0]);
    else throw new Error(`${t.name}: GGML type ${t.type} is not supported by Qwen35Dense`);
    dense[t.name] = { type: 'raw', ggml: t.type, dims: t.dims, raw: { off, bytes } };
    off += Math.ceil(bytes / 256) * 256;
  }
  return {
    config,
    experts: { file: 'experts.bin', record: 0, parts: {}, layers: config.layers, perLayer: 0, bytes: 0 },
    dense: { file: 'dense.bin', bytes: off, tensors: dense },
  };
}
// Raw copies in pieces of at most 8 MiB.
function planUnits(gguf, layout) {
  const units = [], PIECE = 8 << 20;
  for (const t of gguf.tensors) {
    const d = layout.dense.tensors[t.name];
    if (!d) continue;
    const src = gguf.dataStart + t.offset;
    for (let o = 0; o < d.raw.bytes; o += PIECE) units.push({ src: src + o, len: Math.min(PIECE, d.raw.bytes - o), file: 'dense', raw: d.raw.off + o });
  }
  units.sort((a, b) => a.src - b.src);
  return units;
}

// The dense MLP's activation: act = SiLU(gate)·up, gate and up in one buffer [gate F | up F].
const DENSE_KERNELS = {
  siluMul: `
struct P { F: u32 }
@group(0) @binding(0) var<storage, read> gu: array<f32>;
@group(0) @binding(1) var<storage, read_write> act: array<f32>;
@group(0) @binding(2) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) gi: vec3<u32>) {
  let i = gi.x; if (i >= p.F) { return; }
  let g = gu[i]; act[i] = (g / (1.0 + exp(-g))) * gu[p.F + i];
}`,
};

// Prefill kernels that replace qwen35_moe_ssd.js's batched DeltaNet step and attention (same bindings, same math):
//   gdnStepR   — the gated delta rule over T tokens with each head's 128×128 state in registers (256 threads, 64
//                values each; thread pairs split a row) instead of read and written in memory every token.
//   flashAttnB — causal GQA attention with an online softmax: a workgroup takes one KV head and 4 query tokens (that
//                head's heads/kvHeads query heads each), walks the keys in tiles of 8 through shared memory, and never
//                materializes the heads × T × S score matrix (so the chunk size no longer depends on the context).
const PREFILL_KERNELS = {
  gdnStepR: `
struct P { kH: u32, dS: u32, keyDim: u32, convDim: u32, vH: u32, pad: u32, eps: f32, scale: f32 }
struct Q { T: u32, pos0: u32, S: u32, pad: u32 }
@group(0) @binding(0) var<storage, read> cv: array<f32>;
@group(0) @binding(1) var<storage, read> bb: array<f32>;
@group(0) @binding(2) var<storage, read> al: array<f32>;
@group(0) @binding(3) var<storage, read> dt: array<f32>;
@group(0) @binding(4) var<storage, read> aa: array<f32>;
@group(0) @binding(5) var<storage, read_write> M: array<f32>;
@group(0) @binding(6) var<storage, read_write> o: array<f32>;
@group(0) @binding(7) var<uniform> p: P;
@group(0) @binding(8) var<uniform> qd: Q;
var<workgroup> kq: array<f32, 128>;
var<workgroup> qq: array<f32, 128>;
var<workgroup> rq: array<f32, 128>;
var<workgroup> rk: array<f32, 128>;
var<workgroup> part: array<f32, 256>;
var<workgroup> part2: array<f32, 256>;
fn sigm(x: f32) -> f32 { return 1.0 / (1.0 + exp(-x)); }
fn log1p_(u: f32) -> f32 { let y = 1.0 + u; return log(y) - ((y - 1.0) - u) / y; }
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let h = wg.x; let t = l.x; let j = t >> 1u; let i0 = (t & 1u) * 64u; let kh = h % p.kH;
  let n = 128.0; let inv = 1.0 / sqrt(n);
  let row = (h * 128u + j) * 128u + i0;
  var st: array<f32, 64>;
  for (var i = 0u; i < 64u; i++) { st[i] = M[row + i]; }
  let dth = dt[h]; let aah = aa[h];
  for (var tk = 0u; tk < qd.T; tk++) {
    let cb = tk * p.convDim;
    var qv = 0.0; var kv = 0.0;
    if (t < 128u) { qv = cv[cb + kh * 128u + t]; kv = cv[cb + p.keyDim + kh * 128u + t]; rq[t] = qv * qv; rk[t] = kv * kv; }
    workgroupBarrier();
    for (var s = 64u; s > 0u; s >>= 1u) { if (t < s) { rq[t] += rq[t + s]; rk[t] += rk[t + s]; } workgroupBarrier(); }
    if (t < 128u) {
      qq[t] = (qv * (1.0 / sqrt(rq[0] / n + p.eps / n))) * inv;
      kq[t] = (kv * (1.0 / sqrt(rk[0] / n + p.eps / n))) * inv;
    }
    workgroupBarrier();
    let vv = cv[cb + 2u * p.keyDim + h * 128u + j];
    let beta = sigm(bb[tk * p.vH + h]);
    let x = al[tk * p.vH + h] + dth;
    let sp = select(log1p_(exp(x)), x, x > 20.0);
    let decay = exp(sp * aah);
    var sk = 0.0;
    for (var i = 0u; i < 64u; i++) { let m = st[i] * decay; st[i] = m; sk += m * kq[i0 + i]; }
    part[t] = sk; workgroupBarrier();
    let d = (vv - (part[t & ~1u] + part[t | 1u])) * beta;
    var acc = 0.0;
    for (var i = 0u; i < 64u; i++) { let m = st[i] + kq[i0 + i] * d; st[i] = m; acc += m * qq[i0 + i]; }
    part2[t] = acc; workgroupBarrier();
    if ((t & 1u) == 0u) { o[tk * p.vH * 128u + h * 128u + j] = (part2[t] + part2[t + 1u]) * p.scale; }
  }
  for (var i = 0u; i < 64u; i++) { M[row + i] = st[i]; }
}`,
  flashAttnB: `enable f16;
struct P { heads: u32, kvHeads: u32, hd: u32, scale: f32 }
struct Q { T: u32, pos0: u32, S: u32, pad: u32 }
@group(0) @binding(0) var<storage, read> q: array<f32>;
@group(0) @binding(1) var<storage, read> kc: array<f16>;
@group(0) @binding(2) var<storage, read> vc: array<f16>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@group(0) @binding(5) var<uniform> qd: Q;
const HD = 256u; const TQ = 4u; const KT = 8u; const G = 6u; const R = 24u;   // R = G × TQ query rows
var<workgroup> qs: array<f32, 6144>;    // [row][d], row = tq · G + hh
var<workgroup> kvs: array<f16, 2048>;   // a K or V tile, [key][d]
var<workgroup> sc: array<f32, 192>;     // [row][key] scores, then probabilities
var<workgroup> mrow: array<f32, 24>;
var<workgroup> lrow: array<f32, 24>;
var<workgroup> alpha: array<f32, 24>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let g = wg.x; let tq0 = wg.y * TQ; let t = l.x; let QN = p.heads * HD; let kvn = p.kvHeads * HD;
  for (var e = t; e < R * HD; e += 256u) {
    let r = e / HD; let tok = tq0 + r / G;
    qs[e] = select(0.0, q[min(tok, qd.T - 1u) * QN + (g * G + r % G) * HD + e % HD] * p.scale, tok < qd.T);
  }
  if (t < R) { mrow[t] = -1e30; lrow[t] = 0.0; }
  var o: array<f32, 24>;
  let last = qd.pos0 + min(tq0 + TQ - 1u, qd.T - 1u);
  for (var k0 = 0u; k0 <= last; k0 += KT) {
    workgroupBarrier();
    for (var e = t; e < KT * HD; e += 256u) { kvs[e] = kc[min(k0 + e / HD, last) * kvn + g * HD + e % HD]; }
    workgroupBarrier();
    if (t < R * KT) {
      let r = t / KT; let k = t % KT; let tok = tq0 + r / G;
      var s = 0.0;
      for (var d = 0u; d < HD; d++) { s += qs[r * HD + d] * f32(kvs[k * HD + d]); }
      sc[t] = select(-1e30, s, k0 + k <= qd.pos0 + tok && tok < qd.T);
    }
    workgroupBarrier();
    if (t < R) {
      var mx = mrow[t];
      for (var k = 0u; k < KT; k++) { mx = max(mx, sc[t * KT + k]); }
      let a = exp(mrow[t] - mx); var sum = 0.0;
      for (var k = 0u; k < KT; k++) { let e = exp(sc[t * KT + k] - mx); sc[t * KT + k] = e; sum += e; }
      lrow[t] = lrow[t] * a + sum; mrow[t] = mx; alpha[t] = a;
    }
    for (var e = t; e < KT * HD; e += 256u) { kvs[e] = vc[min(k0 + e / HD, last) * kvn + g * HD + e % HD]; }
    workgroupBarrier();
    for (var r = 0u; r < R; r++) {
      var acc = o[r] * alpha[r];
      for (var k = 0u; k < KT; k++) { acc += sc[r * KT + k] * f32(kvs[k * HD + t]); }
      o[r] = acc;
    }
  }
  workgroupBarrier();
  for (var r = 0u; r < R; r++) {
    let tok = tq0 + r / G;
    if (tok < qd.T) { y[tok * QN + (g * G + r % G) * HD + t] = o[r] / lrow[r]; }
  }
}`,
};

export class Qwen35Dense extends Qwen3MoeSsd {
  static configFrom(kv) { return configFromGguf(kv); }
  static get ingestPlan() { return { layout: planLayout, units: planUnits }; }

  // Without a url, the pinned Hugging Face file; with one (a local serve), the OPFS store is named after the file.
  static async load(modelId = null, opts = {}) {
    const source = opts.source || (opts.url ? { repo: null, file: opts.url.split('/').pop(), revision: null } : UNDERDOG_SALUKI_27B);
    return super.load(modelId, { ...opts, source });
  }

  constructor(device, manifest, gguf, opts) {
    super(device, manifest, gguf, opts);
    const c = this.cfg;
    if (c.ssm.dConv !== 4) throw new Error(`gdnConv assumes a 4-tap conv, got ${c.ssm.dConv}`);
    if (c.ssm.dState !== 128 || c.ssm.dInner !== c.ssm.vHeads * c.ssm.dState) throw new Error('gdnStep assumes 128-wide heads');
    this.recurrent = Array.from({ length: c.layers }, (_, l) => (l + 1) % c.attnInterval !== 0);
    this.types = {};
    for (const [name, d] of Object.entries(manifest.dense.tensors)) this.types[name] = d.ggml === F32 ? null : QTYPE_BY_ID[d.ggml];
    this.prefetch = false;
    // Prompt chunks of up to 256 tokens. Without flash attention the batched scores take heads × chunk × maxCtx
    // floats; then the chunk shrinks to keep them near 96 MB.
    this.batchPrefill = opts.batchPrefill ?? true;
    const fit = this.flashAttention ? Infinity : Math.floor((96 << 20) / (c.heads * this.maxCtx * 4));
    this.chunkTokens = Math.max(16, Math.min(Math.floor(opts.prefillChunk || 256), fit === Infinity ? 256 : fit - (fit % 16) || 16));
  }

  // The kernels this model runs: the base engine's norm/attention/argmax, the qwen35 trunk (one token and
  // batched), and a matvec, a tiled GEMM and an embedding gather per block type present in the GGUF.
  get kernels() {
    if (!this._kernels) {
      const base = super.kernels, pick = (o, names) => Object.fromEntries(names.map((n) => [n, o[n]]));
      const k = {
        ...pick(base, ['rmsnorm', 'kvStore', 'attnScore', 'softmax', 'attnOut', 'addInPlace', 'argmax']),
        ...pick(QWEN35_KERNELS, ['qkNormRopeP', 'sigmoidMul', 'gdnConv', 'gdnStep', 'gdnNormGate']),
        ...pick(QWEN35_BATCH_KERNELS, ['rmsnormB', 'gdnConvB', 'gdnNormGateB', 'qkNormRopePB', 'kvStoreB', 'attnScoreB',
          'softmaxB', 'attnOutB', 'sigmoidMulB', 'addInPlaceB', 'siluMul2B']),
        ...DENSE_KERNELS,
        gdnStepR: PREFILL_KERNELS.gdnStepR,
        ...(this.flashAttention ? { flashAttnB: PREFILL_KERNELS.flashAttnB } : {}),
      };
      const embedType = this.types['token_embd.weight'];
      for (const t of new Set(Object.values(this.types).filter(Boolean))) {
        k[`mv_${t}`] = mvKernel(t); k[`mm_${t}`] = this.matrixKernels ? mmSgKernel(t) : mmKernel(t);
        if (PADDED.has(t)) k[`repack_${t}`] = repackKernel(t);
      }
      k[`embed_${embedType}`] = embedKernel(embedType);
      k[`embedB_${embedType}`] = embedBKernel(embedType);
      this._kernels = k;
    }
    return this._kernels;
  }

  // Prefill GEMMs on subgroup matrices (f16 in, f32 accumulate) when the device has them with 32-wide subgroups and
  // an f16 8×8×8 configuration; otherwise the f32 tiled GEMM. opts.subgroupMatrix === false forces the f32 path.
  // Apple reports only f16→f16 and f32→f32 configurations, yet Dawn compiles f16 operands into an f32 result and
  // computes it right (scripts/test-iq-kernels.mjs; the vendored Bonsai 2 engine relies on the same pairing).
  get matrixKernels() {
    const i = this.device.adapterInfo || this.opts.adapterInfo || {};
    const cfgs = i.subgroupMatrixConfigs || [];
    return this.opts.subgroupMatrix !== false && this.device.features.has('chromium-experimental-subgroup-matrix')
      && i.subgroupMinSize === 32 && i.subgroupMaxSize === 32
      && cfgs.some((c) => c.componentType === 'f16' && c.M === 8 && c.N === 8 && c.K === 8);
  }

  // flashAttnB is written for 6 query heads per KV head of 256 dims and needs 29.7 KB of workgroup memory.
  get flashAttention() {
    const c = this.cfg;
    return this.opts.flashAttention !== false && c.heads === 6 * c.kvHeads && c.headDim === 256
      && this.device.limits.maxComputeWorkgroupStorageSize >= 29728;
  }

  async init(onProgress) {
    const dev = this.device;
    dev.pushErrorScope('validation');
    for (const k of Object.keys(this.kernels)) this.pipeline(k);
    const err = await dev.popErrorScope();
    if (err) throw new Error(`WGSL: ${err.message}`);
    await this.uploadDense(onProgress);
    await this.repackPadded();
    const g = gridData();
    this.grid = this.buffer(g.byteLength, STORAGE | COPY_DST, 'dense');
    dev.queue.writeBuffer(this.grid, 0, g);
    this.initBuffers();
    await dev.queue.onSubmittedWorkDone();
  }

  // Blocks of 4k+2 bytes arrive in GGUF layout; give each two bytes of padding after its scale (iq_quants.js PADDED)
  // on the GPU, then free the GGUF-layout buffer. A few tensors at a time, so the extra memory stays small.
  async repackPadded() {
    const dev = this.device;
    let pending = [];
    const flush = async () => { await dev.queue.onSubmittedWorkDone(); for (const b of pending) { this.gpuBytes.dense -= b.size; b.destroy(); } pending = []; };
    for (const [name, t] of Object.entries(this.types)) {
      if (!t || !PADDED.has(t)) continue;
      const dims = this.manifest.dense.tensors[name].dims, rows = dims.reduce((a, b) => a * b, 1) / dims[0];
      const words = gpuRowBytes(t, dims[0]) * rows / 4, src = this.w[name].raw;
      const dst = this.buffer(words * 4, STORAGE | COPY_DST, 'dense');
      const enc = dev.createCommandEncoder(), pass = enc.beginComputePass();
      this.dispatch(pass, `repack_${t}`, this.bind(`repack_${t}`, [src, dst, this.uniform([words])]), Math.ceil(words / 256));
      pass.end(); dev.queue.submit([enc.finish()]);
      this.w[name].raw = dst;
      pending.push(src);
      if (pending.length >= 8) await flush();
    }
    await flush();
  }

  // Like bind(), but a resource may be { buffer, offset, size }.
  bindR(name, resources) {
    return this.device.createBindGroup({
      layout: this.pipeline(name).getBindGroupLayout(0),
      entries: resources.map((r, i) => ({ binding: i, resource: r instanceof GPUBuffer ? { buffer: r } : r })),
    });
  }

  kvBytes() {
    const c = this.cfg, s = c.ssm, convDim = 2 * s.kHeads * s.dState + s.dInner;
    return this.recurrent.reduce((sum, r) => sum + (r ? 3 * convDim * 4 + s.vHeads * s.dState * s.dState * 4 : 2 * 2 * this.maxCtx * c.kvHeads * c.headDim), 0);
  }

  // A quantized weight's matvec: { name, group, wg } for dispatch. y may be { buffer, offset, size }.
  mv(name, x, y, M, N) {
    const t = this.types[name], w = this.w[name];
    if (!t || !w) throw new Error(`missing quantized tensor ${name}`);
    const u = this.uniform([M, N, gpuRowBytes(t, N), 0]);
    return { k: `mv_${t}`, g: this.bindR(`mv_${t}`, [x, w.raw, this.grid, y, u]), wg: Math.ceil(M / MV_ROWS) };
  }
  mm(name, x, y, M, N) {
    const t = this.types[name], w = this.w[name];
    const u = this.uniform([M, N, gpuRowBytes(t, N), 0]);
    return { k: `mm_${t}`, g: this.bindR(`mm_${t}`, [x, w.raw, this.grid, y, u, this.qb]), wg: Math.ceil(M / MM_TILE) };
  }

  initBuffers() {
    const c = this.cfg, s = c.ssm;
    const H = c.hidden, hd = c.headDim, QN = c.heads * hd, kvn = c.kvHeads * hd, F = c.ff;
    const keyDim = s.kHeads * s.dState, convDim = 2 * keyDim + s.dInner;
    if ((F * 4) % 256) throw new Error('gate/up halves must be 256-byte aligned');
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
    const a = this.a = {
      x: A(H), xn: A(H), qg: A(2 * QN), q: A(QN), gate: A(QN), k: A(kvn), kr: A(kvn), v: A(kvn), att: A(QN), o: A(H),
      sc: A(c.heads * this.maxCtx), mixed: A(convDim), cv: A(convDim), z: A(s.dInner), bb: A(s.vHeads), al: A(s.vHeads),
      go: A(s.dInner), gn: A(s.dInner), dummy: A(4), gu: A(2 * F), act: A(F), logits: A(c.vocab), am: A(4), rope: A(c.ropeDims),
    };
    this.tok = this.buffer(16, UNIFORM | COPY_DST);
    this.rbLogits = this.buffer(c.vocab * 4, MAP_READ | COPY_DST);
    this.rbArg = this.buffer(16, MAP_READ | COPY_DST);
    this.qb = this.buffer(16, UNIFORM | COPY_DST, 'batch');

    const U = (w) => this.uniform(w), eps = { f: c.eps };
    const u = {
      nH: U([H]), rmsH: U([H, eps]),
      ropeQ: U([hd, 2 * hd, c.ropeDims, 1, eps]), ropeK: U([hd, hd, c.ropeDims, 0, eps]), kvn: U([kvn]),
      att: U([c.heads, c.kvHeads, hd, { f: 1 / Math.sqrt(hd) }]), attOut: U([c.heads, c.kvHeads, hd, 0]), gate: U([QN]),
      conv: U([convDim]), step: U([s.kHeads, s.dState, keyDim, 0, eps, { f: 1 / Math.sqrt(s.dState) }]), ng: U([s.dState, eps]),
      silu: U([F]), am: U([c.vocab]),
    };
    const W = this.w, raw = (name) => { const t = W[name]; if (!t || !t.raw || this.types[name]) throw new Error(`missing F32 tensor ${name}`); return t.raw; };
    const half = (off) => ({ buffer: a.gu, offset: off * F * 4, size: F * 4 });
    const et = this.types['token_embd.weight'];
    this.g = {
      embed: this.bind(`embed_${et}`, [W['token_embd.weight'].raw, this.grid, a.x, this.tok, U([H, gpuRowBytes(et, H)])]),
      rmsOut: this.bind('rmsnorm', [a.x, raw('output_norm.weight'), a.xn, u.rmsH]),
      lm: this.mv('output.weight', a.xn, a.logits, c.vocab, H),
      am: this.bind('argmax', [a.logits, a.am, u.am]),
    };
    this.layers = [];
    for (let l = 0; l < c.layers; l++) {
      const n = (t) => `blk.${l}.${t}`;
      const g = { recur: this.recurrent[l], rmsA: this.bind('rmsnorm', [a.x, raw(n('attn_norm.weight')), a.xn, u.rmsH]) };
      if (g.recur) {
        Object.assign(g, {
          qkv: this.mv(n('attn_qkv.weight'), a.xn, a.mixed, convDim, H),
          z: this.mv(n('attn_gate.weight'), a.xn, a.z, s.dInner, H),
          beta: this.mv(n('ssm_beta.weight'), a.xn, a.bb, s.vHeads, H),
          alpha: this.mv(n('ssm_alpha.weight'), a.xn, a.al, s.vHeads, H),
          conv: this.bind('gdnConv', [a.mixed, raw(n('ssm_conv1d.weight')), this.conv[l], a.cv, u.conv]),
          step: this.bind('gdnStep', [a.cv, a.bb, a.al, raw(n('ssm_dt.bias')), raw(n('ssm_a')), this.ssm[l], a.go, u.step]),
          norm: this.bind('gdnNormGate', [a.go, raw(n('ssm_norm.weight')), a.z, a.gn, u.ng]),
          out: this.mv(n('ssm_out.weight'), a.gn, a.o, H, s.dInner),
        });
      } else {
        Object.assign(g, {
          q: this.mv(n('attn_q.weight'), a.xn, a.qg, 2 * QN, H),
          k: this.mv(n('attn_k.weight'), a.xn, a.k, kvn, H),
          v: this.mv(n('attn_v.weight'), a.xn, a.v, kvn, H),
          ropeQ: this.bind('qkNormRopeP', [a.qg, raw(n('attn_q_norm.weight')), a.rope, a.q, a.gate, u.ropeQ]),
          ropeK: this.bind('qkNormRopeP', [a.k, raw(n('attn_k_norm.weight')), a.rope, a.kr, a.dummy, u.ropeK]),
          kv: this.bind('kvStore', [a.kr, a.v, this.kc[l], this.vc[l], this.tok, u.kvn]),
          score: this.bind('attnScore', [a.q, this.kc[l], a.sc, this.tok, u.att]),
          soft: this.bind('softmax', [a.sc, this.tok]),
          attOut: this.bind('attnOut', [a.sc, this.vc[l], a.att, this.tok, u.attOut]),
          gate: this.bind('sigmoidMul', [a.att, a.gate, u.gate]),
          o: this.mv(n('attn_output.weight'), a.att, a.o, H, QN),
        });
      }
      Object.assign(g, {
        addO: this.bind('addInPlace', [a.x, a.o, u.nH]),
        rmsF: this.bind('rmsnorm', [a.x, raw(n('post_attention_norm.weight')), a.xn, u.rmsH]),
        up: this.mv(n('ffn_up.weight'), a.xn, half(1), F, H),
        gt: this.mv(n('ffn_gate.weight'), a.xn, half(0), F, H),
        silu: this.bind('siluMul', [a.gu, a.act, u.silu]),
        down: this.mv(n('ffn_down.weight'), a.act, a.o, H, F),
        addD: this.bind('addInPlace', [a.x, a.o, u.nH]),
      });
      this.layers.push(g);
    }
    if (this.batchPrefill) this.initBatch();
  }

  // ── one token ─────────────────────────────────────────────────────────────
  run(pass, op) { this.dispatch(pass, op.k, op.g, op.wg); }
  encodeLayer(pass, l, seqLen) {
    const c = this.cfg, s = c.ssm, g = this.layers[l], d = (nm, gr, x) => this.dispatch(pass, nm, gr, x);
    const H = c.hidden, QN = c.heads * c.headDim, kvn = c.kvHeads * c.headDim, convDim = 2 * s.kHeads * s.dState + s.dInner;
    d('rmsnorm', g.rmsA, 1);
    if (g.recur) {
      this.run(pass, g.qkv); this.run(pass, g.z); this.run(pass, g.beta); this.run(pass, g.alpha);
      d('gdnConv', g.conv, Math.ceil(convDim / 256));
      d('gdnStep', g.step, s.vHeads);
      d('gdnNormGate', g.norm, s.vHeads);
      this.run(pass, g.out);
    } else {
      this.run(pass, g.q); this.run(pass, g.k); this.run(pass, g.v);
      d('qkNormRopeP', g.ropeQ, c.heads); d('qkNormRopeP', g.ropeK, c.kvHeads);
      d('kvStore', g.kv, Math.ceil(kvn / 256));
      d('attnScore', g.score, Math.ceil(c.heads * seqLen / 256));
      d('softmax', g.soft, c.heads);
      d('attnOut', g.attOut, Math.ceil(QN / 256));
      d('sigmoidMul', g.gate, Math.ceil(QN / 256));
      this.run(pass, g.o);
    }
    d('addInPlace', g.addO, Math.ceil(H / 256));
    d('rmsnorm', g.rmsF, 1);
    this.run(pass, g.gt); this.run(pass, g.up);
    d('siluMul', g.silu, Math.ceil(c.ff / 256));
    this.run(pass, g.down);
    d('addInPlace', g.addD, Math.ceil(H / 256));
  }
  encodeHead(pass, want) {
    this.dispatch(pass, 'rmsnorm', this.g.rmsOut, 1);
    this.run(pass, this.g.lm);
    if (want === 'argmax') this.dispatch(pass, 'argmax', this.g.am, 1);
  }

  // One token through every layer at this.position, in one submit. want: 'none' | 'argmax' | 'logits'.
  async step(token, want = 'argmax') {
    const c = this.cfg, dev = this.device;
    if (this.position >= this.maxCtx) throw new Error(`context full (${this.maxCtx} tokens)`);
    const tStart = performance.now(), pos = this.position;
    this.writeTokenUniforms(token, pos);
    const enc = dev.createCommandEncoder(), pass = enc.beginComputePass();
    this.dispatch(pass, `embed_${this.types['token_embd.weight']}`, this.g.embed, Math.ceil(c.hidden / 8 / 256));
    for (let l = 0; l < c.layers; l++) this.encodeLayer(pass, l, pos + 1);
    if (want !== 'none') this.encodeHead(pass, want);
    pass.end();
    if (want === 'argmax') enc.copyBufferToBuffer(this.a.am, 0, this.rbArg, 0, 4);
    if (want === 'logits') enc.copyBufferToBuffer(this.a.logits, 0, this.rbLogits, 0, c.vocab * 4);
    dev.queue.submit([enc.finish()]);
    this.counters.encodeMs += performance.now() - tStart;
    this.position++;
    this.cached.push(token);
    const result = await this.readResult(want);
    this.counters.tokens++;
    this.counters.wallMs += performance.now() - tStart;
    return result;
  }
  async readResult(want) {
    const tw = performance.now();
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
      await this.device.queue.onSubmittedWorkDone();
    }
    this.counters.gpuWaitMs += performance.now() - tw;
    return result;
  }

  // ── batched prefill: chunks of T prompt tokens, token-major ───────────────
  initBatch() {
    const c = this.cfg, s = c.ssm, B = this.chunkTokens, a = this.a;
    const H = c.hidden, hd = c.headDim, QN = c.heads * hd, kvn = c.kvHeads * hd, F = c.ff;
    const keyDim = s.kHeads * s.dState, convDim = 2 * keyDim + s.dInner;
    const A = (n) => this.buffer(n * 4, STORAGE | COPY_SRC | COPY_DST, 'batch');
    const b = this.b = {
      ids: A(B), x: A(B * H), xn: A(B * H), qg: A(B * 2 * QN), q: A(B * QN), gate: A(B * QN), k: A(B * kvn), kr: A(B * kvn), v: A(B * kvn),
      att: A(B * QN), o: A(B * H), sc: this.flashAttention ? A(4) : A(c.heads * B * this.maxCtx), mixed: A(B * convDim), cv: A(B * convDim), z: A(B * s.dInner),
      bb: A(B * s.vHeads), al: A(B * s.vHeads), go: A(B * s.dInner), gn: A(B * s.dInner),
      g: A(B * F), u: A(B * F), act: A(B * F), rope: A(B * c.ropeDims), dummy: A(4),
    };
    const U = (w) => this.uniform(w), eps = { f: c.eps }, qb = this.qb, W = this.w;
    const u = {
      nH: U([H]), rmsH: U([H, eps]),
      ropeQ: U([hd, 2 * hd, 2 * QN, QN, c.ropeDims, 1, eps]), ropeK: U([hd, hd, kvn, kvn, c.ropeDims, 0, eps]), kvn: U([kvn]),
      att: U([c.heads, c.kvHeads, hd, { f: 1 / Math.sqrt(hd) }]), attOut: U([c.heads, c.kvHeads, hd, 0]), gate: U([QN]),
      conv: U([convDim]), step: U([s.kHeads, s.dState, keyDim, convDim, s.vHeads, 0, eps, { f: 1 / Math.sqrt(s.dState) }]),
      ng: U([s.dState, s.dInner, eps]), ff: U([F]),
    };
    const raw = (name) => W[name].raw, et = this.types['token_embd.weight'];
    this.gB = { embed: this.bind(`embedB_${et}`, [W['token_embd.weight'].raw, this.grid, b.ids, b.x, U([H, gpuRowBytes(et, H)]), qb]) };
    for (let l = 0; l < c.layers; l++) {
      const n = (t) => `blk.${l}.${t}`, g = { rmsA: this.bind('rmsnormB', [b.x, raw(n('attn_norm.weight')), b.xn, u.rmsH]) };
      if (this.recurrent[l]) {
        Object.assign(g, {
          qkv: this.mm(n('attn_qkv.weight'), b.xn, b.mixed, convDim, H), z: this.mm(n('attn_gate.weight'), b.xn, b.z, s.dInner, H),
          beta: this.mm(n('ssm_beta.weight'), b.xn, b.bb, s.vHeads, H), alpha: this.mm(n('ssm_alpha.weight'), b.xn, b.al, s.vHeads, H),
          conv: this.bind('gdnConvB', [b.mixed, raw(n('ssm_conv1d.weight')), this.conv[l], b.cv, u.conv, qb]),
          step: this.bind('gdnStepR', [b.cv, b.bb, b.al, raw(n('ssm_dt.bias')), raw(n('ssm_a')), this.ssm[l], b.go, u.step, qb]),
          norm: this.bind('gdnNormGateB', [b.go, raw(n('ssm_norm.weight')), b.z, b.gn, u.ng]),
          out: this.mm(n('ssm_out.weight'), b.gn, b.o, H, s.dInner),
        });
      } else {
        Object.assign(g, {
          q: this.mm(n('attn_q.weight'), b.xn, b.qg, 2 * QN, H), k: this.mm(n('attn_k.weight'), b.xn, b.k, kvn, H), v: this.mm(n('attn_v.weight'), b.xn, b.v, kvn, H),
          ropeQ: this.bind('qkNormRopePB', [b.qg, raw(n('attn_q_norm.weight')), b.rope, b.q, b.gate, u.ropeQ]),
          ropeK: this.bind('qkNormRopePB', [b.k, raw(n('attn_k_norm.weight')), b.rope, b.kr, b.dummy, u.ropeK]),
          kv: this.bind('kvStoreB', [b.kr, b.v, this.kc[l], this.vc[l], u.kvn, qb]),
          ...(this.flashAttention ? { flash: this.bind('flashAttnB', [b.q, this.kc[l], this.vc[l], b.att, u.att, qb]) } : {
            score: this.bind('attnScoreB', [b.q, this.kc[l], b.sc, u.att, qb]),
            soft: this.bind('softmaxB', [b.sc, qb]),
            attOut: this.bind('attnOutB', [b.sc, this.vc[l], b.att, u.attOut, qb]),
          }),
          gate: this.bind('sigmoidMulB', [b.att, b.gate, u.gate, qb]),
          o: this.mm(n('attn_output.weight'), b.att, b.o, H, QN),
        });
      }
      Object.assign(g, {
        addO: this.bind('addInPlaceB', [b.x, b.o, u.nH, qb]),
        rmsF: this.bind('rmsnormB', [b.x, raw(n('post_attention_norm.weight')), b.xn, u.rmsH]),
        gt: this.mm(n('ffn_gate.weight'), b.xn, b.g, F, H), up: this.mm(n('ffn_up.weight'), b.xn, b.u, F, H),
        silu: this.bind('siluMul2B', [b.g, b.u, b.act, u.ff, qb]),
        down: this.mm(n('ffn_down.weight'), b.act, b.o, H, F),
        addD: this.bind('addInPlaceB', [b.x, b.o, u.nH, qb]),
      });
      this.layers[l].B = g;
    }
  }

  encodeLayerB(pass, l, T, S) {
    const c = this.cfg, s = c.ssm, g = this.layers[l].B, d = (nm, gr, x, y) => this.dispatch(pass, nm, gr, x, y);
    const H = c.hidden, QN = c.heads * c.headDim, kvn = c.kvHeads * c.headDim, convDim = 2 * s.kHeads * s.dState + s.dInner;
    const tt = Math.ceil(T / (this.matrixKernels ? MM_SG_TOKENS : MM_TILE)), mm = (op) => this.dispatch(pass, op.k, op.g, op.wg, tt);
    d('rmsnormB', g.rmsA, T);
    if (this.recurrent[l]) {
      mm(g.qkv); mm(g.z); mm(g.beta); mm(g.alpha);
      d('gdnConvB', g.conv, Math.ceil(convDim / 256));
      d('gdnStepR', g.step, s.vHeads);
      d('gdnNormGateB', g.norm, s.vHeads, T);
      mm(g.out);
    } else {
      mm(g.q); mm(g.k); mm(g.v);
      d('qkNormRopePB', g.ropeQ, c.heads, T); d('qkNormRopePB', g.ropeK, c.kvHeads, T);
      d('kvStoreB', g.kv, Math.ceil(kvn / 256), T);
      if (g.flash) d('flashAttnB', g.flash, c.kvHeads, Math.ceil(T / 4));
      else { d('attnScoreB', g.score, Math.ceil(c.heads * T * S / 256)); d('softmaxB', g.soft, c.heads * T); d('attnOutB', g.attOut, Math.ceil(QN / 256), T); }
      d('sigmoidMulB', g.gate, Math.ceil(QN / 256), T);
      mm(g.o);
    }
    d('addInPlaceB', g.addO, Math.ceil(H / 256), T);
    d('rmsnormB', g.rmsF, T);
    mm(g.gt); mm(g.up);
    d('siluMul2B', g.silu, Math.ceil(c.ff / 256), T);
    mm(g.down);
    d('addInPlaceB', g.addD, Math.ceil(H / 256), T);
  }

  // T = ids.length tokens at this.position through every layer in one submit; want applies to the last token.
  async prefillChunk(ids, want = 'none') {
    const c = this.cfg, dev = this.device, H = c.hidden, T = ids.length, pos0 = this.position, S = pos0 + T;
    if (T > this.chunkTokens) throw new Error(`chunk of ${T} > ${this.chunkTokens}`);
    if (S > this.maxCtx) throw new Error(`context full (${this.maxCtx} tokens)`);
    const tStart = performance.now();
    dev.queue.writeBuffer(this.b.ids, 0, Uint32Array.from(ids));
    dev.queue.writeBuffer(this.qb, 0, new Uint32Array([T, pos0, S, 0]));
    const nRot = c.ropeDims, half = nRot / 2, r = new Float32Array(T * nRot), stepR = Math.fround(Math.pow(c.ropeTheta, -2 / nRot));
    for (let t = 0; t < T; t++) {
      let th = Math.fround(pos0 + t);
      for (let i = 0; i < half; i++) { r[t * nRot + i] = Math.cos(th); r[t * nRot + half + i] = Math.sin(th); th = Math.fround(th * stepR); }
    }
    dev.queue.writeBuffer(this.b.rope, 0, r);
    const enc = dev.createCommandEncoder();
    let pass = enc.beginComputePass();
    this.dispatch(pass, `embedB_${this.types['token_embd.weight']}`, this.gB.embed, Math.ceil(H / 8 / 256), T);
    for (let l = 0; l < c.layers; l++) this.encodeLayerB(pass, l, T, S);
    pass.end();
    enc.copyBufferToBuffer(this.b.x, (T - 1) * H * 4, this.a.x, 0, H * 4);
    if (want !== 'none') {
      pass = enc.beginComputePass();
      this.encodeHead(pass, want);
      pass.end();
      if (want === 'argmax') enc.copyBufferToBuffer(this.a.am, 0, this.rbArg, 0, 4);
      if (want === 'logits') enc.copyBufferToBuffer(this.a.logits, 0, this.rbLogits, 0, c.vocab * 4);
    }
    dev.queue.submit([enc.finish()]);
    this.position += T;
    this.cached.push(...ids);
    const result = await this.readResult(want);
    this.counters.tokens += T;
    this.counters.wallMs += performance.now() - tStart;
    return result;
  }

  // The recurrent state cannot rewind, so any change before the cached end restarts from token 0.
  async prefill(ids, want = 'argmax') {
    let common = 0;
    while (common < ids.length - 1 && common < this.cached.length && this.cached[common] === ids[common]) common++;
    if (common < this.cached.length) this.reset();
    const rest = ids.slice(this.cached.length);
    if (!this.batchPrefill || rest.length < 2) {
      let r = null;
      for (let i = 0; i < rest.length; i++) r = await this.step(rest[i], i === rest.length - 1 ? want : 'none');
      return r;
    }
    let r = null;
    for (let i = 0; i < rest.length; i += this.chunkTokens) {
      r = await this.prefillChunk(rest.slice(i, i + this.chunkTokens), i + this.chunkTokens >= rest.length ? want : 'none');
    }
    return r;
  }

  reset() {
    super.reset();
    if (!this.conv) return;
    const enc = this.device.createCommandEncoder();
    for (let l = 0; l < this.cfg.layers; l++) if (this.recurrent[l]) { enc.clearBuffer(this.conv[l]); enc.clearBuffer(this.ssm[l]); }
    this.device.queue.submit([enc.finish()]);
  }

  // RoPE angles as ggml's CPU rope cache forms them for text positions (qwen35_moe_ssd.js has the derivation).
  writeTokenUniforms(token, pos) {
    const c = this.cfg, nRot = c.ropeDims, half = nRot / 2;
    this.device.queue.writeBuffer(this.tok, 0, new Uint32Array([token, pos, pos + 1, 0]));
    const r = new Float32Array(nRot), step = Math.fround(Math.pow(c.ropeTheta, -2 / nRot));
    let th = Math.fround(pos);
    for (let i = 0; i < half; i++) { r[i] = Math.cos(th); r[half + i] = Math.sin(th); th = Math.fround(th * step); }
    this.device.queue.writeBuffer(this.a.rope, 0, r);
  }

  // Qwen3.5-family template: the generation prompt opens the reasoning block when thinking is on.
  chatPrompt(messages, { enableThinking = true } = {}) {
    let p = '';
    for (const m of messages) p += `<|im_start|>${m.role}\n${m.content}<|im_end|>\n`;
    return p + '<|im_start|>assistant\n' + (enableThinking ? '<think>\n' : '<think>\n\n</think>\n\n');
  }

  resetCounters() { this.counters = { tokens: 0, gpuWaitMs: 0, encodeMs: 0, wallMs: 0 }; }
  stats() {
    const c = this.counters, n = Math.max(1, c.tokens);
    return { tokens: c.tokens, tokPerSec: c.tokens / (c.wallMs / 1000), msPerToken: c.wallMs / n, gpuWaitMsPerToken: c.gpuWaitMs / n, gpuBytes: { ...this.gpuBytes } };
  }
  async dispose() { try { this.device.destroy(); } catch (_) {} }
}

// For kernel tests (scripts/test-qwen35-dense-kernels.mjs).
export { PREFILL_KERNELS as QWEN35_DENSE_PREFILL_KERNELS };
