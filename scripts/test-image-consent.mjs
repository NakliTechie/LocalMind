// Node proof of the Image-mode download question (IMAGE-CONSENT block, index.html; issue #7):
//   1. a model never loaded asks, with the full size left to download;
//   2. a model that loaded and is still in the cache does not ask;
//   3. a Delete in Settings (the cache shrank) asks again;
//   4. a partial download asks, says it resumes, and counts only what is left;
//   5. low free space and storage without persistence are named in the question.
// Run: node scripts/test-image-consent.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const src = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const block = /\/\/ IMAGE-CONSENT[\s\S]*?\/\/ END IMAGE-CONSENT/.exec(src);
assert.ok(block, 'IMAGE-CONSENT block missing from index.html');
const { imageDownloadPlan, imageDownloadMessage } = new Function(block[0] + '\nreturn { imageDownloadPlan, imageDownloadMessage };')();

const GB = 1e9;
const id = 'prism-ml/bonsai-image-ternary-4B-mlx-2bit';
const fmt = (n) => (n / GB).toFixed(1) + ' GB';
const base = { modelId: id, expected: 3.3 * GB, free: 100 * GB, persisted: true };

// 1. Never loaded.
let p = imageDownloadPlan({ ...base, ready: {}, held: 0 });
assert.equal(p.ask, true);
assert.equal(p.remaining, 3.3 * GB);
assert.deepEqual(p.notes, []);
let m = imageDownloadMessage('Bonsai 4B · ternary', p, base.free, fmt);
assert.match(m, /about <b>3\.3 GB<\/b>/);
assert.match(m, /continues from where it stopped/);

// 2. Loaded before and still cached: no question.
p = imageDownloadPlan({ ...base, ready: { [id]: 3.25 * GB }, held: 3.25 * GB });
assert.deepEqual(p, { ask: false });
// Another model's record does not count for this one.
assert.equal(imageDownloadPlan({ ...base, ready: { other: 3 * GB }, held: 0 }).ask, true);

// 3. Deleted in Settings after it loaded.
p = imageDownloadPlan({ ...base, ready: { [id]: 3.25 * GB }, held: 0 });
assert.equal(p.ask, true);
assert.equal(p.remaining, 3.3 * GB);

// 4. Half downloaded (tab closed mid-way).
p = imageDownloadPlan({ ...base, ready: {}, held: 1.3 * GB });
assert.equal(p.ask, true);
assert.equal(p.remaining, 2 * GB);
assert.deepEqual(p.notes, ['resume']);
m = imageDownloadMessage('Bonsai 4B · ternary', p, base.free, fmt);
assert.match(m, /1\.3 GB is already in this browser/);
assert.match(m, /about <b>2\.0 GB<\/b>/);
// More held than the estimate: nothing negative.
assert.equal(imageDownloadPlan({ ...base, ready: {}, held: 4 * GB }).remaining, 0);

// 5. Low space, no persistence.
p = imageDownloadPlan({ ...base, ready: {}, held: 0, free: 1 * GB, persisted: false });
assert.deepEqual(p.notes, ['space', 'not-persistent']);
m = imageDownloadMessage('Bonsai 4B · ternary', p, 1 * GB, fmt);
assert.match(m, /about 1\.0 GB of storage free/);
assert.match(m, /not granted persistent storage/);
// Unknown free space (estimate() failed) is not reported as low.
assert.deepEqual(imageDownloadPlan({ ...base, ready: {}, held: 0, free: NaN }).notes, []);

console.log('test-image-consent: 5 groups passed');
