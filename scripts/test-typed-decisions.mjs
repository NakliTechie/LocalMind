// Node proof of the typed-decision decode and the JevBench scorer (scripts/typed-decisions/; Chunk I step 1):
//   1. the Choice(…) / Bool(…) prompt is byte-identical to TypeLLM 0.1.4's own Python output (fixture);
//   2. control labels skip multi-token and colliding labels; softmax; permutation averaging cancels a pure label bias;
//   3. the 231 vendored public tasks load (72 / 48 / 111; 139 choice, 74 noul, 18 score) and every one maps;
//   4. the scorer and ECE, run on TypeLLM's published no-thinking answers, reproduce 195/231 (71/48/76) and ECE 0.052494;
//   5. an oracle scorer through decide() + taskToDecision() gets 231/231 (the mapping and label plumbing are sound).
// The engine seam (real logprobs from Ternary Bonsai 2) is not here; this is everything around it.
// Run: node scripts/test-typed-decisions.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { openingText, controlLabels, candidateSoftmax, orderings, decide, decisionMessages } from './typed-decisions/decide.mjs';
import { loadTasks, taskToDecision, scoreTask, summarize, ece } from './typed-decisions/jevbench.mjs';

const fx = (f) => JSON.parse(readFileSync(new URL(`./typed-decisions/fixtures/${f}`, import.meta.url), 'utf8'));

// 1. Prompt text vs TypeLLM 0.1.4 (python: Choice(...).opening_text()).
for (const c of fx('opening-text.json')) assert.equal(openingText({ syntax: c.syntax, question: c.question, choices: c.choices }), c.text);
assert.deepEqual(decisionMessages('ctx  \n', 'X'), [{ role: 'user', content: 'ctx' }, { role: 'user', content: 'X' }]);

// 2. Labels, softmax, permutations.
const tok = { A: 10, B: 11, C: null, D: 11, E: 14 };   // C is multi-token, D collides with B
assert.deepEqual(controlLabels(3, (l) => (l in tok ? tok[l] : 100 + l.charCodeAt(0))), [{ label: 'A', id: 10 }, { label: 'B', id: 11 }, { label: 'E', id: 14 }]);
assert.throws(() => controlLabels(40, () => 1), /single-token labels/);
const sm = candidateSoftmax([Math.log(0.2), Math.log(0.8)]);
assert.ok(Math.abs(sm[0] - 0.2) < 1e-12 && Math.abs(sm[1] - 0.8) < 1e-12);
assert.equal(orderings(3, 99).length, 6); assert.deepEqual(orderings(3, 1), [[0, 1, 2]]);
const labels = controlLabels(4, (l) => l.charCodeAt(0));
// A scorer that only likes label A (pure position bias): one ordering says value 0; all 24 orderings say uniform.
const biased = async (_m, ids) => ids.map((_, i) => (i === 0 ? 0 : -5));
const one = await decide({ context: 'c', question: 'q', values: ['w', 'x', 'y', 'z'], syntax: 'Choice', labels, score: biased });
assert.equal(one.argmax, 'w'); assert.ok(one.probs[0] > 0.9);
const all = await decide({ context: 'c', question: 'q', values: ['w', 'x', 'y', 'z'], syntax: 'Choice', labels, score: biased, permutations: 24 });
assert.equal(all.prompts.length, 24); all.probs.forEach((p) => assert.ok(Math.abs(p - 0.25) < 1e-9));

// 3. Tasks.
const tasks = loadTasks();
const count = (k, v) => tasks.filter((t) => t[k] === v).length;
assert.equal(tasks.length, 231);
assert.deepEqual([count('tier', 'original'), count('tier', 'easy'), count('tier', 'hard')], [72, 48, 111]);
const qt = (v) => tasks.filter((t) => t.question.type === v).length;
assert.deepEqual([qt('choice'), qt('noul'), qt('score')], [139, 74, 18]);
for (const t of tasks) { const d = taskToDecision(t); assert.ok(d.values.length >= 2 && d.values.length <= 24, t.id); }

// 4. Scorer + ECE reproduce TypeLLM's published no-thinking run.
const byId = new Map(tasks.map((t) => [t.id, t]));
const theirs = fx('typellm-0.1.4-no-thinking-answers.json');
const rescored = theirs.map((a) => ({ tier: a.tier, ...scoreTask(a.probabilities, byId.get(a.task_id)) }));
rescored.forEach((r, i) => assert.equal(r.correct, theirs[i].correct, theirs[i].task_id));
const s = summarize(rescored);
assert.equal(s.correct, 195);
assert.deepEqual([s.byTier.original.correct, s.byTier.easy.correct, s.byTier.hard.correct], [71, 48, 76]);
assert.ok(Math.abs(s.ece - 0.052494) < 5e-7, `ECE ${s.ece}`);
assert.ok(Math.abs(ece([[0.95, true], [0.95, false]]) - 0.45) < 1e-12);

// 5. Oracle run through the decision path (24 labels: the largest task has more than 4 choices).
const labels24 = controlLabels(24, (l) => l.charCodeAt(0));
assert.ok(Math.max(...tasks.map((t) => taskToDecision(t).values.length)) > 4);
const results = [];
for (const t of tasks) {
  const d = taskToDecision(t);
  const want = d.syntax === 'Bool' ? (t.expected === 'yes') : String(t.expected);
  const oracle = async (messages, ids) => {
    const block = messages[1].content, map = JSON.parse(/choices=(\{.*\}),/.exec(block)[1]);
    return ids.map((_, i) => (map[labels24[i].label] === want ? 0 : -6));
  };
  const r = await decide({ ...d, labels: labels24, score: oracle });
  results.push({ tier: t.tier, ...scoreTask(d.toLabels(r.probs), t) });
}
assert.equal(summarize(results).correct, 231);

console.log('typed decisions: all checks passed (prompt = TypeLLM 0.1.4; TypeLLM answers rescored 195/231, ECE 0.052494; oracle 231/231)');
