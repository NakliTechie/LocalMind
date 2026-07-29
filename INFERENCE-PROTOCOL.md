# LocalMind inference protocol v1

`inference-worker.js` is LocalMind's DOM-free inference boundary. LocalMind uses
it directly and NakliOS vendors the same file with its `lfm2_5.js` engine.
This keeps the model runtime independently versioned while allowing NakliOS to
own consent, scheduling, and app isolation.

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
