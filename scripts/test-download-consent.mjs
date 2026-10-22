// Node proof of the ask-before-download rule (DOWNLOAD-CONSENT block, index.html; issue #7):
//   1. a model never loaded asks, with the full size left to download;
//   2. a model that loaded and is still in the cache does not ask; a cache that already holds it does not either;
//   3. a Delete in Settings (the cache shrank) asks again;
//   4. a partial download asks, says it resumes, and counts only what is left; `exact` (a shared repo) does not;
//   5. low free space and storage without persistence are named in the question;
//   6. one consent: after the user let downloads under 5 GB through, those do not ask; 5 GB and up still do;
//   7. small downloads never ask; an unknown size (Gemini Nano) asks without a number.
// Run: node scripts/test-download-consent.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const src = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const block = /\/\/ DOWNLOAD-CONSENT[\s\S]*?\/\/ END DOWNLOAD-CONSENT/.exec(src);
assert.ok(block, 'DOWNLOAD-CONSENT block missing from index.html');
const { downloadPlan, downloadMessage } = new Function(block[0] + '\nreturn { downloadPlan, downloadMessage };')();

const GB = 1e9;
const key = 'prism-ml/bonsai-image-ternary-4B-mlx-2bit';
const fmt = (n) => (n / GB).toFixed(1) + ' GB';
const base = { key, expected: 3.3 * GB, free: 100 * GB, persisted: true };
const spec = { label: 'Bonsai 4B · ternary', purpose: 'generate images' };

// 1. Never loaded.
let p = downloadPlan({ ...base, ready: {}, held: 0 });
assert.equal(p.ask, true);
assert.equal(p.remaining, 3.3 * GB);
assert.deepEqual(p.notes, []);
let m = downloadMessage(spec, p, base.free, fmt);
assert.match(m, /^<p[^>]*>To generate images, LocalMind needs <b>Bonsai 4B · ternary<\/b>/);
assert.match(m, /about <b>3\.3 GB<\/b>/);
assert.match(m, /continues from where it stopped/);

// 2. Loaded before and still cached; or the cache already holds about all of it.
assert.deepEqual(downloadPlan({ ...base, ready: { [key]: 3.25 * GB }, held: 3.25 * GB }), { ask: false });
assert.deepEqual(downloadPlan({ ...base, ready: {}, held: 3.2 * GB }), { ask: false });
assert.equal(downloadPlan({ ...base, ready: { other: 3 * GB }, held: 0 }).ask, true, "another model's record does not count");

// 3. Deleted in Settings after it loaded.
p = downloadPlan({ ...base, ready: { [key]: 3.25 * GB }, held: 0 });
assert.equal(p.ask, true);
assert.equal(p.remaining, 3.3 * GB);

// 4. Half downloaded (tab closed mid-way).
p = downloadPlan({ ...base, ready: {}, held: 1.3 * GB });
assert.equal(p.remaining, 2 * GB);
assert.deepEqual(p.notes, ['resume']);
m = downloadMessage(spec, p, base.free, fmt);
assert.match(m, /1\.3 GB is already in this browser/);
assert.match(m, /about <b>2\.0 GB<\/b>/);
assert.equal(downloadPlan({ ...base, ready: {}, held: 4 * GB, exact: false }).ask, false);
// exact: the repo's bytes may belong to another size of the model, so they neither skip nor shrink the question.
p = downloadPlan({ ...base, ready: {}, held: 3.3 * GB, exact: true });
assert.equal(p.ask, true);
assert.equal(p.remaining, 3.3 * GB);
assert.deepEqual(p.notes, []);

// 5. Low space, no persistence.
p = downloadPlan({ ...base, ready: {}, held: 0, free: 1 * GB, persisted: false });
assert.deepEqual(p.notes, ['space', 'not-persistent']);
m = downloadMessage(spec, p, 1 * GB, fmt);
assert.match(m, /about 1\.0 GB free for this site right now/);
assert.match(m, /keep at least \d+(\.\d)? GB free on it/, 'the limit is the disk, not the first quota (live check 2026-10-22: 10.7 GB reported, 26 GB stored)');
assert.match(m, /not granted persistent storage/);
assert.deepEqual(downloadPlan({ ...base, ready: {}, held: 0, free: NaN }).notes, [], 'unknown free space is not low');

// 6. One consent covers later downloads under 5 GB; 5 GB and up still ask.
assert.deepEqual(downloadPlan({ ...base, ready: {}, held: 0, trusted: true }), { ask: false });
assert.equal(downloadPlan({ ...base, expected: 32 * GB, ready: {}, held: 0, trusted: true }).ask, true);
assert.equal(downloadPlan({ ...base, expected: 5 * GB, ready: {}, held: 0, trusted: true }).ask, true);

// 7. Under 100 MB never asks; unknown size asks without a number.
assert.deepEqual(downloadPlan({ ...base, expected: 98e6, ready: {}, held: 0 }), { ask: false });
p = downloadPlan({ ...base, key: 'gemini-nano', expected: Infinity, ready: {}, held: 0, trusted: true, persisted: false });
assert.equal(p.ask, true);
assert.equal(p.remaining, null);
m = downloadMessage({ label: 'Gemini Nano', purpose: 'chat with it' }, p, base.free, fmt);
assert.match(m, /Chrome needs to download <b>Gemini Nano<\/b> once/);
assert.doesNotMatch(m, /NaN|Infinity|null/);

console.log('test-download-consent: 7 groups passed');
