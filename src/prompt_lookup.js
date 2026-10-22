/* prompt_lookup.js — prompt-lookup speculative decoding (Saxena 2023, "prompt lookup decoding"; transformers'
 * prompt_lookup_num_tokens): no drafter model. When the last few tokens of the text so far appeared earlier in it, the
 * tokens that followed that earlier occurrence are the draft; the model checks the whole draft in one pass and keeps the
 * part it agrees with, plus its own next token. Output is the model's own greedy decoding. It pays where a reply repeats
 * its context (editing code it was given, quoting, restating), and costs a check pass when the guess is wrong.
 *
 * The engine needs: prefill(ids, 'argmax'), step(token, 'argmax'), prefillChunk(ids, 'rows') → the argmax of every row,
 * rewind(pos), position, reset(), stopTokenIds. FlintMoeSsd (flint_moe_ssd.js) and Qwen3Dense (qwen35_dense.js) have
 * them.
 *
 *   for await (const r of lookupGenerate(engine, promptIds, { maxNewTokens })) …   // r.tokens: the new tokens
 */

// The draft for `ctx`: the K tokens after the latest earlier occurrence of its last n tokens, longest n first
// (maxN … minN); null when the tail never occurred before.
export function findDraft(ctx, { maxN = 4, minN = 2, K = 8 } = {}) {
  const L = ctx.length;
  for (let n = Math.min(maxN, L - 1); n >= minN; n--) {
    for (let i = L - n - 1; i >= 0; i--) {
      let j = 0;
      while (j < n && ctx[i + j] === ctx[L - n + j]) j++;
      if (j === n) {
        const d = ctx.slice(i + n, Math.min(i + n + K, L));
        if (d.length) return d;
      }
    }
  }
  return null;
}

// Greedy decoding of `ids` with prompt-lookup drafts. Yields { tokens, prefill } first, then { tokens, plain } per plain
// step or { tokens, accepted, drafted, checkMs } per check pass. K: the longest draft (adapts: halves after a round that
// keeps under half, doubles after one that keeps all, within [minK, maxK]).
export async function* lookupGenerate(engine, ids, { maxNewTokens = 256, stopTokenIds = engine.stopTokenIds, K = 8, minK = 2, maxK = 16, maxN = 4, minN = 2 } = {}) {
  const stops = new Set(stopTokenIds || []);
  engine.reset();
  let next = await engine.prefill(ids, 'argmax'), produced = 1;
  const ctx = [...ids];
  yield { tokens: [next], prefill: true };
  if (stops.has(next)) return;
  while (produced < maxNewTokens && engine.position < engine.maxCtx - 1) {
    ctx.push(next);
    const room = Math.min(K, maxNewTokens - produced, engine.maxCtx - engine.position - 1);
    const draft = room >= 1 ? findDraft(ctx, { maxN, minN, K: room }) : null;
    if (!draft) {
      next = await engine.step(next, 'argmax'); produced++;
      yield { tokens: [next], plain: true };
      if (stops.has(next)) return;
      continue;
    }
    const pos = engine.position, t0 = performance.now();
    const rows = await engine.prefillChunk([next, ...draft], 'rows');
    const checkMs = performance.now() - t0;
    let acc = 0;
    while (acc < draft.length && draft[acc] === rows[acc]) acc++;
    let fresh = [...draft.slice(0, acc), rows[acc]];
    const hit = fresh.findIndex((x) => stops.has(x));
    if (hit >= 0) fresh = fresh.slice(0, hit + 1);
    engine.rewind(pos + acc + 1);
    ctx.push(...fresh.slice(0, -1));
    next = fresh[fresh.length - 1];
    produced += fresh.length;
    K = acc === draft.length ? Math.min(maxK, K * 2) : acc < draft.length / 2 ? Math.max(minK, Math.floor(K / 2)) : K;
    yield { tokens: fresh, accepted: acc, drafted: draft.length, checkMs };
    if (hit >= 0) return;
  }
}
