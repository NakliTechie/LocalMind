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
//      existence probes get a headers timeout that honours the caller's abort;
//   4. a failed load drops this repo's cached files that are shorter than Hugging
//      Face reports (CACHE-HEAL block) and loads once more; nothing short, no retry.
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

// 2. Runtime contract, with the stall window shrunk to 40 ms and the 1-5 s backoff between
// reopens shrunk to 1-5 ms (at full length the backoffs alone kept this suite running 68 s).
const guard = /\/\/ STALL-GUARD-START([\s\S]*?)\/\/ STALL-GUARD-END/.exec(workerSource);
assert.ok(guard, 'STALL-GUARD block missing');
assert.match(guard[1], /const __STALL_MS = 30000;/);
const shortStall = guard[1].replace('const __STALL_MS = 30000;', 'const __STALL_MS = 40;');
const BACKOFF = /Math\.min\(1000 \* (retries|\(attempt \+ 1\)), 5000\)/g;
assert.equal(shortStall.match(BACKOFF).length, 3, 'every reopen backoff is shrunk');
const loadGuard = async (name, source) => {
  const path = join(dir, name);
  await writeFile(path, source + '\nexport { __stallGuardedBody, __guardedGet, __boundedFetch };\n');
  return import(pathToFileURL(path).href);
};
const { __stallGuardedBody, __guardedGet, __boundedFetch } = await loadGuard('guard.mjs', shortStall.replace(BACKOFF, 'Math.min($1, 5)'));
// A copy with the full backoff, for the check that a cancelled load waits out no backoff.
const fullBackoff = await loadGuard('guard-full-backoff.mjs', shortStall);

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
    if (step && step.closeAfter != null) {
      // A body that ends cleanly (no error) before the file's full size.
      const bytes = FILE.slice(from, from + step.closeAfter);
      return new Response(new ReadableStream({ start(c) { c.enqueue(bytes); c.close(); } }),
        { status: 206, headers: { 'content-range': `bytes ${from}-${FILE.length - 1}/${FILE.length}`, 'content-type': 'application/json' } });
    }
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

// A body that closes cleanly short of its known size is resumed, never passed on truncated
// (2026-09-24: a tokenizer.json ended at 1,000,510 of 3,297,799 bytes and got cached that way).
{
  const { bytes, calls } = await run(0, [{ closeAfter: 400 }, { closeAfter: 350 }, undefined]);
  assert.deepEqual(calls, [0, 400, 750]);
  assert.deepEqual(bytes, FILE);
}
{
  const f = makeFetch([...Array(10)].map(() => ({ closeAfter: 0 })));
  const r = await __guardedGet('https://huggingface.co/x/resolve/main/tokenizer.json', f.fetchImpl);
  await assert.rejects(r.arrayBuffer(), /download ended early/);
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
  const p = fullBackoff.__boundedFetch('https://huggingface.co/x', { headers: { Range: 'bytes=0-0' }, signal: caller.signal }, fetchImpl);
  const t0 = Date.now();
  setTimeout(() => caller.abort(new Error('user cancelled')), 10);
  await assert.rejects(p, /user cancelled/);
  assert.equal(calls, 1);
  assert.ok(Date.now() - t0 < 500, 'a cancelled load stops at once, without a retry backoff');
}

// 4. Self-heal for a file cached short before the guard: a failed load drops this repo's
// cached files that are smaller than Hugging Face says, and loads once more.
assert.match(workerSource, /const dropped = await __evictTruncatedCache\(modelId, self\.caches, __origFetch\)\.catch\(\(\) => \[\]\);\s*if \(!dropped\.length\) throw err;[\s\S]{0,120}await load\(\);/);
assert.equal(workerSource.match(/await load\(\);/g).length, 2, 'one load, at most one retry');
{
  const heal = /\/\/ CACHE-HEAL-START([\s\S]*?)\/\/ CACHE-HEAL-END/.exec(workerSource);
  assert.ok(heal, 'CACHE-HEAL block missing');
  const healPath = join(dir, 'heal.mjs');
  await writeFile(healPath, heal[1] + '\nexport { __evictTruncatedCache };\n');
  const { __evictTruncatedCache } = await import(pathToFileURL(healPath).href);

  const HF = 'https://huggingface.co/';
  const sizes = { // what a HEAD on Hugging Face reports
    [HF + 'org/model/resolve/main/tokenizer.json']: 3297799,
    [HF + 'org/model/resolve/main/config.json']: 900,
    [HF + 'org/model/resolve/main/onnx/model.onnx']: 5000,
    [HF + 'org/model/resolve/main/onnx/model.onnx_data']: 8000,
    [HF + 'org/model-other/resolve/main/tokenizer.json']: 1000,
  };
  const seed = { // what Cache Storage holds: url -> bytes cached
    [HF + 'org/model/resolve/main/tokenizer.json']: 1000510, // short: the 2026-09-24 file
    [HF + 'org/model/resolve/main/config.json']: 900,        // whole
    [HF + 'org/model/resolve/main/onnx/model.onnx']: 4000,   // short, but its HEAD fails
    [HF + 'org/model/resolve/main/onnx/model.onnx_data']: 8000,
    [HF + 'org/model-other/resolve/main/tokenizer.json']: 10, // short, another repo
  };
  const store = new Map(Object.entries(seed).map(([u, n]) => [u, new Response(new Uint8Array(n), { headers: { 'content-length': String(n) } })]));
  const opened = [];
  const cacheStorage = { async open(name) {
    opened.push(name);
    return {
      async keys() { return [...store.keys()].map((u) => new Request(u)); },
      async match(req) { const r = store.get(req.url); return r && r.clone(); },
      async delete(req) { return store.delete(req.url); },
    };
  } };
  const heads = [];
  const fetchImpl = async (url, init) => {
    heads.push(init.method);
    assert.ok(init.signal, 'every HEAD is time-bounded');
    if (url.endsWith('/model.onnx')) throw new TypeError('Failed to fetch');
    return new Response(null, { status: 200, headers: { 'content-length': String(sizes[url]) } });
  };
  const dropped = await __evictTruncatedCache('org/model', cacheStorage, fetchImpl);
  assert.deepEqual(dropped, [HF + 'org/model/resolve/main/tokenizer.json']);
  assert.deepEqual(opened, ['transformers-cache']);
  assert.deepEqual(heads, ['HEAD', 'HEAD', 'HEAD', 'HEAD'], 'only this repo is checked; org/model-other is a different repo');
  assert.ok(store.has(HF + 'org/model/resolve/main/onnx/model.onnx'), 'an unverifiable file is kept');
  assert.ok(store.has(HF + 'org/model-other/resolve/main/tokenizer.json'), 'another repo is never touched');
  assert.equal(store.size, 4);
  // Nothing short (or an id that is not a repo) means nothing dropped, so the caller does not retry.
  assert.deepEqual(await __evictTruncatedCache('org/model', cacheStorage, fetchImpl), []);
  assert.deepEqual(await __evictTruncatedCache('/models/local', cacheStorage, fetchImpl), []);
  assert.deepEqual(await __evictTruncatedCache('org/model', null, fetchImpl), []);
  // A 404 on the HEAD (file gone upstream) keeps the cached copy.
  store.set(HF + 'org/model/resolve/main/tokenizer.json', new Response(new Uint8Array(5)));
  const gone = async () => new Response(null, { status: 404 });
  assert.deepEqual(await __evictTruncatedCache('org/model', cacheStorage, gone), []);
}

// 5. Main-thread load watchdog (attachWorkerHandlers, index.html): from the start of a load until its download
//    completes, a worker that reports nothing for LOAD_STALL_MS is terminated, the load is shown failed and
//    the window.localmind.load() caller rejected (2026-10-02: a chat worker stopped running tasks at
//    120 / 201 MB and the bar sat there for two days). The real source runs against a fake worker, fake
//    timers and stub page globals.
{
  const start = indexSource.indexOf('    const LOAD_STALL_MS = ');
  const fnAt = indexSource.indexOf('function attachWorkerHandlers(w) {', start);
  assert.ok(start > 0 && fnAt > start, 'LOAD_STALL_MS + attachWorkerHandlers missing from index.html');
  let depth = 0, end = -1;
  for (let i = indexSource.indexOf('{', fnAt); i < indexSource.length; i++) {
    if (indexSource[i] === '{') depth++;
    else if (indexSource[i] === '}' && --depth === 0) { end = i + 1; break; }
  }
  const src = indexSource.slice(start, end);
  const REAL = new Set(['Math', 'String', 'Number', 'Error', 'Object', 'Array', 'JSON', 'Promise', 'Symbol', 'Boolean', 'undefined']);
  // Any other page global (badges, inputs, MODELS, helpers) is a stub that accepts every get, set and call.
  const anything = () => new Proxy(function () {}, { get: (f, p) => (p === Symbol.toPrimitive ? () => '' : (f[p] ??= anything())), set: () => true, apply: () => undefined });
  const setup = () => {
    let now = 0, nextId = 0;
    const timers = new Map(), calls = { unload: 0, shown: [], rejected: [], resolved: 0 };
    const store = {
      setTimeout: (fn, ms) => { timers.set(++nextId, { fn, at: now + ms }); return nextId; },
      clearTimeout: (id) => { timers.delete(id); },
      console: { warn() {}, error() {}, debug() {}, log() {} },
      LocalMind: { runtime: { unload: () => { calls.unload++; }, capabilities: () => ({}) } },
      showLoadError: (m) => { calls.shown.push(m); },
      modelReady: false, generating: false,
      loadResolvers: { resolve: () => { calls.resolved++; }, reject: (e) => { calls.rejected.push(e.message); } },
    };
    // Symbol keys get undefined: `with` reads Symbol.unscopables, and a stub there would hide every name.
    const scope = new Proxy(store, { has: (t, k) => typeof k === 'string' && !REAL.has(k), get: (t, k) => (typeof k === 'symbol' ? undefined : k in t ? t[k] : (t[k] = anything())), set: (t, k, v) => { t[k] = v; return true; } });
    const mod = new Function('scope', `with (scope) { ${src}\nreturn { attachWorkerHandlers, LOAD_STALL_MS }; }`)(scope);
    const listeners = {};
    const w = { addEventListener: (type, fn) => { listeners[type] = fn; } };
    store.worker = w;
    mod.attachWorkerHandlers(w);
    const advance = (ms) => { now += ms; for (const [id, t] of [...timers]) if (t.at <= now) { timers.delete(id); t.fn(); } };
    const msg = (data) => listeners.message({ data });
    const progress = (status, loaded, total) => msg({ type: 'progress', data: { status, loaded, total } });
    return { store, calls, advance, msg, progress, error: (m) => listeners.error({ message: m }), pending: () => timers.size, STALL: mod.LOAD_STALL_MS };
  };
  const STALLED = 'no download progress for 3 minutes';

  // Silent from the start: nothing before the deadline, then terminate + banner + rejected caller.
  let t = setup();
  assert.equal(t.STALL, 3 * 60 * 1000, 'the window is above three ONNX stall-guard retry cycles');
  t.advance(t.STALL - 1);
  assert.equal(t.calls.unload, 0);
  t.advance(1);
  assert.equal(t.calls.unload, 1);
  assert.deepEqual(t.calls.shown, [STALLED]);
  assert.deepEqual(t.calls.rejected, ['Model load stalled: ' + STALLED]);
  assert.equal(t.store.worker, null);
  // Bytes arriving keep it alive however long the download takes; silence after them still trips it.
  t = setup();
  for (let i = 1; i <= 10; i++) { t.advance(t.STALL - 1000); t.progress('progress_total', i, 100); }
  assert.equal(t.calls.unload, 0, 'a slow download that keeps delivering is never cut');
  t.advance(t.STALL);
  assert.equal(t.calls.unload, 1);
  // A finished download ends it: session creation may be silent; other reports do not re-arm it; a later file does.
  t = setup();
  t.progress('progress_total', 100, 100);
  t.advance(10 * t.STALL);
  t.progress('initiate'); t.progress('done');
  t.advance(10 * t.STALL);
  assert.equal(t.calls.unload, 0, 'silence after the download completes is not a stall');
  t.progress('progress_total', 150, 200);
  t.advance(t.STALL);
  assert.equal(t.calls.unload, 1, 'a further file re-arms it');
  // 'loading', 'warmup' and 'ready' end it (no timer left behind); 'ready' resolves the caller.
  for (const finish of [(x) => x.progress('loading'), (x) => x.msg({ type: 'warmup' }), (x) => x.msg({ type: 'ready' })]) {
    t = setup();
    t.progress('progress_total', 10, 100);
    finish(t);
    assert.equal(t.pending(), 0, 'the watchdog timer is cleared');
    t.advance(10 * t.STALL);
    assert.equal(t.calls.unload, 0);
  }
  assert.equal(t.calls.resolved, 1);
  // A superseded worker, or a model already loaded, is left alone.
  t = setup(); t.store.worker = {}; t.advance(t.STALL);
  assert.deepEqual([t.calls.unload, t.calls.shown.length, t.calls.rejected.length], [0, 0, 0]);
  t = setup(); t.store.modelReady = true; t.advance(t.STALL);
  assert.equal(t.calls.unload, 0);
  // A worker that fails to start rejects the caller and ends the watchdog; so does a load error message.
  t = setup(); t.error('boom'); t.advance(t.STALL);
  assert.deepEqual(t.calls.rejected, ['boom']);
  assert.equal(t.calls.unload, 0);
  t = setup(); t.msg({ type: 'error', message: 'Failed to load model: x' }); t.advance(t.STALL);
  assert.deepEqual(t.calls.rejected, ['Failed to load model: x']);
  assert.equal(t.calls.unload, 0);
}
console.log('download stall guard: all checks pass');
