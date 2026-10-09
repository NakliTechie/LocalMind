// Node proof that "Load .gguf from disk…" can feed an SSD-streamed model (LOCAL-GGUF-SSD block, index.html):
//   1. a picked file of exactly a pinned GGUF's size routes to that model; any other size stays a wllama load;
//   2. the catalog's gguf { file, size } equal the engines' pinned sources (qwen35_moe_ssd.js, gemma4_moe_ssd.js, qwen35_dense.js);
//   3. the file reaches the engine: runtime options → load message → worker → Engine.load({ localFile }), and
//      the engine ingests it through diskformer's fileFetch after a size check.
// fileFetch itself (same store bytes as a download, resume from the same file) is tested in diskformer:
// test/ingest-resume.test.mjs.
// Run: node scripts/test-local-gguf-ssd.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (p) => readFile(new URL(`../${p}`, import.meta.url), 'utf8');
const src = await read('index.html');
const block = /\/\/ LOCAL-GGUF-SSD[\s\S]*?\/\/ END LOCAL-GGUF-SSD/.exec(src);
assert.ok(block, 'LOCAL-GGUF-SSD block missing from index.html');
const ssdModelForFile = new Function(block[0] + '\nreturn ssdModelForFile;')();

// 1. Routing by exact size.
const models = {
  'qwen36-35b-a3b-ssd': { gguf: { file: 'Qwen3.6-35B-A3B-Q8_0.gguf', size: 36903140320 } },
  'gemma4-26b-a4b-ssd': { gguf: { file: 'gemma-4-26B_q4_0-it.gguf', size: 14439363584 } },
  'lfm2-230m-gguf': {},
};
assert.equal(ssdModelForFile({ name: 'x.gguf', size: 14439363584 }, models), 'gemma4-26b-a4b-ssd');
assert.equal(ssdModelForFile({ name: 'Qwen3.6-35B-A3B-Q8_0.gguf', size: 36903140320 }, models), 'qwen36-35b-a3b-ssd');
assert.equal(ssdModelForFile({ name: 'gemma-4-26B_q4_0-it.gguf', size: 14439363583 }, models), null, 'one byte off: not the pinned file');
assert.equal(ssdModelForFile({ name: 'small.gguf', size: 170000000 }, models), null);

// 2. Catalog entries match the engines' pinned files.
const pinned = (code, name) => {
  const m = new RegExp(`export const ${name} = \\{[\\s\\S]*?file: '([^']+)'[\\s\\S]*?size: (\\d+)`).exec(code);
  assert.ok(m, `${name} not found`);
  return { file: m[1], size: Number(m[2]) };
};
const catalog = (key) => {
  const m = new RegExp(`'${key}': \\{[\\s\\S]*?gguf: \\{ file: '([^']+)', size: (\\d+) \\}`).exec(src);
  assert.ok(m, `${key} has no gguf entry`);
  return { file: m[1], size: Number(m[2]) };
};
assert.deepEqual(catalog('qwen36-35b-a3b-ssd'), pinned(await read('src/qwen35_moe_ssd.js'), 'QWEN36_35B_A3B'));
assert.deepEqual(catalog('gemma4-26b-a4b-ssd'), pinned(await read('src/gemma4_moe_ssd.js'), 'GEMMA4_26B_A4B'));
assert.deepEqual(catalog('underdog-saluki-27b'), pinned(await read('src/qwen35_dense.js'), 'UNDERDOG_SALUKI_27B'));

// 3. Wiring.
assert.match(src, /const ssdId = ssdModelForFile\(file, MODELS\);/);
assert.match(src, /localFile: m\.localFile \|\| null,/, 'runtime.loadModel passes the picked file');
assert.match(src, /localFile: \(isWllama \|\| moeSsd\) \? \(options\.localFile \|\| null\) : null,/, 'the load message carries it to the SSD worker');
assert.match(src, /localFile: d\.localFile \|\| undefined,/, 'the SSD worker hands it to Engine.load');
const engine = await read('src/qwen3_moe_ssd.js');
assert.match(engine, /if \(localFile && src\.size && localFile\.size !== src\.size\)/, 'the engine refuses a file of the wrong size');
assert.match(engine, /const fetchFn = localFile \? fileFetch\(localFile\) :/, 'the engine ingests through fileFetch');
assert.match(src, /export function fileFetch\(blob\)/, 'the rolled-in ingest.js has fileFetch');
assert.match(src, /const verb = m && m\.localFile \? \(m\.gguf \? 'Copying from disk' : 'Reading from disk'\) : 'Downloading';/, 'progress says Copying, not Downloading');

console.log('local GGUF → SSD model: all checks passed');
