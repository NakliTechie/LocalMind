/*
 * LocalMind Transformers.js/WebGPU inference worker.
 *
 * This worker implements localmind.inference.v1 for the conservative host
 * model catalog. It intentionally contains no LocalMind or NakliOS UI code.
 */

const PROTOCOL = 'localmind.inference.v1';
const TRANSFORMERS_URL =
  'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0/+esm';

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
      throw new Error(`Transformers.js 4.2.0 does not export ${modelClass}`);
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
    return tokenizer.apply_chat_template(messages, {
      add_generation_prompt: true,
      return_dict: true,
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
  const streamer = new transformers.TextStreamer(
    multimodal ? processor.tokenizer : tokenizer,
    {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (token) => {
        post({ type: 'token', token }, id);
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
