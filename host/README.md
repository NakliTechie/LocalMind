# Host artifacts

LocalMind's own page is `index.html` alone; it does not load anything in this folder. These files are for other
hosts, chiefly NakliOS, which copies them into `vendor/localmind/` with their SHA-256 hashes
(`naklios/vendor/localmind/manifest.json`).

| File | What it is |
|---|---|
| `host-model-catalog.js` | The conservative model catalog hosts offer (`globalThis.LocalMindHostCatalog`). |
| `onnx-inference-worker.js` | Gemma 4 and Qwen3.5 through Transformers.js 4.2.0 on WebGPU. |
| `image-inference-worker.js` | The Bonsai FLUX.2-Klein image engine; generated from `index.html` by `scripts/extract-image-worker.mjs`. |

The default LFM2.5 worker is shared with the app, so it lives in `src/`: copy `src/inference-worker.js` and
`src/lfm2_5.js` into the same directory as the files above. Protocols: [`docs/INFERENCE-PROTOCOL.md`](../docs/INFERENCE-PROTOCOL.md).
