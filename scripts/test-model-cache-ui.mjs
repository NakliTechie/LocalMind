// Static checks for deleting stored models from the picker and Settings → Models → Model cache: the picker's delete
// control, unloading the loaded model before its files go, "Delete all" with its total, and the storage-full pointer.
//   node scripts/test-model-cache-ui.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const fn = (name) => {
  const a = html.indexOf(`function ${name}(`);
  assert.ok(a > 0, `function ${name} exists`);
  const b = html.indexOf('\n    }\n', a);
  return html.slice(a, b);
};

// One delete path for every caller: it touches only the listed groups, and unloads a model reading one of them first.
const del = fn('deleteModelCaches');
assert.match(del, /for \(const g of list\) await g\.remove\(\);/);
assert.doesNotMatch(del, /caches\.keys\(\)|indexedDB\.databases\(\)|getDirectory\(\)/, 'deletes by name: no origin-wide loops');
assert.match(del, /repos\.has\(repoForModel\(MODELS\[key\]\)\)/);
assert.match(del, /if \(uses\(activeModelKey\)\) \{[^]*?resetToNoModel\(/);
assert.ok(del.indexOf('resetToNoModel(') < del.indexOf('g.remove()'), 'unload happens before the stores are removed');
assert.match(del, /if \(generating\) \{/);
assert.match(del, /pickerGroups = await inventoryModelCaches\(\)/);
assert.match(del, /if \(!modelPicker\.hidden\) renderModelPicker\(\);\s*refreshCacheInfo\(\);/);

// The shared unload: worker gone, nothing active, picker back on "Choose a model"; the cancel button reuses it.
const reset = fn('resetToNoModel');
assert.match(reset, /LocalMind\.runtime\.unload\(\)/);
assert.match(reset, /activeModelKey = null;/);
assert.match(reset, /modelReady = false;/);
assert.match(reset, /modelSelect\.selectedIndex = -1;\s*refreshModelPickerLabel\(\);/);
assert.match(html, /progressCancelBtn\.addEventListener\('click', \(\) => \{\s*resetToNoModel\(/);

// Picker rows: stored rows (not Gemini Nano or an endpoint) carry the control with the size it frees.
const render = fn('renderModelPicker');
assert.match(render, /state !== 'download' && m && m\.backend !== 'chrome-ai' && m\.backend !== 'endpoint'/);
assert.match(render, /const label = `Delete \$\{optionName\(o\)\} from this device \(\$\{fmtBytes\(g\.bytes\)\}\)`;/);
assert.match(render, /<button type="button" class="btn-icon btn-danger-text mp-del"[^`]*aria-label="\$\{escapeHtml\(label\)\}"/);
assert.match(html, /\.mp-del \{/);

// Clicking the control confirms with name and size and never selects the row.
const pick = fn('deletePickerModel');
assert.match(pick, /if \(!confirm\(`Delete \$\{name\} from this device\? This frees \$\{fmtBytes\(g\.bytes\)\}/);
assert.match(pick, /await deleteModelCaches\(\[g\]\)/);
assert.doesNotMatch(pick, /pickModel\(|loadModel\(/);
assert.match(html, /const del = e\.target\.closest\('\.mp-del'\);\s*if \(del\) \{ e\.stopPropagation\(\); deletePickerModel\([^;]*\); return; \}\s*const row = e\.target\.closest\('\.mp-opt'\);/);
// Keyboard: Tab from a row reaches its control, Delete presses it, and keys on the control never pick the row.
assert.match(html, /if \(e\.target\.closest\('\.mp-del'\)\) \{[^]*?return;\s*\}/);
assert.match(html, /if \(del && e\.key === 'Tab' && !e\.shiftKey\) \{ e\.preventDefault\(\); del\.focus\(\); return; \}/);
assert.match(html, /if \(del && \(e\.key === 'Delete' \|\| e\.key === 'Backspace'\)\)/);

// Model cache: per-row Delete and "Delete all (<total>)" both go through deleteModelCaches.
const info = fn('refreshCacheInfo');
assert.match(info, /id="clearCacheBtn">Delete all \(\$\{fmtBytes\(total\)\}\)<\/button>/);
assert.match(info, /confirm\(`Delete all \$\{rows\.length\} cached model[^`]*free \$\{fmtBytes\(total\)\}/);
assert.match(info, /await deleteModelCaches\(rows\)/);
assert.match(info, /await deleteModelCaches\(\[g\]\)/);
assert.doesNotMatch(info, /await g\.remove\(\)/, 'no delete path skips the unload');

// Storage-full load errors point at Settings → Models → Model cache.
assert.match(html, /<button type="button" class="btn-icon" id="loadErrorStorage" hidden>Free up storage<\/button>/);
assert.match(html, /<div class="settings-divider" data-tab="models" id="modelCacheSection">\s*<label>Model cache<\/label>/);
assert.match(fn('showLoadError'), /loadErrorStorage\.hidden = !\(isStorageFullError\(cause\)/);
assert.match(html, /loadErrorStorage\.addEventListener\('click', \(\) => openSettings\('models', 'modelCacheSection'\)\);/);
const re = /const isStorageFullError = \(msg\) => (\/.*\/i)\.test/.exec(html);
assert.ok(re, 'isStorageFullError exists');
const isFull = new Function(`return (m) => ${re[1]}.test(m)`)();
for (const m of ['QuotaExceededError: The quota has been exceeded.', 'Failed to write: storage is full', 'not enough disk space'])
  assert.ok(isFull(m), m);
for (const m of ['HTTP 404', 'no download progress for 3 minutes', 'WebGPU device lost'])
  assert.ok(!isFull(m), m);

console.log('test-model-cache-ui: all assertions passed');
