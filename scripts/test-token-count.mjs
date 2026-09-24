// Token counting: the context budget is only as good as this estimate.
// Extracts the TOKEN-COUNT block out of index.html and runs the SHIPPED code
// against counts from each model's own tokenizer (scripts/token-fixtures.mjs).
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { TOKEN_FIXTURES } from './token-fixtures.mjs';

const indexSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const start = indexSource.indexOf('// TOKEN-COUNT-START');
const end = indexSource.indexOf('// TOKEN-COUNT-END');
assert.ok(start > -1 && end > start, 'index.html must keep the TOKEN-COUNT markers');
const block = indexSource.slice(start, end);

// The block is plain declarations; evaluate it and hand back what the app calls.
const { countTokens, TOKEN_WEIGHTS, TOKEN_PROFILE_BY_MODEL } =
  new Function(`${block}\nreturn { countTokens, TOKEN_WEIGHTS, TOKEN_PROFILE_BY_MODEL };`)();

assert.equal(typeof countTokens, 'function');
assert.ok(TOKEN_WEIGHTS.unknown, 'an unmeasured tokenizer must fall back to the "unknown" profile');

// Every model in the fixtures must be mapped; an unmapped one silently gets the
// conservative profile, which is safe but means a roster addition was forgotten.
const models = [...new Set(TOKEN_FIXTURES.flatMap((s) => Object.keys(s.actual)))];
for (const key of models) {
  assert.ok(TOKEN_PROFILE_BY_MODEL[key], `TOKEN_PROFILE_BY_MODEL is missing ${key}`);
}

// Accuracy. Undercounting is the dangerous direction: it lets the window overflow
// with the budget check still passing, so it gets the tighter bound.
const UNDER = -0.20, OVER = 0.28;
let worstUnder = 0, worstOver = 0, worstUnderAt = '', worstOverAt = '';
for (const s of TOKEN_FIXTURES) {
  for (const [key, actual] of Object.entries(s.actual)) {
    const est = countTokens(s.text, key);
    const err = est / actual - 1;
    if (err < worstUnder) { worstUnder = err; worstUnderAt = `${s.name}/${key}`; }
    if (err > worstOver) { worstOver = err; worstOverAt = `${s.name}/${key}`; }
    assert.ok(err >= UNDER, `${s.name} on ${key}: estimate ${est} vs ${actual} = ${(err * 100).toFixed(0)}%, under the ${UNDER * 100}% floor`);
    assert.ok(err <= OVER, `${s.name} on ${key}: estimate ${est} vs ${actual} = +${(err * 100).toFixed(0)}%, over the +${OVER * 100}% ceiling`);
  }
}

// An unmapped model must never undercount on this corpus — that is the whole
// point of the padded 'unknown' profile.
for (const s of TOKEN_FIXTURES) {
  for (const actual of Object.values(s.actual)) {
    assert.ok(countTokens(s.text, 'no-such-model') >= actual,
      `the unknown profile undercounted ${s.name} (${countTokens(s.text, 'no-such-model')} < ${actual})`);
  }
}

// Guard the regression this replaced: chars/3.5 was out by multiples on Indic text.
const worstOld = TOKEN_FIXTURES.reduce((worst, s) => {
  for (const [key, actual] of Object.entries(s.actual)) {
    const old = Math.ceil(s.text.length / 3.5);
    worst = Math.min(worst, old / actual - 1);
  }
  return worst;
}, 0);
assert.ok(worstOld < -0.8, 'the fixtures must still contain a case the old chars/3.5 guess got badly wrong');

// The consequence this exists for. buildContextMessages budgets
// contextSize - 2048 - 300 for history. Take a Kannada conversation sized so the
// old chars/3.5 guess said it fits and the tokenizer says it does not: the guess
// waved it through and the window overflowed. The new count must refuse it.
{
  const kn = TOKEN_FIXTURES.find((s) => s.name === 'kn-a');
  const budget = 16384 - 2048 - 300;                 // MiniCPM5 2B's window
  const actualPerCopy = kn.actual['minicpm5-2b-gguf'];
  const copies = Math.ceil(budget / actualPerCopy) + 1;   // genuinely over the window
  const history = Array.from({ length: copies }, () => kn.text).join('\n');
  const oldGuess = Math.ceil(history.length / 3.5);
  const trueTokens = actualPerCopy * copies;
  const estimate = countTokens(history, 'minicpm5-2b-gguf');
  assert.ok(trueTokens > budget, 'the fixture history must genuinely exceed the window');
  assert.ok(oldGuess <= budget, `the old guess should have waved this through (${oldGuess} vs ${budget})`);
  assert.ok(estimate > budget, `the new count must refuse it (${estimate} vs ${budget}, true ${trueTokens})`);
}

// Cheap enough to run over a whole history on every turn.
const big = TOKEN_FIXTURES.map((s) => s.text).join('\n').repeat(40);
const t0 = performance.now();
countTokens(big, 'qwen35-4b');
const ms = performance.now() - t0;
assert.ok(ms < 250, `countTokens took ${ms.toFixed(0)} ms on ${big.length} characters`);

assert.equal(countTokens('', 'qwen35-4b'), 0);
assert.equal(countTokens(null, 'qwen35-4b'), 0);
assert.ok(countTokens('🙂🙂🙂', 'qwen35-4b') > 0, 'astral characters must count');

console.log(`LocalMind token counting: ok — ${TOKEN_FIXTURES.length} samples x ${models.length} tokenizers, ` +
  `worst ${(worstUnder * 100).toFixed(0)}% (${worstUnderAt}) / +${(worstOver * 100).toFixed(0)}% (${worstOverAt}), ` +
  `old guess worst ${(worstOld * 100).toFixed(0)}%, ${ms.toFixed(0)} ms for ${big.length} chars`);
