// ple-harness-worker.js — drives the vendored Gemma 4 E2B engine directly in a dedicated
// worker for scripts/test-ple-opfs.mjs. It counts live GPU buffer bytes (createBuffer minus
// destroy), loads the engine with the PLE table resident or served from OPFS, and runs
// greedy generations, returning token ids and timings. No LocalMind UI is involved.
//
// Messages (each answered by {id, ok, result | error}):
//   {op:'load', mode:'resident'|'opfs', patches?:[[from, to], ...], pleOpts?: createGemmaPle options}
//       patches are exact-once string replacements applied to the engine text before import
//       (for experiments such as the decode pipeline depth); the engine is then imported
//       from a blob URL. With no patches the served gemma-4-e2b.js is imported as is.
//   {op:'gen', prompt, maxNewTokens}   one fresh-cache greedy generation
//   {op:'promptTokens', prompt}        token count of the rendered prompt
//   {op:'gpu'}                         {live, peak} GPU buffer bytes
//   {op:'opfs', action:'list'|'clear'} list OPFS files, or remove localmind-ssd/
self.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);

let live = 0, peak = 0;
const sizes = new WeakMap();
const createBuffer = GPUDevice.prototype.createBuffer;
GPUDevice.prototype.createBuffer = function (desc) {
  const b = createBuffer.call(this, desc);
  sizes.set(b, desc.size);
  live += desc.size;
  if (live > peak) peak = live;
  return b;
};
const destroy = GPUBuffer.prototype.destroy;
GPUBuffer.prototype.destroy = function () {
  const s = sizes.get(this);
  if (s) { live -= s; sizes.delete(this); }
  return destroy.call(this);
};

// Keep the engine's device reachable for experiment patches.
const requestDevice = GPUAdapter.prototype.requestDevice;
GPUAdapter.prototype.requestDevice = async function (...a) { const d = await requestDevice.apply(this, a); self.__dev = d; return d; };

const logs = [];
for (const k of ['log', 'warn', 'error']) {
  const orig = console[k].bind(console);
  console[k] = (...a) => { logs.push(a.map(String).join(' ')); orig(...a); };
}

let model = null;
let engine = null;

async function importEngine(patches) {
  const url = new URL('../gemma-4-e2b.js', self.location.href).href;
  if (!patches || !patches.length) return import(url);
  let src = await (await fetch(url)).text();
  for (const [from, to] of patches) {
    const n = src.split(from).length - 1;
    if (n !== 1) throw new Error(`harness patch matched ${n} times: ${from.slice(0, 80)}`);
    src = src.replace(from, to);
  }
  return import(URL.createObjectURL(new Blob([src], { type: 'application/javascript' })));
}

const handlers = {
  async load({ mode = 'resident', patches = [], loadOpts = {}, pleOpts = {} }) {
    if (model) { model.dispose(); model = null; }
    engine = await importEngine(patches);
    const before = live;
    const t0 = performance.now();
    const status = [];
    const ple = mode === 'opfs'
      ? (await import(new URL('../ple-opfs.js', self.location.href).href)).createGemmaPle({ ...pleOpts, onStatus: (s) => status.push(s) })
      : undefined;
    model = await engine.Gemma4Mobile.load(null, { ple, ...loadOpts });
    const loadMs = performance.now() - t0;
    const afterLoad = live;
    await model.warmup();
    return { loadMs, gpuAfterLoad: afterLoad - before, gpuAfterWarmup: live - before, peak, pleMode: model.pleMode ?? 'resident', pleStats: model.pleStats ?? null, status };
  },
  async gen({ prompt, maxNewTokens = 256 }) {
    model.reset();
    const msgs = [{ role: 'user', content: prompt }];
    const promptTokens = model.encodePrompt(msgs).length;
    const ids = [];
    const t0 = performance.now();
    let first = 0, last = 0, text = '';
    for await (const out of model.generate(msgs, { maxNewTokens })) {
      const now = performance.now();
      if (!first) first = now;
      last = now;
      ids.push(out.token);
      text = out.text;
    }
    return { promptTokens, ids, text, ttftMs: first - t0, decodeMs: last - first, tokPerSec: ids.length > 1 ? (ids.length - 1) / ((last - first) / 1000) : 0, pleStats: model.pleStats ?? null };
  },
  async promptTokens({ prompt }) {
    return model.encodePrompt([{ role: 'user', content: prompt }]).length;
  },
  async gpu() { return { live, peak }; },
  async logs() { return logs.splice(0); },
  async opfs({ action }) {
    const root = await navigator.storage.getDirectory();
    const out = [];
    for await (const [name, h] of root.entries()) {
      if (h.kind !== 'file') continue;
      const size = (await h.getFile()).size;
      out.push({ name, size });
    }
    try {
      const ssd = await root.getDirectoryHandle('localmind-ssd');
      if (action === 'clear') { await root.removeEntry('localmind-ssd', { recursive: true }); out.push({ removed: 'localmind-ssd' }); }
      else for await (const [k, d] of ssd.entries()) for await (const [name, h] of d.entries()) out.push({ name: `localmind-ssd/${k}/${name}`, size: (await h.getFile()).size });
    } catch (_) {}
    out.push({ estimate: await navigator.storage.estimate() });
    return out;
  },
};

self.onmessage = async (e) => {
  const { id, op, ...args } = e.data || {};
  try {
    self.postMessage({ id, ok: true, result: await handlers[op](args) });
  } catch (err) {
    self.postMessage({ id, ok: false, error: String((err && err.stack) || err) });
  }
};
self.postMessage({ id: 0, ok: true, result: 'ready' });
