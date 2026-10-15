// test-prompt-rewriter.mjs — the Image-mode prompt rewriter's pure helpers (promptRewriter block in index.html),
// read out of the shipped file: JSON parse, resample-then-fallback, wh_ratio → size, quoted-text re-injection.
// Also pins the wiring: the wllama worker forwards chat_template_kwargs, the rewriter passes enable_thinking:false,
// and the toggle shows with the server engine only.
//
//   node scripts/test-prompt-rewriter.mjs
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const block = /\/\* promptRewriter:start \*\/([\s\S]*?)\/\* promptRewriter:end \*\//.exec(html);
assert.ok(block, 'promptRewriter block not found in index.html');
const { snapRewriteRatio, parseRewriteOutput, sizeForRewriteRatio, reinjectQuotedText, rewriteImagePrompt } =
  new Function(`${block[1]}; return { snapRewriteRatio, parseRewriteOutput, sizeForRewriteRatio, reinjectQuotedText, rewriteImagePrompt };`)();

// 1. Parse: the Pocket's normal output, a think block, a code fence, text around the object.
const good = '{"rewritten_prompt": "A red fox sitting in fresh snow at dawn, soft golden light.", "wh_ratio": "16:9"}';
assert.deepEqual(parseRewriteOutput(good), { prompt: 'A red fox sitting in fresh snow at dawn, soft golden light.', ratio: '16:9' });
assert.equal(parseRewriteOutput('<think>\n\n</think>\n\n' + good).ratio, '16:9');
assert.equal(parseRewriteOutput('<think>{"rewritten_prompt":"wrong one here"}</think>' + good).ratio, '16:9');
assert.equal(parseRewriteOutput('```json\n' + good + '\n```').ratio, '16:9');
assert.equal(parseRewriteOutput('Here you go: ' + good + ' Enjoy.').ratio, '16:9');
// Missing or odd ratio → still a rewrite, size unchanged.
assert.deepEqual(parseRewriteOutput('{"rewritten_prompt":"A quiet harbour at night."}'), { prompt: 'A quiet harbour at night.', ratio: null });
// Unusable output → null.
for (const bad of [
  '', 'no json at all', '{"rewritten_prompt": "A red fox sitting in', // truncated mid-object (the stream-lag bug)
  '{"wh_ratio":"1:1"}', '{"rewritten_prompt": 42}', '{"rewritten_prompt": "  "}', '[1,2]', null, undefined,
]) assert.equal(parseRewriteOutput(bad), null, `should refuse ${JSON.stringify(bad)}`);

// 2. Ratios: allowed set, separators, snapping, nonsense.
for (const r of ['1:1', '4:3', '3:4', '3:2', '2:3', '16:9', '9:16']) assert.equal(snapRewriteRatio(r), r);
assert.equal(snapRewriteRatio('16/9'), '16:9');
assert.equal(snapRewriteRatio(' 3 x 2 '), '3:2');
assert.equal(snapRewriteRatio('5:4'), '4:3');      // 1.25 → nearest allowed
assert.equal(snapRewriteRatio('21:9'), '16:9');    // 2.33 → still within reach of 16:9
assert.equal(snapRewriteRatio('1920:1080'), '16:9');
for (const bad of ['', 'wide', '0:1', '1:0', '5:1', '1:5', null, 16]) assert.equal(snapRewriteRatio(bad), null, `ratio ${bad}`);

// 3. Size: keeps the chosen pixel count, multiples of 16, transposes match.
assert.deepEqual(sizeForRewriteRatio('1:1', 512, 512), { width: 512, height: 512 });
assert.deepEqual(sizeForRewriteRatio('16:9', 512, 512), { width: 688, height: 384 });
assert.deepEqual(sizeForRewriteRatio('9:16', 512, 512), { width: 384, height: 688 });
assert.deepEqual(sizeForRewriteRatio('3:2', 768, 512), { width: 768, height: 512 });
assert.deepEqual(sizeForRewriteRatio('4:3', 1024, 1024), { width: 1184, height: 880 });
assert.deepEqual(sizeForRewriteRatio(null, 768, 512), { width: 768, height: 512 });
for (const r of ['1:1', '4:3', '3:4', '3:2', '2:3', '16:9', '9:16']) for (const [bw, bh] of [[512, 512], [768, 512], [1024, 1024]]) {
  const { width, height } = sizeForRewriteRatio(r, bw, bh);
  assert.equal(width % 16, 0); assert.equal(height % 16, 0);
  const [a, b] = r.split(':').map(Number);
  assert.ok(Math.abs(width / height - a / b) < 0.06, `${r} at ${bw}x${bh} → ${width}x${height}`);
  assert.ok(Math.abs(width * height / (bw * bh) - 1) < 0.08, `area kept for ${r} at ${bw}x${bh}`);
}

// 4. Quoted text: dropped strings come back once; kept ones and requests without quotes are untouched.
assert.equal(reinjectQuotedText('a cafe sign', 'A cafe sign.'), 'A cafe sign.');
assert.equal(reinjectQuotedText('a sign that says "OPEN"', 'A sign reading "OPEN".'), 'A sign reading "OPEN".');
assert.equal(reinjectQuotedText('a sign saying "Chai 10 Rs" and “Welcome”', 'A roadside tea stall sign.  '),
  'A roadside tea stall sign. The text in the image reads exactly: "Chai 10 Rs", "Welcome".');
assert.equal(reinjectQuotedText('"Hi" and "Hi"', 'x'), 'x The text in the image reads exactly: "Hi".');

// 5. Resample once, then fall back to the raw prompt.
const seq = (...outs) => { let n = 0; const f = async () => { const o = outs[n++]; if (o instanceof Error) throw o; return o; }; f.calls = () => n; return f; };
let g = seq(good);
let r = await rewriteImagePrompt(g, 'a fox');
assert.deepEqual([r.rewritten, r.tries, r.ratio, g.calls()], [true, 1, '16:9', 1]);
g = seq('{"rewritten_prompt": "trunc', good);
r = await rewriteImagePrompt(g, 'a fox');
assert.deepEqual([r.rewritten, r.tries, g.calls()], [true, 2, 2]);
g = seq('garbage', '{"rewritten_prompt": "trunc', good);
r = await rewriteImagePrompt(g, 'a fox');
assert.deepEqual([r.rewritten, r.prompt, r.ratio, r.tries, g.calls()], [false, 'a fox', null, 2, 2], 'two bad draws → raw prompt, no third');
assert.equal(r.reason, 'no valid JSON');
g = seq(new Error('worker died'), good);
r = await rewriteImagePrompt(g, 'a fox');
assert.deepEqual([r.rewritten, r.tries], [true, 2], 'a thrown draw counts as a bad draw');
g = seq(new Error('worker died'), new Error('worker died'));
r = await rewriteImagePrompt(g, 'a "STOP" sign');
assert.deepEqual([r.rewritten, r.prompt, r.reason], [false, 'a "STOP" sign', 'worker died']);
r = await rewriteImagePrompt(seq('{"rewritten_prompt":"A red octagonal road sign on a pole.","wh_ratio":"1:1"}'), 'a "STOP" sign');
assert.equal(r.prompt, 'A red octagonal road sign on a pole. The text in the image reads exactly: "STOP".');

// 6. Wiring in the shipped page.
assert.match(html, /\.\.\.\(cfg\.chat_template_kwargs \? \{ chat_template_kwargs: cfg\.chat_template_kwargs \} : \{\}\)/, 'wllama worker forwards chat_template_kwargs');
assert.match(html, /chat_template_kwargs: \{ enable_thinking: false \}/, 'rewriter turns thinking off');
assert.match(html, /image21-pocket-rewriter-0\.8B-Q8_0\.gguf/, 'rewriter GGUF URL');
assert.match(html, /<label id="imageEnhanceRow" style="display:none"[^>]*>Enhance prompt <input type="checkbox" id="imageEnhance"><\/label>/, 'toggle, hidden and unchecked by default');
assert.match(html, /imageEnhanceRow\.style\.display = server \? '' : 'none';/, 'toggle shows with the server engine only');
assert.match(html, /prompt: prep\.renderPrompt, width: prep\.width, height: prep\.height/, 'server render uses the rewrite and its size');
console.log('prompt-rewriter: parse 15 cases, ratios 20, sizes 27, quoted text 4, resample/fallback 6, wiring 6 — all pass');
