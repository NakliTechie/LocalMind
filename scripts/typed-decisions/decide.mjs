// Typed decisions (Chunk I, step 1): TypeLLM 0.1.4's single-token decision decode, in plain JS so a browser engine
// can use it. Ported from TypeLLM commit e0bc2d37 (Apache-2.0; the commit behind its 195/231 JevBench run):
//   - every enum / boolean value gets a one-token control label (A, B, … then 0–9), never its own text;
//   - the prompt is two user turns: the context, then a Choice(…) / Bool(…) block naming label → value;
//   - one forward pass; the logprobs of the label tokens, softmaxed at T, are the distribution;
//   - optional permutation averaging: re-deal the values under the fixed labels, average per value.
// The engine side supplies `score(messages, labelTokenIds) → logprobs[]` (next-token logprobs of those ids after the
// chat template with the generation prompt). Nothing here touches a model.

export const LABEL_POOL = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'];
export const MAX_CHOICES = 24;   // TypeLLM's MAX_ENUM_CHOICES

// singleToken(label) → token id when the label is exactly one token that decodes to itself, else null.
// Labels whose ids collide are skipped (TypeLLM runtime.py _control_labels).
export function controlLabels(count, singleToken) {
  const out = [], seen = new Set();
  for (const label of LABEL_POOL) {
    const id = singleToken(label);
    if (id == null || seen.has(id)) continue;
    out.push({ label, id }); seen.add(id);
    if (out.length === count) return out;
  }
  throw new Error(`need ${count} single-token labels, found ${out.length}`);
}

// TypeLLM 0.1.4 Choice.opening_text() for a finite choice. syntax: 'Choice' (enum) or 'Bool'.
// choices: [[label, value], …] in display order. JSON.stringify matches Python's json.dumps(ensure_ascii=False,
// separators=(',', ':')) for strings, booleans and numbers.
export function openingText({ syntax = 'Choice', name = 'decision', question, choices }) {
  const map = '{' + choices.map(([l, v]) => `${JSON.stringify(l)}:${JSON.stringify(v)}`).join(',') + '}';
  const lines = [`${syntax}(`];
  if (name != null) lines.push(`  name=${JSON.stringify(name)},`);
  lines.push(`  question=${JSON.stringify(question)},`, `  choices=${map},`,
    '  instruction="Answer the question using only the best label.",', ')');
  return lines.join('\n');
}

// Batch-mode prompt: two consecutive user turns, no system message (runtime.py L810-L840).
export const decisionMessages = (context, opening) => [
  { role: 'user', content: String(context).trimEnd() },
  { role: 'user', content: opening },
];

export function candidateSoftmax(logprobs, temperature = 1) {
  if (!(temperature > 0) || !Number.isFinite(temperature)) throw new Error('temperature must be finite and > 0');
  const scaled = logprobs.map((v) => v / temperature);
  const pivot = Math.max(...scaled);
  const w = scaled.map((v) => Math.exp(v - pivot));
  const total = w.reduce((a, b) => a + b, 0);
  return w.map((x) => x / total);
}

// Orderings of n values for permutation averaging: identity first, then distinct random ones (TypeLLM caps at 720).
export function orderings(n, count, rand = Math.random) {
  const out = [[...Array(n).keys()]];
  const seen = new Set([out[0].join(',')]);
  let total = 1; for (let i = 2; i <= n; i++) total *= i;
  const want = Math.min(count, total, 720);
  while (out.length < want) {
    const p = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    const k = p.join(','); if (!seen.has(k)) { seen.add(k); out.push(p); }
  }
  return out;
}

// One decision. values: the enum values in schema order (booleans: [true, false]). Returns { probs: Map value → p,
// argmax value, prompts }. score(messages, ids) must resolve to logprobs aligned with ids.
export async function decide({ context, question, values, syntax, labels, score, permutations = 1, temperature = 1, rand }) {
  if (values.length > MAX_CHOICES) throw new Error(`${values.length} values; the maximum is ${MAX_CHOICES}`);
  const L = labels.slice(0, values.length);
  const sum = new Array(values.length).fill(0);
  const prompts = [];
  for (const order of orderings(values.length, permutations, rand)) {
    // order[i] = index of the value shown under label i
    const opening = openingText({ syntax, question, choices: L.map((l, i) => [l.label, values[order[i]]]) });
    const messages = decisionMessages(context, opening);
    prompts.push(messages);
    const p = candidateSoftmax(await score(messages, L.map((l) => l.id)), temperature);
    p.forEach((pi, i) => { sum[order[i]] += pi; });
  }
  const n = prompts.length;
  const probs = sum.map((s) => s / n);
  let best = 0; probs.forEach((p, i) => { if (p > probs[best]) best = i; });
  return { probs, argmax: values[best], prompts };
}
