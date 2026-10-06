// JevBench v1 public tasks (231: original 72, easy 48, hard 111; MIT, fstandhartinger/jevbench f8ce7136) as typed
// decisions, plus its scoring rule and ECE, ported from jevbench/scoring.py and jevbench/metrics.py.
//
// Task → decision mapping. TypeLLM's own mapping (jev-compat/translate.py) is unpublished; METHOD.md says only
// "Choice maps to a string enum, Noul to Boolean, and Score to an integer enum with rubric descriptions". Ours:
//   choice → Choice over the task's label names; the criteria text goes into the question as "label: description";
//   noul   → Bool over [true, false]; criteria true/false go into the question; p(true) is "yes";
//   score  → Choice over "0".."3"; the rubric levels go into the question as "0: …".
// The context is the task's `state`. A different mapping can move the score; record which one a run used.
import { readFileSync } from 'node:fs';

const DIR = new URL('./jevbench/', import.meta.url);
export const SPLITS = ['original', 'easy', 'hard'];

export function loadTasks(splits = SPLITS) {
  return splits.flatMap((s) => readFileSync(new URL(`${s}.jsonl`, DIR), 'utf8').split('\n').filter(Boolean).map((l) => ({ ...JSON.parse(l), tier: s })));
}

export function taskToDecision(task) {
  const q = task.question, ins = q.instructions;
  if (q.type === 'noul') {
    const c = q.criteria || {};
    return { syntax: 'Bool', values: [true, false], context: task.state,
      question: `${ins}\ntrue: ${c.true}\nfalse: ${c.false}`,
      toLabels: (p) => ({ yes: p[0], no: p[1] }) };
  }
  if (q.type === 'score') {
    const levels = q.criteria || [];
    return { syntax: 'Choice', values: task.labels.slice(), context: task.state,
      question: `${ins}\n${levels.map((d, i) => `${i}: ${d}`).join('\n')}`,
      toLabels: (p) => Object.fromEntries(task.labels.map((l, i) => [l, p[i]])) };
  }
  const crit = q.criteria || {};
  return { syntax: 'Choice', values: task.labels.slice(), context: task.state,
    question: `${ins}\n${task.labels.map((l) => `${l}: ${crit[l] ?? ''}`).join('\n')}`,
    toLabels: (p) => Object.fromEntries(task.labels.map((l, i) => [l, p[i]])) };
}

// scoring.py: deterministic argmax, ties to the lexicographically smallest label; score tasks compare str(expected).
export function argmaxLabel(probs) {
  let best = null, bp = -1;
  for (const k of Object.keys(probs).sort()) if (probs[k] > bp) { best = k; bp = probs[k]; }
  return best;
}
const SUM_TOL = 1e-3, RENORM_TOL = 2e-2;
export function scoreTask(probs, task) {
  const keys = Object.keys(probs).sort(), want = [...task.labels].sort();
  if (keys.join('\u0000') !== want.join('\u0000')) return { valid: false, correct: false, predicted: null };
  const total = keys.reduce((a, k) => a + probs[k], 0);
  if (Math.abs(total - 1) > RENORM_TOL || keys.some((k) => !(probs[k] >= 0 && probs[k] <= 1))) return { valid: false, correct: false, predicted: null };
  const clean = Math.abs(total - 1) > SUM_TOL ? Object.fromEntries(keys.map((k) => [k, probs[k] / total])) : probs;
  const predicted = argmaxLabel(clean);
  return { valid: true, predicted, correct: predicted === String(task.expected), confidence: Math.max(...Object.values(clean)) };
}

// metrics.py ece_top_label: 10 equal-width bins over top-label confidence.
export function ece(pairs, nBins = 10) {
  const bins = Array.from({ length: nBins }, () => ({ n: 0, conf: 0, correct: 0 }));
  for (const [c0, ok] of pairs) {
    const c = Math.min(Math.max(c0, 0), 1), b = bins[Math.min(Math.floor(c * nBins), nBins - 1)];
    b.n++; b.conf += c; b.correct += ok ? 1 : 0;
  }
  const n = bins.reduce((a, b) => a + b.n, 0);
  return bins.reduce((e, b) => (b.n ? e + (b.n / n) * Math.abs(b.correct / b.n - b.conf / b.n) : e), 0);
}

export function summarize(results) {
  const by = {};
  for (const r of results) { const t = (by[r.tier] ||= { correct: 0, n: 0 }); t.n++; if (r.correct) t.correct++; }
  return {
    correct: results.filter((r) => r.correct).length, n: results.length, byTier: by,
    ece: ece(results.filter((r) => r.valid).map((r) => [r.confidence, r.correct])),
  };
}
