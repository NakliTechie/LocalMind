/*
 * LocalMind Transformers.js/WebGPU inference worker.
 *
 * This worker implements localmind.inference.v1 for the conservative host
 * model catalog. It intentionally contains no LocalMind or NakliOS UI code.
 */

const PROTOCOL = 'localmind.inference.v1';
const TRANSFORMERS_URL =
  'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2/+esm';

let transformers = null;
let processor = null;
let tokenizer = null;
let model = null;
let loadedModelId = null;
let loadedType = null;
let loadedModelClass = null;
let stoppingCriteria = null;
let activeRequestId = null;

const post = (message, id = activeRequestId) => {
  const payload = id == null ? message : { ...message, id };
  self.postMessage({ protocol: PROTOCOL, ...payload });
};

async function loadTransformers() {
  if (transformers) return transformers;
  transformers = await import(TRANSFORMERS_URL);
  const { env, InterruptableStoppingCriteria } = transformers;
  env.allowLocalModels = true;
  env.localModelPath = '/models/';
  env.allowRemoteModels = true;
  stoppingCriteria = new InterruptableStoppingCriteria();
  return transformers;
}

async function unload() {
  try { stoppingCriteria?.interrupt(); } catch (_) {}
  try { await model?.dispose?.(); } catch (_) {}
  processor = null;
  tokenizer = null;
  model = null;
  loadedModelId = null;
  loadedType = null;
  loadedModelClass = null;
  activeRequestId = null;
}

// LiquidAI's LFM3 ONNX export names its last-position input logits_to_keep
// (shape [1]); Transformers.js 4.3.2 feeds only num_logits_to_keep and rejects
// the run as "Missing the following inputs: logits_to_keep". Hide the input
// from that check and add it at the session's run, set to 1: generate() reads
// only the last position's logits. Ported from LocalMind 38c4627.
function feedLogitsToKeep(loaded) {
  const sess = loaded?.sessions?.model;
  if (!sess || !sess.inputNames.includes('logits_to_keep')) return;
  const names = sess.inputNames.filter((n) => n !== 'logits_to_keep');
  const one = new transformers.Tensor('int64', [1n], [1]).ort_tensor;
  const run = sess.run.bind(sess);
  Object.defineProperty(sess, 'inputNames', { value: names });
  sess.run = (feeds, opts) => run({ ...feeds, logits_to_keep: one }, opts);
}

async function loadModel(request) {
  const id = request.id;
  const modelId = String(request.modelId || '');
  const modelType = request.modelType === 'multimodal' ? 'multimodal' : 'causal';
  const modelClass = request.modelClass === 'qwen3_5' ? 'qwen3_5' :
    modelType === 'multimodal' ? 'gemma4' : 'auto-causal';
  const dtype = request.dtype || 'q4f16';
  activeRequestId = id == null ? null : id;

  if (!modelId) throw new Error('modelId is required');
  if (model && loadedModelId === modelId && loadedType === modelType &&
      loadedModelClass === modelClass) {
    post({ type: 'ready', backend: 'webgpu', model: modelId }, id);
    return;
  }
  if (model) await unload();

  const mod = await loadTransformers();
  const progress_callback = (data) => post({ type: 'progress', data }, id);

  if (modelType === 'multimodal') {
    processor = await mod.AutoProcessor.from_pretrained(modelId, {
      progress_callback,
    });
    tokenizer = processor.tokenizer;
    const ConditionalGenerationModel = modelClass === 'qwen3_5'
      ? mod.Qwen3_5ForConditionalGeneration
      : mod.Gemma4ForConditionalGeneration;
    if (!ConditionalGenerationModel) {
      throw new Error(`Transformers.js 4.3.2 does not export ${modelClass}`);
    }
    model = await ConditionalGenerationModel.from_pretrained(modelId, {
      dtype,
      device: 'webgpu',
      progress_callback,
    });
  } else {
    tokenizer = await mod.AutoTokenizer.from_pretrained(modelId, {
      progress_callback,
    });
    processor = null;
    model = await mod.AutoModelForCausalLM.from_pretrained(modelId, {
      dtype,
      device: 'webgpu',
      progress_callback,
    });
    feedLogitsToKeep(model);
  }

  post({ type: 'progress', data: { status: 'warmup', file: modelId } }, id);
  const warmupInputs = modelType === 'multimodal'
    ? await processor('a', null, null, { add_special_tokens: false })
    : tokenizer('a');
  await model.generate({ ...warmupInputs, max_new_tokens: 1 });
  loadedModelId = modelId;
  loadedType = modelType;
  loadedModelClass = modelClass;
  activeRequestId = null;
  post({ type: 'ready', backend: 'webgpu', model: modelId }, id);
}

function normaliseMessages(messages, multimodal = false) {
  return (Array.isArray(messages) ? messages : []).map((message) => {
    let role = message?.role;
    if (role !== 'system' && role !== 'user' && role !== 'assistant') role = 'user';
    const raw = message?.content;
    const text = typeof raw === 'string'
      ? raw
      : Array.isArray(raw)
        ? raw.filter((block) => block?.type === 'text')
          .map((block) => String(block.text || '')).join('\n')
        : String(raw == null ? '' : raw);
    return multimodal
      ? { role, content: [{ type: 'text', text }] }
      : { role, content: text };
  });
}

function causalInputs(messages) {
  try {
    // Templates that think by default (LFM3) read enable_thinking; others ignore it.
    return tokenizer.apply_chat_template(messages, {
      add_generation_prompt: true,
      return_dict: true,
      enable_thinking: false,
    });
  } catch (_) {
    let prompt = '';
    for (const message of messages) {
      prompt += `<|im_start|>${message.role}\n${message.content}<|im_end|>\n`;
    }
    prompt += '<|im_start|>assistant\n';
    return tokenizer(prompt, { add_special_tokens: false });
  }
}

async function multimodalInputs(messages) {
  const prompt = processor.apply_chat_template(messages, {
    add_generation_prompt: true,
    enable_thinking: false,
  });
  return processor(prompt, null, null, { add_special_tokens: false });
}

async function generate(request) {
  const id = request.id;
  if (!model) throw new Error('WebGPU model is not loaded');
  activeRequestId = id == null ? null : id;
  stoppingCriteria.reset();

  const config = request.generationConfig || {};
  const multimodal = loadedType === 'multimodal';
  const messages = normaliseMessages(request.messages, multimodal);
  const inputs = multimodal
    ? await multimodalInputs(messages)
    : causalInputs(messages);
  // With thinking off, LFM3 still opens <think> on some prompts. Host apps get
  // answer text only, so drop that span. Each tag is one token and arrives
  // whole in one streamer chunk.
  let inThink = false;
  const streamer = new transformers.TextStreamer(
    multimodal ? processor.tokenizer : tokenizer,
    {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (chunk) => {
        let token = '';
        let rest = String(chunk);
        while (rest) {
          const tag = inThink ? '</think>' : '<think>';
          const at = rest.indexOf(tag);
          if (at === -1) { if (!inThink) token += rest; break; }
          if (!inThink) token += rest.slice(0, at);
          rest = rest.slice(at + tag.length);
          inThink = !inThink;
        }
        if (token) post({ type: 'token', token }, id);
      },
    },
  );

  await model.generate({
    ...inputs,
    max_new_tokens: config.max_new_tokens || config.max_tokens || 384,
    do_sample: true,
    temperature: config.temperature ?? 0.7,
    top_k: config.top_k ?? 40,
    top_p: config.top_p ?? 0.95,
    repetition_penalty: config.repetition_penalty ?? 1.0,
    streamer,
    stopping_criteria: stoppingCriteria,
  });
  activeRequestId = null;
  post({ type: 'complete', finishReason: 'stop' }, id);
}

function stop(request) {
  if (request.id != null && activeRequestId != null &&
      request.id !== activeRequestId) return;
  try { stoppingCriteria?.interrupt(); } catch (_) {}
}

self.addEventListener('message', async (event) => {
  const request = event.data || {};
  try {
    if (request.type === 'load') await loadModel(request);
    else if (request.type === 'generate') await generate(request);
    else if (request.type === 'stop') stop(request);
    else if (request.type === 'unload') await unload();
    else throw new Error(`Unknown request type: ${String(request.type || '')}`);
  } catch (error) {
    post({ type: 'error', message: error?.message || String(error) }, request.id);
    if (request.type === 'load') await unload();
    if (request.type === 'generate') activeRequestId = null;
  }
});
