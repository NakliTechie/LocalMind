import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../inference-worker.js', import.meta.url), 'utf8');
const protocol = await readFile(new URL('../INFERENCE-PROTOCOL.md', import.meta.url), 'utf8');

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

console.log('LocalMind inference worker contract: ok');
