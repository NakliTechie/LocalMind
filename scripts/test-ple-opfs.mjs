// test-ple-opfs.mjs — the gates for Gemma 4 E2B's per-layer embedding (PLE) table served from OPFS.
//
// Drives scripts/ple-harness.html (the vendored engine in a dedicated worker, no LocalMind UI) in a
// fresh headless Chrome per mode, so each mode's GPU-process footprint is measured on its own:
//   resident    the table on the GPU, as upstream ships it
//   opfs        ple-opfs.js defaults: 32,768-row GPU cache, GPU slot map, split-step speculation
//   opfs-cpu    512-row cache, CPU lookups, decode one step at a time (the simplest OPFS mode)
//   resident    again, as the control for run-to-run determinism
// Gates, all reported with numbers:
//   1. greedy output (token ids) identical to resident on every prompt (12 prompts, 128 tokens)
//   2. GPU memory after load: live GPU buffer bytes (createBuffer minus destroy, in the worker)
//      and the Chrome GPU process footprint (macOS `footprint`)
//   3. decode tok/s: a first-time prose answer, the same prompt again, and a first-time code answer;
//      then --rounds interleaved resident/OPFS loads in one Chrome, reported as the median of the
//      per-round OPFS/resident ratios (the number that holds up when other work shares the GPU)
//   4. prefill (time to first token) for a ~2k-token prompt, first time and repeated
//
//   python3 -m http.server 8766 --bind 127.0.0.1      # from the repo root (or .claude/launch.json)
//   node scripts/test-ple-opfs.mjs [--model google/gemma-4-E4B-it-qat-mobile-transformers] [--rounds 6] [--out result.json]
//
// The first run downloads the model (2.46 GB) into --profile and writes the 1.2 GB table to its
// OPFS; later runs reuse both. Close other GPU work first: speeds on a busy machine are indicative.
import { spawn, execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';

const argv = process.argv.slice(2);
const opt = (name, dflt) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : dflt; };
const PROFILE = opt('profile', `${homedir()}/.cache/localmind-ple-profile`).replace(/^~/, homedir());
const URL_ = opt('url', 'http://127.0.0.1:8766/scripts/ple-harness.html');
const OUT = opt('out', null);
const PORT = Number(opt('port', 9435));
const CHROME = opt('chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
const MAX = Number(opt('max-tokens', 128));
const ROUNDS = Number(opt('rounds', 6));
const MODEL = opt('model', null); // a Gemma 4 QAT-mobile repo id; default: the engine's (E2B)

const LONG = readFileSync(new URL('../docs/ARCHITECTURE.md', import.meta.url), 'utf8').slice(0, 6700);
const PROMPTS = [
  'Explain how a hash map works: hashing, buckets, collisions and resizing.',
  'Write a Python class HashMap with put, get, delete and automatic resizing, using separate chaining. Code only.',
  'What is the capital of Japan? One sentence.',
  'Translate to French: The weather is lovely today and we are going to the market.',
  'Write a haiku about autumn rain.',
  'List five prime numbers greater than 100 and explain how you checked one of them.',
  'Summarize the plot of Romeo and Juliet in three sentences.',
  'Write a JSON object describing a book with title, author, year and three tags.',
  'भारत की राजधानी क्या है? दो वाक्यों में उत्तर दें।',
  'Explain the difference between TCP and UDP for a beginner, with an analogy.',
  '写一首关于月亮的四行短诗，然后用英文解释它。',
  LONG + '\n\nSummarize the document above in five bullet points.',
];
const PROSE = 'Describe how a compiler turns source code into machine code, stage by stage.';
const CODE = 'Write a JavaScript function that parses a CSV string with quoted fields into an array of objects. Code only.';
const MODES = [
  ['resident', { mode: 'resident' }],
  ['opfs', { mode: 'opfs' }],
  ['opfs-cpu', { mode: 'opfs', pleOpts: { gpuMap: false, slots: 512, warm: [] } }],
  ['resident-control', { mode: 'resident' }],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.error(new Date().toTimeString().slice(0, 8), ...a);
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };

function gpuProcessMB() {
  try {
    const line = execFileSync('ps', ['-axo', 'pid=,command='], { encoding: 'utf8' }).split('\n')
      .find((l) => l.includes(PROFILE) && l.includes('--type=gpu-process'));
    if (!line) return null;
    const out = execFileSync('footprint', ['-p', line.trim().split(/\s+/)[0]], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const m = out.match(/Footprint:\s+([\d.]+)\s*(KB|MB|GB)/);
    return m ? +(Number(m[1]) * { KB: 1 / 1024, MB: 1, GB: 1024 }[m[2]]).toFixed(1) : null;
  } catch { return null; }
}

async function withChrome(fn) {
  mkdirSync(PROFILE, { recursive: true });
  const chrome = spawn(CHROME, ['--headless=new', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${PROFILE}`,
    '--enable-unsafe-webgpu', '--enable-features=WebGPU', `--remote-debugging-port=${PORT}`, 'about:blank'], { stdio: 'ignore' });
  try {
    // Chrome 154 may listen for DevTools on [::1] only; try both loopback addresses.
    let cdpBase = null;
    for (let i = 0; i < 100 && !cdpBase; i++) {
      for (const host of ['127.0.0.1', '[::1]']) { try { await fetch(`http://${host}:${PORT}/json/version`); cdpBase = `http://${host}:${PORT}`; break; } catch {} }
      if (!cdpBase) await sleep(200);
    }
    if (!cdpBase) throw new Error(`Chrome DevTools did not answer on port ${PORT}`);
    const page = (await (await fetch(`${cdpBase}/json`)).json()).find((t) => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0; const pend = new Map();
    ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
    const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
    const call = async (op, args = {}) => {
      const r = await send('Runtime.evaluate', { expression: `window.harness.call(${JSON.stringify(op)}, ${JSON.stringify(args)})`, awaitPromise: true, returnByValue: true });
      if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
      return r.result?.result?.value;
    };
    await send('Page.enable'); await send('Runtime.enable');
    await send('Page.navigate', { url: `${URL_}?t=${Date.now()}` });
    for (let i = 0; i < 100; i++) {
      const r = await send('Runtime.evaluate', { expression: '!!(window.harness && window.harness.ready)', returnByValue: true });
      if (r.result?.result?.value) break;
      await sleep(200);
    }
    const value = await fn(call);
    ws.close();
    return value;
  } finally { chrome.kill('SIGTERM'); await sleep(1500); }
}

async function runMode(name, loadArgs) {
  return withChrome(async (call) => {
    const load = await call('load', { ...loadArgs, modelId: MODEL });
    if (load.pleMode !== (loadArgs.mode === 'opfs' ? 'opfs' : 'resident')) throw new Error(`${name}: engine reports PLE mode ${load.pleMode}`);
    const r = { name, pleMode: load.pleMode, loadMs: Math.round(load.loadMs), gpuBytesAfterLoad: load.gpuAfterLoad, gpuProcessMBAfterLoad: gpuProcessMB(), pleStatus: load.status };
    log(`${name}: loaded in ${(r.loadMs / 1000).toFixed(1)} s, ${(r.gpuBytesAfterLoad / 1e9).toFixed(3)} GB of GPU buffers, GPU process ${r.gpuProcessMBAfterLoad} MB`);
    // Gate 3 first, on a fresh cache: first-time prose, the same prompt again, first-time code.
    const g = async (prompt, max) => call('gen', { prompt, maxNewTokens: max });
    const p1 = await g(PROSE, 256), p2 = await g(PROSE, 256), c1 = await g(CODE, 256);
    r.decode = { proseFirst: +p1.tokPerSec.toFixed(1), proseRepeat: +p2.tokPerSec.toFixed(1), codeFirst: +c1.tokPerSec.toFixed(1) };
    r.decodeIds = [p1.ids, c1.ids];
    // Gate 4: the long prompt, first time and twice more.
    const t = [];
    for (let i = 0; i < 3; i++) { const x = await g(PROMPTS[PROMPTS.length - 1], 8); t.push(x.ttftMs); r.longPromptTokens = x.promptTokens; }
    r.prefill = { firstMs: Math.round(t[0]), repeatMs: Math.round(median(t.slice(1))) };
    // Gate 1: token ids on every prompt.
    r.ids = [];
    for (const p of PROMPTS) r.ids.push((await g(p, MAX)).ids);
    r.pleStats = (await g('Hi', 1)).pleStats;
    log(`${name}: decode ${JSON.stringify(r.decode)} tok/s; prefill ${r.longPromptTokens} tokens ${JSON.stringify(r.prefill)}`);
    return r;
  });
}

const results = [];
for (const [name, args] of MODES) results.push(await runMode(name, args));

// Gate 3, interleaved: alternate resident and OPFS loads in one Chrome, pair each round.
const rounds = ROUNDS > 0 ? await withChrome(async (call) => {
  const out = [];
  for (let round = 0; round < ROUNDS; round++) {
    const row = { round };
    for (const mode of round % 2 ? ['opfs', 'resident'] : ['resident', 'opfs']) {
      await call('load', { mode, modelId: MODEL });
      const a = await call('gen', { prompt: PROSE, maxNewTokens: 256 });
      const b = await call('gen', { prompt: PROSE, maxNewTokens: 256 });
      const c = await call('gen', { prompt: CODE, maxNewTokens: 256 });
      row[mode] = { proseFirst: a.tokPerSec, proseRepeat: b.tokPerSec, codeFirst: c.tokPerSec };
    }
    out.push(row);
    log(`round ${round}: ${['proseFirst', 'proseRepeat', 'codeFirst'].map((k) => `${k} ${row.opfs[k].toFixed(1)}/${row.resident[k].toFixed(1)}`).join(', ')} (OPFS/resident tok/s)`);
  }
  return out;
}) : [];
const paired = Object.fromEntries(['proseFirst', 'proseRepeat', 'codeFirst'].map((k) => [k,
  rounds.length ? +median(rounds.map((r) => r.opfs[k] / r.resident[k])).toFixed(3) : null]));
if (rounds.length) log(`decode, median OPFS/resident ratio over ${rounds.length} interleaved rounds: ${JSON.stringify(paired)}`);
const ref = results[0];
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const report = results.map((r) => ({
  mode: r.name,
  'identical prompts': `${r.ids.filter((ids, i) => same(ids, ref.ids[i])).length}/${r.ids.length}`,
  'identical decode runs': `${r.decodeIds.filter((ids, i) => same(ids, ref.decodeIds[i])).length}/2`,
  'GPU buffers GB': +(r.gpuBytesAfterLoad / 1e9).toFixed(3),
  'drop GB': +((ref.gpuBytesAfterLoad - r.gpuBytesAfterLoad) / 1e9).toFixed(3),
  'GPU process MB': r.gpuProcessMBAfterLoad,
  'prose 1st': r.decode.proseFirst, 'prose again': r.decode.proseRepeat, 'code 1st': r.decode.codeFirst,
  'prefill 1st ms': r.prefill.firstMs, 'prefill again ms': r.prefill.repeatMs,
  replays: r.pleStats?.replays ?? '',
}));
console.table(report);
const firstDiffs = results.slice(1).map((r) => ({ mode: r.name, diffs: r.ids.map((ids, i) => ({ i, at: ids.findIndex((x, j) => x !== ref.ids[i][j]) })).filter((d) => d.at >= 0 || r.ids[d.i].length !== ref.ids[d.i].length) }));
if (OUT) {
  writeFileSync(OUT, JSON.stringify({ date: new Date().toISOString(), model: MODEL || 'google/gemma-4-E2B-it-qat-mobile-transformers', url: URL_, maxTokens: MAX, report, firstDiffs, paired, rounds, results: results.map(({ ids, decodeIds, ...r }) => r) }, null, 1));
  log('wrote', OUT);
}
const gate1 = results.filter((r) => r.pleMode === 'opfs').every((r) => r.ids.every((ids, i) => same(ids, ref.ids[i])) && r.decodeIds.every((ids, i) => same(ids, ref.decodeIds[i])));
log(gate1 ? 'gate 1 holds: every OPFS output matches resident' : `gate 1 FAILS: ${JSON.stringify(firstDiffs)}`);
process.exit(gate1 ? 0 : 1);
