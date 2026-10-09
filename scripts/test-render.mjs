// test-render.mjs — the chat bubble's text rendering, run from index.html's own source in node (no browser).
//   1. Inline math: pandoc's dollar rule (replaceInlineMath) — Underdog Saluki's "$x$" / "$2x = 0.10$" render as math,
//      prices stay text, an escaped \$ stays a dollar, a rejected opening does not swallow the next span.
//   2. Streaming: streamDisplayText hides tool-call markup at every prefix of a streamed reply (closed blocks, an
//      unclosed block, a half-arrived opening tag, LFM2's <|tool_call_start|> markers) and leaves other text alone.
//
//   node scripts/test-render.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
// The source of a top-level `function <name>(…) { … }` in the page's module: from its declaration to the first line
// that closes it at the same 4-space indent (regex literals full of quotes and braces defeat brace counting).
function fn(name) {
  const at = html.indexOf(`\n    function ${name}(`);
  assert.ok(at >= 0, `function ${name} not found in index.html`);
  const end = html.indexOf('\n    }\n', at + 1);
  assert.ok(end > at, `end of function ${name} not found`);
  return html.slice(at + 1, end + 6);
}
const ctx = { katex: { renderToString: (e) => `[M:${e}]` } };
vm.createContext(ctx);
vm.runInContext(['escapeHtml', 'replaceInlineMath', 'renderMarkdown', 'stripToolCallTags', 'streamDisplayText'].map(fn).join('\n'), ctx);
const { renderMarkdown, streamDisplayText, replaceInlineMath } = ctx;
const maths = (t) => [...renderMarkdown(t).matchAll(/\[M:([^\]]*)\]/g)].map((m) => m[1]);

// 1. Inline math.
const saluki = 'The ball costs **$0.05** (5 cents).\n\nIf the ball is $x$, the bat is $x + 1.00$. Together: $x + (x + 1.00) = 1.10$, so $2x = 0.10$, giving $x = 0.05$.';
assert.deepEqual(maths(saluki), ['x', 'x + 1.00', 'x + (x + 1.00) = 1.10', '2x = 0.10', 'x = 0.05'], 'Saluki reasoning answer');
assert.match(renderMarkdown(saluki), /<strong>\$0\.05<\/strong>/, 'a bold price stays a price');
assert.deepEqual(maths('It costs $5 and $10 today.'), [], 'two prices');
assert.deepEqual(maths('Pick $5,$10 or $20.'), [], 'prices separated by a comma');
assert.deepEqual(maths('A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball.'), [], 'prices in a question');
assert.deepEqual(maths('The ball costs $0.05. If the ball is $x$, done.'), ['x'], 'a rejected price does not swallow the next span');
assert.deepEqual(maths('Area $\\pi r^2$ and $$\\sum_{i=1}^n i$$'), ['\\pi r^2', '\\sum_{i=1}^n i'], 'LaTeX inline and display');
assert.deepEqual(maths('Escaped \\$5 and $y$'), ['y'], 'an escaped dollar is literal');
assert.deepEqual(maths('Line one $a\nline two b$'), [], 'math never spans a newline');
assert.deepEqual(maths('Use `$x$` in code'), ['x'], 'inline code is outside this test (renderer order unchanged)');
assert.equal(replaceInlineMath('no dollars here', () => 'X'), 'no dollars here');

// 2. Streaming display.
const reply = 'Let me check.\n<tool_call>\n{"name": "get_current_time", "arguments": {"timezone": "UTC"}}\n</tool_call>\n<tool_call>\n{"name": "calculate", "arguments": {"expression": "123456 * 789"}}\n</tool_call>';
for (let n = 0; n <= reply.length; n++) {
  const shown = streamDisplayText(reply.slice(0, n)) || '';
  assert.doesNotMatch(shown, /<t|tool_call|"name"/, `markup visible at prefix ${n}: ${JSON.stringify(shown)}`);
  if (n >= 'Let me check.'.length) assert.equal(shown, 'Let me check.', `text lost at prefix ${n}`);
}
const lfm = 'Sure. <|tool_call_start|>[get_current_time(timezone="UTC")]<|tool_call_end|>';
for (let n = 0; n <= lfm.length; n++) assert.doesNotMatch(streamDisplayText(lfm.slice(0, n)) || '', /<\||tool_call/, `LFM2 markup visible at prefix ${n}`);
assert.equal(streamDisplayText('a < b and x <tag> y'), 'a < b and x <tag> y', 'other angle brackets untouched');
assert.equal(streamDisplayText('<|think|>pondering'), '<|think|>pondering', 'think markers untouched');
assert.equal(streamDisplayText('Ends with <t'), 'Ends with', 'a half-arrived tag is hidden');

console.log('render: ok — inline math (pandoc rule) and streaming tool-call markup');
