// JevBench (231 public tasks) on Ternary Bonsai 2 in headless Chrome with WebGPU, through the typed-decision decode
// (decide.mjs) and the engine seam (bonsai-seam.mjs). Rows are written as they arrive, so a stall loses nothing.
//
//   node scripts/serve-range.mjs 8123 &          # repo root + /models/ → ~/Models (the GGUF: ~/Models/bonsai2/)
//   node scripts/typed-decisions/run-jevbench.mjs --url http://127.0.0.1:8123 --out /tmp/jevbench.jsonl
//   options: --permutations N (default 1, TypeLLM's 195/231 run) --limit N (0 = all) --skip N --max-length 16384
//            --row-timeout <min> (default 15: no new row for that long = stalled, exit 2)
import { spawn } from 'node:child_process';
import { writeFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : d; };
const URL_ = opt('url', 'http://127.0.0.1:8123');
const OUT = opt('out', join(tmpdir(), `jevbench-bonsai2-${Date.now()}.jsonl`));
const PORT = Number(opt('port', 9341));
const PROFILE = opt('profile', join(tmpdir(), `jevbench-profile-${process.pid}`));
const ROW_TIMEOUT = Number(opt('row-timeout', 15)) * 60000;
const run = { permutations: Number(opt('permutations', 1)), limit: Number(opt('limit', 0)), skip: Number(opt('skip', 0)), maxLength: Number(opt('max-length', 16384)) };   // limit 0 = all
const CHROME = opt('chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(PROFILE, { recursive: true });
const chrome = spawn(CHROME, ['--headless=new', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${PROFILE}`,
  '--enable-unsafe-webgpu', '--enable-features=WebGPU', `--remote-debugging-port=${PORT}`, 'about:blank'], { stdio: 'ignore' });
const kill = () => { try { chrome.kill('SIGTERM'); } catch {} };
process.on('exit', kill);
for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => { kill(); process.exit(130); });

let base = null;
for (let i = 0; i < 100 && !base; i++) { for (const h of ['127.0.0.1', '[::1]']) { try { await fetch(`http://${h}:${PORT}/json/version`); base = `http://${h}:${PORT}`; break; } catch {} } if (!base) await sleep(200); }
if (!base) throw new Error('Chrome DevTools did not answer');
const page = (await (await fetch(`${base}/json`)).json()).find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.text); return r.result?.result?.value; };
await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url: `${URL_}/scripts/typed-decisions/harness.html` });
for (let i = 0; i < 100 && !(await ev('!!window.ready').catch(() => false)); i++) await sleep(300);
await ev(`window.runJev(${JSON.stringify(run)}); true`);

writeFileSync(OUT, '');
let seen = 0, lastRowAt = Date.now(), seam = null;
for (;;) {
  await sleep(5000);
  const s = await ev(`({ phase: state.phase, progress: state.progress, n: state.rows.length, error: state.error, seam: state.seamCheck, summary: state.summary })`);
  if (s.seam && !seam) { seam = s.seam; console.log(`seam check: argmax "${seam}" (expect "Paris")`); }
  if (s.n > seen) {
    const rows = await ev(`state.rows.slice(${seen})`);
    for (const r of rows) appendFileSync(OUT, JSON.stringify(r) + '\n');
    seen = s.n; lastRowAt = Date.now();
    console.log(`${new Date().toISOString().slice(11, 19)} ${s.progress} · correct so far ${await ev('state.rows.filter((r) => r.correct).length')}`);
  } else if (s.phase === 'load') { lastRowAt = Date.now(); }
  if (s.phase === 'done') { console.log(JSON.stringify({ out: OUT, seam, ...s.summary })); break; }
  if (s.phase === 'error') { console.error(s.error); process.exit(1); }
  if (Date.now() - lastRowAt > ROW_TIMEOUT) { console.error(`stalled: no row for ${ROW_TIMEOUT / 60000} min at ${s.progress}`); process.exit(2); }
}
kill(); process.exit(0);
