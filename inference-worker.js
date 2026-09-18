/*
 * LocalMind inference worker protocol v1.
 *
 * This worker deliberately has no DOM or LocalMind UI dependencies. It is the
 * shared, vendorable runtime entry point used by LocalMind and NakliOS.
 *
 * Protocol:
 *   -> { type: "load", id?, modelId?, hfToken? }
 *   <- progress*; ready
 *   -> { type: "generate", id, messages, generationConfig? }
 *   <- token*; complete
 *   -> { type: "stop", id? }
 *   -> { type: "unload", id? }
 *
 * Every response echoes the request id when one was provided. Older LocalMind
 * callers omit ids, which remains supported.
 */

const PROTOCOL = 'localmind.inference.v1';
const DEFAULT_MODEL_ID = 'LiquidAI/LFM2.5-230M-GGUF';
const GGUF_FILE = 'LFM2.5-230M-Q4_0.gguf';
const ENGINE_URL = new URL('./lfm2_5.js', import.meta.url).href;

let Lfm2Mobile = null;
let model = null;
let abortController = null;
let stopFlag = false;
let lastHistoryLen = 0;
let activeRequestId = null;

// ── Shared engine-worker prelude ──────────────────────────────────────────
// Prepended verbatim to every custom-WGSL engine worker (LFM2.5 /
// Ternary Bonsai 2): the hidden-tab rAF shim, the optional Hugging Face token,
// and `engineFetch`, the streaming + resuming range-read wrapper the engines
// take as `load(…, { fetch })`. In index.html it lives in #engineWorkerPreludeSrc
// and the Bonsai 2 blob-worker factory splices it in; inference-worker.js (the
// standalone, NakliOS-vendored entry point) carries a byte-identical copy,
// enforced by scripts/test-engine-fetch.mjs. Edit both or neither.
// The engine yields between load stages with requestAnimationFrame whenever that
// global exists (Chrome exposes it in dedicated workers). rAF never fires while
// the tab is hidden, so a load started and then tabbed away stalls at "Loading
// tokenizer" / "warmup" until the tab is fronted again. A timer-backed rAF keeps
// a multi-GB load moving in the background; nothing on the worker path needs real
// frame timing. Must be installed before the engine is imported.
self.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);

// The engines read each weight range exactly once, so a single dropped
// connection aborts the whole load (one 'Failed to fetch' at 70% of Bonsai 2's
// ~6 GB did, in the 2026-09-18 live check). Range reads go through this wrapper: the request
// is retried with backoff on transient failures (network errors, 429/5xx), and
// the body is STREAMED — not buffered — so the engine's per-chunk byte progress
// keeps flowing on slow links; if the body drops mid-range, the remainder is
// re-requested from the next byte (`Range: bytes=<start+delivered>-<end>`) and
// spliced into the same stream. Every other request (the HEAD size probe,
// tokenizer/resource fetches) passes straight through.
const RANGE_RETRIES = 4;
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
  let delivered = 0;
  let reader = first.body.getReader();
  const body = new ReadableStream({
    async pull(controller) {
      for (;;) {
        try {
          const { done, value } = await reader.read();
          if (done) { controller.close(); return; }
          delivered += value.byteLength;
          controller.enqueue(value);
          return;
        } catch (err) {
          throwIfAborted();
          try { reader.cancel().catch(() => {}); } catch (_) {}
          // Body dropped mid-range: reopen from the next byte and keep streaming.
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
    if (role !== 'system' && role !== 'user' && role !== 'assistant') role = 'user';
    const raw = message && message.content;
    const content = typeof raw === 'string'
      ? raw
      : Array.isArray(raw)
        ? raw.filter((block) => block && block.type === 'text')
          .map((block) => block.text || '')
          .join('\n')
        : String(raw == null ? '' : raw);
    return { role, content };
  });

const loadModel = async (request) => {
  const id = request.id;
  activeRequestId = id == null ? null : id;
  if (model) {
    post({ type: 'ready', backend: 'webgpu', model: request.modelId || DEFAULT_MODEL_ID }, id);
    return;
  }
  if (!Lfm2Mobile) ({ Lfm2Mobile } = await import(ENGINE_URL));
  hfToken = (typeof request.hfToken === 'string' && request.hfToken.trim()) || null;
  post({ type: 'progress', data: { status: 'initiate', file: GGUF_FILE } }, id);
  model = await Lfm2Mobile.load(request.modelId || DEFAULT_MODEL_ID, {
    // Range reads stream + resume and carry the optional HF token (prelude).
    fetch: engineFetch,
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
            data: { status: 'progress_total', file: GGUF_FILE, loaded, total },
          }, id);
        } else if (typeof event.fraction === 'number') {
          post({
            type: 'progress',
            data: {
              status: 'progress_total',
              file: GGUF_FILE,
              loaded: Math.round(event.fraction * 1000),
              total: 1000,
            },
          }, id);
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
  post({
    type: 'ready',
    backend: 'webgpu',
    model: request.modelId || DEFAULT_MODEL_ID,
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
  let previous = '';

  try {
    const stream = model.generate(messages, {
      maxNewTokens: config.max_new_tokens || config.max_tokens || 1024,
      signal: abortController.signal,
    });
    for await (const output of stream) {
      if (stopFlag) break;
      const full = output && typeof output.text === 'string' ? output.text : '';
      if (full.length > previous.length) {
        post({ type: 'token', token: full.slice(previous.length) }, id);
        previous = full;
      }
    }
  } catch (error) {
    const message = String((error && error.message) || error);
    if (!(stopFlag || message.toLowerCase().includes('abort'))) throw error;
  } finally {
    abortController = null;
  }
  post({ type: 'complete', finishReason: stopFlag ? 'cancelled' : 'stop' }, id);
  activeRequestId = null;
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
    else if (request.type === 'unload') await unload();
    else post({ type: 'error', message: `Unknown request type: ${String(request.type || '')}` }, request.id);
  } catch (error) {
    post({ type: 'error', message: (error && error.message) || String(error) }, request.id);
    if (request.type === 'load') model = null;
    if (request.type === 'generate') activeRequestId = null;
  }
};
