// The engine seam for typed decisions on Ternary Bonsai 2 (Chunk I step 1; design in plan/typed-decisions-engine-seam.md).
// score(messages, ids) → next-token logits of `ids` after the chat template (thinking off). decide() softmaxes the
// subset, so raw logits are enough. No drafter download: the verify sessions are the engine's own graphs.
//
// How: the prompt is prefilled through plain sessions in the engine's chunk sizes, and its last ≤ 8 tokens go through
// an 8-row session built with { allRowsHead: true, smallM }, whose small-M head writes every row's logits to the
// `verify_logits` output ([8, VOCAB] f32). The small-M head kernel takes at most 8 rows (Lut2SmallMGemm M ≤ 8).
// Checked 2026-10-06 night: "What is the capital of France? Answer in one word." → argmax "Paris" (p 0.9992),
// the same token as the engine's own greedy decode.

const PREFILL = [16, 32, 64, 128, 256, 512];
const HEAD = 8;

export function makeBonsaiScorer(engine, Engine) {
  const I = Engine.__dflashInternals;
  if (!I || !I.ch || !I.lh) throw new Error('bonsai-seam: engine is missing the dflash internals hook');
  const inner = engine.model, rt = inner.runtime, cache = engine.generationState.cache, VOC = inner.config.vocab_size;
  const sessions = new Map();
  const session = async (T, head) => {
    const key = (head ? 'h' : 'p') + T; let s = sessions.get(key); if (s) return s;
    const opts = head ? { allRowsHead: true, smallM: { precision: 'f16' } } : {};
    class S extends I.ch { buildEmission() { return I.lh(this.model, this.cache, this.blockLen, opts); } }
    s = new S(inner, cache, T); await s.build(); sessions.set(key, s); return s;
  };
  const runChunk = async (s, chunk) => { const pos = cache.seqLength; await s.run(new Uint32Array(chunk), pos); cache.seqLength = pos + chunk.length; };

  // Logits of the token after `messages` (rendered with the engine's own template, thinking off).
  async function lastRow(messages) {
    const saved = engine.chatTemplateArgs;
    engine.chatTemplateArgs = { ...(saved || {}), enable_thinking: false };
    let toks;
    try { toks = Array.from(engine.encodePrompt(messages)); } finally { engine.chatTemplateArgs = saved; }
    if (toks.length > cache.maxLength) throw new Error(`prompt is ${toks.length} tokens; the cache holds ${cache.maxLength}`);
    engine.resetCache();
    const k = Math.min(HEAD, toks.length), body = toks.slice(0, toks.length - k), tail = toks.slice(toks.length - k);
    for (let i = 0; i < body.length;) {
      const T = PREFILL.find((b) => b >= body.length - i) ?? PREFILL[PREFILL.length - 1];
      const chunk = body.slice(i, i + T); await runChunk(await session(T, false), chunk); i += chunk.length;
    }
    const hs = await session(HEAD, true); await runChunk(hs, tail);
    const lg = await rt.readTensor(hs.compiled.tensor('verify_logits'));
    return { row: lg.subarray((tail.length - 1) * VOC, tail.length * VOC), tokens: toks.length };
  }
  const score = async (messages, ids) => { const { row } = await lastRow(messages); return ids.map((id) => row[id]); };
  const dispose = () => { for (const s of sessions.values()) { try { s.dispose(); } catch (_) {} } sessions.clear(); };
  return { score, lastRow, dispose };
}

// One-token control labels for this tokenizer (decide.mjs controlLabels' `singleToken`).
export const bonsaiSingleToken = (engine) => (label) => {
  const ids = engine.tokenizer.encode(label, { add_special_tokens: false }).ids;
  return ids.length === 1 && engine.tokenizer.decode([ids[0]]) === label ? ids[0] : null;
};
