// test-flint-kernels.mjs — the rung-2g WGSL kernels (flint_moe_ssd.js) against JS references on random inputs, in
// headless Chrome with WebGPU: the Q4_1 GEMV, expert, tiled GEMM and batched-expert kernels (value = d·q + m, ggml
// dequantize_row_q4_1), and the windowed, scaled attention scores with the sink softmax (ggml_soft_max_ext with sinks).
// No model weights needed. Exit 0 when every kernel is within tolerance.
//
//   node scripts/test-flint-kernels.mjs
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT = 8000 + Math.floor(Math.random() * 900), CDP = 9600 + Math.floor(Math.random() * 300);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const server = spawn(process.execPath, [new URL('./serve-range.mjs', import.meta.url).pathname, String(PORT)], { stdio: 'ignore' });
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--no-first-run', '--no-default-browser-check',
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'flintk-'))}`, '--enable-unsafe-webgpu', '--enable-features=WebGPU', `--remote-debugging-port=${CDP}`, 'about:blank'], { stdio: 'ignore' });
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
const r = await send('Runtime.evaluate', { expression: `(async () => {
const mod = await import('/src/flint_moe_ssd.js?v=' + Date.now());
const KS = { ...mod.FLINT_KERNELS, ...mod.FLINT_BATCH_KERNELS };
const ad = await navigator.gpu.requestAdapter(); const dev = await ad.requestDevice({ requiredFeatures: ['shader-f16'] });
let seed = 4242; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296 * 2 - 1; };
const R = (n, s = 1) => Float32Array.from({ length: n }, () => rnd() * s);
const ri = (n) => Math.floor((rnd() + 1) / 2 * n) % n;
const buf = (arr) => { const n = Math.max(16, Math.ceil(arr.byteLength / 4) * 4), u8 = new Uint8Array(n); u8.set(new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength)); const b = dev.createBuffer({ size: n, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST }); dev.queue.writeBuffer(b, 0, u8); return b; };
const uni = (words) => { const ab = new ArrayBuffer(Math.max(16, Math.ceil(words.length / 4) * 16)); const u = new Uint32Array(ab), f = new Float32Array(ab); words.forEach((w, i) => { if (typeof w === 'object') f[i] = w.f; else u[i] = w; }); const b = dev.createBuffer({ size: ab.byteLength, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }); dev.queue.writeBuffer(b, 0, ab); return b; };
const run = async (name, bufs, wg) => {
  const pl = dev.createComputePipeline({ layout: 'auto', compute: { module: dev.createShaderModule({ code: KS[name] }), entryPoint: 'main' } });
  const bg = dev.createBindGroup({ layout: pl.getBindGroupLayout(0), entries: bufs.map((b, i) => ({ binding: i, resource: { buffer: b } })) });
  const e = dev.createCommandEncoder(); const p = e.beginComputePass(); p.setPipeline(pl); p.setBindGroup(0, bg); p.dispatchWorkgroups(...[].concat(wg)); p.end(); dev.queue.submit([e.finish()]);
};
const read = async (b, n) => { const s = dev.createBuffer({ size: n * 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST }); const e = dev.createCommandEncoder(); e.copyBufferToBuffer(b, 0, s, 0, n * 4); dev.queue.submit([e.finish()]); await s.mapAsync(1); const v = new Float32Array(s.getMappedRange().slice(0)); s.unmap(); return v; };
const cmp = (a, b) => { let mx = 0, mr = 0; for (let i = 0; i < a.length; i++) { const d = Math.abs(a[i] - b[i]); mx = Math.max(mx, d); mr = Math.max(mr, d / (Math.abs(b[i]) + 1e-6)); } return { maxAbs: +mx.toExponential(2), maxRel: +mr.toExponential(2) }; };
// f16 bits of a value that f16 holds exactly (normal range).
const h16 = (x) => { if (x === 0) return 0; const s = x < 0 ? 0x8000 : 0; x = Math.abs(x); const e = Math.floor(Math.log2(x)); return s | ((e + 15) << 10) | Math.round((x / 2 ** e - 1) * 1024); };
// rows × cols Q4_1 in GGUF blocks (5 words: d | m << 16, 16 nibble bytes) and its dequantized matrix.
const q41 = (rows, cols) => {
  const nb = cols / 32, words = new Uint32Array(rows * nb * 5), W = new Float32Array(rows * cols);
  for (let r = 0; r < rows; r++) for (let b = 0; b < nb; b++) {
    const d = (1 + ri(64)) / 1024, m = -ri(64) / 128, k = (r * nb + b) * 5, q = Array.from({ length: 32 }, () => ri(16));
    words[k] = h16(d) | (h16(m) << 16);
    for (let j = 0; j < 16; j++) words[k + 1 + (j >> 2)] |= (q[j] | (q[j + 16] << 4)) << ((j & 3) * 8);
    for (let j = 0; j < 32; j++) W[r * cols + b * 32 + j] = d * q[j] + m;
  }
  return { words, W };
};
const gemv = (W, rows, cols, x, xo = 0) => Float32Array.from({ length: rows }, (_, r) => { let s = 0; for (let k = 0; k < cols; k++) s += W[r * cols + k] * x[xo + k]; return s; });
const aux = buf(new Uint32Array(4)), out = {};

{ // matmulQ41: 37 rows (not a multiple of 4) × 256
  const M = 37, N = 256, { words, W } = q41(M, N), x = R(N), by = buf(new Float32Array(M));
  await run('matmulQ41', [buf(x), buf(words), aux, by, uni([M, N])], Math.ceil(M / 4));
  out.matmulQ41 = cmp(await read(by, M), gemv(W, M, N, x));
}
{ // expertQ41: 3 experts × 20 rows × 128, slots [2, 0]; shared input, then one input per slot
  const M = 20, N = 128, E = 3, { words, W } = q41(E * M, N), slots = new Uint32Array([2, 0]);
  for (const per of [0, 1]) {
    const x = R(2 * N), by = buf(new Float32Array(2 * M));
    await run('expertQ41', [buf(x), buf(words), aux, by, uni([M, N, M, per]), buf(slots)], [Math.ceil(M / 4), 1, 2]);
    const y = new Float32Array(2 * M);
    for (let z = 0; z < 2; z++) y.set(gemv(W.subarray(slots[z] * M * N), M, N, x, per ? z * N : 0), z * M);
    out['expertQ41_input' + per] = cmp(await read(by, 2 * M), y);
  }
}
{ // matmulQ41T: 37 rows × 256, 5 tokens
  const M = 37, N = 256, T = 5, { words, W } = q41(M, N), x = R(T * N), by = buf(new Float32Array(T * M));
  await run('matmulQ41T', [buf(x), buf(words), aux, by, uni([M, N]), uni([T, 0, 0, 0])], [Math.ceil(M / 16), Math.ceil(T / 16)]);
  const y = new Float32Array(T * M);
  for (let t = 0; t < T; t++) y.set(gemv(W, M, N, x, t * N), t * M);
  out.matmulQ41T = cmp(await read(by, T * M), y);
}
{ // expertQ41B: 3 tokens × top-2 = 6 pairs over 4 experts; gate/up (input per token) and down (input per pair)
  const M = 20, N = 128, E = 4, K = 2, T = 3, Z = T * K, { words, W } = q41(E * M, N), slots = Uint32Array.from({ length: Z }, () => ri(E));
  for (const mode of [0, 1]) {
    const x = R((mode ? Z : T) * N), by = buf(new Float32Array(Z * M));
    await run('expertQ41B', [buf(x), buf(words), aux, by, uni([M, N, M, mode, K]), buf(slots)], [Math.ceil(M / 4), 1, Z]);
    const y = new Float32Array(Z * M);
    for (let z = 0; z < Z; z++) y.set(gemv(W.subarray(slots[z] * M * N), M, N, x, (mode ? z : Math.floor(z / K)) * N), z * M);
    out['expertQ41B_mode' + mode] = cmp(await read(by, Z * M), y);
  }
}
// Attention: 4 heads over 2 KV heads × 8; K exact in f16. Reference softmax over the kept keys plus the head's sink.
const heads = 4, kvH = 2, hd = 8, scale = Math.fround(1 / Math.sqrt(hd)), sinks = R(heads, 2);
const kv16 = (n) => { const v = Float32Array.from({ length: n }, () => ri(129) / 64 - 1); return { v, bits: Uint16Array.from(v, h16) }; };
const sinkSoft = (s, h) => { const m = Math.max(...s, sinks[h]); const e = s.map((v) => Math.exp(v - m)); const z = e.reduce((a, b) => a + b, 0) + Math.exp(sinks[h] - m); return e.map((v) => v / z); };
for (const win of [0, 4]) { // one token at position 9 (seqLen 10)
  const seqLen = 10, st = win && seqLen > win ? seqLen - win : 0, n = seqLen - st, q = R(heads * hd), K_ = kv16(seqLen * kvH * hd);
  const tok = uni([0, seqLen - 1, seqLen, 0]), bsc = buf(new Float32Array(heads * seqLen));
  await run('attnScoreSW', [buf(q), buf(K_.bits), bsc, tok, uni([heads, kvH, hd, win, { f: scale }, 0, 0, 0])], 1);
  const ref = new Float32Array(heads * n);
  for (let h = 0; h < heads; h++) for (let j = 0; j < n; j++) { let a = 0; const kh = Math.floor(h / (heads / kvH)); for (let d = 0; d < hd; d++) a += q[h * hd + d] * K_.v[(st + j) * kvH * hd + kh * hd + d]; ref[h * n + j] = a * scale; }
  out['attnScoreSW_win' + win] = cmp(await read(bsc, heads * n), ref);
  await run('softmaxSinkW', [bsc, buf(sinks), tok, uni([heads, kvH, hd, win])], heads);
  const p = new Float32Array(heads * n);
  for (let h = 0; h < heads; h++) p.set(sinkSoft(Array.from(ref.subarray(h * n, h * n + n)), h), h * n);
  out['softmaxSinkW_win' + win] = cmp(await read(bsc, heads * n), p);
}
for (const win of [0, 4]) { // 3 queries at positions 5..7 over S = 8 keys
  const T = 3, pos0 = 5, S = 8, q = R(T * heads * hd), K_ = kv16(S * kvH * hd), qd = uni([T, pos0, S, 0]), bsc = buf(new Float32Array(heads * T * S));
  await run('attnScoreSWB', [buf(q), buf(K_.bits), bsc, uni([heads, kvH, hd, win, { f: scale }, 0, 0, 0]), qd], Math.ceil(heads * T * S / 256));
  await run('softmaxSinkB', [bsc, buf(sinks), qd], heads * T);
  const p = new Float32Array(heads * T * S);
  for (let h = 0; h < heads; h++) for (let t = 0; t < T; t++) {
    const qp = pos0 + t, kh = Math.floor(h / (heads / kvH)), keep = [], s = [];
    for (let pos = 0; pos < S; pos++) if (pos <= qp && !(win && qp - pos >= win)) { let a = 0; for (let d = 0; d < hd; d++) a += q[t * heads * hd + h * hd + d] * K_.v[pos * kvH * hd + kh * hd + d]; keep.push(pos); s.push(a * scale); }
    sinkSoft(s, h).forEach((v, i) => { p[(h * T + t) * S + keep[i]] = v; });
  }
  out['attnSinkB_win' + win] = cmp(await read(bsc, heads * T * S), p);
}
return out;

})()`, awaitPromise: true, returnByValue: true });
if (r.result?.exceptionDetails) { console.error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text); process.exit(1); }
const res = r.result.result.value;
// Tolerances: f32 sums in a different order than the JS reference.
const TOL = { maxAbs: 1e-5, maxRel: 2e-3 };
let ok = true;
const walk = (name, v) => {
  if (v && typeof v.maxAbs === 'number') {
    const pass = v.maxAbs <= TOL.maxAbs || v.maxRel <= TOL.maxRel;
    ok &&= pass;
    console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}: max abs ${v.maxAbs}, max rel ${v.maxRel}`);
  } else for (const [k, x] of Object.entries(v)) walk(name ? `${name}.${k}` : k, x);
};
walk('', res);
console.log(ok ? 'flint kernels: ok' : 'flint kernels: FAIL');
stop();
process.exit(ok ? 0 : 1);
