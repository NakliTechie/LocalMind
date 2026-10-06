// Node proof of the wiring that keeps generated images (IMAGE-STORE block, index.html; Open Q#1):
//   1. every image run saves its PNG + prompt/size/seed/steps/engine to IndexedDB, best-effort (a failed save only warns);
//   2. the Library has an Images tab that lists, opens, downloads and deletes them, and a command for it;
//   3. the store is its own database (localmind-images), separate from chats and memory.
// The IndexedDB round trip (save → reload → list → delete) is checked in a browser.
// Run: node scripts/test-library-images.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const src = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const block = /\/\/ IMAGE-STORE[\s\S]*?\/\/ END IMAGE-STORE/.exec(src);
assert.ok(block, 'IMAGE-STORE block missing');
assert.match(block[0], /const IMAGE_DB = 'localmind-images', IMAGE_STORE = 'images';/);
for (const fn of ['saveImageRecord', 'deleteImageRecord', 'clearImageRecords', 'listImageRecords']) assert.match(block[0], new RegExp(fn));

const run = /async function runImageGen\(prompt\) \{[\s\S]*?\n    \}\n/.exec(src)[0];
assert.match(run, /saveImageRecord\(\{ id: `img-\$\{Date\.now\(\)\}-\$\{res\.seed\}`, created: Date\.now\(\), prompt, width: res\.width, height: res\.height,\s*seed: res\.seed, steps, engine:/);
assert.match(run, /\.catch\(\(e\) => console\.warn\('Could not save the image to the Library:', e\)\);/, 'a failed save does not fail the run');
assert.ok(run.indexOf('saveImageRecord(') < run.indexOf('showImagePreview(shown)'), 'saved as soon as the PNG exists');

assert.match(src, /data-lib-tab="images" role="tab"/);
assert.match(src, /<div data-lib="images" hidden>/);
assert.match(src, /else if \(tab === 'images'\) refreshLibraryImages\(\);/);
assert.match(src, /\{ id: 'library\.images', title: 'Library: saved images', group: 'Data', run: \(\) => openLibrary\('images'\) \}/);
assert.match(src, /del\.addEventListener\('click', async \(\) => \{ await deleteImageRecord\(r\.id\); refreshLibraryImages\(\); \}\);/);
assert.match(src, /dl\.download = `localmind-\$\{r\.seed\}\.png`/);

console.log('library images: all checks passed');
