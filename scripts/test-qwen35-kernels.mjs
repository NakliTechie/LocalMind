// test-qwen35-kernels.mjs — the rung-2b WGSL kernels (qwen35_moe_ssd.js) against JS
// transcriptions of the llama.cpp CPU ops they port (ggml_gated_delta_net, ssm_conv, rms_norm +
// NeoX rope, the gated norm, the MoE + shared-expert sum), on random inputs, in headless Chrome
// with WebGPU. No model weights needed. Exit 0 when every kernel is within tolerance.
//
//   node scripts/test-qwen35-kernels.mjs
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT = 8000 + Math.floor(Math.random() * 900), CDP = 9600 + Math.floor(Math.random() * 300);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const server = spawn(process.execPath, [new URL('./serve-range.mjs', import.meta.url).pathname, String(PORT)], { stdio: 'ignore' });
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--no-first-run', '--no-default-browser-check',
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'q35k-'))}`, '--enable-unsafe-webgpu', '--enable-features=WebGPU', `--remote-debugging-port=${CDP}`, 'about:blank'], { stdio: 'ignore' });
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
const { QWEN35_KERNELS: KS } = await import('/src/qwen35_moe_ssd.js?v=' + Date.now());
const ad = await navigator.gpu.requestAdapter(); const dev = await ad.requestDevice({ requiredFeatures: ['shader-f16'] });
let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296 * 2 - 1; };
const R = (n, s = 1) => Float32Array.from({ length: n }, () => rnd() * s);
const buf = (arr, extra = 0) => { const b = dev.createBuffer({ size: Math.max(16, arr.byteLength + extra), usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST }); dev.queue.writeBuffer(b, 0, arr); return b; };
const uni = (words) => { const ab = new ArrayBuffer(Math.max(16, Math.ceil(words.length / 4) * 16)); const u = new Uint32Array(ab), f = new Float32Array(ab); words.forEach((w, i) => { if (typeof w === 'object') f[i] = w.f; else u[i] = w; }); const b = dev.createBuffer({ size: ab.byteLength, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }); dev.queue.writeBuffer(b, 0, ab); return b; };
const run = async (name, bufs, wg) => {
  const pl = dev.createComputePipeline({ layout: 'auto', compute: { module: dev.createShaderModule({ code: KS[name] }), entryPoint: 'main' } });
  const bg = dev.createBindGroup({ layout: pl.getBindGroupLayout(0), entries: bufs.map((b, i) => ({ binding: i, resource: { buffer: b } })) });
  const e = dev.createCommandEncoder(); const p = e.beginComputePass(); p.setPipeline(pl); p.setBindGroup(0, bg); p.dispatchWorkgroups(wg); p.end(); dev.queue.submit([e.finish()]);
};
const read = async (b, n) => { const s = dev.createBuffer({ size: n * 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST }); const e = dev.createCommandEncoder(); e.copyBufferToBuffer(b, 0, s, 0, n * 4); dev.queue.submit([e.finish()]); await s.mapAsync(1); const r = new Float32Array(s.getMappedRange().slice(0)); s.unmap(); return r; };
const cmp = (a, b) => { let mx = 0, mr = 0; for (let i = 0; i < a.length; i++) { const d = Math.abs(a[i] - b[i]); mx = Math.max(mx, d); mr = Math.max(mr, d / (Math.abs(b[i]) + 1e-6)); } return { maxAbs: +mx.toExponential(2), maxRel: +mr.toExponential(2) }; };
const f = Math.fround, out = {};
const eps = 1e-6;

{ // gdnStep
  const kH = 16, vH = 32, dS = 128, keyDim = kH * dS, conv = 2 * keyDim + vH * dS;
  const cv = R(conv), bb = R(vH, 2), al = R(vH, 2), dt = R(vH), aa = Float32Array.from({ length: vH }, () => -Math.exp(rnd())), M0 = R(vH * dS * dS, 0.1);
  const bM = buf(M0), bo = buf(new Float32Array(vH * dS));
  await run('gdnStep', [buf(cv), buf(bb), buf(al), buf(dt), buf(aa), bM, bo, uni([kH, dS, keyDim, 0, { f: eps }, { f: 1 / Math.sqrt(dS) }])], vH);
  const M = M0.slice(), o = new Float32Array(vH * dS);
  for (let h = 0; h < vH; h++) {
    const kh = h % kH, q = cv.subarray(kh * dS, kh * dS + dS), k = cv.subarray(keyDim + kh * dS, keyDim + kh * dS + dS), v = cv.subarray(2 * keyDim + h * dS, 2 * keyDim + h * dS + dS);
    const l2 = (x) => { let s = 0; for (const e of x) s += e * e; const sc = f(1 / Math.sqrt(f(s / dS + eps / dS))); return Float32Array.from(x, (e) => f(f(e * sc) * f(1 / Math.sqrt(dS)))); };
    const qn = l2(q), kn = l2(k);
    const beta = 1 / (1 + Math.exp(-bb[h])); const x = al[h] + dt[h]; const sp = x > 20 ? x : Math.log1p(Math.exp(x)); const dec = Math.exp(sp * aa[h]);
    const base = h * dS * dS, delta = new Float32Array(dS);
    for (let i = 0; i < dS * dS; i++) M[base + i] *= dec;
    for (let j = 0; j < dS; j++) { let s = 0; for (let i = 0; i < dS; i++) s += M[base + j * dS + i] * kn[i]; delta[j] = (v[j] - s) * beta; }
    for (let j = 0; j < dS; j++) for (let i = 0; i < dS; i++) M[base + j * dS + i] += kn[i] * delta[j];
    for (let j = 0; j < dS; j++) { let s = 0; for (let i = 0; i < dS; i++) s += M[base + j * dS + i] * qn[i]; o[h * dS + j] = s / Math.sqrt(dS); }
  }
  out.gdnStep = { out: cmp(await read(bo, vH * dS), o), state: cmp(await read(bM, vH * dS * dS), M) };
}
{ // gdnConv
  const n = 8192, mixed = R(n), w = R(n * 4), st = R(n * 3);
  const bst = buf(st), by = buf(new Float32Array(n));
  await run('gdnConv', [buf(mixed), buf(w), bst, by, uni([n])], Math.ceil(n / 256));
  const y = new Float32Array(n), st2 = new Float32Array(n * 3);
  for (let c = 0; c < n; c++) { const inp = [st[c * 3], st[c * 3 + 1], st[c * 3 + 2], mixed[c]]; let s = 0; for (let j = 0; j < 4; j++) s = f(s + f(inp[j] * w[c * 4 + j])); y[c] = s / (1 + Math.exp(-s)); st2[c * 3] = inp[1]; st2[c * 3 + 1] = inp[2]; st2[c * 3 + 2] = inp[3]; }
  out.gdnConv = { out: cmp(await read(by, n), y), state: cmp(await read(bst, n * 3), st2) };
}
{ // qkNormRopeP, q with gate (16 heads × [256 q | 256 gate]), nRot 64
  const H = 16, hd = 256, nRot = 64, half = 32, src = R(H * 2 * hd, 3), w = R(hd), rope = new Float32Array(nRot);
  for (let i = 0; i < half; i++) { const th = 7 * Math.pow(1e7, -2 * i / nRot); rope[i] = Math.cos(th); rope[half + i] = Math.sin(th); }
  const bd = buf(new Float32Array(H * hd)), bg = buf(new Float32Array(H * hd));
  await run('qkNormRopeP', [buf(src), buf(w), buf(rope), bd, bg, uni([hd, 2 * hd, nRot, 1, { f: eps }])], H);
  const d = new Float32Array(H * hd), g = new Float32Array(H * hd);
  for (let h = 0; h < H; h++) {
    const sb = h * 2 * hd; let s = 0; for (let i = 0; i < hd; i++) s += src[sb + i] ** 2; const sc = 1 / Math.sqrt(s / hd + eps);
    const y = Float32Array.from({ length: hd }, (_, i) => src[sb + i] * sc * w[i]);
    for (let i = 0; i < hd; i++) d[h * hd + i] = y[i];
    for (let i = 0; i < half; i++) { d[h * hd + i] = y[i] * rope[i] - y[i + half] * rope[half + i]; d[h * hd + i + half] = y[i] * rope[half + i] + y[i + half] * rope[i]; }
    for (let i = 0; i < hd; i++) g[h * hd + i] = src[sb + hd + i];
  }
  out.qkNormRopeP = { q: cmp(await read(bd, H * hd), d), gate: cmp(await read(bg, H * hd), g) };
}
{ // gdnNormGate
  const vH = 32, dS = 128, o = R(vH * dS), w = R(dS), z = R(vH * dS, 3), by = buf(new Float32Array(vH * dS));
  await run('gdnNormGate', [buf(o), buf(w), buf(z), by, uni([dS, { f: eps }])], vH);
  const y = new Float32Array(vH * dS);
  for (let h = 0; h < vH; h++) { let s = 0; for (let j = 0; j < dS; j++) s += o[h * dS + j] ** 2; const sc = 1 / Math.sqrt(s / dS + eps); for (let j = 0; j < dS; j++) { const zz = z[h * dS + j]; y[h * dS + j] = o[h * dS + j] * sc * w[j] * (zz / (1 + Math.exp(-zz))); } }
  out.gdnNormGate = cmp(await read(by, vH * dS), y);
}
{ // moeAccumShared
  const Hd = 2048, K = 8, outv = R(K * Hd), sh = R(Hd), sg = new Float32Array([0.7]), x = R(Hd);
  const sel = new Uint32Array(2 * K); const wts = R(K).map(Math.abs); const ws = wts.reduce((a, b) => a + b, 0);
  for (let j = 0; j < K; j++) { sel[j] = j; sel[K + j] = new Uint32Array(new Float32Array([wts[j] / ws]).buffer)[0]; }
  const bx = buf(x);
  await run('moeAccumShared', [buf(outv), buf(sel), buf(sh), buf(sg), bx, uni([Hd, K])], Math.ceil(Hd / 256));
  const y = new Float32Array(Hd), gate = 1 / (1 + Math.exp(-0.7));
  for (let h = 0; h < Hd; h++) { let a = 0; for (let j = 0; j < K; j++) a += f(wts[j] / ws) * outv[j * Hd + h]; y[h] = a + sh[h] * gate + x[h]; }
  out.moeAccumShared = cmp(await read(bx, Hd), y);
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
console.log(ok ? 'qwen35 kernels: ok' : 'qwen35 kernels: FAIL');
stop();
process.exit(ok ? 0 : 1);
