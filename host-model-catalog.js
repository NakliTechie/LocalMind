/*
 * LocalMind host model catalog v1.
 *
 * This is the small, DOM-free catalog intended for hosts such as NakliOS.
 * LocalMind's workbench has a much larger experimental registry; the host
 * catalog is deliberately conservative and contains only models whose current
 * runtime path is already supported by LocalMind.
 */

const LOCALMIND_HOST_MODELS = Object.freeze([
  Object.freeze({
    key: 'lfm2-230m-webgpu',
    id: 'LiquidAI/LFM2.5-230M-GGUF',
    label: 'LFM2.5 230M',
    family: 'LFM2.5',
    runtime: 'custom-webgpu',
    worker: 'inference-worker.js',
    dtype: 'q4',
    size: '~140 MB',
    sizeBytes: 140_000_000,
    contextTokens: 32_768,
    modelType: 'causal',
    description: 'Fastest start. The default LocalMind WebGPU engine.',
    generationConfig: Object.freeze({
      temperature: 0.3,
      top_k: 20,
      top_p: 0.95,
      repetition_penalty: 1.05,
    }),
  }),
  Object.freeze({
    key: 'gemma4-e2b',
    id: 'onnx-community/gemma-4-E2B-it-ONNX',
    label: 'Gemma 4 E2B',
    family: 'Gemma 4',
    runtime: 'transformers-webgpu',
    worker: 'onnx-inference-worker.js',
    dtype: 'q4f16',
    size: '~1.5 GB',
    sizeBytes: 1_500_000_000,
    contextTokens: 8_192,
    modelType: 'multimodal',
    description: 'Stronger small model. Text is enabled through the host SDK.',
    generationConfig: Object.freeze({
      temperature: 0.7,
      top_k: 40,
      top_p: 0.95,
      repetition_penalty: 1.1,
    }),
  }),
  Object.freeze({
    key: 'gemma4-e4b',
    id: 'onnx-community/gemma-4-E4B-it-ONNX',
    label: 'Gemma 4 E4B',
    family: 'Gemma 4',
    runtime: 'transformers-webgpu',
    worker: 'onnx-inference-worker.js',
    dtype: 'q4f16',
    size: '~4.9 GB',
    sizeBytes: 4_900_000_000,
    contextTokens: 12_288,
    modelType: 'multimodal',
    description: 'Most capable built-in choice. Best on high-memory systems.',
    generationConfig: Object.freeze({
      temperature: 0.7,
      top_k: 40,
      top_p: 0.95,
      repetition_penalty: 1.1,
    }),
  }),
  Object.freeze({
    key: 'qwen3-4b',
    id: 'onnx-community/Qwen3-4B-ONNX',
    label: 'Qwen3 4B',
    family: 'Qwen3',
    runtime: 'transformers-webgpu',
    worker: 'onnx-inference-worker.js',
    dtype: 'q4f16',
    size: '~2.8 GB',
    sizeBytes: 2_800_000_000,
    contextTokens: 32_768,
    modelType: 'causal',
    description: 'Stable multilingual reasoning and instruction model.',
    generationConfig: Object.freeze({
      temperature: 0.7,
      top_k: 20,
      top_p: 0.8,
      repetition_penalty: 1.05,
    }),
  }),
]);

const LOCALMIND_HOST_IMAGE_MODELS = Object.freeze([
  Object.freeze({
    key: 'flux2-klein-4b-webgpu',
    id: 'prism-ml/bonsai-image-ternary-4B-mlx-2bit',
    label: 'Bonsai Image · FLUX.2-Klein 4B',
    family: 'FLUX.2-Klein',
    runtime: 'custom-webgpu-image',
    worker: 'image-inference-worker.js',
    size: '~3.9 GB',
    sizeBytes: 3_880_000_000,
    outputFormat: 'png',
    defaultSize: '512x512',
    defaultSteps: 4,
    supportedSizes: Object.freeze([
      '512x512',
      '768x768',
      '1024x1024',
      '1024x768',
      '768x1024',
    ]),
    description:
      'Private FLUX.2-Klein image generation in this browser. ' +
      'The model is cached after its first download.',
  }),
]);

const LOCALMIND_DEFAULT_MODEL_KEY = 'lfm2-230m-webgpu';
const LOCALMIND_DEFAULT_IMAGE_MODEL_KEY = 'flux2-klein-4b-webgpu';

function getLocalMindHostModel(key) {
  return LOCALMIND_HOST_MODELS.find((model) => model.key === key) ||
    LOCALMIND_HOST_MODELS[0];
}

function getLocalMindHostImageModel(key) {
  return LOCALMIND_HOST_IMAGE_MODELS.find((model) => model.key === key) ||
    LOCALMIND_HOST_IMAGE_MODELS[0];
}

globalThis.LocalMindHostCatalog = Object.freeze({
  models: LOCALMIND_HOST_MODELS,
  defaultKey: LOCALMIND_DEFAULT_MODEL_KEY,
  get: getLocalMindHostModel,
  imageModels: LOCALMIND_HOST_IMAGE_MODELS,
  defaultImageKey: LOCALMIND_DEFAULT_IMAGE_MODEL_KEY,
  getImage: getLocalMindHostImageModel,
});
