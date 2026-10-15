/* minicpmv_vision.js — MiniCPM-V 4.7's vision encoder (mmproj GGUF, projector `minicpmv4_7`) on WebGPU.
 *
 * One image tile in, its token embeddings out (64 × 2048 for a 448 × 448 tile), ready to splice into the text model.
 * The math follows llama.cpp a0e6dc738 tools/mtmd/models/minicpmv.cpp (clip_graph_minicpmv4_6::build) and the index
 * tables in clip.cpp, and is gated against scripts/minicpmv-vision-ref.py (float64 numpy). Activations are f32; the
 * BF16 weights are read as stored (a BF16 value is the top half of an f32, so the shader widens it exactly).
 *
 *   const v = await MiniCpmVVision.load(device, { read: (off, len) => Promise<Uint8Array>, size });
 *   const { tokens, dim, buffer } = await v.encode(pixels, width, height);   // pixels: Float32Array, H × W × 3
 *   const f32 = await v.readback(buffer, tokens * dim);
 *
 * Graph per tile (patch grid ph × pw, both even and their halves even):
 *   patch conv 14×14 + bias + position embedding (SigLIP 70×70 buckets)
 *   ViT layers 0..insert (LayerNorm → attention 16×72 → residual; LayerNorm → FFN tanh-GELU → residual)
 *   merger: LayerNorm → attention inside each 2×2 window → residual; 2×2 downsample: LayerNorm(concat) → MLP
 *     (tanh-GELU) + mean of the four
 *   ViT layers insert+1..26 on the quarter grid; post LayerNorm
 *   final merger: 2×2 concat → LayerNorm → MLP (erf-GELU) → 2048
 */
import { parseGguf } from './gguf.js';

const STORAGE = 0x80, COPY_SRC = 0x04, COPY_DST = 0x08, UNIFORM = 0x40, MAP_READ = 0x01;
const F32 = 0, BF16 = 30;

const BF = 'fn bf(w: u32, hi: bool) -> f32 { return bitcast<f32>(select(w << 16u, w & 0xffff0000u, hi)); }';

const K = {
  // y[p][o] = bias[o] + Σ_{c,ky,kx} W[o][c][ky][kx] · img[(py·14+ky)][(px·14+kx)][c] + posE[bucket(p)][o]
  patch: `
struct P { ph: u32, pw: u32, C: u32, W: u32 }
@group(0) @binding(0) var<storage, read> img: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read> bias: array<f32>;
@group(0) @binding(3) var<storage, read> posE: array<f32>;
@group(0) @binding(4) var<storage, read_write> y: array<f32>;
@group(0) @binding(5) var<uniform> p: P;
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let o = g.x; let pi = g.y; if (o >= p.C) { return; }
  let py = pi / p.pw; let px = pi % p.pw;
  var acc = bias[o];
  for (var c = 0u; c < 3u; c++) {
    for (var ky = 0u; ky < 14u; ky++) {
      let row = (py * 14u + ky) * p.W + px * 14u;
      let wb = ((o * 3u + c) * 14u + ky) * 14u;
      for (var kx = 0u; kx < 14u; kx++) { acc += w[wb + kx] * img[(row + kx) * 3u + c]; }
    }
  }
  let bucket = ((70u * py) / p.ph) * 70u + (70u * px) / p.pw;
  y[pi * p.C + o] = acc + posE[bucket * p.C + o];
}`,
  // LayerNorm with weight and bias, one workgroup per row.
  layerNorm: `
struct P { n: u32, eps: f32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<f32>;
@group(0) @binding(2) var<storage, read> b: array<f32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let base = wg.x * p.n; let t = l.x;
  var s = 0.0;
  for (var i = t; i < p.n; i += 256u) { s += x[base + i]; }
  red[t] = s; workgroupBarrier();
  for (var k = 128u; k > 0u; k >>= 1u) { if (t < k) { red[t] += red[t + k]; } workgroupBarrier(); }
  let mean = red[0] / f32(p.n); workgroupBarrier();
  var v = 0.0;
  for (var i = t; i < p.n; i += 256u) { let d = x[base + i] - mean; v += d * d; }
  red[t] = v; workgroupBarrier();
  for (var k = 128u; k > 0u; k >>= 1u) { if (t < k) { red[t] += red[t + k]; } workgroupBarrier(); }
  let inv = 1.0 / sqrt(red[0] / f32(p.n) + p.eps);
  for (var i = t; i < p.n; i += 256u) { y[base + i] = (x[base + i] - mean) * inv * w[i] + b[i]; }
}`,
  // Y[t·M + m] = bias[m] + Σ_k X[t·N + k] · W[m·N + k], W in BF16 (two per u32, element 2i in the low half).
  // 16 rows × 16 tokens per workgroup through shared memory, 32-wide k blocks; the last block is guarded (the FFN's
  // K = 4304 is not a multiple of 32). Dispatch (ceil(M/16), ceil(T/16)).
  gemm: `
struct P { M: u32, N: u32, T: u32, pad: u32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> w: array<u32>;
@group(0) @binding(2) var<storage, read> bias: array<f32>;
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
      let rr = i / 32u; let kk = i % 32u;
      let m = m0 + rr; var wv = 0.0;
      let kin = k0 + kk < p.N;
      if (m < p.M && kin) { let e = m * p.N + k0 + kk; wv = bf(w[e >> 1u], (e & 1u) == 1u); }
      ws[i] = wv;
      let t = t0 + rr; var xv = 0.0;
      if (t < p.T && kin) { xv = x[t * p.N + k0 + kk]; }
      xs[i] = xv;
    }
    workgroupBarrier();
    for (var kk = 0u; kk < 32u; kk++) { acc += ws[r * 32u + kk] * xs[c * 32u + kk]; }
    workgroupBarrier();
  }
  let m = m0 + r; let t = t0 + c;
  if (m < p.M && t < p.T) { y[t * p.M + m] = acc + bias[m]; }
}`,
  // S[h][i][j] = scale · q_i·k_j for head h (d = 72); with win = 1, keys outside query i's 2×2 window get -inf.
  scores: `
struct P { n: u32, C: u32, heads: u32, dh: u32, scale: f32, win: u32, pw: u32, pad: u32 }
@group(0) @binding(0) var<storage, read> q: array<f32>;
@group(0) @binding(1) var<storage, read> k: array<f32>;
@group(0) @binding(2) var<storage, read_write> s: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
fn winOf(i: u32) -> u32 { return ((i / p.pw) / 2u) * (p.pw / 2u) + (i % p.pw) / 2u; }
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let j = g.x; let i = g.y; let h = g.z;
  if (j >= p.n) { return; }
  let o = (h * p.n + i) * p.n + j;
  if (p.win == 1u && winOf(i) != winOf(j)) { s[o] = -3.4e38; return; }
  var acc = 0.0;
  let qb = i * p.C + h * p.dh; let kb = j * p.C + h * p.dh;
  for (var d = 0u; d < p.dh; d++) { acc += q[qb + d] * k[kb + d]; }
  s[o] = acc * p.scale;
}`,
  softmax: `
struct P { n: u32 }
@group(0) @binding(0) var<storage, read_write> s: array<f32>;
@group(0) @binding(1) var<uniform> p: P;
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let base = wg.x * p.n; let t = l.x;
  var m = -3.4e38;
  for (var i = t; i < p.n; i += 256u) { m = max(m, s[base + i]); }
  red[t] = m; workgroupBarrier();
  for (var k = 128u; k > 0u; k >>= 1u) { if (t < k) { red[t] = max(red[t], red[t + k]); } workgroupBarrier(); }
  let mx = red[0]; workgroupBarrier();
  var sum = 0.0;
  for (var i = t; i < p.n; i += 256u) { let e = select(exp(s[base + i] - mx), 0.0, s[base + i] <= -3.0e38); s[base + i] = e; sum += e; }
  red[t] = sum; workgroupBarrier();
  for (var k = 128u; k > 0u; k >>= 1u) { if (t < k) { red[t] += red[t + k]; } workgroupBarrier(); }
  let inv = 1.0 / red[0];
  for (var i = t; i < p.n; i += 256u) { s[base + i] *= inv; }
}`,
  // O[i][h·72 + d] = Σ_j P[h][i][j] · v[j][h·72 + d]
  attnOut: `
struct P { n: u32, C: u32, heads: u32, dh: u32 }
@group(0) @binding(0) var<storage, read> s: array<f32>;
@group(0) @binding(1) var<storage, read> v: array<f32>;
@group(0) @binding(2) var<storage, read_write> o: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let c = g.x; let i = g.y; if (c >= p.C) { return; }
  let h = c / p.dh; let sb = (h * p.n + i) * p.n;
  var acc = 0.0;
  for (var j = 0u; j < p.n; j++) { acc += s[sb + j] * v[j * p.C + c]; }
  o[i * p.C + c] = acc;
}`,
  geluTanh: `
struct P { n: u32 }
@group(0) @binding(0) var<storage, read_write> x: array<f32>;
@group(0) @binding(1) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>) {
  let i = g.y * ng.x * 256u + g.x; if (i >= p.n) { return; }
  let v = x[i];
  x[i] = 0.5 * v * (1.0 + tanh(clamp(0.7978845608028654 * (v + 0.044715 * v * v * v), -10.0, 10.0)));
}`,
  // erf by Abramowitz–Stegun 7.1.26 (absolute error under 1.5e-7).
  geluErf: `
struct P { n: u32 }
@group(0) @binding(0) var<storage, read_write> x: array<f32>;
@group(0) @binding(1) var<uniform> p: P;
fn erf_(z: f32) -> f32 {
  let a = abs(z); let t = 1.0 / (1.0 + 0.3275911 * a);
  let y = 1.0 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * exp(-a * a);
  return select(-y, y, z >= 0.0);
}
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>) {
  let i = g.y * ng.x * 256u + g.x; if (i >= p.n) { return; }
  let v = x[i];
  x[i] = 0.5 * v * (1.0 + erf_(v * 0.7071067811865476));
}`,
  add: `
struct P { n: u32 }
@group(0) @binding(0) var<storage, read_write> y: array<f32>;
@group(0) @binding(1) var<storage, read> x: array<f32>;
@group(0) @binding(2) var<uniform> p: P;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) g: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>) {
  let i = g.y * ng.x * 256u + g.x; if (i >= p.n) { return; }
  y[i] += x[i];
}`,
  // 2×2 gather on a gh × gw grid: cat[q] = [x(2i,2j), x(2i,2j+1), x(2i+1,2j), x(2i+1,2j+1)] (4C wide),
  // mean[q] = their average (written when withMean = 1). q = i·(gw/2) + j.
  gather: `
struct P { gw: u32, C: u32, nq: u32, withMean: u32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read_write> cat: array<f32>;
@group(0) @binding(2) var<storage, read_write> mean: array<f32>;
@group(0) @binding(3) var<uniform> p: P;
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let c = g.x; let q = g.y; if (c >= p.C || q >= p.nq) { return; }
  let hw = p.gw / 2u; let i = q / hw; let j = q % hw;
  let a = x[((2u * i) * p.gw + 2u * j) * p.C + c];
  let b = x[((2u * i) * p.gw + 2u * j + 1u) * p.C + c];
  let d = x[((2u * i + 1u) * p.gw + 2u * j) * p.C + c];
  let e = x[((2u * i + 1u) * p.gw + 2u * j + 1u) * p.C + c];
  let cb = q * 4u * p.C;
  cat[cb + c] = a; cat[cb + p.C + c] = b; cat[cb + 2u * p.C + c] = d; cat[cb + 3u * p.C + c] = e;
  if (p.withMean == 1u) { mean[q * p.C + c] = (a + b + d + e) * 0.25; }
}`,
};

export class MiniCpmVVision {
  // read(off, len) → Uint8Array of the mmproj GGUF's bytes [off, off + len). size: the file's byte length.
  static async load(device, { read, onProgress = () => {} } = {}) {
    const head = await read(0, 8 << 20);
    const gguf = parseGguf(head);
    const v = new MiniCpmVVision(device, gguf);
    await v.upload(read, onProgress);
    return v;
  }

  // The mmproj kept in OPFS (localmind-ssd/<name>/mmproj.gguf, with a manifest naming its source so Settings → Models
  // lists it under the model): downloaded once in 64 MB ranges with fetchFn, each range committed, so an interrupted
  // download resumes. Then load() reads from the stored file.
  static async loadCached(device, { url, size, source = null, name, fetch: fetchFn = (u, i) => fetch(u, i), onProgress = () => {} } = {}) {
    const root = await navigator.storage.getDirectory();
    const dir = await (await root.getDirectoryHandle('localmind-ssd', { create: true })).getDirectoryHandle(name, { create: true });
    const fh = await dir.getFileHandle('mmproj.gguf', { create: true });
    let have = (await fh.getFile()).size;
    if (have > size) { const w = await fh.createWritable(); await w.truncate(0); await w.close(); have = 0; }
    const CH = 64 << 20;
    while (have < size) {
      const end = Math.min(size, have + CH) - 1;
      const r = await fetchFn(url, { headers: { Range: `bytes=${have}-${end}` } });
      if (r.status !== 206 && !(r.status === 200 && have === 0 && end === size - 1)) throw new Error(`vision weights: HTTP ${r.status} for bytes ${have}-${end}`);
      const buf = new Uint8Array(await r.arrayBuffer());
      if (buf.byteLength !== end - have + 1) throw new Error(`vision weights: got ${buf.byteLength} of ${end - have + 1} bytes`);
      const w = await fh.createWritable({ keepExistingData: true });
      await w.seek(have); await w.write(buf); await w.close();
      have += buf.byteLength;
      onProgress({ status: 'vision-download', loaded: have, total: size });
    }
    if (source) {
      const m = await dir.getFileHandle('manifest.json', { create: true }), w = await m.createWritable();
      await w.write(JSON.stringify({ source, file: 'mmproj.gguf', size })); await w.close();
    }
    const file = await fh.getFile();
    const read = async (off, len) => new Uint8Array(await file.slice(off, off + len).arrayBuffer());
    return MiniCpmVVision.load(device, { read, onProgress });
  }

  constructor(device, gguf) {
    const kv = gguf.kv || gguf.metadata;
    if (kv['clip.projector_type'] !== 'minicpmv4_7') throw new Error(`MiniCpmVVision needs a minicpmv4_7 mmproj, got ${kv['clip.projector_type']}`);
    this.device = device;
    this.gguf = gguf;
    this.cfg = {
      C: kv['clip.vision.embedding_length'], heads: kv['clip.vision.attention.head_count'], layers: kv['clip.vision.block_count'],
      patch: kv['clip.vision.patch_size'], eps: kv['clip.vision.attention.layer_norm_epsilon'],
      insert: kv['clip.vision.wa_layer_indexes'][0], imageSize: kv['clip.vision.image_size'],
      out: 0,
    };
    if (this.cfg.patch !== 14) throw new Error(`patch kernel assumes 14×14 patches, got ${this.cfg.patch}`);
    this.pipelines = {};
  }

  pipeline(name) {
    return (this.pipelines[name] ||= this.device.createComputePipeline({ layout: 'auto', compute: { module: this.device.createShaderModule({ code: K[name] }), entryPoint: 'main' } }));
  }
  bind(name, bufs) {
    return this.device.createBindGroup({ layout: this.pipeline(name).getBindGroupLayout(0), entries: bufs.map((b, i) => ({ binding: i, resource: { buffer: b } })) });
  }
  uniform(vals) {
    const ab = new ArrayBuffer(Math.max(16, Math.ceil(vals.length / 4) * 16)), u = new Uint32Array(ab), f = new Float32Array(ab);
    vals.forEach((x, i) => { if (typeof x === 'object') f[i] = x.f; else u[i] = x; });
    const b = this.device.createBuffer({ size: ab.byteLength, usage: UNIFORM | COPY_DST });
    this.device.queue.writeBuffer(b, 0, ab);
    (this.tmp ||= []).push(b);
    return b;
  }

  async upload(read, onProgress) {
    const dev = this.device, g = this.gguf;
    dev.pushErrorScope('validation');
    for (const k of Object.keys(K)) this.pipeline(k);
    const err = await dev.popErrorScope();
    if (err) throw new Error(`minicpmv vision WGSL: ${err.message}`);
    this.w = {};
    let done = 0, bytes = 0;
    for (const t of g.tensors) {
      const n = t.dims.reduce((a, b) => a * b, 1);
      if (t.type !== F32 && t.type !== BF16) throw new Error(`${t.name}: unsupported type ${t.type}`);
      const len = n * (t.type === F32 ? 4 : 2);
      const data = await read(g.dataStart + t.offset, len);
      if (data.byteLength !== len || len % 4) throw new Error(`${t.name}: read ${data.byteLength} of ${len} bytes`);
      const buf = dev.createBuffer({ size: len, usage: STORAGE | COPY_DST | COPY_SRC });
      dev.queue.writeBuffer(buf, 0, data);
      this.w[t.name] = buf;
      bytes += len; done++;
      onProgress({ status: 'vision-weights', loaded: done, total: g.tensors.length, bytes });
    }
    this.cfg.out = this.gguf.tensors.find((t) => t.name === 'mm.down.weight').dims[1];
    const sep = g.tensors.find((t) => t.name === 'v.tok_embd_sep');
    this.sepRows = sep ? sep.dims[1] : 0;
    this.gpuBytes = bytes;
    await dev.queue.onSubmittedWorkDone();
  }

  // The separator embeddings (`v.tok_embd_sep`, rows 0 = </image>, 1 = <slice>, 2 = </slice>, 3 = \n) as one Float32Array.
  async separators() {
    if (!this.sepRows) return null;
    return new Float32Array(await this.readback(this.w['v.tok_embd_sep'], this.sepRows * this.cfg.out));
  }

  // pixels: Float32Array, height × width × 3, as the encoder sees them (normalised). width and height must be
  // multiples of 56 (14-pixel patches, then two 2×2 merges). Returns a GPU buffer of tokens × out floats.
  async encode(pixels, width, height, { capture = null } = {}) {
    const dev = this.device, c = this.cfg, C = c.C, P = c.patch;
    if (width % (4 * P) || height % (4 * P)) throw new Error(`image ${width}×${height}: sides must be multiples of ${4 * P}`);
    const ph = height / P, pw = width / P, N = ph * pw, Nq = N / 4, No = N / 16, dh = C / c.heads;
    const dimOf = (name) => this.gguf.tensors.find((t) => t.name === name).dims[1];
    const FF = dimOf('v.blk.0.ffn_up.weight'), DF = dimOf('v.vit_merger.ds_ffn_up.weight'), UF = dimOf('mm.up.weight');
    const A = (n) => { const b = dev.createBuffer({ size: Math.max(16, n * 4), usage: STORAGE | COPY_SRC | COPY_DST }); this.tmp.push(b); return b; };
    this.tmp = [];
    const img = A(pixels.length); dev.queue.writeBuffer(img, 0, pixels);
    const x = A(N * C), h = A(N * C), q = A(N * C), k = A(N * C), v = A(N * C), att = A(N * C), o = A(N * C);
    const ff = A(Math.max(N * FF, Nq * DF, No * UF)), sc = A(c.heads * N * N);
    const cat = A(Nq * 4 * C), catN = A(Nq * 4 * C), mean = A(Nq * C), xq = A(Nq * C), out = dev.createBuffer({ size: No * c.out * 4, usage: STORAGE | COPY_SRC });
    const W = this.w;
    const enc = dev.createCommandEncoder();
    const run = (name, bufs, x1, y1 = 1, z1 = 1) => { const p = enc.beginComputePass(); p.setPipeline(this.pipeline(name)); p.setBindGroup(0, this.bind(name, bufs)); p.dispatchWorkgroups(x1, y1, z1); p.end(); };
    const flat = (n) => { const wg = Math.ceil(n / 256); const xw = Math.min(wg, 65535); return [xw, Math.ceil(wg / xw)]; };
    const ln = (src, dst, rows, n, pre) => run('layerNorm', [src, W[pre + '.weight'], W[pre + '.bias'], dst, this.uniform([n, { f: c.eps }])], rows);
    const lin = (src, dst, T, Kd, M, pre) => run('gemm', [src, W[pre + '.weight'], W[pre + '.bias'], dst, this.uniform([M, Kd, T, 0])], Math.ceil(M / 16), Math.ceil(T / 16));
    const add = (dst, src, n) => run('add', [dst, src, this.uniform([n])], ...flat(n));
    const gelu = (buf, n, kind) => run(kind, [buf, this.uniform([n])], ...flat(n));
    const snap = (name, buf, n) => { if (capture) { const r = dev.createBuffer({ size: n * 4, usage: COPY_DST | MAP_READ }); enc.copyBufferToBuffer(buf, 0, r, 0, n * 4); capture[name] = r; this.tmp.push(r); } };
    const dbg = (il, name, buf, n) => { if (il === 0 && capture && capture.layer0) snap('l0-' + name, buf, n); };
    const attention = (T, gridW, pre, win, il = -1) => {
      lin(h, q, T, C, C, pre + '.attn_q'); lin(h, k, T, C, C, pre + '.attn_k'); lin(h, v, T, C, C, pre + '.attn_v');
      dbg(il, 'h', h, T * C); dbg(il, 'q', q, T * C);
      run('scores', [q, k, sc, this.uniform([T, C, c.heads, dh, { f: 1 / Math.sqrt(dh) }, win ? 1 : 0, gridW, 0])], Math.ceil(T / 64), T, c.heads);
      run('softmax', [sc, this.uniform([T])], c.heads * T);
      run('attnOut', [sc, v, att, this.uniform([T, C, c.heads, dh])], Math.ceil(C / 64), T);
      dbg(il, 'att', att, T * C);
      lin(att, o, T, C, C, pre + '.attn_out');
      add(x, o, T * C);
      dbg(il, 'x1', x, T * C);
    };
    const layer = (il, T, gridW) => {
      const pre = `v.blk.${il}`;
      ln(x, h, T, C, pre + '.ln1');
      attention(T, gridW, pre, false, il);
      ln(x, h, T, C, pre + '.ln2');
      lin(h, ff, T, C, FF, pre + '.ffn_up'); dbg(il, 'u', ff, T * FF);
      gelu(ff, T * FF, 'geluTanh'); lin(ff, o, T, FF, C, pre + '.ffn_down');
      add(x, o, T * C);
      dbg(il, 'x2', x, T * C);
    };

    run('patch', [img, W['v.patch_embd.weight'], W['v.patch_embd.bias'], W['v.position_embd.weight'], x, this.uniform([ph, pw, C, width])], Math.ceil(C / 64), N);
    snap('patch', x, N * C);
    for (let il = 0; il <= c.insert; il++) layer(il, N, pw);
    snap(`l${c.insert}`, x, N * C);
    // merger: window attention over 2×2 windows, then the 2×2 downsample (tanh-GELU MLP + mean)
    ln(x, h, N, C, 'v.vit_merger.ln1');
    attention(N, pw, 'v.vit_merger', true);
    snap('merger_attn', x, N * C);
    run('gather', [x, cat, mean, this.uniform([pw, C, Nq, 1])], Math.ceil(C / 64), Nq);
    ln(cat, catN, Nq, 4 * C, 'v.vit_merger.ds_ln');
    lin(catN, ff, Nq, 4 * C, DF, 'v.vit_merger.ds_ffn_up'); gelu(ff, Nq * DF, 'geluTanh');
    lin(ff, xq, Nq, DF, C, 'v.vit_merger.ds_ffn_down');
    add(xq, mean, Nq * C);
    enc.copyBufferToBuffer(xq, 0, x, 0, Nq * C * 4);
    snap('ds', x, Nq * C);
    for (let il = c.insert + 1; il < c.layers; il++) layer(il, Nq, pw / 2);
    snap('last', x, Nq * C);
    ln(x, h, Nq, C, 'v.post_ln');
    snap('post_ln', h, Nq * C);
    // final merger: 2×2 concat on the half grid → LayerNorm → erf-GELU MLP → out
    run('gather', [h, cat, mean, this.uniform([pw / 2, C, No, 0])], Math.ceil(C / 64), No);
    ln(cat, catN, No, 4 * C, 'mm.input_norm');
    lin(catN, ff, No, 4 * C, UF, 'mm.up'); gelu(ff, No * UF, 'geluErf');
    lin(ff, out, No, UF, c.out, 'mm.down');
    dev.queue.submit([enc.finish()]);
    await dev.queue.onSubmittedWorkDone();
    if (capture) for (const [name, b] of Object.entries(capture)) { if (!(b instanceof GPUBuffer)) continue; await b.mapAsync(1); capture[name] = new Float32Array(b.getMappedRange().slice(0)); b.unmap(); }
    for (const b of this.tmp) b.destroy();
    this.tmp = [];
    return { tokens: No, dim: c.out, buffer: out };
  }

  async readback(buffer, n) {
    const dev = this.device, r = dev.createBuffer({ size: n * 4, usage: COPY_DST | MAP_READ });
    const enc = dev.createCommandEncoder(); enc.copyBufferToBuffer(buffer, 0, r, 0, n * 4); dev.queue.submit([enc.finish()]);
    await r.mapAsync(1); const a = new Float32Array(r.getMappedRange().slice(0)); r.unmap(); r.destroy();
    return a;
  }

  dispose() { for (const b of Object.values(this.w || {})) b.destroy(); this.w = null; }
}
