// test-iq-kernels.mjs — src/iq_quants.js against llama.cpp's own reference, on real weights.
//
// 1. The packed codebooks unpack to exactly ggml-common.h's tables (skipped when the header is absent).
// 2. For each of the 11 block types, 16 rows of a real tensor of that type are read from the Underdog Saluki 27B
//    GGUF (a local copy, or HTTP Range from Hugging Face). gguf-py's numpy dequantize (an implementation
//    independent of ours) gives the reference values. In headless Chrome with WebGPU:
//      repack — padded types go through repackKernel first, as at engine upload
//      embed  — every dequantized value, row by row, against gguf-py      (tolerance: f32 rounding)
//      mv     — W·x for a random x against the float64 product            (relative to Σ|w·x|)
//      mm     — the tiled GEMM (f32, and the subgroup-matrix f16 variant where the adapter has it) against the same product
//
//   node scripts/test-iq-kernels.mjs [--gguf path/to/Underdog-Saluki-27B-1.0-IQ2-mix.gguf]
// Needs python3 with the `gguf` package (pip install gguf).
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, openSync, readSync, closeSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join } from 'node:path';
import { parseGguf, tensorBytes } from '../src/gguf.js';
import { QTYPES, rowBytes, gpuRowBytes, PADDED, gridData, GRID_OFF } from '../src/iq_quants.js';

const argv = process.argv.slice(2);
const GGUF = argv.includes('--gguf') ? argv[argv.indexOf('--gguf') + 1] : join(homedir(), '.cache/localmind-models/Underdog-Saluki-27B-1.0-IQ2-mix.gguf');
const URL_ = 'https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0/resolve/main/Underdog-Saluki-27B-1.0-IQ2-mix.gguf';
const SIZE = 7898369152, ROWS = 16, TOKENS = 75;   // 75 tokens: past the first 64-token half, ending mid-block
const tmp = mkdtempSync(join(tmpdir(), 'iqk-'));
let failed = false;
const report = (pass, msg) => { failed ||= !pass; console.log(`${pass ? 'ok  ' : 'FAIL'} ${msg}`); };

// Bytes [a, a+n) of the GGUF: from the local file when it is complete, else over HTTP.
const local = existsSync(GGUF) && readFileSync.length && (await import('node:fs')).statSync(GGUF).size === SIZE;
async function bytes(a, n) {
  if (local) { const fd = openSync(GGUF, 'r'), b = Buffer.alloc(n); readSync(fd, b, 0, n, a); closeSync(fd); return new Uint8Array(b); }
  const r = await fetch(URL_, { headers: { Range: `bytes=${a}-${a + n - 1}` } });
  if (r.status !== 206) throw new Error(`range ${a}: HTTP ${r.status}`);
  return new Uint8Array(await r.arrayBuffer());
}

// 1. Codebooks.
const header = join(homedir(), 'Code/llama.cpp-dev/ggml/src/ggml-common.h');
if (existsSync(header)) {
  const src = readFileSync(header, 'utf8'), g = gridData();
  const table = (name) => [...new RegExp(`GGML_TABLE_BEGIN\\(\\w+, ${name}, \\w+\\)([\\s\\S]*?)GGML_TABLE_END`).exec(src)[1].matchAll(/-?0x[0-9a-fA-F]+|-?\d+/g)].map((t) => BigInt(t[0]));
  const check64 = (name, off) => table(name).every((v, e) => BigInt(g[off + 2 * e]) + (BigInt(g[off + 2 * e + 1]) << 32n) === BigInt.asUintN(64, v));
  const check32 = (name, off) => table(name).every((v, e) => BigInt(g[off + e]) === BigInt.asUintN(32, v));
  const all = check64('iq2xxs_grid', GRID_OFF.iq2xxs) && check64('iq2xs_grid', GRID_OFF.iq2xs) && check64('iq2s_grid', GRID_OFF.iq2s)
    && check32('iq3xxs_grid', GRID_OFF.iq3xxs) && check32('iq3s_grid', GRID_OFF.iq3s) && check64('iq1s_grid', GRID_OFF.iq1s)
    && table('kvalues_iq4nl').every((v, i) => (g[GRID_OFF.kv4 + i] | 0) === Number(v));
  report(all, 'codebooks unpack to ggml-common.h exactly');
} else console.log(`skip codebook check (no ${header})`);

// 2. Fixtures: the first tensor of each type, its first ROWS rows.
let n = 16 << 20, gg;
for (;;) { try { gg = parseGguf(await bytes(0, n)); break; } catch (e) { if (!e.needBytes) throw e; n = e.needBytes; } }
const fixtures = [];
for (const [type, q] of Object.entries(QTYPES)) {
  const t = gg.tensors.find((x) => x.type === q.id && x.dims.length === 2 && x.dims[0] % 256 === 0);
  if (!t) { report(false, `${type}: no tensor of this type in the GGUF`); continue; }
  const cols = t.dims[0], rb = rowBytes(type, cols);
  const raw = await bytes(gg.dataStart + t.offset, ROWS * rb);
  const f = join(tmp, `${type}.bin`); writeFileSync(f, raw);
  fixtures.push({ type, name: t.name, cols, rb, f });
}
// gguf-py reference dequantization.
const py = `
import sys, json, numpy as np
from gguf.quants import dequantize
from gguf.constants import GGMLQuantizationType as Q
for fx in json.load(sys.stdin):
    raw = np.fromfile(fx['f'], dtype=np.uint8).reshape(${ROWS}, fx['rb'])
    np.asarray(dequantize(raw, Q[fx['type']]), dtype=np.float32).tofile(fx['f'] + '.f32')
`;
execFileSync('python3', ['-c', py], { input: JSON.stringify(fixtures) });
for (const fx of fixtures) fx.ref = new Float32Array(readFileSync(fx.f + '.f32').buffer.slice(0));

// 3. GPU.
const PORT = 8000 + Math.floor(Math.random() * 900), CDP = 9600 + Math.floor(Math.random() * 300);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const server = spawn(process.execPath, [new URL('./serve-range.mjs', import.meta.url).pathname, String(PORT)], { stdio: 'ignore' });
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--no-first-run', '--no-default-browser-check',
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'iqk-chrome-'))}`, '--enable-unsafe-webgpu', '--enable-features=WebGPU', `--remote-debugging-port=${CDP}`, 'about:blank'], { stdio: 'ignore' });
const stop = () => { try { chrome.kill(); } catch {} try { server.kill(); } catch {} };
process.on('exit', stop);
let base = null;
for (let i = 0; i < 100 && !base; i++) { for (const h of ['127.0.0.1', '[::1]']) { try { await fetch(`http://${h}:${CDP}/json/version`); base = `http://${h}:${CDP}`; break; } catch {} } if (!base) await sleep(200); }
const page = (await (await fetch(`${base}/json`)).json()).find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable');
await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/scripts/qwen3-moe-harness.html` });
await sleep(1500);
const ev = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
  return r.result.result.value;
};
await ev(`(async () => {
  const Q = await import('/src/iq_quants.js?v=' + Date.now());
  const ad = await navigator.gpu.requestAdapter();
  const sgm = ['subgroups', 'chromium-experimental-subgroup-matrix'].every((f) => ad.features.has(f)) && ad.info.subgroupMinSize === 32 && ad.info.subgroupMaxSize === 32;
  const dev = await ad.requestDevice({ requiredFeatures: ['shader-f16', ...(sgm ? ['subgroups', 'chromium-experimental-subgroup-matrix'] : [])] });
  const S = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST;
  const buf = (arr) => { const b = dev.createBuffer({ size: Math.max(16, Math.ceil(arr.byteLength / 4) * 4), usage: S }); dev.queue.writeBuffer(b, 0, arr.buffer, arr.byteOffset, Math.ceil(arr.byteLength / 4) * 4 <= arr.buffer.byteLength - arr.byteOffset ? Math.ceil(arr.byteLength / 4) * 4 : arr.byteLength); return b; };
  const uni = (words) => { const b = dev.createBuffer({ size: Math.max(16, words.length * 4), usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }); dev.queue.writeBuffer(b, 0, Uint32Array.from(words)); return b; };
  const run = async (code, bufs, x, y = 1) => {
    dev.pushErrorScope('validation');
    const pl = dev.createComputePipeline({ layout: 'auto', compute: { module: dev.createShaderModule({ code }), entryPoint: 'main' } });
    const bg = dev.createBindGroup({ layout: pl.getBindGroupLayout(0), entries: bufs.map((b, i) => ({ binding: i, resource: { buffer: b } })) });
    const e = dev.createCommandEncoder(); const p = e.beginComputePass(); p.setPipeline(pl); p.setBindGroup(0, bg); p.dispatchWorkgroups(x, y); p.end(); dev.queue.submit([e.finish()]);
    const err = await dev.popErrorScope(); if (err) throw new Error(err.message);
  };
  const read = async (b, n) => { const s = dev.createBuffer({ size: n * 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST }); const e = dev.createCommandEncoder(); e.copyBufferToBuffer(b, 0, s, 0, n * 4); dev.queue.submit([e.finish()]); await s.mapAsync(1); const r = new Float32Array(s.getMappedRange().slice(0)); s.unmap(); return r; };
  window.__iq = { Q, dev, buf, uni, run, read, grid: buf(Q.gridData()), sgm, cfgs: ad.info.subgroupMatrixConfigs };
  return { sgm, cfgs: JSON.stringify(ad.info.subgroupMatrixConfigs) };
})()`).then((r) => { console.log(`subgroup matrices: ${r.sgm} ${r.cfgs}`); return r; });

const ROWS_ = ROWS;
let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296 * 2 - 1; };
for (const fx of fixtures) {
  const { type, cols, rb, ref } = fx;
  const x = Float32Array.from({ length: TOKENS * cols }, () => rnd());
  const raw = readFileSync(fx.f);
  const res = await ev(`(async () => {
    const { Q, buf, uni, run, read, grid } = window.__iq;
    const raw = Uint8Array.from(atob(${JSON.stringify(raw.toString('base64'))}), (c) => c.charCodeAt(0));
    const x = new Float32Array(Uint8Array.from(atob(${JSON.stringify(Buffer.from(x.buffer).toString('base64'))}), (c) => c.charCodeAt(0)).buffer);
    const N = ${cols}, M = ${ROWS_}, T = ${TOKENS}, grb = ${gpuRowBytes(type, cols)};
    let wq = buf(raw);
    if (${PADDED.has(type)}) {   // the engine's upload path: GGUF blocks → padded GPU blocks
      const words = grb * M / 4, out = buf(new Uint32Array(words));
      await run(Q.repackKernel('${type}'), [wq, out, uni([words])], Math.ceil(words / 256));
      wq = out;
    }
    const emb = [];
    const yE = buf(new Float32Array(N));
    for (let r = 0; r < M; r++) {
      await run(Q.embedKernel('${type}'), [wq, grid, yE, uni([r, 0, 1, 0]), uni([N, grb])], Math.ceil(N / 8 / 256));
      emb.push(...await read(yE, N));
    }
    const yv = buf(new Float32Array(M));
    await run(Q.mvKernel('${type}'), [buf(x.subarray(0, N)), wq, grid, yv, uni([M, N, grb, 0])], Math.ceil(M / Q.MV_ROWS));
    const ym = buf(new Float32Array(T * M));
    await run(Q.mmKernel('${type}'), [buf(x), wq, grid, ym, uni([M, N, grb, 0]), uni([T, 0, T, 0])], Math.ceil(M / Q.MM_TILE), Math.ceil(T / Q.MM_TILE));
    let mmsg = null;
    if (window.__iq.sgm) {   // y sized for whole 8-token blocks, as the engine's batch buffers are
      const ys = buf(new Float32Array(Math.ceil(T / 8) * 8 * M));
      await run(Q.mmSgKernel('${type}'), [buf(x), wq, grid, ys, uni([M, N, grb, 0]), uni([T, 0, T, 0])], Math.ceil(M / Q.MM_TILE), Math.ceil(T / Q.MM_SG_TOKENS));
      mmsg = Array.from(await read(ys, T * M));
    }
    return { emb: Array.from(emb), mv: Array.from(await read(yv, M)), mm: Array.from(await read(ym, T * M)), mmsg };
  })()`);
  // embed: elementwise against gguf-py.
  let maxE = 0, scaleE = 0;
  for (let i = 0; i < ref.length; i++) { maxE = Math.max(maxE, Math.abs(res.emb[i] - ref[i])); scaleE = Math.max(scaleE, Math.abs(ref[i])); }
  report(maxE <= 1e-6 * scaleE + 1e-9, `${type} embed (${fx.name}, ${cols} cols): max |Δ| ${maxE.toExponential(2)} of max |w| ${scaleE.toExponential(2)}`);
  // mv / mm: against the float64 product, relative to Σ|w·x| per output.
  const check = (got, t) => {
    let worst = 0;
    for (let m = 0; m < ROWS; m++) {
      let s = 0, a = 0;
      for (let k = 0; k < cols; k++) { const p = ref[m * cols + k] * x[t * cols + k]; s += p; a += Math.abs(p); }
      worst = Math.max(worst, Math.abs(got(m) - s) / (a + 1e-12));
    }
    return worst;
  };
  const wv = check((m) => res.mv[m], 0);
  report(wv <= 1e-5, `${type} mv: worst |Δ| / Σ|w·x| ${wv.toExponential(2)}`);
  let wm = 0; for (let t = 0; t < TOKENS; t++) wm = Math.max(wm, check((m) => res.mm[t * ROWS + m], t));
  report(wm <= 1e-5, `${type} mm (${TOKENS} tokens): worst |Δ| / Σ|w·x| ${wm.toExponential(2)}`);
  if (res.mmsg) {
    // f16 inputs (weights and activations rounded once, as llama.cpp Metal's mul_mm does), f32 accumulation.
    let ws = 0; for (let t = 0; t < TOKENS; t++) ws = Math.max(ws, check((m) => res.mmsg[t * ROWS + m], t));
    report(ws <= 2e-3, `${type} mm subgroup-matrix f16 (${TOKENS} tokens): worst |Δ| / Σ|w·x| ${ws.toExponential(2)}`);
  }
}
console.log(failed ? 'iq kernels: FAIL' : 'iq kernels: ok');
stop();
process.exit(failed ? 1 : 0);
