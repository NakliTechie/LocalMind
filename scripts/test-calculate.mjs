// test-calculate.mjs — the calculate tool's evaluator (evalMath in index.html), read out of the shipped file.
// The old evaluator deleted unknown characters and evaluated the rest, so it returned wrong numbers with no error
// ("sqrt(16)" → 16, "2^10" → 210, "17.5% of 2340 + 99" → 116.5). Every case here was wrong or unchecked then.
//
//   node scripts/test-calculate.mjs
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const m = /\n    function evalMath\(expression\) \{[\s\S]*?\n    \}\n/.exec(html);
assert.ok(m, 'evalMath not found in index.html');
const evalMath = new Function(`${m[0]}; return evalMath;`)();
assert.match(html, /execute\(args\) \{\s*try \{ return \{ result: evalMath\(args\.expression\) \}; \} catch \(e\) \{ return \{ error: e\.message \}; \}/, 'calculate uses evalMath');

const near = (got, want) => assert.ok(Math.abs(got - want) < 1e-9 * Math.max(1, Math.abs(want)), `${got} != ${want}`);
const cases = [
  ['4821 * 377', 1817517],
  ['0.175 * 2340 + 99', 508.5],
  ['17.5% of 2340 + 99', 508.5],
  ['15% of 80', 12],
  ['50%', 0.5],
  ['10 % 3', 1],
  ['sqrt(16)', 4],
  ['2^10', 1024],
  ['2 ** 10', 1024],
  ['1,234,567 + 1', 1234568],
  ['round(pi * 100) / 100', 3.14],
  ['log(1000)', 3],
  ['ln(e)', 1],
  ['max(3, 7, 5)', 7],
  ['12 × 3 ÷ 4', 9],
  ['(1 + 2) * -3', -9],
  ['1.5e3 / 3', 500],
];
for (const [expr, want] of cases) near(evalMath(expr), want);
for (const bad of ['alert(1)', 'process.exit()', 'foo + 1', '2 +', '1/0', 'constructor', '', '[1,2]']) {
  assert.throws(() => evalMath(bad), undefined, `should refuse ${JSON.stringify(bad)}`);
}
console.log(`calculate: ${cases.length} expressions right, 8 bad inputs refused`);
