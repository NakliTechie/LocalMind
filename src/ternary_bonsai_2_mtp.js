/* ternary_bonsai_2_mtp.js — MTP (multi-token prediction) speculative decoding for the vendored Ternary Bonsai 2
   engine (ternary_bonsai_2_27b.js), behind the same specDecodeRunner() seam the DFlash 2 runner uses.

   The draft head is ProCreations' r3 MTP block for Ternary Bonsai 2 27B (one Qwen3.5 full-attention decoder layer
   + its own norms, Q8_0, 451 MB), as grafted into CaryPalmer/Ternary-Bonsai-2-27B-262k-GGUF (Apache-2.0). That file
   is the PTQ1_0 trunk LocalMind already loads plus the head block appended at its end, so the app range-reads only
   the head's bytes (and the trunk's 20 KB output_norm) from it: MTP_HEAD below pins the revision, the file size and
   every tensor's offset, so no GGUF header (11 MB of tokenizer) is downloaded.

   Graph (llama.cpp PrismML `prism` branch, src/models/qwen35.cpp graph_mtp; trunk side `h_nextn`):
     h  = output_norm(trunk final hidden at position p-1)            (the trunk's normed last-layer output)
     e  = token_embd(x_p), Hadamard-inverted to the plain basis      (the engine's own embed op + inverse rotation)
     x  = eh_proj([enorm(e) ; hnorm(h)])
     x += attn_output(attention(attn_norm(x)) * sigmoid(gate))      (24 q heads x 256, 4 kv heads, q/k RMS norm,
                                                                       NEOX RoPE on 64 dims, theta 1e7, own KV cache)
     x += ffn_down(silu(ffn_gate(n)) * ffn_up(n)), n = post_attention_norm(x)
     h' = shared_head_norm(x); draft = argmax(lm_head(h'))          (the trunk's lm_head, Hadamard-rotated input)
   Depth N chains the head: the next step takes the draft token and h' (llama.cpp `draft-mtp`). The head's KV cache
   row at position p holds the pair (x_p, h_{p-1}); after each verify the accepted rows are re-run with the trunk's
   own h so the cache matches what llama.cpp keeps.

   Output is greedy-identical to the engine's own decode: every emitted token is the trunk's argmax from the batched
   verify pass, drafts only decide how many verify rows are accepted per cycle. */

const MTP_HEAD = {
  url: 'https://huggingface.co/CaryPalmer/Ternary-Bonsai-2-27B-262k-GGUF/resolve/9f9b92cd8229cb13e473ca3d11055c3f60276508/Ternary-Bonsai-2-27B-PTQ1_0-mtp-procreations.gguf',
  fileSize: 6397970272,
  // [absolute offset, length]: the trunk's output_norm.weight, then the whole blk.64 head block (to end of file)
  ranges: [[289240928, 20480], [5946650464, 451319808]],
  bytes: 20480 + 451319808,
  // name: [absolute offset, ggml type (0 F32, 8 Q8_0), ne0 (K), ne1 (N)]
  tensors: {
    output_norm: [289240928, 0, 5120, 1],
    eh_proj: [5946650464, 8, 10240, 5120],
    attn_norm: [6002356064, 0, 5120, 1],
    ffn_down: [6002376544, 8, 17408, 5120],
    ffn_gate: [6097076064, 8, 5120, 17408],
    ffn_up: [6191775584, 8, 5120, 17408],
    post_attention_norm: [6286475104, 0, 5120, 1],
    attn_k_norm: [6286495584, 0, 256, 1],
    attn_k: [6286496608, 8, 5120, 1024],
    attn_output: [6292067168, 8, 6144, 5120],
    attn_q_norm: [6325490528, 0, 256, 1],
    attn_q: [6325491552, 8, 5120, 12288],
    attn_v: [6392338272, 8, 5120, 1024],
    shared_head_norm: [6397908832, 0, 5120, 1],
    enorm: [6397929312, 0, 5120, 1],
    hnorm: [6397949792, 0, 5120, 1],
  },
};
const MCFG = { H: 5120, I: 17408, NH: 24, NKV: 4, HD: 256, ROT: 64, THETA: 1e7, EPS: 1e-6, VOCAB: 248320, MAXM: 8 };

// ---------------- WGSL ----------------
// Y[m, n] (+)= sum_k X[m, k] * W[n, k]; W is Q8_0 repacked at load: 32 int8 per block as 8 u32 (two vec4<u32>), the
// block scales as f16 pairs. 256 threads = 8 output rows x 32 lanes striding over the K blocks; M rows of X per call.
const WG_Q8 = (M) => /* wgsl */`
struct P { K: u32, N: u32, nb: u32, acc: u32 };
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> X: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> Wq: array<vec4<u32>>;
@group(0) @binding(3) var<storage, read> Ws: array<u32>;
@group(0) @binding(4) var<storage, read_write> Y: array<f32>;
const M: u32 = ${M}u;
var<workgroup> red: array<f32, ${256 * M}>;
fn i8x4(w: u32) -> vec4<f32> { return vec4<f32>(unpack4xI8(w)); }
@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let tid = lid.x; let lane = tid & 31u; let n = wg.x * 8u + (tid >> 5u);
  var acc: array<f32, ${M}>;
  for (var m = 0u; m < M; m++) { acc[m] = 0.0; }
  if (n < p.N) {
    let K4 = p.K >> 2u;
    for (var b = lane; b < p.nb; b += 32u) {
      let blk = n * p.nb + b;
      let q0 = Wq[blk * 2u]; let q1 = Wq[blk * 2u + 1u];
      let s = unpack2x16float(Ws[blk >> 1u])[blk & 1u];
      let w0 = i8x4(q0.x); let w1 = i8x4(q0.y); let w2 = i8x4(q0.z); let w3 = i8x4(q0.w);
      let w4 = i8x4(q1.x); let w5 = i8x4(q1.y); let w6 = i8x4(q1.z); let w7 = i8x4(q1.w);
      for (var m = 0u; m < M; m++) {
        let xb = m * K4 + b * 8u;
        let d = dot(w0, X[xb]) + dot(w1, X[xb + 1u]) + dot(w2, X[xb + 2u]) + dot(w3, X[xb + 3u])
              + dot(w4, X[xb + 4u]) + dot(w5, X[xb + 5u]) + dot(w6, X[xb + 6u]) + dot(w7, X[xb + 7u]);
        acc[m] += s * d;
      }
    }
  }
  for (var m = 0u; m < M; m++) { red[m * 256u + tid] = acc[m]; }
  workgroupBarrier();
  for (var o = 16u; o > 0u; o >>= 1u) {
    if (lane < o) { for (var m = 0u; m < M; m++) { red[m * 256u + tid] += red[m * 256u + tid + o]; } }
    workgroupBarrier();
  }
  if (lane == 0u && n < p.N) {
    for (var m = 0u; m < M; m++) {
      let v = red[m * 256u + tid];
      if (p.acc == 1u) { Y[m * p.N + n] += v; } else { Y[m * p.N + n] = v; }
    }
  }
}`;

// RMS norm with a weight, strided rows: Y[r*os + oo + i] = X[r*is + io + i] * rsqrt(mean(x^2) + eps) * W[i]
const WG_NORM = /* wgsl */`
struct P { D: u32, is: u32, io: u32, os: u32, oo: u32, eps: f32, pad0: u32, pad1: u32 };
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> X: array<f32>;
@group(0) @binding(2) var<storage, read> W: array<f32>;
@group(0) @binding(3) var<storage, read_write> Y: array<f32>;
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let r = wg.x; let tid = lid.x; let ib = r * p.is + p.io; let ob = r * p.os + p.oo;
  var s = 0.0;
  for (var i = tid; i < p.D; i += 256u) { let v = X[ib + i]; s += v * v; }
  red[tid] = s; workgroupBarrier();
  for (var o = 128u; o > 0u; o >>= 1u) { if (tid < o) { red[tid] += red[tid + o]; } workgroupBarrier(); }
  let inv = inverseSqrt(red[0] / f32(p.D) + p.eps);
  for (var i = tid; i < p.D; i += 256u) { Y[ob + i] = X[ib + i] * inv * W[i]; }
}`;

// Per-head q/k RMS norm + NEOX RoPE (pairs i, i+32 over the first 64 dims, freq theta^(-2i/64), position pos0+m), and
// the K/V cache write at that position. Workgroup (m, j): j < 24 a q head, 24..27 a k head, 28..31 a v head.
const WG_QKPREP = /* wgsl */`
struct P { pos0: u32, pad0: u32, pad1: u32, pad2: u32, theta: f32, eps: f32, pad3: f32, pad4: f32 };
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> Qf: array<f32>;
@group(0) @binding(2) var<storage, read> Kt: array<f32>;
@group(0) @binding(3) var<storage, read> Vt: array<f32>;
@group(0) @binding(4) var<storage, read> QN: array<f32>;
@group(0) @binding(5) var<storage, read> KN: array<f32>;
@group(0) @binding(6) var<storage, read_write> Q: array<f32>;
@group(0) @binding(7) var<storage, read_write> Kc: array<f32>;
@group(0) @binding(8) var<storage, read_write> Vc: array<f32>;
var<workgroup> red: array<f32, 256>;
var<workgroup> sh: array<f32, 256>;
@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let m = wg.x; let j = wg.y; let tid = lid.x; let pos = p.pos0 + m;
  if (j >= 28u) { Vc[pos * 1024u + (j - 28u) * 256u + tid] = Vt[m * 1024u + (j - 28u) * 256u + tid]; return; }
  var x = 0.0; var w = 0.0;
  if (j < 24u) { x = Qf[m * 12288u + j * 512u + tid]; w = QN[tid]; } else { x = Kt[m * 1024u + (j - 24u) * 256u + tid]; w = KN[tid]; }
  red[tid] = x * x; workgroupBarrier();
  for (var o = 128u; o > 0u; o >>= 1u) { if (tid < o) { red[tid] += red[tid + o]; } workgroupBarrier(); }
  let y = x * inverseSqrt(red[0] / 256.0 + p.eps) * w;
  sh[tid] = y; workgroupBarrier();
  var outv = y;
  if (tid < 64u) {
    let i = tid & 31u;
    let ang = f32(pos) * exp(-f32(2u * i) / 64.0 * log(p.theta));
    let c = cos(ang); let s = sin(ang);
    if (tid < 32u) { outv = y * c - sh[tid + 32u] * s; } else { outv = sh[tid - 32u] * s + y * c; }
  }
  if (j < 24u) { Q[(m * 24u + j) * 256u + tid] = outv; } else { Kc[pos * 1024u + (j - 24u) * 256u + tid] = outv; }
}`;

// Causal attention over the head's own KV cache, keys kvLo..pos0+m, online softmax in 256-key tiles; output gated by
// sigmoid(gate) (the second half of each q head's 512-wide slice). Workgroup (m, h), thread = output dim.
const WG_ATTN = /* wgsl */`
struct P { pos0: u32, kvLo: u32, pad0: u32, pad1: u32, scale: f32, pad2: f32, pad3: f32, pad4: f32 };
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> Q: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> Kc: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> Vc: array<f32>;
@group(0) @binding(4) var<storage, read> Qf: array<f32>;
@group(0) @binding(5) var<storage, read_write> O: array<f32>;
var<workgroup> q: array<vec4<f32>, 64>;
var<workgroup> sc: array<f32, 256>;
var<workgroup> red: array<f32, 256>;
@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let m = wg.x; let h = wg.y; let tid = lid.x; let kvh = h / 6u; let qpos = p.pos0 + m;
  if (tid < 64u) { q[tid] = Q[(m * 24u + h) * 64u + tid]; }
  workgroupBarrier();
  var mx = -1e30; var l = 0.0; var acc = 0.0;
  for (var t0 = p.kvLo; t0 <= qpos; t0 += 256u) {
    let jk = t0 + tid;
    var s = -1e30;
    if (jk <= qpos) {
      let kb = (jk * 4u + kvh) * 64u;
      var d = 0.0;
      for (var e = 0u; e < 64u; e++) { d += dot(q[e], Kc[kb + e]); }
      s = d * p.scale;
    }
    red[tid] = s; workgroupBarrier();
    for (var o = 128u; o > 0u; o >>= 1u) { if (tid < o) { red[tid] = max(red[tid], red[tid + o]); } workgroupBarrier(); }
    let nm = max(mx, red[0]); workgroupBarrier();
    let pj = select(0.0, exp(s - nm), jk <= qpos);
    sc[tid] = pj; red[tid] = pj; workgroupBarrier();
    for (var o = 128u; o > 0u; o >>= 1u) { if (tid < o) { red[tid] += red[tid + o]; } workgroupBarrier(); }
    let corr = exp(mx - nm);
    l = l * corr + red[0]; acc = acc * corr;
    let cnt = min(256u, qpos - t0 + 1u);
    for (var jj = 0u; jj < cnt; jj++) { acc += sc[jj] * Vc[((t0 + jj) * 4u + kvh) * 256u + tid]; }
    mx = nm;
    workgroupBarrier();
  }
  let g = Qf[m * 12288u + h * 512u + 256u + tid];
  O[m * 6144u + h * 256u + tid] = acc / l * (1.0 / (1.0 + exp(-g)));
}`;

const WG_SILU_MUL = /* wgsl */`
struct P { n: u32, pad0: u32, pad1: u32, pad2: u32 };
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> U: array<f32>;
@group(0) @binding(2) var<storage, read_write> G: array<f32>;
@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x; if (i >= p.n) { return; }
  let g = G[i]; G[i] = g / (1.0 + exp(-g)) * U[i];
}`;

// ---------------- the head ----------------
// Weights on the GPU, the KV cache, and one forward pass over M <= 8 rows at consecutive positions.
class MTPHead {
  constructor(dev, opts = {}) {
    this.dev = dev; this.log = opts.log || (() => {});
    this.stats = { weightBytes: 0, passes: 0, rows: 0 };
    this.buf = {}; this.w = {}; this.uni = []; this.pipes = {};
  }

  // source(absOffset, length) -> Promise<Uint8Array>: bytes of the grafted GGUF (or of any file with MTP_HEAD's layout)
  async loadWeights(source, onProgress = () => {}) {
    const { dev } = this; const S = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;
    let done = 0; const total = MTP_HEAD.bytes;
    for (const [name, [off, type, K, N]] of Object.entries(MTP_HEAD.tensors)) {
      if (type === 0) {
        const raw = await source(off, K * 4); if (raw.byteLength !== K * 4) throw new Error(`MTP head: short read for ${name}`);
        const b = dev.createBuffer({ size: K * 4, usage: S, label: 'mtp.' + name }); dev.queue.writeBuffer(b, 0, raw); this.w[name] = b; done += K * 4;
      } else if (type === 8) {
        const nb = K / 32; if (nb % 2) throw new Error(`MTP head: ${name} has an odd block count`);
        const wq = dev.createBuffer({ size: N * nb * 32, usage: S, label: 'mtp.' + name + '.q' });
        const ws = dev.createBuffer({ size: N * nb * 2, usage: S, label: 'mtp.' + name + '.s' });
        const ROWS = 512;
        for (let r0 = 0; r0 < N; r0 += ROWS) {
          const rows = Math.min(ROWS, N - r0), len = rows * nb * 34;
          const raw = await source(off + r0 * nb * 34, len); if (raw.byteLength !== len) throw new Error(`MTP head: short read for ${name}`);
          const q = new Uint8Array(rows * nb * 32), s = new Uint16Array(rows * nb);
          for (let b = 0; b < rows * nb; ++b) { const o = b * 34; s[b] = raw[o] | (raw[o + 1] << 8); q.set(raw.subarray(o + 2, o + 34), b * 32); }
          dev.queue.writeBuffer(wq, r0 * nb * 32, q); dev.queue.writeBuffer(ws, r0 * nb * 2, s);
          done += len; onProgress({ done, total });
        }
        this.w[name] = { q: wq, s: ws, K, N, nb };
        this.stats.weightBytes += N * nb * 34;
      } else throw new Error(`MTP head: unexpected type ${type} for ${name}`);
    }
    onProgress({ done: total, total });
  }

  // Activation buffers + pipelines; kvCap = cache rows (positions) the head's KV cache holds.
  async init(kvCap) {
    const { dev } = this; const { H, I, MAXM } = MCFG;
    const S = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;
    const mk = (name, floats) => { this.buf[name] = dev.createBuffer({ size: floats * 4, usage: S, label: 'mtp.' + name }); };
    mk('E', MAXM * H); mk('Hn', MAXM * H); mk('Hraw', MAXM * H); mk('Xc', MAXM * 2 * H); mk('X', MAXM * H); mk('A', MAXM * H);
    mk('Qf', MAXM * 12288); mk('Kt', MAXM * 1024); mk('Vt', MAXM * 1024); mk('Q', MAXM * 6144); mk('O', MAXM * 6144);
    mk('F1', MAXM * I); mk('F2', MAXM * I); mk('Hout', MAXM * H); mk('Hlast', H); mk('zero', H);
    const maxBind = dev.limits.maxStorageBufferBindingSize;
    this.kvCap = Math.min(kvCap, Math.floor(maxBind / 4096));
    mk('Kc', this.kvCap * 1024); mk('Vc', this.kvCap * 1024);
    const compile = async (code, label) => {
      const mod = dev.createShaderModule({ code, label });
      const info = await mod.getCompilationInfo(); const errs = info.messages.filter((x) => x.type === 'error');
      if (errs.length) throw new Error(`MTP ${label} WGSL: ${errs.map((x) => x.message).join('; ')}`);
      return dev.createComputePipeline({ layout: 'auto', compute: { module: mod, entryPoint: 'main' }, label });
    };
    for (let M = 1; M <= MAXM; ++M) this.pipes['q8_' + M] = await compile(WG_Q8(M), 'q8_' + M);
    this.pipes.norm = await compile(WG_NORM, 'norm');
    this.pipes.qk = await compile(WG_QKPREP, 'qkprep');
    this.pipes.attn = await compile(WG_ATTN, 'attn');
    this.pipes.silu = await compile(WG_SILU_MUL, 'silu');
    this.uniPool = []; this.uniUsed = 0;
  }

  #uniform(data) {
    if (this.uniUsed >= this.uniPool.length) this.uniPool.push(this.dev.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }));
    const u = this.uniPool[this.uniUsed++]; this.dev.queue.writeBuffer(u, 0, data); return u;
  }
  #bind(pipe, bufs) { return this.dev.createBindGroup({ layout: pipe.getBindGroupLayout(0), entries: bufs.map((b, i) => ({ binding: i, resource: { buffer: b } })) }); }
  #dispatch(pass, pipe, bufs, x, y = 1) { pass.setPipeline(pipe); pass.setBindGroup(0, this.#bind(pipe, bufs)); pass.dispatchWorkgroups(x, y); }

  #norm(pass, rows, D, X, is, io, W, Y, os, oo) {
    const u = new ArrayBuffer(32); const v = new Uint32Array(u); v.set([D, is, io, os, oo]); new Float32Array(u)[5] = MCFG.EPS;
    this.#dispatch(pass, this.pipes.norm, [this.#uniform(u), X, W, Y], rows);
  }
  #q8(pass, M, wname, X, Y, acc = 0) {
    const t = this.w[wname];
    this.#dispatch(pass, this.pipes['q8_' + M], [this.#uniform(new Uint32Array([t.K, t.N, t.nb, acc])), X, t.q, t.s, Y], Math.ceil(t.N / 8));
  }

  // Normalize M raw trunk rows (src buffer region) with output_norm into Hn rows [dst, dst+M).
  normTrunkRows(src, srcOffset, M, dst) {
    const { dev, buf } = this; const H = MCFG.H; this.uniUsed = 0;
    const e = dev.createCommandEncoder();
    e.copyBufferToBuffer(src, srcOffset, buf.Hraw, 0, M * H * 4);
    const pass = e.beginComputePass();
    this.#norm(pass, M, H, buf.Hraw, H, 0, this.w.output_norm, buf.Hn, H, dst * H);
    pass.end(); dev.queue.submit([e.finish()]);
  }
  // Copy one normed row into Hn[dst] (from Hlast, Hout[row] or zero).
  setHnRow(dst, srcBuf, srcRow = 0) {
    const e = this.dev.createCommandEncoder(); e.copyBufferToBuffer(srcBuf, srcRow * MCFG.H * 4, this.buf.Hn, dst * MCFG.H * 4, MCFG.H * 4); this.dev.queue.submit([e.finish()]);
  }
  saveLast(srcBuf, srcRow) {
    const e = this.dev.createCommandEncoder(); e.copyBufferToBuffer(srcBuf, srcRow * MCFG.H * 4, this.buf.Hlast, 0, MCFG.H * 4); this.dev.queue.submit([e.finish()]);
  }

  // One forward over M rows at positions pos0..pos0+M-1. Inputs: embeddings of the M tokens at embed (GPU buffer,
  // row-major [>=M, H]) and Hn[0..M) (normed trunk/head h of each row's previous position). Writes KV rows, leaves
  // shared_head_norm(x) in Hout[0..M).
  forward(embed, embedOffset, M, pos0, kvLo) {
    const { dev, buf, w } = this; const { H, I } = MCFG;
    if (M < 1 || M > MCFG.MAXM) throw new Error(`MTP forward: ${M} rows`);
    if (pos0 + M > this.kvCap) throw new Error(`MTP forward: position ${pos0 + M} beyond the head's KV cache (${this.kvCap})`);
    this.uniUsed = 0;
    const e = dev.createCommandEncoder();
    e.copyBufferToBuffer(embed, embedOffset, buf.E, 0, M * H * 4);
    const pass = e.beginComputePass();
    this.#norm(pass, M, H, buf.E, H, 0, w.enorm, buf.Xc, 2 * H, 0);
    this.#norm(pass, M, H, buf.Hn, H, 0, w.hnorm, buf.Xc, 2 * H, H);
    this.#q8(pass, M, 'eh_proj', buf.Xc, buf.X);
    this.#norm(pass, M, H, buf.X, H, 0, w.attn_norm, buf.A, H, 0);
    this.#q8(pass, M, 'attn_q', buf.A, buf.Qf); this.#q8(pass, M, 'attn_k', buf.A, buf.Kt); this.#q8(pass, M, 'attn_v', buf.A, buf.Vt);
    const qu = new ArrayBuffer(32); new Uint32Array(qu)[0] = pos0; const qf = new Float32Array(qu); qf[4] = MCFG.THETA; qf[5] = MCFG.EPS;
    this.#dispatch(pass, this.pipes.qk, [this.#uniform(qu), buf.Qf, buf.Kt, buf.Vt, w.attn_q_norm, w.attn_k_norm, buf.Q, buf.Kc, buf.Vc], M, 32);
    const au = new ArrayBuffer(32); new Uint32Array(au).set([pos0, kvLo]); new Float32Array(au)[4] = 1 / Math.sqrt(MCFG.HD);
    this.#dispatch(pass, this.pipes.attn, [this.#uniform(au), buf.Q, buf.Kc, buf.Vc, buf.Qf, buf.O], M, 24);
    this.#q8(pass, M, 'attn_output', buf.O, buf.X, 1);
    this.#norm(pass, M, H, buf.X, H, 0, w.post_attention_norm, buf.A, H, 0);
    this.#q8(pass, M, 'ffn_gate', buf.A, buf.F1); this.#q8(pass, M, 'ffn_up', buf.A, buf.F2);
    this.#dispatch(pass, this.pipes.silu, [this.#uniform(new Uint32Array([M * I, 0, 0, 0])), buf.F2, buf.F1], Math.ceil(M * I / 256));
    this.#q8(pass, M, 'ffn_down', buf.F1, buf.X, 1);
    this.#norm(pass, M, H, buf.X, H, 0, w.shared_head_norm, buf.Hout, H, 0);
    pass.end(); dev.queue.submit([e.finish()]);
    this.stats.passes++; this.stats.rows += M;
  }

  dispose() {
    for (const b of Object.values(this.buf)) { try { b.destroy(); } catch (_) {} }
    for (const t of Object.values(this.w)) { try { if (t.q) { t.q.destroy(); t.s.destroy(); } else t.destroy(); } catch (_) {} }
    for (const u of this.uniPool || []) { try { u.destroy(); } catch (_) {} }
    this.buf = {}; this.w = {};
  }
}

// ---------------- the runner ----------------
const MTP_PREFILL_BLOCKS = [16, 32, 64, 128, 256, 512];

class MTPRunner {
  static async create(engine, opts = {}) {
    const r = new MTPRunner(engine, opts);
    await r.#init(opts);
    const cache = engine.generationState?.cache;
    if (cache) await r.#resources(cache);
    return r;
  }

  constructor(engine, opts) {
    this.engine = engine; this.inner = engine.model; this.rt = this.inner.runtime; this.dev = this.rt.host.device; this.cfg = this.inner.config;
    this.I = engine.constructor.__dflashInternals;
    if (!this.I || !this.I.lh || !this.I.ch || !this.I.RewindSession) throw new Error('MTPRunner: engine is missing the dflash internals hook (regenerate ternary_bonsai_2_27b.js)');
    this.depth = opts.depth ?? 2;
    if (!(this.depth >= 1 && this.depth <= MCFG.MAXM - 1)) throw new Error(`MTPRunner: depth must be 1..${MCFG.MAXM - 1}`);
    this.window = opts.window ?? 1024;   // prompt rows (the tail of each prefill) fed to the head's KV cache
    this.smallM = opts.smallM === 'off' ? undefined : { precision: opts.smallM ?? 'f16' };
    this.log = opts.log || (() => {});
    this.H = this.cfg.hidden_size; this.VOC = this.cfg.vocab_size;
    if (this.H !== MCFG.H || this.VOC !== MCFG.VOCAB) throw new Error(`MTPRunner: target H/V ${this.H}/${this.VOC} != head ${MCFG.H}/${MCFG.VOCAB}`);
    this.res = new Map();
    this.stats = { cycles: 0, tokens: 0, accepted: 0, drafted: 0, generations: 0 };
    this.disposed = false;
  }

  async #init(opts) {
    const { I, inner, H, VOC } = this;
    this.head = new MTPHead(this.dev, { log: this.log });
    await this.head.loadWeights(opts.head, opts.onProgress || (() => {}));
    class Micro extends I.f0 { constructor(emit) { super(inner, null, 8); this._emit = emit; } buildEmission() { return this._emit(); } }
    const micro = async (name, emit) => { const s = new Micro(() => { const S = new I.ba(); const b = I._i(S); const t = emit(S, b); return { graph: S.finish({ name }), weights: b.boundWeights, states: b.states, ...t }; }); await s.build(); return s; };
    // token embedding in the plain basis: LlamaEmbed + inverse Hadamard (what the prefill prologue emits)
    this.embedS = await micro('mtp-embed', (S, b) => {
      const re = b.w; const ids = S.stepInput('input_ids', 'uint32', [8]); const hid = S.scratch('embed.hidden', 'float32', [8, H]); let h;
      if (inner.embedBits && inner.embedScales) h = S.op('com.xenova.LlamaEmbed', { inputT: ids, bitsT: re('embed.bits', inner.embedBits), scalesT: re('embed.scales', inner.embedScales), hiddenT: hid }, { args: { hiddenSize: H, vocabSize: VOC, seqLen: 8, format: inner.embedFormat ?? 'q8_rows' } }).hiddenT;
      else { const ke = I.pi(re, inner)('top'); h = S.op('com.xenova.LlamaEmbed', { inputT: ids, weightsT: ke, hiddenT: hid }, { args: { embedOffset: inner.offsets.top.embed_tokens, hiddenSize: H, vocabSize: VOC, seqLen: 8 } }).hiddenT; }
      h = I.bi(S, inner, re)(h, 'embed_tokens', true); S.output(h, 'embed'); return {};
    });
    const embedT = this.embedS.compiled.tensor('embed'); this.embedBuf = embedT.buffer; this.embedOff = embedT.byteOffset ?? 0;
    this.embedIds = this.embedS.compiled.tensor('input_ids');
    // the trunk's lm_head on one row: Hadamard rotation + Lut2SmallMGemm (M = 1) + GPU argmax
    if (!(inner.lmHeadQ4 && inner.lmHeadQ4Scales && inner.lmHeadLut === 9 && this.cfg.prismHadamard?.weights.includes('output.weight'))) throw new Error('MTPRunner: expected a prism-rotated lut2 lm_head (lmHeadLut 9)');
    const prec = (this.smallM && this.smallM.precision) || 'f16';
    this.headS = await micro('mtp-head', (S, b) => {
      const re = b.w; const x = S.stepInput('hid', 'float32', [1, H]); const rot = I.bi(S, inner, re)(x, 'lm_head'); const lg = S.scratch('logits', 'float32', [1, VOC]);
      S.op('com.xenova.Lut2SmallMGemm', { aT: S.view(rot, 0, 'float32', [1, H], 'head.in'), bitsT: re('head.bits', inner.lmHeadQ4), scalesT: re('head.scales', inner.lmHeadQ4Scales), yT: lg }, { args: { M: 1, inFeatures: H, outFeatures: VOC, blockOffset: 0, outStride: VOC, dstColStart: 0, lut: 9, precision: prec, kSplits: 1 } });
      const am = S.op('ai.onnx.ArgMax', { x: lg }, { attrs: { axis: 1, keepdims: 0 } }).y;
      S.output(am, 'argmax'); return {};
    });
    this.headIn = this.headS.compiled.tensor('hid'); this.headArg = this.headS.compiled.tensor('argmax');
    this.log(`MTPRunner ready: depth ${this.depth}, head ${(this.head.stats.weightBytes / 1e6).toFixed(0)} MB on GPU`);
  }

  async #resources(cache) {
    let r = this.res.get(cache); if (r) return r;
    const { I, inner, smallM } = this; const LV = this.depth + 1;
    if (!this.head.kvCap) await this.head.init(cache.maxLength + 8);
    const sessions = new Map();
    const session = async (T, opts) => { const key = T + (opts.allRowsHead ? 'v' : 'p'); let s = sessions.get(key); if (s) return s; class S extends I.ch { buildEmission() { return I.lh(this.model, this.cache, this.blockLen, opts); } } s = new S(inner, cache, T); await s.build(); sessions.set(key, s); return s; };
    const verify = await session(LV, { allRowsHead: true, ...(smallM ? { smallM } : {}), teeRecurrence: true, finalHidden: true });
    const prefill = (T) => session(T, { finalHidden: true });
    await prefill(16); await prefill(512);
    const rewind = new I.RewindSession(inner, cache, LV, verify); await rewind.build();
    const slot = await cache.allocateCheckpointSlot();
    // head KV bookkeeping: rows [kvLo, valid) of the head's KV cache are correct; hLastPos = the position whose
    // (token, h) pair Hlast completes (Hlast = normed trunk h at hLastPos - 1)
    r = { sessions, verify, prefill, rewind, slot, kvLo: 0, valid: 0, hLastPos: -1 }; this.res.set(cache, r); return r;
  }

  // Change the draft depth; per-cache sessions (sized depth + 1) are rebuilt on the next generate.
  setDepth(depth) {
    if (!(depth >= 1 && depth <= MCFG.MAXM - 1)) throw new Error(`MTPRunner: depth must be 1..${MCFG.MAXM - 1}`);
    if (depth === this.depth) return;
    for (const cache of [...this.res.keys()]) this.release(cache);
    this.depth = depth;
  }

  // Self-check of the trunk-hidden route: output_norm + the shared lm_head over the last verify run's row 0 must give
  // the verify graph's own token for that row.
  async checkTrunkHidden(cache) {
    const r = this.res.get(cache); if (!r) return null;
    const ht = r.verify.compiled.tensor('mtp.hidden');
    const vt = Array.from(await this.rt.readTensor(r.verify.compiled.tensor('verify_tokens')));
    const got = [];
    for (let j = 0; j < this.depth + 1; ++j) {
      this.head.normTrunkRows(ht.buffer, (ht.byteOffset ?? 0) + j * this.H * 4, 1, 0);
      const e = this.dev.createCommandEncoder(); e.copyBufferToBuffer(this.head.buf.Hn, 0, this.headIn.buffer, this.headIn.byteOffset ?? 0, this.H * 4); this.dev.queue.submit([e.finish()]);
      this.headS.compiled.collector.enqueue(this.headS.steps);
      got.push((await this.rt.readTensor(this.headArg))[0]);
    }
    return { verifyTokens: vt, fromHidden: got, match: got.every((t, j) => t === vt[j]) };
  }

  release(cache) {
    const r = this.res.get(cache); if (!r) return; this.res.delete(cache);
    for (const s of r.sessions.values()) { try { s.dispose(); } catch (_) {} }
    try { r.rewind.dispose(); } catch (_) {}
    try { this.I.r2(r.slot.storage); } catch (_) {}
  }

  dispose() {
    if (this.disposed) return; this.disposed = true;
    for (const cache of [...this.res.keys()]) this.release(cache);
    try { this.embedS.dispose(); } catch (_) {}
    try { this.headS.dispose(); } catch (_) {}
    try { this.head.dispose(); } catch (_) {}
  }

  // run ids (1..T) through a session at past_len = cache.seqLength; advances the cache
  async #runBlock(r, s, ids) {
    const T = ids.length; const pos = r.cache.seqLength;
    const next = await s.run(new Uint32Array(ids), pos); r.cache.seqLength = pos + T;
    const ht = s.compiled.tensor('mtp.hidden');
    return { next, pos, hidden: { buffer: ht.buffer, offset: ht.byteOffset ?? 0 }, tokens: () => this.rt.readTensor(s.compiled.tensor('verify_tokens')) };
  }

  #embed(ids) {
    const a = new Uint32Array(8); a.set(ids.slice(0, 8));
    this.rt.host.writeBuffer(this.embedIds.buffer, this.embedIds.byteOffset ?? 0, a); this.embedS.compiled.collector.enqueue(this.embedS.steps);
  }

  // Head pass over `toks` at positions pos0.. (Hn rows prepared by the caller); with `draft`, returns the argmax
  // of the last row's head output.
  async #pass(r, toks, pos0, draft) {
    this.#embed(toks);
    this.head.forward(this.embedBuf, this.embedOff, toks.length, pos0, r.kvLo);
    r.valid = Math.max(r.valid, pos0 + toks.length);
    if (!draft) return null;
    const e = this.dev.createCommandEncoder(); e.copyBufferToBuffer(this.head.buf.Hout, (toks.length - 1) * this.H * 4, this.headIn.buffer, this.headIn.byteOffset ?? 0, this.H * 4); this.dev.queue.submit([e.finish()]);
    this.headS.compiled.collector.enqueue(this.headS.steps);
    return (await this.rt.readTensor(this.headArg))[0];
  }

  // ---- the engine seam ----
  async *generate(tokenIds, cache, generationArgs, beginDecode, eosTokenId) {
    const { I, rt, H, head } = this; const LV = this.depth + 1, D = this.depth;
    if (tokenIds.length === 0) throw new Error('generation requires at least one input token');
    const { maxNewTokens, stopOnEos, onPrefillDone } = I.dc(generationArgs, {});
    const isEos = (t) => stopOnEos && I.fc(t, eosTokenId);
    const r = await this.#resources(cache); r.cache = cache;
    this.stats.generations++;
    // head KV continuity: rows below the cache's current length stay valid only if this cache produced them
    const past = cache.get_seq_length();
    if (past < r.valid) r.valid = past;
    if (r.valid < past) { r.kvLo = past; r.valid = past; }   // a gap (prefix imported or decoded without the head)
    if (r.kvLo > past) r.kvLo = past;
    const haveLast = r.hLastPos === past && past > 0;
    // prompt prefill in the engine's block sizes through sessions that also output the final hidden rows; the
    // last `window` rows feed the head's KV cache (pairs (x_p, h_{p-1})).
    const ids = Array.from(tokenIds); const firstKept = Math.max(0, ids.length - this.window);
    if (firstKept > 0) { r.kvLo = past + firstKept; r.valid = r.kvLo; }
    let anchor = null, lastHidden = null, lastT = 0;
    for (let i = 0; i < ids.length;) {
      const remaining = ids.length - i; const T = MTP_PREFILL_BLOCKS.find((b) => b >= remaining) ?? MTP_PREFILL_BLOCKS[MTP_PREFILL_BLOCKS.length - 1];
      const chunk = ids.slice(i, i + T); const run = await this.#runBlock(r, await r.prefill(T), chunk); anchor = run.next;
      // head rows for this chunk: local rows a..b-1 (absolute positions run.pos + a ...), h from the previous row
      for (let a = Math.max(0, firstKept - i); a < chunk.length; a += MCFG.MAXM) {
        const b = Math.min(chunk.length, a + MCFG.MAXM), M = b - a;
        // Hn[0] = h at position run.pos + a - 1: the previous row of this chunk, or the carried-over last row
        if (a > 0) head.normTrunkRows(run.hidden.buffer, run.hidden.offset + (a - 1) * H * 4, M, 0);
        else {
          if (M > 1) head.normTrunkRows(run.hidden.buffer, run.hidden.offset, M - 1, 1);
          if (i === 0 && !haveLast) head.setHnRow(0, head.buf.zero); else head.setHnRow(0, head.buf.Hlast);
        }
        await this.#pass(r, chunk.slice(a, b), run.pos + a, false);
      }
      // carry the chunk's last row: Hlast = normed h at the chunk's last position
      head.normTrunkRows(run.hidden.buffer, run.hidden.offset + (chunk.length - 1) * H * 4, 1, 0);
      head.saveLast(head.buf.Hn, 0);
      lastHidden = run.hidden; lastT = chunk.length;
      i += chunk.length;
    }
    r.hLastPos = cache.get_seq_length();
    await rt.queueIdle();
    onPrefillDone?.({ tokens: tokenIds.length, cache_length: cache.get_seq_length() });
    if (maxNewTokens <= 0 || isEos(anchor)) return;
    yield anchor; let emitted = 1;
    // pending head rows: tokens at positions pendPos.. whose h rows sit in Hn[0..]; the last one is the anchor
    let pendTok = [anchor], pendPos = cache.seqLength;
    head.setHnRow(0, head.buf.Hlast);
    let eosSeen = false;
    try {
      while (emitted < maxNewTokens && !eosSeen) {
        const P = cache.seqLength;
        if (P + LV > cache.maxLength || P + LV + 1 > head.kvCap) break;
        // draft: first pass also re-writes the accepted rows' KV with the trunk's own h; later passes chain h'
        const drafts = [];
        drafts.push(await this.#pass(r, pendTok, pendPos, true));
        for (let d = 1; d < D; ++d) { head.setHnRow(0, head.buf.Hout, d === 1 ? pendTok.length - 1 : 0); drafts.push(await this.#pass(r, [drafts[d - 1]], P + d, true)); }
        this.stats.drafted += D;
        const block = [anchor, ...drafts];
        r.slot.checkpoint.capture();
        const run = await this.#runBlock(r, r.verify, block); const vt = Array.from(await run.tokens());
        let k = 0; while (k < D && vt[k] === drafts[k]) k++;
        const bonus = vt[k];
        const out = [];
        for (let i = 0; i < k; ++i) { if (isEos(drafts[i])) { eosSeen = true; k = i; break; } out.push(drafts[i]); }
        if (!eosSeen) { if (isEos(bonus)) eosSeen = true; else out.push(bonus); }
        const y = Math.min(out.length, maxNewTokens - emitted);
        const keep = y < out.length ? y : k + 1;
        // next cycle's pending rows: positions P+1..P+keep with the trunk's h at P..P+keep-1 (verify rows 0..keep-1)
        head.normTrunkRows(run.hidden.buffer, run.hidden.offset, keep, 0);
        pendTok = [...block.slice(1, keep), out[keep - 1] ?? bonus]; pendPos = P + 1;
        r.valid = Math.min(r.valid, P + 1);   // rows written from drafted h past P are speculative
        if (keep < LV) { r.slot.checkpoint.restore(); r.rewind.run(keep); cache.seqLength = P + keep; }
        this.stats.cycles++; this.stats.accepted += k;
        for (let i = 0; i < y; ++i) { yield out[i]; emitted++; this.stats.tokens++; }
        anchor = bonus;
      }
    } finally {
      // leave the head's KV correct for every cached position, and Hlast for the next one
      const S = cache.seqLength;
      const n = Math.max(0, Math.min(pendTok.length, S + 1 - pendPos));
      if (n > 1) await this.#pass(r, pendTok.slice(0, n - 1), pendPos, false);
      if (n >= 1) { head.saveLast(head.buf.Hn, n - 1); r.hLastPos = pendPos + n - 1; } else r.hLastPos = -1;
      r.valid = Math.min(Math.max(r.valid, pendPos + Math.max(0, n - 1)), S);
      await rt.queueIdle();
    }
  }
}

export { MTPRunner, MTPHead, MTP_HEAD, MCFG };
