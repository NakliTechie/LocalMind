// Node proof of the chat worker's download stall guard (STALL-GUARD block in
// createWorker's source, index.html):
//   1. the generated worker source still parses, and its resumable download path
//      reads the body through __stallGuardedBody, not a bare getReader();
//   2. the guard's runtime contract against a mocked fetch: a body that stops
//      delivering mid-file is reopened at the exact next byte; a request that never
//      returns headers is aborted and retried; 503 is retried; slow-but-moving
//      bodies are never cut; no bytes through every retry fails loudly;
//   3. every other Hugging Face request is bounded too: whole-file GETs the
//      resumable path skips (under 5 MB, resumable off, its fallbacks) stream
//      through the same guard, a 404 comes back as a 404, and the HEAD / 1-byte
//      existence probes get a headers timeout that honours the caller's abort.
// Run: node scripts/test-download-stall.mjs
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const indexSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const m = /function createWorker\(\) \{\n      const code = `([\s\S]*?)\n`;\n      const blob/.exec(indexSource);
assert.ok(m, 'createWorker() template missing from index.html');
// Cook the template exactly as the browser does, then syntax-check the result.
const workerSource = new Function('return `' + m[1] + '\n`;')();
const dir = await mkdtemp(join(tmpdir(), 'lm-stall-'));
await writeFile(join(dir, 'worker.mjs'), workerSource);
execFileSync(process.execPath, ['--check', join(dir, 'worker.mjs')]);

// 1. Wiring.
assert.match(workerSource, /const body = __stallGuardedBody\(urlStr, startByte, totalSize, __origFetch\);/);
assert.match(workerSource, /try \{ await body\.open\(\); \}\s*catch \{ closeDb\(\); return __guardedGet\(urlStr, __origFetch\); \}/);
assert.match(workerSource, /if \(method === 'HEAD' \|\| callerRange\) return __boundedFetch\(input, init, __origFetch\);/);
assert.match(workerSource, /if \(!__resumableEnabled\) return __guardedGet\(urlStr, __origFetch\);/);
assert.match(workerSource, /const headResp = await __boundedFetch\(urlStr, \{ method: 'HEAD' \}, __origFetch\);/);
// Only non-HF / non-GET-or-HEAD traffic may reach the bare fetch now.
assert.equal(workerSource.match(/return __origFetch\(input, init\);/g).length, 1, 'every HF fallback goes through __guardedGet');
assert.match(workerSource, /const reader = body;/);
assert.doesNotMatch(workerSource, /rangeResp\.body\.getReader\(\)/);
assert.match(workerSource, /cancel\(\) \{ body\.cancel\(\); closeDb\(\); \}/);

// 2. Runtime contract, with the stall window shrunk to 40 ms.
const guard = /\/\/ STALL-GUARD-START([\s\S]*?)\/\/ STALL-GUARD-END/.exec(workerSource);
assert.ok(guard, 'STALL-GUARD block missing');
assert.match(guard[1], /const __STALL_MS = 30000;/);
const modPath = join(dir, 'guard.mjs');
await writeFile(modPath, guard[1].replace('const __STALL_MS = 30000;', 'const __STALL_MS = 40;') + '\nexport { __stallGuardedBody, __guardedGet, __boundedFetch };\n');
const { __stallGuardedBody, __guardedGet, __boundedFetch } = await import(pathToFileURL(modPath).href);

const FILE = new Uint8Array(1000);
for (let i = 0; i < FILE.length; i++) FILE[i] = i % 251;
const never = (signal) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason)));

// A fake fetch driven by a script of steps, one per request:
//   { stallAfter: n }  206 body that delivers n bytes then goes silent (never errors)
//   { slow: ms }       206 body that delivers 100 bytes per pull, each after `ms`
//   'hang'             never returns headers (until aborted)
//   503                that status
//   undefined          a clean 206 of the rest of the file
const makeFetch = (script) => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    const from = Number(/^bytes=(\d+)-$/.exec(new Headers(init.headers).get('range'))[1]);
    calls.push(from);
    const step = script.shift();
    if (step === 'hang') return never(init.signal);
    if (typeof step === 'number') return new Response('', { status: step });
    const partial = { 'content-range': `bytes ${from}-${FILE.length - 1}/${FILE.length}`, 'content-length': String(FILE.length - from), 'content-type': 'application/json' };
    const rest = FILE.subarray(from);
    let pos = 0;
    const body = new ReadableStream({
      async pull(c) {
        if (step && step.stallAfter != null && pos >= step.stallAfter) return never(init.signal);
        if (step && step.slow) await new Promise((r) => setTimeout(r, step.slow));
        const n = step && step.stallAfter != null ? step.stallAfter - pos : step && step.slow ? 100 : rest.length;
        const chunk = rest.slice(pos, pos + n);
        pos += chunk.length;
        if (chunk.length) c.enqueue(chunk);
        if (pos >= rest.length) c.close();
      },
    });
    return new Response(body, { status: 206, headers: partial });
  };
  return { fetchImpl, calls };
};
const drain = async (b) => {
  const parts = [];
  for (;;) { const { done, value } = await b.read(); if (done) break; parts.push(value); }
  const out = new Uint8Array(parts.reduce((a, p) => a + p.length, 0));
  let o = 0; for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
};
const run = async (from, script) => {
  const f = makeFetch(script);
  const b = __stallGuardedBody('https://huggingface.co/x/resolve/main/model.onnx', from, FILE.length, f.fetchImpl);
  await b.open();
  return { bytes: await drain(b), calls: f.calls };
};

// Silent mid-body stalls → reopened at the exact next byte, bytes identical.
{
  const { bytes, calls } = await run(0, [{ stallAfter: 300 }, { stallAfter: 250 }, undefined]);
  assert.deepEqual(calls, [0, 300, 550]);
  assert.deepEqual(bytes, FILE);
}
// Resuming from a saved-chunk offset keeps absolute byte positions.
{
  const { bytes, calls } = await run(400, [{ stallAfter: 100 }, undefined]);
  assert.deepEqual(calls, [400, 500]);
  assert.deepEqual(bytes, FILE.subarray(400));
}
// Headers that never arrive, then a 503 → aborted, retried, then served.
{
  const { bytes, calls } = await run(0, ['hang', 503, undefined]);
  assert.deepEqual(calls, [0, 0, 0]);
  assert.deepEqual(bytes, FILE);
}
// A slow link that keeps delivering (pulls 30 ms apart, window 40 ms) is never cut.
{
  const { bytes, calls } = await run(0, [{ slow: 30 }]);
  assert.deepEqual(calls, [0]);
  assert.deepEqual(bytes, FILE);
}
// Progress resets the budget: 7 stalls, each after new bytes, still completes.
{
  const script = [...Array(7)].map(() => ({ stallAfter: 100 }));
  script.push(undefined);
  const { bytes, calls } = await run(0, script);
  assert.equal(calls.length, 8);
  assert.deepEqual(bytes, FILE);
}
// No bytes through every retry → the load fails with the stall error, not a freeze.
{
  const f = makeFetch([...Array(10)].map(() => ({ stallAfter: 0 })));
  const b = __stallGuardedBody('https://huggingface.co/x', 0, FILE.length, f.fetchImpl);
  await b.open();
  await assert.rejects(drain(b), /download stalled/);
  assert.equal(f.calls.length, 6); // first open + __STALL_RETRIES (5) reopens
}
// An open that can never succeed throws from open(), so the caller falls back.
{
  const f = makeFetch([...Array(10)].map(() => 'hang'));
  const b = __stallGuardedBody('https://huggingface.co/x', 0, FILE.length, f.fetchImpl);
  await assert.rejects(b.open(), /no response headers/);
}

// 3. Small files and the other fallbacks: a whole-file GET through the same guard.
{
  const f = makeFetch([{ stallAfter: 300 }, 'hang', undefined]);
  const r = await __guardedGet('https://huggingface.co/x/resolve/main/tokenizer.json', f.fetchImpl);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('content-length'), String(FILE.length));
  assert.equal(r.headers.get('content-type'), 'application/json');
  assert.deepEqual(new Uint8Array(await r.arrayBuffer()), FILE);
  assert.deepEqual(f.calls, [0, 300, 300]);
}
{
  // An optional file that does not exist: the 404 comes straight back, no retries.
  const f = makeFetch([404]);
  const r = await __guardedGet('https://huggingface.co/x/resolve/main/preprocessor_config.json', f.fetchImpl);
  assert.equal(r.status, 404);
  assert.deepEqual(f.calls, [0]);
}
{
  // Hung headers and a 503 on the first open are retried.
  const f = makeFetch(['hang', 503, undefined]);
  const r = await __guardedGet('https://huggingface.co/x', f.fetchImpl);
  assert.deepEqual(new Uint8Array(await r.arrayBuffer()), FILE);
  assert.deepEqual(f.calls, [0, 0, 0]);
}
// The HEAD probe and the 1-byte existence probe: headers bounded, caller's abort wins.
{
  const seen = [];
  let n = 0;
  const fetchImpl = (url, init) => { seen.push(init.method || 'GET'); return n++ === 0 ? never(init.signal) : Promise.resolve(new Response(null, { status: 200, headers: { 'content-length': '1000' } })); };
  const r = await __boundedFetch('https://huggingface.co/x', { method: 'HEAD' }, fetchImpl);
  assert.equal(r.headers.get('content-length'), '1000');
  assert.deepEqual(seen, ['HEAD', 'HEAD']);
}
{
  const caller = new AbortController();
  let calls = 0;
  const fetchImpl = (url, init) => { calls++; return never(init.signal); };
  const p = __boundedFetch('https://huggingface.co/x', { headers: { Range: 'bytes=0-0' }, signal: caller.signal }, fetchImpl);
  const t0 = Date.now();
  setTimeout(() => caller.abort(new Error('user cancelled')), 10);
  await assert.rejects(p, /user cancelled/);
  assert.equal(calls, 1);
  assert.ok(Date.now() - t0 < 500, 'a cancelled load stops at once, without a retry backoff');
}
console.log('download stall guard: all checks pass');
