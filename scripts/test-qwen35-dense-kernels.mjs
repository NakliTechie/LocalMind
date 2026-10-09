// test-qwen35-dense-kernels.mjs — qwen35_dense.js's prefill kernels against the batched kernels they replace
// (qwen35_moe_ssd.js, themselves checked against llama.cpp's CPU ops by test-qwen35-kernels.mjs), on random inputs
// at Qwen3.8-27B's geometry, in headless Chrome with WebGPU. No model weights needed.
//   gdnStepR   vs gdnStepB                          (48 value heads × 128, 37 tokens)
//   flashAttnB vs attnScoreB → softmaxB → attnOutB  (24 heads / 4 KV heads × 256, 37 new tokens after 300 cached)
//
//   node scripts/test-qwen35-dense-kernels.mjs
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT = 8000 + Math.floor(Math.random() * 900), CDP = 9600 + Math.floor(Math.random() * 300);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const server = spawn(process.execPath, [new URL('./serve-range.mjs', import.meta.url).pathname, String(PORT)], { stdio: 'ignore' });
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--no-first-run', '--no-default-browser-check',
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'q35d-'))}`, '--enable-unsafe-webgpu', '--enable-features=WebGPU', `--remote-debugging-port=${CDP}`, 'about:blank'], { stdio: 'ignore' });
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
const { QWEN35_BATCH_KERNELS: B } = await import('/src/qwen35_moe_ssd.js?v=' + Date.now());
const { QWEN35_DENSE_PREFILL_KERNELS: D } = await import('/src/qwen35_dense.js?v=' + Date.now());
const ad = await navigator.gpu.requestAdapter();
const dev = await ad.requestDevice({ requiredFeatures: ['shader-f16'], requiredLimits: { maxComputeWorkgroupStorageSize: ad.limits.maxComputeWorkgroupStorageSize } });
let seed = 4242; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296 * 2 - 1; };
const R = (n, s = 1) => Float32Array.from({ length: n }, () => rnd() * s);
const S_ = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST;
const buf = (arr) => { const b = dev.createBuffer({ size: Math.max(16, Math.ceil(arr.byteLength / 4) * 4), usage: S_ }); dev.queue.writeBuffer(b, 0, arr.buffer, arr.byteOffset, arr.byteLength); return b; };
const uni = (words) => { const ab = new ArrayBuffer(Math.max(16, Math.ceil(words.length / 4) * 16)); const u = new Uint32Array(ab), f = new Float32Array(ab); words.forEach((w, i) => { if (typeof w === 'object') f[i] = w.f; else u[i] = w; }); const b = dev.createBuffer({ size: ab.byteLength, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }); dev.queue.writeBuffer(b, 0, ab); return b; };
const run = async (code, bufs, x, y = 1) => {
  dev.pushErrorScope('validation');
  const pl = dev.createComputePipeline({ layout: 'auto', compute: { module: dev.createShaderModule({ code }), entryPoint: 'main' } });
  const bg = dev.createBindGroup({ layout: pl.getBindGroupLayout(0), entries: bufs.map((b, i) => ({ binding: i, resource: { buffer: b } })) });
  const e = dev.createCommandEncoder(); const p = e.beginComputePass(); p.setPipeline(pl); p.setBindGroup(0, bg); p.dispatchWorkgroups(x, y); p.end(); dev.queue.submit([e.finish()]);
  const err = await dev.popErrorScope(); if (err) throw new Error(err.message);
};
const read = async (b, n) => { const s = dev.createBuffer({ size: n * 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST }); const e = dev.createCommandEncoder(); e.copyBufferToBuffer(b, 0, s, 0, n * 4); dev.queue.submit([e.finish()]); await s.mapAsync(1); const r = new Float32Array(s.getMappedRange().slice(0)); s.unmap(); return r; };
const cmp = (a, b) => { let mx = 0, sc = 0; for (let i = 0; i < b.length; i++) { mx = Math.max(mx, Math.abs(a[i] - b[i])); sc = Math.max(sc, Math.abs(b[i])); } return { maxAbs: +mx.toExponential(2), scale: +sc.toExponential(2), rel: +(mx / sc).toExponential(2) }; };
const out = {}, eps = 1e-6;
{ // DeltaNet step over T tokens
  const kH = 16, vH = 48, dS = 128, keyDim = kH * dS, convDim = 2 * keyDim + vH * dS, T = 37;
  const cv = R(T * convDim), bb = R(T * vH, 2), al = R(T * vH, 2), dt = R(vH), aa = Float32Array.from({ length: vH }, () => -Math.exp(rnd())), M0 = R(vH * dS * dS, 0.1);
  const P = uni([kH, dS, keyDim, convDim, vH, 0, { f: eps }, { f: 1 / Math.sqrt(dS) }]), Q = uni([T, 0, T, 0]);
  const bufs = () => [buf(cv), buf(bb), buf(al), buf(dt), buf(aa), buf(M0), buf(new Float32Array(T * vH * dS)), P, Q];
  const a = bufs(), b = bufs();
  await run(B.gdnStepB, a, vH); await run(D.gdnStepR, b, vH);
  out.gdnStepR = { out: cmp(await read(b[6], T * vH * dS), await read(a[6], T * vH * dS)), state: cmp(await read(b[5], vH * dS * dS), await read(a[5], vH * dS * dS)) };
}
{ // attention over 300 cached + 37 new tokens
  const heads = 24, kvH = 4, hd = 256, QN = heads * hd, kvn = kvH * hd, T = 37, pos0 = 300, S = pos0 + T;
  const q = R(T * QN, 2), kc = new Float16Array(S * kvn).map(() => rnd() * 2), vc = new Float16Array(S * kvn).map(() => rnd());
  const P = uni([heads, kvH, hd, { f: 1 / Math.sqrt(hd) }]), Q = uni([T, pos0, S, 0]);
  const bq = buf(q), bk = buf(kc), bv = buf(vc), sc = buf(new Float32Array(heads * T * S)), y1 = buf(new Float32Array(T * QN)), y2 = buf(new Float32Array(T * QN));
  await run(B.attnScoreB, [bq, bk, sc, P, Q], Math.ceil(heads * T * S / 256));
  await run(B.softmaxB, [sc, Q], heads * T);
  await run(B.attnOutB, [sc, bv, y1, uni([heads, kvH, hd, 0]), Q], Math.ceil(QN / 256), T);
  await run(D.flashAttnB, [bq, bk, bv, y2, P, Q], kvH, Math.ceil(T / 4));
  out.flashAttnB = cmp(await read(y2, T * QN), await read(y1, T * QN));
}
return out;
})()`, awaitPromise: true, returnByValue: true });
if (r.result?.exceptionDetails) { console.error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text); process.exit(1); }
const res = r.result.result.value;
// The new kernels sum in a different order than the ones they replace: tolerance relative to the largest value.
let ok = true;
const walk = (name, v) => {
  if (v && typeof v.rel === 'number') { const pass = v.rel <= 1e-5; ok &&= pass; console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}: max |Δ| ${v.maxAbs} of max ${v.scale} (rel ${v.rel})`); }
  else for (const [k, x] of Object.entries(v)) walk(name ? `${name}.${k}` : k, x);
};
walk('', res);
console.log(ok ? 'qwen35 dense kernels: ok' : 'qwen35 dense kernels: FAIL');
stop();
process.exit(ok ? 0 : 1);
