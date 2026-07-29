/*
 * LocalMind inference worker protocol v1.
 *
 * This worker deliberately has no DOM or LocalMind UI dependencies. It is the
 * shared, vendorable runtime entry point used by LocalMind and NakliOS.
 *
 * Protocol:
 *   -> { type: "load", id?, modelId? }
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
  post({ type: 'progress', data: { status: 'initiate', file: GGUF_FILE } }, id);
  model = await Lfm2Mobile.load(request.modelId || DEFAULT_MODEL_ID, {
    onProgress: (event) => {
      if (!event) return;
      if (event.status === 'weights') {
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
