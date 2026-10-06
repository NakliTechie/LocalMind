// Node proof of the Full / Light vision choice (VISION-MODELS block, index.html; Chunk A3):
//   1. phones default to Light, desktops to Full, and a stored choice wins;
//   2. Light is q4f16 on all three SmolVLM-500M modules, Full is fp16;
//   3. the load message carries the chosen dtype, and switching size drops the loaded worker.
// Caption quality of Light is a browser test (plan/night-run-2026-10-06.md item 8).
// Run: node scripts/test-vision-models.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const src = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const block = /\/\/ VISION-MODELS[\s\S]*?\/\/ END VISION-MODELS/.exec(src);
assert.ok(block, 'VISION-MODELS block missing');
const { VISION_MODELS, defaultVisionModel } = new Function(block[0] + '\nreturn { VISION_MODELS, defaultVisionModel };')();

assert.equal(defaultVisionModel(null, true), 'light');
assert.equal(defaultVisionModel(null, false), 'full');
assert.equal(defaultVisionModel('full', true), 'full', 'a stored choice wins on a phone');
assert.equal(defaultVisionModel('light', false), 'light');
assert.equal(defaultVisionModel('bogus', false), 'full');

assert.equal(VISION_MODELS.full.dtype, 'fp16');
assert.deepEqual(VISION_MODELS.light.dtype, { embed_tokens: 'q4f16', vision_encoder: 'q4f16', decoder_model_merged: 'q4f16' });

assert.match(src, /postMessage\(\{ type: 'load', modelId: VISION_MODEL_ID, dtype: visionModel\(\)\.dtype \}\)/);
assert.match(src, /dtype: d\.dtype \|\| 'fp16',/, 'the worker passes the dtype through');
assert.match(src, /visionModelSelect\.addEventListener\('change', \(\) => \{[\s\S]*?VS\.worker\.terminate\(\)/);
assert.doesNotMatch(src, /VIS_PROGRESS_DEFAULT/);

console.log('vision models: all checks passed');
