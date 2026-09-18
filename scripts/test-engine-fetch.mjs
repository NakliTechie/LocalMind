// Node proof of the shared engine-worker prelude (#engineWorkerPreludeSrc):
//   1. inference-worker.js carries a byte-identical copy (the two cannot drift);
//   2. all three custom-WGSL workers hand `engineFetch` to their engine's load();
//   3. engineFetch's runtime contract against a mocked fetch — passthrough for
//      non-range requests, retry on 5xx/429, mid-range body drop resumed at the
//      exact next byte and spliced into one stream, Authorization: Bearer on
//      huggingface.co only, abort honoured without a retry.
// Run: node scripts/test-engine-fetch.mjs
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const indexSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const workerSource = await readFile(new URL('../inference-worker.js', import.meta.url), 'utf8');

const block = (id) => {
  const m = new RegExp(`<script type="text/worker" id="${id}">([\\s\\S]*?)</script>`).exec(indexSource);
  assert.ok(m, `worker block #${id} missing from index.html`);
  return m[1];
};
const prelude = block('engineWorkerPreludeSrc');

// 1. Drift guard.
assert.ok(prelude.includes('const engineFetch = async'), 'prelude defines engineFetch');
assert.ok(prelude.includes('self.requestAnimationFrame = (cb) => setTimeout('), 'prelude installs the rAF shim');
assert.ok(workerSource.includes(prelude.trimEnd()), 'inference-worker.js must carry the prelude byte-for-byte (copy #engineWorkerPreludeSrc from index.html)');

// 2. Wiring.
assert.match(workerSource, /Lfm2Mobile\.load\([^]*?fetch: engineFetch,/);
assert.doesNotMatch(workerSource, /accessToken:/);
assert.match(block('gemma4WebgpuWorkerSrc'), /Gemma4Mobile\.load\([^]*?fetch: engineFetch,/);
assert.doesNotMatch(block('gemma4WebgpuWorkerSrc'), /accessToken:/);
assert.match(block('ternaryBonsai2WebgpuWorkerSrc'), /TernaryBonsai2\.load\([^]*?fetch: engineFetch,/);
assert.doesNotMatch(block('gemma4WebgpuWorkerSrc') + block('ternaryBonsai2WebgpuWorkerSrc'), /const engineFetch|self\.requestAnimationFrame =/);
assert.match(indexSource, /code = engineWorkerPrelude\(\) \+ code\.replaceAll\('__GEMMA4_ENGINE_URL__'/);
assert.match(indexSource, /code = engineWorkerPrelude\(\) \+ code\.replaceAll\('__TERNARY_BONSAI2_ENGINE_URL__'/);

// 3. Runtime contract. Load the prelude as a module with a worker-shaped global.
globalThis.self = globalThis;
self.location = { href: 'https://localmind.naklitechie.com/' };
const dir = await mkdtemp(join(tmpdir(), 'lm-prelude-'));
const modPath = join(dir, 'prelude.mjs');
await writeFile(modPath, prelude + '\nexport { engineFetch, parseRangeHeader };\nexport const setToken = (t) => { hfToken = t; };\n');
const { engineFetch, parseRangeHeader, setToken } = await import(pathToFileURL(modPath).href);

assert.deepEqual(parseRangeHeader({ headers: { Range: 'bytes=10-19' } }), { start: 10, end: 19 });
assert.deepEqual(parseRangeHeader({ headers: { Range: 'bytes=10-' } }), { start: 10, end: null });
assert.equal(parseRangeHeader({}), null);

const FILE = new Uint8Array(1000);
for (let i = 0; i < FILE.length; i++) FILE[i] = i % 251;
const calls = [];
let script = [];
const partial = (start, end, dropAfter = null) => {
  const bytes = FILE.subarray(start, end + 1);
  // A drop delivers `dropAfter` bytes on one pull and errors on the NEXT pull:
  // erroring in the same pull would discard the queued chunk (Streams spec).
  let pulls = 0;
  const body = new ReadableStream({
    pull(controller) {
      if (dropAfter != null) {
        if (pulls++ === 0) { controller.enqueue(bytes.slice(0, dropAfter)); return; }
        controller.error(new TypeError('network error: body dropped'));
        return;
      }
      controller.enqueue(bytes.slice());
      controller.close();
    },
  });
  return new Response(body, { status: 206, headers: { 'Content-Range': `bytes ${start}-${end}/${FILE.length}` } });
};
globalThis.fetch = async (url, init = {}) => {
  const headers = new Headers(init.headers);
  calls.push({ url: String(url), range: headers.get('range'), auth: headers.get('authorization') });
  const step = script.shift();
  if (step === 'reject') throw new TypeError('Failed to fetch');
  if (typeof step === 'number') return new Response('', { status: step });
  if (step && step.drop != null) {
    const m = /^bytes=(\d+)-(\d+)$/.exec(headers.get('range'));
    return partial(Number(m[1]), Number(m[2]), step.drop);
  }
  const r = headers.get('range') && /^bytes=(\d+)-(\d+)$/.exec(headers.get('range'));
  if (r) return partial(Number(r[1]), Number(r[2]));
  return new Response('plain', { status: 200 });
};
const readAll = async (res) => {
  const chunks = [];
  const reader = res.body.getReader();
  for (;;) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); }
  const out = new Uint8Array(chunks.reduce((n, c) => n + c.byteLength, 0));
  let o = 0; for (const c of chunks) { out.set(c, o); o += c.byteLength; }
  return out;
};
const reset = () => { calls.length = 0; script = []; };

// Passthrough: no Range header → one plain fetch, no auth without a token.
reset();
assert.equal(await (await engineFetch('https://huggingface.co/x/resolve/main/config.json')).text(), 'plain');
assert.deepEqual(calls, [{ url: 'https://huggingface.co/x/resolve/main/config.json', range: null, auth: null }]);

// Clean range read.
reset();
assert.deepEqual(Array.from(await readAll(await engineFetch('https://cdn/x.gguf', { headers: { Range: 'bytes=100-199' } }))), Array.from(FILE.subarray(100, 200)));
assert.deepEqual(calls.map((c) => c.range), ['bytes=100-199']);

// Transient failures before the first byte: rejected fetch, then 503, then 429, then 206.
reset();
script = ['reject', 503, 429];
const t0 = Date.now();
assert.deepEqual(Array.from(await readAll(await engineFetch('https://cdn/x.gguf', { headers: { Range: 'bytes=0-9' } }))), Array.from(FILE.subarray(0, 10)));
assert.equal(calls.length, 4);
assert.ok(Date.now() - t0 >= 6000 - 50, 'backoff 1s + 2s + 3s ran');

// Body dropped mid-range: resumed at the exact next byte, spliced into one stream.
reset();
script = [{ drop: 37 }];
const res = await engineFetch('https://cdn/x.gguf', { headers: { Range: 'bytes=200-299' } });
assert.equal(res.status, 206);
assert.deepEqual(Array.from(await readAll(res)), Array.from(FILE.subarray(200, 300)));
assert.deepEqual(calls.map((c) => c.range), ['bytes=200-299', 'bytes=237-299']);

// Retries exhausted → the last error surfaces.
reset();
script = [503, 503, 503, 503];
await assert.rejects(engineFetch('https://cdn/x.gguf', { headers: { Range: 'bytes=0-9' } }), /HTTP 503 on range read/);
assert.equal(calls.length, 4);

// Token: Authorization on huggingface.co only; cleared token → no header.
reset();
setToken('hf_test');
await engineFetch('https://huggingface.co/x/resolve/main/x.gguf', { headers: { Range: 'bytes=0-9' } });
await engineFetch('https://cas-bridge.xethub.hf.co/x.gguf', { headers: { Range: 'bytes=0-9' } });
await engineFetch('https://huggingface.co/api/models/x');
setToken(null);
await engineFetch('https://huggingface.co/x/resolve/main/x.gguf', { headers: { Range: 'bytes=0-9' } });
assert.deepEqual(calls.map((c) => c.auth), ['Bearer hf_test', null, 'Bearer hf_test', null]);

// Abort: no retry, AbortError surfaces.
reset();
script = ['reject'];
const ac = new AbortController();
ac.abort();
await assert.rejects(engineFetch('https://cdn/x.gguf', { headers: { Range: 'bytes=0-9' }, signal: ac.signal }), (e) => e.name === 'AbortError');
assert.equal(calls.length, 0);

console.log('engine worker prelude (rAF shim + engineFetch): ok');
