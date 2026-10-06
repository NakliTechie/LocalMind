// Node proof of the model-download ETA (DOWNLOAD-ETA block, index.html; UX review H1):
//   1. no estimate before 3 s of data, then rate and time left from the last 20 s only;
//   2. a resumed download (loaded starts high) is timed from where it resumed, not from 0;
//   3. a drop in `loaded` (a new file, a restart) starts the window again;
//   4. the wording: seconds rounded to 5, minutes, hours;
//   5. the progress handler shows it and the load path resets it.
// Run: node scripts/test-download-eta.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const src = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const block = /\/\/ DOWNLOAD-ETA[\s\S]*?\/\/ END DOWNLOAD-ETA/.exec(src);
assert.ok(block, 'DOWNLOAD-ETA block missing from index.html');
const { createEtaTracker, formatEta } = new Function(block[0] + '\nreturn { createEtaTracker, formatEta };')();

const MB = 1024 * 1024;

// 1. Warm-up, then a steady 10 MB/s.
let eta = createEtaTracker();
assert.equal(eta.push(0, 500 * MB, 0), null);
assert.equal(eta.push(20 * MB, 500 * MB, 2000), null, 'under 3 s: no estimate');
let r = eta.push(40 * MB, 500 * MB, 4000);
assert.ok(Math.abs(r.rate - 10 * MB) < 1);
assert.ok(Math.abs(r.secondsLeft - 46) < 0.01);

// The window: 60 s at 1 MB/s, then 10 s at 20 MB/s. The 20 s window sees mostly the fast part.
eta = createEtaTracker();
let loaded = 0;
for (let t = 0; t <= 60000; t += 1000) { eta.push(loaded, 2000 * MB, t); loaded += MB; }
for (let t = 61000; t <= 70000; t += 1000) { loaded += 20 * MB; r = eta.push(loaded, 2000 * MB, t); }
assert.ok(r.rate > 9 * MB && r.rate < 12 * MB, `windowed rate ${r.rate / MB} MB/s`);

// 2. Resume at 900 of 1000 MB, 5 MB/s from there: 20 s left, not a rate counted from 0.
eta = createEtaTracker();
eta.push(900 * MB, 1000 * MB, 0);
r = eta.push(925 * MB, 1000 * MB, 5000);
assert.ok(Math.abs(r.rate - 5 * MB) < 1);
assert.ok(Math.abs(r.secondsLeft - 15) < 0.01);

// 3. loaded drops: the window restarts, so no estimate until 3 s more.
assert.equal(eta.push(10 * MB, 1000 * MB, 6000), null);
assert.equal(eta.push(20 * MB, 1000 * MB, 8000), null);
assert.ok(eta.push(40 * MB, 1000 * MB, 9500));
// Finished, stalled or no total: nothing.
assert.equal(eta.push(1000 * MB, 1000 * MB, 20000), null);
eta.reset();
eta.push(5, 1000, 0);
assert.equal(eta.push(5, 1000, 5000), null, 'no bytes moved: no estimate');

// 4. Wording.
assert.equal(formatEta(2), '~5 s left');
assert.equal(formatEta(41), '~45 s left');
assert.equal(formatEta(89), '~1 min left');
assert.equal(formatEta(46 * 60), '~46 min left');
assert.equal(formatEta(2 * 3600 + 7 * 60), '~2 h 7 min left');
assert.equal(formatEta(Infinity), '');
assert.equal(formatEta(NaN), '');

// 5. Wiring.
assert.match(src, /const est = downloadEta\.push\(p\.loaded, p\.total\);/);
assert.match(src, /currentDownloadFile = '';\n\s*downloadEta\.reset\(\);/);
assert.match(src, /chatInput\.placeholder = `Loading \$\{m\.label\} — \$\{pct\}%/);

console.log('download ETA: all checks passed');
