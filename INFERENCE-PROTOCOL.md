# LocalMind inference protocol v1

LocalMind exposes DOM-free inference artifacts for hosts. `inference-worker.js`
runs the default custom-WGSL LFM2.5 engine. `onnx-inference-worker.js` runs the
curated Gemma 4 and Qwen models through Transformers.js/WebGPU.
`image-inference-worker.js` runs the Bonsai FLUX.2-Klein image engine through
WebGPU. It is generated from LocalMind's inline workbench engine so the
standalone app and host artifact cannot silently drift.
`host-model-catalog.js` is the versioned model metadata shared with NakliOS.
This keeps model runtimes independently versioned while allowing NakliOS to own
selection, consent, endpoint credentials, scheduling, and app isolation.

The worker is a module worker:

```js
const worker = new Worker(
  new URL('./inference-worker.js', import.meta.url),
  { type: 'module' },
);
```

## Messages

Load the default model:

```js
worker.postMessage({
  type: 'load',
  id: 'load-1',
  modelId: 'LiquidAI/LFM2.5-230M-GGUF',
});
```

The Transformers.js worker additionally accepts the catalog's `dtype` and
`modelType` fields:

```js
worker.postMessage({
  type: 'load',
  id: 'load-gemma',
  modelId: 'onnx-community/gemma-4-E2B-it-ONNX',
  dtype: 'q4f16',
  modelType: 'multimodal',
});
```

The worker emits `progress` events followed by `ready`. Model weights use the
engine's Cache Storage cache and are downloaded only when absent.

Generate:

```js
worker.postMessage({
  type: 'generate',
  id: 'request-1',
  messages: [
    { role: 'system', content: 'Answer clearly and briefly.' },
    { role: 'user', content: 'Explain local-first software.' },
  ],
  generationConfig: {
    max_tokens: 256,
    reset: true
  },
});
```

The worker emits zero or more `token` messages, then exactly one `complete`
message. Every response has `protocol: "localmind.inference.v1"` and echoes an
input `id`. Callers that omit `id` remain supported for compatibility.
Set `generationConfig.reset` when a host is switching between isolated app
requests rather than continuing one conversation.

Cancel the active generation:

```js
worker.postMessage({ type: 'stop', id: 'request-1' });
```

Unload and release GPU resources:

```js
worker.postMessage({ type: 'unload' });
```

Only one generation can be active in a worker. Multi-app queuing, permissions,
history, and tool access are intentionally outside this protocol; those are
host responsibilities.

## Image protocol

The image worker uses `protocol: "localmind.image.v1"` and the same correlated
`id` convention. Load the catalog model:

```js
imageWorker.postMessage({
  type: 'load',
  id: 'image-load-1',
  modelId: 'prism-ml/bonsai-image-ternary-4B-mlx-2bit',
});
```

It emits `progress` messages followed by `loaded`. Generate one PNG:

```js
imageWorker.postMessage({
  type: 'generate',
  id: 'image-1',
  prompt: 'A hand-cut paper collage of a monsoon city',
  width: 512,
  height: 512,
  steps: 4,
  seed: 42,
});
```

The worker emits `step` progress and then an `image` message containing PNG
`bytes`, `width`, `height`, and `seed`. Send `{ type: "destroy" }` or terminate
the worker to release its WebGPU device. Hosts should not keep a chat worker
and the image worker resident at the same time on memory-constrained devices.
