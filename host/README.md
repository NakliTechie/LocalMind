# Host artifacts

LocalMind's own page is `index.html` alone; it does not load anything in this folder. These files are for other
hosts, chiefly NakliOS, which copies them into `vendor/localmind/` with their SHA-256 hashes
(`naklios/vendor/localmind/manifest.json`).

| File | What it is |
|---|---|
| `host-model-catalog.js` | The conservative model catalog hosts offer (`globalThis.LocalMindHostCatalog`). |
| `onnx-inference-worker.js` | LFM3 1.7B (the default), Gemma 4 and Qwen3.5 through Transformers.js 4.3.2 on WebGPU. |
| `image-inference-worker.js` | The Bonsai FLUX.2-Klein image engine; generated from `index.html` by `scripts/extract-image-worker.mjs`. |

The anyformer worker is shared with the app, so it lives in `src/`: copy `src/inference-worker.js` into the same
directory as the files above. It serves LFM2.5 230M (`lfm2-230m-webgpu`) and anyformer catalog models such as LFM2.5
24B-A2B with the Pi adapter (`lfm25-24b-pi`: load with `entry`, pass `tools`, switch the adapter with `setAdapter`). Protocols: [`docs/INFERENCE-PROTOCOL.md`](../docs/INFERENCE-PROTOCOL.md).
