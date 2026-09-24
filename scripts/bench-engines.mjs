// Engine benchmark: decode speed of the same model on LocalMind's different in-browser engines.
//
// Drives a real Chrome over the DevTools protocol, through the opt-in `window.localmind` API (no tools,
// no agent prompt), so every engine gets the same request: one user message, temperature 0, max_tokens
// 256. Each row runs 3 times; run 1 is warm-up and the reported numbers are the median of the rest.
// Output tokens are counted exactly, inside the page, with each model's own tokenizer.json (special
// tokens excluded), because the engines stream different-sized chunks.
//
//   node scripts/bench-engines.mjs                 # both suites against localmind.naklitechie.com
//   node scripts/bench-engines.mjs --suite engines # kernels vs Transformers.js vs wllama
//   node scripts/bench-engines.mjs --suite dflash  # Ternary Bonsai 2 27B, plain vs DFlash 2, code and prose
//   node scripts/bench-engines.mjs --url http://127.0.0.1:8000/ --profile ~/.cache/lm-bench --out bench.json
//   node scripts/bench-engines.mjs --list          # print the rows and exit
//
// Needs Chrome with WebGPU. The first run downloads every model in the suite into --profile (engines:
// ~4.5 GB, dflash: ~7 GB); later runs reuse that cache. Close other GPU-heavy work first: a busy
// machine moves absolute numbers by 1.5-3x (ratios within a model are steadier, not immune).
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const opt = (name, dflt) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : dflt; };
const URL_ = opt('url', 'https://localmind.naklitechie.com/');
const SUITE = opt('suite', 'all');
const RUNS = Number(opt('runs', 3));
const MAX = Number(opt('max-tokens', 256));
const PROFILE = (opt('profile', join(tmpdir(), 'localmind-bench'))).replace(/^~/, homedir());
const OUT = opt('out', null);
const CHROME = opt('chrome', process.platform === 'darwin'
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome');
const PORT = Number(opt('port', 9431));

const PROSE = 'Explain how a hash map works: hashing, buckets, collisions and resizing.';
const CODE = 'Write a Python class HashMap with put, get, delete and automatic resizing, using separate chaining. Code only.';
const TOK = { // tokenizer.json source per model family
  lfm2: 'LiquidAI/LFM2.5-1.2B-Instruct-ONNX',
  gemma4: 'onnx-community/gemma-4-E2B-it-ONNX',
  qwen35: 'onnx-community/Qwen3.5-4B-ONNX-OPT',
  qwen38: 'Qwen/Qwen3.8-27B',
};
// Baselines the roster does not carry are registered as custom models for the run.
const LFM230_ONNX = { id: 'LiquidAI/LFM2.5-230M-ONNX', label: 'LFM2.5 230M · ONNX (bench)', dtype: 'q4', size: '~210 MB',
  type: 'causal', multimodal: false, agentCapable: false, contextSize: 32768, custom: true, genConfig: { max_new_tokens: 2048 } };
const LFM12_GGUF_URL = 'https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF/resolve/main/LFM2.5-1.2B-Instruct-Q4_K_M.gguf';
const LFM12_GGUF = { id: LFM12_GGUF_URL, label: 'LFM2.5 1.2B · GGUF (bench)', backend: 'wllama', size: '~730 MB',
  type: 'causal', multimodal: false, agentCapable: false, contextSize: 8192, custom: true, genConfig: { max_new_tokens: 2048 } };

const ROWS = [
  { suite: 'engines', model: 'LFM2.5 230M', engine: 'hand-written WGSL', key: 'lfm2-230m-webgpu', tok: 'lfm2', prompt: PROSE },
  { suite: 'engines', model: 'LFM2.5 230M', engine: 'Transformers.js (ONNX)', key: LFM230_ONNX.id, custom: LFM230_ONNX, tok: 'lfm2', prompt: PROSE },
  { suite: 'engines', model: 'LFM2.5 230M', engine: 'wllama (GGUF)', key: 'lfm2-230m-gguf', tok: 'lfm2', prompt: PROSE },
  { suite: 'engines', model: 'Gemma 4 E2B', engine: 'hand-written WGSL', key: 'gemma4-e2b-webgpu', tok: 'gemma4', prompt: PROSE },
  { suite: 'engines', model: 'Gemma 4 E2B', engine: 'Transformers.js (ONNX)', key: 'gemma4-e2b', tok: 'gemma4', prompt: PROSE },
  { suite: 'engines', model: 'LFM2.5 1.2B', engine: 'Transformers.js (ONNX)', key: 'lfm2-1.2b', tok: 'lfm2', prompt: PROSE },
  { suite: 'engines', model: 'LFM2.5 1.2B', engine: 'wllama (GGUF)', key: LFM12_GGUF_URL, custom: LFM12_GGUF, tok: 'lfm2', prompt: PROSE },
  { suite: 'engines', model: 'Qwen3.5 4B', engine: 'Transformers.js (ONNX)', key: 'qwen35-4b', tok: 'qwen35', prompt: PROSE },
  { suite: 'dflash', model: 'Ternary Bonsai 2 27B', engine: 'hand-written WGSL · code', key: 'ternary-bonsai-2-27b-webgpu', dflash: false, tok: 'qwen38', prompt: CODE },
  { suite: 'dflash', model: 'Ternary Bonsai 2 27B', engine: 'WGSL + DFlash 2 · code', key: 'ternary-bonsai-2-27b-webgpu', dflash: true, tok: 'qwen38', prompt: CODE },
  { suite: 'dflash', model: 'Ternary Bonsai 2 27B', engine: 'hand-written WGSL · prose', key: 'ternary-bonsai-2-27b-webgpu', dflash: false, tok: 'qwen38', prompt: PROSE },
  { suite: 'dflash', model: 'Ternary Bonsai 2 27B', engine: 'WGSL + DFlash 2 · prose', key: 'ternary-bonsai-2-27b-webgpu', dflash: true, tok: 'qwen38', prompt: PROSE },
];
const rows = ROWS.filter((r) => SUITE === 'all' || r.suite === SUITE);
if (argv.includes('--list')) { for (const r of rows) console.log(`${r.suite.padEnd(8)} ${r.model.padEnd(22)} ${r.engine}`); process.exit(0); }
if (!rows.length) { console.error(`unknown --suite ${SUITE} (engines | dflash | all)`); process.exit(2); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.error(new Date().toTimeString().slice(0, 8), ...a);
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };

mkdirSync(PROFILE, { recursive: true });
const chrome = spawn(CHROME, ['--headless=new', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${PROFILE}`,
  '--enable-unsafe-webgpu', '--enable-features=WebGPU', `--remote-debugging-port=${PORT}`, 'about:blank'], { stdio: 'ignore' });
const kill = () => { try { chrome.kill('SIGTERM'); } catch {} };
process.on('exit', kill);
for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => { kill(); process.exit(130); });

async function connect() {
  for (let i = 0; i < 100; i++) { try { await fetch(`http://127.0.0.1:${PORT}/json/version`); break; } catch { await sleep(200); } }
  const page = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pend = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
    return r.result?.result?.value;
  };
  await send('Page.enable'); await send('Runtime.enable');
  return { ws, send, ev };
}

async function runRow(cdp, row) {
  // Seed before the app boots: the API toggle, the DFlash setting, any custom model; watch the drafter.
  const seed = `(() => { try {
      localStorage.setItem('lm_api_enabled', '1');
      localStorage.setItem('lm_dflash', ${row.dflash === false ? "'0'" : "'1'"});
      ${row.custom ? `localStorage.setItem('lm_custom_models', ${JSON.stringify(JSON.stringify([row.custom]))});` : "localStorage.removeItem('lm_custom_models');"}
    } catch (e) {}
    window.__benchDflash = null;
    const W = window.Worker;
    window.Worker = function (u, o) { const w = new W(u, o); w.addEventListener('message', (e) => { if (e.data && e.data.type === 'dflash') window.__benchDflash = e.data.status; }); return w; };
    window.Worker.prototype = W.prototype; })()`;
  const { identifier } = (await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: seed })).result;
  await cdp.send('Page.navigate', { url: URL_ + (URL_.includes('?') ? '&' : '?') + 'bench=' + Date.now() });
  for (let i = 0; i < 240 && !(await cdp.ev('!!(window.localmind && window.localmind.ready)').catch(() => false)); i++) await sleep(1000);
  const t0 = Date.now();
  await cdp.ev(`window.localmind.load(${JSON.stringify(row.key)})`);
  log(`loaded ${row.model} · ${row.engine} in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  if (row.dflash) {
    for (let i = 0; i < 900 && (await cdp.ev('window.__benchDflash')) !== 'ready'; i++) await sleep(2000);
    log('DFlash 2 drafter:', await cdp.ev('window.__benchDflash'));
  }
  const runs = [];
  for (let r = 0; r < RUNS; r++) {
    runs.push(await cdp.ev(`(async () => {
      const t0 = performance.now(); let first = 0, last = 0, text = '';
      const stream = await window.localmind.chat.completions.create({ messages: [{ role: 'user', content: ${JSON.stringify(row.prompt)} }], stream: true, temperature: 0, max_tokens: ${MAX} });
      for await (const ch of stream) { const d = ch.choices && ch.choices[0] && ch.choices[0].delta && ch.choices[0].delta.content; if (d) { const now = performance.now(); if (!first) first = now; last = now; text += d; } }
      return { ttftMs: first - t0, decodeMs: last - first, text };
    })()`));
  }
  // Exact token counts with the model's own tokenizer, in the page (no Node dependencies).
  const counts = await cdp.ev(`(async () => {
    const { Tokenizer } = await import('https://cdn.jsdelivr.net/npm/@huggingface/tokenizers@0.2.0/+esm');
    const get = async (p) => { for (const f of [p, 'onnx/' + p]) { const r = await fetch('https://huggingface.co/${TOK[row.tok]}/resolve/main/' + f); if (r.ok) return r.json(); } return {}; };
    const tj = await get('tokenizer.json'), tc = await get('tokenizer_config.json');
    const t = new Tokenizer(tj, tc), special = new Set((tj.added_tokens || []).filter((a) => a.special).map((a) => a.content));
    return ${JSON.stringify(runs.map((x) => x.text))}.map((s) => t.encode(s, { addSpecialTokens: false }).tokens.filter((x) => !special.has(x)).length);
  })()`);
  await cdp.send('Page.removeScriptToEvaluateOnNewDocument', { identifier });
  const per = runs.map((x, i) => ({ tokens: counts[i], ttftMs: x.ttftMs, tokPerSec: (counts[i] - 1) / (x.decodeMs / 1000) }));
  const warm = per.length > 1 ? per.slice(1) : per;
  return { ...row, custom: undefined, prompt: row.prompt === CODE ? 'code' : 'prose', runs: per,
    tokens: warm.map((x) => x.tokens), ttftMs: Math.round(median(warm.map((x) => x.ttftMs))),
    tokPerSec: +median(warm.map((x) => x.tokPerSec)).toFixed(1),
    identicalRuns: new Set(runs.map((x) => x.text)).size === 1, firstText: runs[0].text };
}

const cdp = await connect();
const results = [];
for (const row of rows) {
  try { results.push(await runRow(cdp, row)); log(`${row.model} · ${row.engine}: ${results.at(-1).tokPerSec} tok/s`); }
  catch (err) { results.push({ ...row, custom: undefined, error: String(err.message || err).slice(0, 300) }); log(`${row.model} · ${row.engine}: ERROR ${err.message}`); }
}
cdp.ws.close(); kill();

// DFlash output must match plain decode byte for byte (greedy); flag it if not.
for (const r of results.filter((x) => x.dflash)) {
  const plain = results.find((x) => x.key === r.key && x.dflash === false && x.prompt === r.prompt);
  if (plain && plain.firstText != null) r.identicalToPlain = plain.firstText === r.firstText;
}
console.table(results.map((r) => ({ model: r.model, engine: r.engine, 'tok/s': r.tokPerSec ?? r.error, 'TTFT ms': r.ttftMs, tokens: (r.tokens || []).join(','), ...(r.dflash ? { 'same as plain': r.identicalToPlain } : {}) })));
const out = { url: URL_, date: new Date().toISOString(), runs: RUNS, maxTokens: MAX, platform: `${process.platform} ${process.arch}`, results: results.map(({ firstText, ...r }) => r) };
if (OUT) { writeFileSync(OUT, JSON.stringify(out, null, 1)); log('wrote', OUT); }
