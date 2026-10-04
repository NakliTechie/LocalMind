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

import { Qwen3MoeSsd, STORAGE, COPY_SRC, COPY_DST, MAP_READ, UNIFORM } from './qwen3_moe_ssd.js';

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
  }

  get kernels() { return { ...super.kernels, ...KERNELS }; }

  // Like bind(), but a resource may be { buffer, offset, size }.
  bindR(name, resources) {
    return this.device.createBindGroup({
      layout: this.pipeline(name).getBindGroupLayout(0),
      entries: resources.map((r, i) => ({ binding: i, resource: r instanceof GPUBuffer ? { buffer: r } : r })),
    });
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
    };
    this.tok = this.buffer(16, UNIFORM | COPY_DST);
    this.rbSel = this.buffer(256 * (1 + this.lookahead), MAP_READ | COPY_DST);
    this.rbLogits = this.buffer(c.vocab * 4, MAP_READ | COPY_DST);
    this.rbArg = this.buffer(16, MAP_READ | COPY_DST);

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
      });
      this.layers.push(g);
    }
    this.g.rmsOut = this.bind('rmsnorm', [a.x, raw('output_norm.weight'), a.xn, u.rmsH]);
    this.g.lm = this.bind('matmulQ8', [a.xn, W['output.weight'].q, W['output.weight'].s, a.logits, u.lm]);
    this.g.am = this.bind('argmax', [a.logits, a.am, u.am]);
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
    return super.prefill(ids, want);
  }
}

// For kernel tests (scripts): the WGSL this module adds.
export { KERNELS as QWEN35_KERNELS };
