// Node proof of the wllama 3.4.1 stream-lag fix (WLLAMA-DRAIN block in index.html's #wllamaWorkerSrc):
//   1. drainWllamaResults() reads get_result until the queue is empty and returns the leftover chunks, parsing the
//      array form, skipping 'null' and empty payloads while has_more is set, and stopping at 64 reads;
//   2. no proxy (another wllama build) → no reads, no throw;
//   3. the worker drains before every generation (a stopped turn's leftovers) and after the stream, posting the
//      leftover text as part of this reply unless the user stopped.
// Live A/B (2026-10-06, LFM2.5 230M GGUF, 8 back-to-back temperature-0 requests): before, run 4 ended "…kiw" and
// runs 5–7 began with the previous tail ("is", " 12", " kiwis"); after, 8/8 complete and clean.
// Run: node scripts/test-wllama-drain.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const src = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const block = /\/\/ WLLAMA-DRAIN[\s\S]*?\/\/ END WLLAMA-DRAIN/.exec(src);
assert.ok(block, 'WLLAMA-DRAIN block missing');
const drain = new Function(block[0] + '\nreturn drainWllamaResults;')();

const chunk = (t, f = null) => ({ choices: [{ delta: { content: t }, finish_reason: f }] });
const fake = (results) => { let n = 0; return { calls: () => n, proxy: { async wllamaAction(name, arg) {
  assert.equal(name, 'get_result'); assert.deepEqual(arg, { _name: 'gres_req' }); return results[n++] ?? { data_json: '', has_more: false }; } } }; };

// 1. One lagging chunk (the real case): the final stop chunk, then empty.
let f = fake([{ data_json: JSON.stringify([chunk('w', null)]), has_more: false }, { data_json: JSON.stringify([chunk('', 'stop')]), has_more: false }]);
let got = await drain(f);
assert.deepEqual(got.map((c) => c.choices[0].delta.content), ['w', '']);
assert.equal(f.calls(), 3, 'reads until an empty payload');
// 'null' / empty while has_more → keep reading; a bare object is accepted.
f = fake([{ data_json: 'null', has_more: true }, { data_json: '', has_more: true }, { data_json: JSON.stringify(chunk('x')), has_more: false }]);
assert.equal((await drain(f)).length, 1);
// Bounded: a queue that never empties stops at 64 reads.
let n = 0; const endless = { proxy: { async wllamaAction() { n++; return { data_json: JSON.stringify([chunk('y')]), has_more: true }; } } };
assert.equal((await drain(endless)).length, 64); assert.equal(n, 64);
// Bad JSON stops the drain.
f = fake([{ data_json: '{oops', has_more: true }]);
assert.deepEqual(await drain(f), []);

// 2. No proxy.
assert.deepEqual(await drain({}), []); assert.deepEqual(await drain(null), []);

// 3. Wiring in the worker.
const worker = /<script type="text\/worker" id="wllamaWorkerSrc">([\s\S]*?)<\/script>/.exec(src)[1];
assert.match(worker, /try \{ await drainWllamaResults\(wllama\); \} catch \(_\) \{\}\s*\/\/ anything a stopped turn left queued\s*try \{\s*const stream = await wllama\.createChatCompletion\(/);
assert.match(worker, /const left = await drainWllamaResults\(wllama\);\s*if \(!stopFlag\) for \(const chunk of left\)/);

console.log('wllama drain: all checks passed');
