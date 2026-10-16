/* hy_v3_moe_ssd.js — Tencent Hy-Memory-30B-A3B (GGUF arch `hy_v3`) with its routed experts on disk: rung 2f of the
 * SSD-streaming ladder. Hy-Memory is a long-term-memory writer (it extracts and updates memory entries; arXiv
 * 2610.22196); as an engine it is a plain GQA transformer with a DeepSeek-style router, so it reuses the LFM2.5 rung
 * (lfm2_moe_ssd.js: sigmoid router + selection bias, dense leading layers run inside MoE layer 0's trunk pass,
 * Q4_0 / Q6_K kernels) with every layer an attention layer.
 *
 * The math follows llama.cpp src/models/hy-v3.cpp. 48 layers, each:
 *   x += attn(rms_norm(x) · attn_norm): Q/K/V (32 / 4 / 4 heads × 128; Q is 4096 wide, wider than the 2048 hidden),
 *     per-head weighted RMS norm on Q and K, NeoX RoPE (base 11158840, all 128 dims), softmax(QKᵀ/√128) V, output
 *     projection 4096 → 2048.
 *   x += ffn(rms_norm(x) · ffn_norm): a dense SwiGLU (6912) on layer 0; on layers 1–47 a MoE of 128 experts, top 8 by
 *     sigmoid(router) + exp_probs_b (the bias only picks), weights = the picked sigmoids over their sum × 2.826
 *     (expert_weights_scale), SwiGLU experts (1536), plus one always-on shared SwiGLU expert (1536, no gate).
 * Embedding: Q6_K rows (no scale); head: rms_norm(x) · output_norm, then output.weight (Q6_K, untied).
 *
 * File: our conversion of tencent/Hy-Memory-30B-A3B (bf16 safetensors) with llama.cpp convert_hf_to_gguf.py, then
 * `llama-quantize --token-embedding-type q6_k --output-tensor-type q6_k … Q4_0`: matmul weights Q4_0, norms / router /
 * bias F32, both vocab tables Q6_K — the types the LFM2.5 kernels already read.
 */

import { Qwen3MoeSsd, BpeTokenizer, Q6K_BLOCK, STORAGE } from './qwen3_moe_ssd.js';
import { Gemma4MoeSsd } from './gemma4_moe_ssd.js';
import { Lfm2MoeSsd, planLayoutLfm2Moe, planUnitsLfm2Moe } from './lfm2_moe_ssd.js';

export function configFromGgufHyV3(kv) {
  const a = kv['general.architecture'];
  if (a !== 'hy_v3') throw new Error(`expected an hy_v3 GGUF, got ${a}`);
  const g = (k) => kv[`${a}.${k}`];
  // llama.cpp defaults hy_v3 to the sigmoid router when the key is absent (hy-v3.cpp load_arch_hparams).
  if ((g('expert_gating_func') ?? 2) !== 2) throw new Error(`hy_v3 expert_gating_func ${g('expert_gating_func')}: this engine implements sigmoid (2)`);
  if (g('expert_weights_norm') === false) throw new Error('hy_v3 without expert_weights_norm: not implemented');
  if (g('nextn_predict_layers')) throw new Error('hy_v3 GGUF with MTP layers: convert with --no-mtp');
  const modelLayers = g('block_count'), lead = g('leading_dense_block_count') ?? 1, layers = modelLayers - lead;
  const H = g('embedding_length'), heads = g('attention.head_count'), kvH = g('attention.head_count_kv');
  const hd = g('attention.key_length') || H / heads, theta = g('rope.freq_base');
  if (g('rope.dimension_count') && g('rope.dimension_count') !== hd) throw new Error('hy_v3 partial RoPE: not implemented');
  return {
    arch: a, modelLayers, lead, layers,
    attn: Array(modelLayers).fill(true),
    hidden: H, denseFf: g('feed_forward_length'), heads, kvHeadsAttn: kvH, attnHeadDim: hd,
    experts: g('expert_count'), topK: g('expert_used_count'), expertFf: g('expert_feed_forward_length'),
    shexpFf: g('expert_shared_feed_forward_length'), expScale: g('expert_weights_scale') ?? 1,
    eps: g('attention.layer_norm_rms_epsilon'), contextLength: g('context_length'),
    vocab: kv['tokenizer.ggml.tokens'].length,
    bos: kv['tokenizer.ggml.bos_token_id'], eos: kv['tokenizer.ggml.eos_token_id'],
    swa: Array(layers).fill(false), headDim: Array(layers).fill(hd), ropeTheta: Array(layers).fill(theta), softcap: 0,
    kvHeads: Array(layers).fill(kvH),
  };
}

// The LFM2.5 store shape. The GGUF has no leading_dense_block_count key, so the layout checks the default (1) against
// the tensors: dense layers have ffn_gate.weight, MoE layers ffn_gate_inp.weight.
export function planLayoutHyV3(gguf) {
  const cfg = configFromGgufHyV3(gguf.kv), names = new Set(gguf.tensors.map((t) => t.name));
  let lead = 0;
  while (names.has(`blk.${lead}.ffn_gate.weight`)) lead++;
  if (lead !== cfg.lead || !names.has(`blk.${lead}.ffn_gate_inp.weight`)) throw new Error(`hy_v3: ${lead} dense leading layers, expected ${cfg.lead}`);
  return planLayoutLfm2Moe(gguf, cfg);
}
export const HYV3_INGEST_PLAN = { layout: planLayoutHyV3, units: planUnitsLfm2Moe };

// Our conversion (the model card on the repo says how; the expert width keys are fixed to 768 in the header).
export const HY_MEMORY_30B_A3B = {
  repo: 'naklitechie/Hy-Memory-30B-A3B-GGUF',
  file: 'Hy-Memory-30B-A3B-Q4_0.gguf',
  revision: 'main',
  sha256: '3831d7bf273083892a4ab993d2c86f3d68c4b6083b0dab88dfd790dff54d30d8',
  size: 17087233472,
};

// ── Tokenizer: byte-level BPE; tokenizer.json's pre-tokenizer is a Sequence of three Isolated splits (llama.cpp
// LLAMA_VOCAB_PRE_TYPE_HY_V4 has the same three regexes): digit runs of up to 3, CJK / kana runs, then the word split.
// Each split keeps both the matches and the text between them, and the next split runs over every piece.
const HY_SPLITS = [
  /\p{N}{1,3}/gu,
  /[一-龥぀-ゟ゠-ヿ]+/gu,
  /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~][A-Za-z]+|[^\r\n\p{L}\p{P}\p{S}]?[\p{L}\p{M}]+| ?[\p{P}\p{S}]+[\r\n]*|\s*[\r\n]+|\s+(?!\S)|\s+/gu,
];
function isolate(pieces, re) {
  const out = [];
  for (const s of pieces) {
    let last = 0;
    for (const m of s.matchAll(re)) {
      if (m.index > last) out.push(s.slice(last, m.index));
      if (m[0]) out.push(m[0]);
      last = m.index + m[0].length;
    }
    if (last < s.length) out.push(s.slice(last));
  }
  return out;
}
export class HyV3Tokenizer extends BpeTokenizer {
  constructor(kv) {
    super(kv);
    // preRe is matched with matchAll over each special-free piece; this one yields the three-split pieces.
    this.preRe = { [Symbol.matchAll]: (s) => HY_SPLITS.reduce(isolate, [s]).map((p) => [p])[Symbol.iterator]() };
  }
  // The vocab lacks some single bytes (\r = "č"). tokenizers' BPE (no unk token) drops such a character before merging,
  // so "\r\n\r\n" is "ĊĊ"; do the same.
  bpe(word) {
    try { return super.bpe(word); } catch {
      let parts = Array.from(word).filter((ch) => this.ids.has(ch));
      while (parts.length > 1) {
        let best = -1, bestRank = Infinity;
        for (let i = 0; i < parts.length - 1; i++) {
          const r = this.ranks.get(parts[i] + ' ' + parts[i + 1]);
          if (r !== undefined && r < bestRank) { bestRank = r; best = i; }
        }
        if (best < 0) break;
        parts = [...parts.slice(0, best), parts[best] + parts[best + 1], ...parts.slice(best + 2)];
      }
      return parts.map((p) => this.ids.get(p)).filter((id) => id !== undefined);
    }
  }
}

// The chat template (tokenizer chat_template.jinja), text turns, no tools: BOS, the system text raw, the reasoning
// mode marker, then <｜hy_User｜>… and <｜hy_Assistant｜><think></think>…<eos> per turn. Thinking off is the template's
// default `no_think` (the generation prompt closes an empty think block); thinking on uses `low` (it opens one).
export function hyChatPrompt(messages, { enableThinking = false } = {}) {
  const effort = enableThinking ? 'low' : 'no_think';
  let sys = '';
  for (const m of messages) if (m.role === 'system') sys += String(m.content ?? '');
  let s = '<｜hy_begin▁of▁sentence｜>' + sys + '<｜reasoning_mode｜>reasoning_effort:' + effort;
  const turns = messages.filter((m) => m.role === 'user' || m.role === 'assistant');
  turns.forEach((m, i) => {
    let c = String(m.content ?? '');
    if (m.role === 'user') { s += '<｜hy_User｜>' + c; return; }
    // Earlier replies lose their reasoning: the model's own </think> and LocalMind's <|think|> … <|/think|> markers.
    c = c.replace(/<\|think\|>[\s\S]*?<\|\/think\|>/g, '');
    if (c.includes('</think>')) c = c.split('</think>').pop();
    s += '<｜hy_Assistant｜><think></think>' + c.trim() + (i < turns.length - 1 ? '<eos:6124c78e>' : '');
  });
  if (turns.length && turns[turns.length - 1].role === 'assistant') return s;
  return s + '<｜hy_Assistant｜><think>' + (enableThinking ? '' : '</think>');
}

// ── Engine ──────────────────────────────────────────────────────────────────
// Lookahead stays at the LFM2.5 default of 1. Measured 2026-10-16 (M4 Pro, profile on the internal disk, ~400-token
// prompt, 256 tokens warm): 4 GB pool → 14.3 tok/s with prefetch off, 14.2 at lookahead 1, 12.8 at 2; 8 GB pool at
// lookahead 1 → 18.4 tok/s. Chunked prefill ~41 tok/s (plan/2026-10-16-hymemory-harness, bench-2).
export class HyV3MoeSsd extends Lfm2MoeSsd {
  static configFrom(kv) { return configFromGgufHyV3(kv); }
  static get ingestPlan() { return HYV3_INGEST_PLAN; }
  static tokenizerFrom(kv) { return new HyV3Tokenizer(kv); }
  static load(modelId, opts = {}) { return Qwen3MoeSsd.load.call(this, modelId, { ...opts, source: opts.source || HY_MEMORY_30B_A3B }); }

  chatPrompt(messages, opts) { return hyChatPrompt(messages, opts); }
  get stopTokenIds() {
    const t = this.tokenizer.ids;
    return [this.cfg.eos, t.get('<eos:6124c78e>'), t.get('<｜hy_end▁of▁sentence｜>'), t.get('<｜hy_EOT｜>')].filter((x) => x !== undefined);
  }
  get thinkOpenTokenId() { return this.tokenizer.ids.get('<think>') ?? null; }
  get thinkCloseTokenId() { return this.tokenizer.ids.get('</think>') ?? null; }
  get thinkInPrompt() { return true; }
  get alwaysThinks() { return false; }
  get thinkPreamble() { return ''; }

  // The untied output head: its Q6_K table into planes as the token table (Gemma's uploadDense), raw copy freed.
  async uploadDense(onProgress) {
    await super.uploadDense(onProgress);
    const dev = this.device, raw = this.w['output.weight'].raw, blocks = raw.size / Q6K_BLOCK | 0;
    const P = (n) => this.buffer(n, STORAGE, 'dense');
    this.q6o = { ql: P(blocks * 128), qh: P(blocks * 64), sc: P(blocks * 16), dd: P(blocks * 4) };
    const enc = dev.createCommandEncoder(), pass = enc.beginComputePass();
    this.dispatch(pass, 'q6kPlanes', this.bind('q6kPlanes', [raw, this.q6o.ql, this.q6o.qh, this.q6o.sc, this.q6o.dd, this.uniform([blocks])]), Math.ceil(blocks / 256));
    pass.end(); dev.queue.submit([enc.finish()]);
    await dev.queue.onSubmittedWorkDone();
    this.gpuBytes.dense -= raw.size; raw.destroy(); this.w['output.weight'].raw = null;
  }

  initBuffers() {
    super.initBuffers();
    const o = this.q6o;
    this.g.lm = this.bind('matmulQ6K', [o.ql, o.qh, o.sc, o.dd, this.a.xn, this.a.logits, this.uniform([this.cfg.vocab, this.cfg.hidden])]);
  }

  // No recurrent state: thinking follows the request (LFM2.5 forces it on).
  async *generateTurn(messages, opts = {}) { yield* Gemma4MoeSsd.prototype.generateTurn.call(this, messages, opts); }
}
