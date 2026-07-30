import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../inference-worker.js', import.meta.url), 'utf8');
const onnxSource = await readFile(new URL('../onnx-inference-worker.js', import.meta.url), 'utf8');
const protocol = await readFile(new URL('../INFERENCE-PROTOCOL.md', import.meta.url), 'utf8');
await import(new URL('../host-model-catalog.js', import.meta.url));
const catalog = globalThis.LocalMindHostCatalog;

assert.match(source, /localmind\.inference\.v1/);
assert.match(source, /new URL\('\.\/lfm2_5\.js', import\.meta\.url\)/);
assert.match(source, /type: 'ready'/);
assert.match(source, /type: 'token'/);
assert.match(source, /type: 'complete'/);
assert.match(source, /type: 'error'/);
assert.match(source, /request\.type === 'stop'/);
assert.match(source, /request\.type === 'unload'/);
assert.match(source, /config\.reset === true/);
assert.match(protocol, /Only one generation can be active/);
assert.match(onnxSource, /localmind\.inference\.v1/);
assert.match(onnxSource, /@huggingface\/transformers@4/);
assert.match(onnxSource, /Gemma4ForConditionalGeneration/);
assert.match(onnxSource, /AutoModelForCausalLM/);
assert.match(onnxSource, /request\.type === 'unload'/);
assert.equal(catalog.defaultKey, 'lfm2-230m-webgpu');
assert.deepEqual(
  catalog.models.map((model) => model.key),
  ['lfm2-230m-webgpu', 'gemma4-e2b', 'gemma4-e4b', 'qwen3-4b'],
);
assert.ok(catalog.models.every((model) => model.worker));

console.log('LocalMind inference workers and host catalog: ok');
