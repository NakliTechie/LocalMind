/*
 * LocalMind inference worker protocol v1.
 *
 * This worker deliberately has no DOM or LocalMind UI dependencies. It is the
 * shared, vendorable runtime entry point used by LocalMind and NakliOS.
 *
 * Protocol:
 *   -> { type: "load", id?, modelId?, entry?, maxCtx?, adapter?, hfToken? }
 *   <- progress*; ready { adapter }
 *   -> { type: "generate", id, messages, tools?, generationConfig? }
 *   <- (token | reasoning)*; tool_calls?; complete
 *   -> { type: "setAdapter", id?, on }
 *   <- adapter { on }
 *   -> { type: "stop", id? }
 *   -> { type: "unload", id? }
 *
 * `entry` names a model in anyformer's catalog (MODELS.chat, e.g. LFM2_5_24B_PI), which brings its repo, GPU budget and
 * any run-time LoRA adapter; without it `modelId` (a Hub repo) loads, LFM2.5 230M by default. `ready.adapter` is the
 * adapter's state (true / false), or null when the model has none. `tools` are OpenAI function tools; anyformer writes
 * them into the prompt in the model's own format and parses the calls, which arrive as one `tool_calls` message
 * (OpenAI tool_calls, ids call_<n>) before `complete`. Messages may carry role "tool" (with tool_call_id) and assistant
 * `tool_calls`. A model that reasons before answering streams the reasoning as `reasoning` deltas, apart from `token`.
 *
 * Every response echoes the request id when one was provided. Older LocalMind
 * callers omit ids, which remains supported.
 */

const PROTOCOL = 'localmind.inference.v1';
const DEFAULT_MODEL_ID = 'LiquidAI/LFM2.5-230M-GGUF';
const GGUF_FILE = 'LFM2.5-230M-Q4_0.gguf';
// The model loads through anyformer (convergence plan, 2026-10-22): anyformer resolves the repo to diskformer's copy of
// the LFM2.5 engine (Lfm2Mobile) and returns a session with the same generate / reset / dispose. Pinned to an exact
// version; LocalMind's anyformer_models.js pins the same one.
const ANYFORMER_URL = 'https://cdn.jsdelivr.net/npm/anyformer@0.4.22/index.js';

let anyformerLoad = null;
let anyformerModels = null;
let weightsLabel = GGUF_FILE;
let model = null;
let abortController = null;
let stopFlag = false;
let lastHistoryLen = 0;
let activeRequestId = null;

// ── Shared engine-worker prelude ──────────────────────────────────────────
// Prepended verbatim to every custom-WGSL engine worker (LFM2.5 / Gemma 4 /
// Ternary Bonsai 2): the hidden-tab rAF shim, the optional Hugging Face token,
// and `engineFetch`, the streaming + resuming range-read wrapper the engines
// take as `load(…, { fetch })`. In index.html it lives in #engineWorkerPreludeSrc
// and the blob-worker factories splice it in; inference-worker.js (the
// standalone, NakliOS-vendored entry point) carries a byte-identical copy,
// enforced by scripts/test-engine-fetch.mjs. Edit both or neither.
// The engine yields between load stages with requestAnimationFrame whenever that
// global exists (Chrome exposes it in dedicated workers). rAF never fires while
// the tab is hidden, so a load started and then tabbed away stalls at "Loading
// tokenizer" / "warmup" until the tab is fronted again. A timer-backed rAF keeps
// a multi-GB load moving in the background; nothing on the worker path needs real
// frame timing. Must be installed before the engine is imported.
self.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
// Chrome 156's Dawn rejects subgroup-matrix multiplies with f16 operands and an f32 result on Apple GPUs ("Mixed
// precision subgroup matrix multiply is not supported by the device"). Apple reports only f16-f16 and f32-f32
// configurations; older Dawn compiled the mixed pair anyway, and the Bonsai 2, Gemma 4, LFM2.5 and IQ prefill kernels
// rely on it. So the first adapter request compiles one tiny mixed kernel on a separate adapter (an adapter gives out
// one device); if that fails, the adapter handed to the engine hides the subgroup-matrix feature and each engine takes
// its non-matrix prefill path. Must be installed before the engine is imported.
(() => {
  const gpu = self.navigator && self.navigator.gpu;
  if (!gpu || typeof gpu.requestAdapter !== 'function') return;
  const SGM = 'chromium-experimental-subgroup-matrix';
  const realRequest = gpu.requestAdapter.bind(gpu);
  const MIXED = 'enable f16; enable chromium_experimental_subgroup_matrix; '
    + '@group(0) @binding(0) var<storage, read_write> o: array<f32>; @group(0) @binding(1) var<storage, read> x: array<f16>; '
    + '@compute @workgroup_size(32) fn main() { let a = subgroupMatrixLoad<subgroup_matrix_left<f16, 8, 8>>(&x, 0, false, 8); '
    + 'let b = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&x, 0, false, 8); var c = subgroup_matrix_result<f32, 8, 8>(); '
    + 'c = subgroupMatrixMultiplyAccumulate(a, b, c); subgroupMatrixStore(&o, 0, c, false, 8); }';
  let mixedOk = null;
  const probe = async (opts) => {
    let dev = null;
    try {
      const a = await realRequest(opts);
      if (!a || !a.features.has('shader-f16') || !a.features.has('subgroups')) return false;
      dev = await a.requestDevice({ requiredFeatures: ['shader-f16', 'subgroups', SGM] });
      await dev.createComputePipelineAsync({ layout: 'auto', compute: { module: dev.createShaderModule({ code: MIXED }), entryPoint: 'main' } });
      return true;
    } catch (e) { return false; } finally { if (dev) dev.destroy(); }
  };
  gpu.requestAdapter = async (opts) => {
    const adapter = await realRequest(opts);
    if (!adapter || !adapter.features.has(SGM)) return adapter;
    if (mixedOk === null) mixedOk = probe(opts);
    if (await mixedOk) return adapter;
    const features = new Set([...adapter.features].filter((f) => f !== SGM));
    return new Proxy(adapter, { get(t, p) { if (p === 'features') return features; const v = Reflect.get(t, p, t); return typeof v === 'function' ? v.bind(t) : v; } });
  };
})();

// The engines read each weight range exactly once, so a single dropped
// connection aborts the whole load (one 'Failed to fetch' at 70% of Bonsai 2's
// ~6 GB did, in the 2026-09-18 live check). Range reads go through this wrapper: the request
// is retried with backoff on transient failures (network errors, 429/5xx), and
// the body is STREAMED — not buffered — so the engine's per-chunk byte progress
// keeps flowing on slow links; if the body drops mid-range, the remainder is
// re-requested from the next byte (`Range: bytes=<start+delivered>-<end>`) and
// spliced into the same stream. Every other request (the HEAD size probe,
// tokenizer/resource fetches) passes straight through.
// A body can also stop delivering without erroring (a half-open connection): reader.read() then waits forever,
// nothing resumes, and the load freezes with no error. Each read is bounded by READ_STALL_MS and a stall is
// resumed like a drop. Bytes arriving reset the budget, so a slow link that keeps delivering is never cut;
// more than RANGE_RETRIES drops or stalls in a row with no bytes fail the read instead of retrying forever.
const RANGE_RETRIES = 4;
const READ_STALL_MS = 30000;
const parseRangeHeader = (init) => {
  const h = init.headers ? new Headers(init.headers).get('range') : null;
  const m = h && /^bytes=(\d+)-(\d*)$/.exec(h.trim());
  return m ? { start: Number(m[1]), end: m[2] === '' ? null : Number(m[2]) } : null;
};
// Settings → Models token (posted as `hfToken` on the load message). Sent as
// Authorization: Bearer on huggingface.co requests only; the CDN hop after the
// 302 carries its own signed URL and gets no header.
let hfToken = null;
const isHfOrigin = (u) => { try { return new URL(u, self.location.href).host === 'huggingface.co'; } catch (_) { return false; } };
const withAuth = (url, init) => {
  if (!hfToken || !isHfOrigin(url)) return init;
  const headers = new Headers(init.headers);
  headers.set('Authorization', 'Bearer ' + hfToken);
  return { ...init, headers };
};
const engineFetch = async (url, init = {}) => {
  const range = parseRangeHeader(init);
  if (!range) return fetch(url, withAuth(url, init));
  const signal = init.signal;
  const throwIfAborted = () => {
    if (signal && signal.aborted) throw (signal.reason || new DOMException('aborted', 'AbortError'));
  };
  const request = async (start) => {
    let lastErr = null;
    for (let attempt = 0; attempt < RANGE_RETRIES; attempt++) {
      throwIfAborted();
      try {
        const headers = new Headers(init.headers);
        headers.set('Range', `bytes=${start}-${range.end == null ? '' : range.end}`);
        const r = await fetch(url, withAuth(url, { ...init, headers }));
        if (r.status === 429 || r.status >= 500) throw new Error(`HTTP ${r.status} on range read`);
        return r;
      } catch (err) {
        lastErr = err;
        throwIfAborted();
        await new Promise((res) => setTimeout(res, 1000 * (attempt + 1)));
      }
    }
    throw lastErr;
  };
  const first = await request(range.start);
  // Anything but a partial-content body (e.g. a 200 full-response fallback) is
  // the engine's to interpret; only 206 bodies get the resume treatment.
  if (first.status !== 206 || !first.body) return first;
  let delivered = 0, dry = 0;
  let reader = first.body.getReader();
  const read = () => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`range read stalled: no bytes in ${READ_STALL_MS} ms`)), READ_STALL_MS);
    reader.read().then((r) => { clearTimeout(timer); resolve(r); }, (e) => { clearTimeout(timer); reject(e); });
  });
  const body = new ReadableStream({
    async pull(controller) {
      for (;;) {
        try {
          const { done, value } = await read();
          if (done) { controller.close(); return; }
          delivered += value.byteLength;
          if (value.byteLength) dry = 0;
          controller.enqueue(value);
          return;
        } catch (err) {
          throwIfAborted();
          try { reader.cancel().catch(() => {}); } catch (_) {}
          if (++dry > RANGE_RETRIES) throw err;
          // Body dropped or stalled mid-range: reopen from the next byte and keep streaming.
          const r = await request(range.start + delivered);
          if (r.status !== 206 || !r.body) throw err;
          reader = r.body.getReader();
        }
      }
    },
    cancel() { try { reader.cancel().catch(() => {}); } catch (_) {} },
  });
  return new Response(body, { status: first.status, statusText: first.statusText, headers: first.headers });
};
// ── End shared engine-worker prelude ──────────────────────────────────────

const post = (message, id = activeRequestId) => {
  const payload = id == null ? message : { ...message, id };
  self.postMessage({ protocol: PROTOCOL, ...payload });
};

const normaliseMessages = (messages) => (Array.isArray(messages) ? messages : [])
  .map((message) => {
    let role = message && message.role;
    if (role !== 'system' && role !== 'user' && role !== 'assistant' && role !== 'tool') role = 'user';
    const raw = message && message.content;
    const content = typeof raw === 'string'
      ? raw
      : Array.isArray(raw)
        ? raw.filter((block) => block && block.type === 'text')
          .map((block) => block.text || '')
          .join('\n')
        : String(raw == null ? '' : raw);
    // Tool traffic passes through for anyformer to write in the model's format.
    const out = { role, content };
    if (role === 'assistant' && Array.isArray(message.tool_calls) && message.tool_calls.length) out.tool_calls = message.tool_calls;
    if (role === 'tool' && message.tool_call_id != null) out.tool_call_id = message.tool_call_id;
    if (role === 'tool' && typeof message.name === 'string') out.name = message.name;
    return out;
  });

const loadModel = async (request) => {
  const id = request.id;
  activeRequestId = id == null ? null : id;
  if (model) {
    post({ type: 'ready', backend: 'webgpu', model: request.entry || request.modelId || DEFAULT_MODEL_ID, adapter: null }, id);
    return;
  }
  if (!anyformerLoad) ({ load: anyformerLoad, MODELS: anyformerModels } = await import(ANYFORMER_URL));
  hfToken = (typeof request.hfToken === 'string' && request.hfToken.trim()) || null;
  const entry = typeof request.entry === 'string' && request.entry ? anyformerModels.chat[request.entry] : null;
  if (request.entry && !entry) throw new Error(`anyformer has no model ${request.entry}`);
  weightsLabel = entry ? `${entry.repo.split('/').pop()} into on-device storage` : GGUF_FILE;
  post({ type: 'progress', data: { status: 'initiate', file: weightsLabel } }, id);
  const maxCtx = request.maxCtx > 0 ? request.maxCtx : undefined;
  model = await anyformerLoad(entry || request.modelId || DEFAULT_MODEL_ID, {
    // Range reads stream + resume and carry the optional HF token (prelude).
    fetch: engineFetch,
    ...(maxCtx ? { maxCtx } : {}),
    onProgress: (event) => {
      if (!event) return;
      if (event.status === 'weights' && event.kind === 'tensors') {
        // Post-download phases: tensor upload to the GPU (counted in tensors,
        // not bytes — must not drive the MB bar), then kernel warmup.
        const loaded = typeof event.loaded === 'number' ? event.loaded : null;
        const total = typeof event.total === 'number' ? event.total : null;
        if (loaded != null && total != null && total > 0) {
          // No '/' in the label: the host splits `file` on '/' to show a basename.
          post({
            type: 'progress',
            data: { status: 'loading', file: `weights to GPU (${loaded} of ${total} tensors)` },
          }, id);
        } else {
          post({ type: 'warmup' }, id);
        }
      } else if (event.status === 'weights') {
        const loaded = typeof event.loaded === 'number' ? event.loaded : null;
        const total = typeof event.total === 'number' ? event.total : null;
        if (loaded != null && total != null && total > 0) {
          post({
            type: 'progress',
            data: { status: 'progress_total', file: weightsLabel, loaded, total },
          }, id);
        } else if (typeof event.fraction === 'number') {
          post({
            type: 'progress',
            data: {
              status: 'progress_total',
              file: weightsLabel,
              loaded: Math.round(event.fraction * 1000),
              total: 1000,
            },
          }, id);
        }
      } else if (event.status === 'adapter') {
        // A run-time LoRA's own file (anyformer 0.4.22+), apart from the model's weights.
        if (typeof event.loaded === 'number' && event.total > 0) {
          post({ type: 'progress', data: { status: 'progress_total', file: 'adapter into browser storage', loaded: event.loaded, total: event.total } }, id);
        }
      } else if (event.status === 'tokenizer') {
        post({ type: 'progress', data: { status: 'loading', file: 'tokenizer' } }, id);
      } else if (event.status === 'init') {
        post({ type: 'progress', data: { status: 'initiate', file: 'WebGPU device' } }, id);
      }
    },
  });
  lastHistoryLen = 0;
  try {
    if (typeof model.warmup === 'function') await model.warmup();
  } catch (_) {
    // Warmup is an optimisation. A usable model must not be rejected for it.
  }
  // A run-time adapter starts in the state the host asks for (off unless adapter: true).
  let adapter = null;
  if (typeof model.setAdapter === 'function') { adapter = request.adapter === true; await model.setAdapter(adapter); }
  post({
    type: 'ready',
    backend: 'webgpu',
    model: request.entry || request.modelId || DEFAULT_MODEL_ID,
    adapter,
  }, id);
};

const generate = async (request) => {
  const id = request.id;
  activeRequestId = id == null ? null : id;
  if (!model) {
    post({ type: 'error', message: 'LFM2 WebGPU model is not loaded' }, id);
    return;
  }

  stopFlag = false;
  const config = request.generationConfig || {};
  const messages = normaliseMessages(request.messages);
  const turnCount = messages.filter((message) => message.role !== 'system').length;
  if ((config.reset === true || turnCount <= 1 || messages.length < lastHistoryLen) &&
      typeof model.reset === 'function') {
    try { model.reset(); } catch (_) {}
  }
  lastHistoryLen = messages.length;
  abortController = new AbortController();
  let previous = '', latest = '', thought = '', toolCalls = null;
  const tools = Array.isArray(request.tools) && request.tools.length ? request.tools : null;

  try {
    const stream = model.generate(messages, {
      maxNewTokens: config.max_new_tokens || config.max_tokens || 1024,
      signal: abortController.signal,
      ...(tools ? { tools } : {}),
      ...(config.enable_thinking === true ? { thinking: true } : {}),
    });
    for await (const output of stream) {
      if (stopFlag) break;
      // Reasoning (a model that always thinks first, with thinking off: LFM2.5 24B-A2B) arrives as its own text.
      const r = output && typeof output.reasoning === 'string' ? output.reasoning : '';
      if (r.length > thought.length && !r.endsWith('\uFFFD')) { post({ type: 'reasoning', token: r.slice(thought.length) }, id); thought = r; }
      if (output && Array.isArray(output.toolCalls) && output.toolCalls.length) toolCalls = output.toolCalls;
      let full = output && typeof output.text === 'string' ? output.text : '';
      // Call markup is held back while a call is being written: anyformer returns it parsed once it is complete.
      if (tools) { const at = full.indexOf('<|tool_call_start|>'); if (at >= 0) full = full.slice(0, at); }
      latest = full;
      // A character split across tokens decodes with a trailing U+FFFD until its last byte arrives: hold the delta
      // until then, or the stream carries U+FFFD and the next delta starts a code unit late (2026-10-14).
      if (!full.endsWith('\uFFFD') && full.length > previous.length) {
        post({ type: 'token', token: full.slice(previous.length) }, id);
        previous = full;
      }
    }
    if (latest.length > previous.length) post({ type: 'token', token: latest.slice(previous.length) }, id);
    if (toolCalls) post({ type: 'tool_calls', toolCalls }, id);
  } catch (error) {
    const message = String((error && error.message) || error);
    if (!(stopFlag || message.toLowerCase().includes('abort'))) throw error;
  } finally {
    abortController = null;
  }
  post({ type: 'complete', finishReason: stopFlag ? 'cancelled' : toolCalls ? 'tool_calls' : 'stop' }, id);
  activeRequestId = null;
};

const setAdapter = async (request) => {
  if (!model || typeof model.setAdapter !== 'function') { post({ type: 'adapter', on: null }, request.id); return; }
  await model.setAdapter(request.on === true);
  post({ type: 'adapter', on: request.on === true }, request.id);
};

const stop = (request) => {
  if (request.id != null && activeRequestId != null && request.id !== activeRequestId) return;
  stopFlag = true;
  if (abortController) {
    try { abortController.abort(); } catch (_) {}
  }
};

const unload = async () => {
  stopFlag = true;
  if (abortController) {
    try { abortController.abort(); } catch (_) {}
  }
  try {
    if (model && typeof model.reset === 'function') model.reset();
  } catch (_) {}
  try {
    if (model && typeof model.dispose === 'function') await model.dispose();
  } catch (_) {}
  model = null;
  abortController = null;
  activeRequestId = null;
  lastHistoryLen = 0;
};

self.onmessage = async (event) => {
  const request = event.data || {};
  try {
    if (request.type === 'load') await loadModel(request);
    else if (request.type === 'generate') await generate(request);
    else if (request.type === 'stop') stop(request);
    else if (request.type === 'setAdapter') await setAdapter(request);
    else if (request.type === 'unload') await unload();
    else post({ type: 'error', message: `Unknown request type: ${String(request.type || '')}` }, request.id);
  } catch (error) {
    post({ type: 'error', message: (error && error.message) || String(error) }, request.id);
    if (request.type === 'load') model = null;
    if (request.type === 'generate') activeRequestId = null;
  }
};
