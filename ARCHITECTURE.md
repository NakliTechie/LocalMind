# LocalMind Architecture

## Context engineering

The raw context window is 4K–65K tokens depending on model. The effective knowledge is unlimited:

- **Sliding window** — last 3 turn-pairs verbatim, older turns compressed to rolling summary
- **RAG retrieval** — top relevant memories auto-injected into system prompt
- **Semantic pre-filtering** — fetched web pages split into paragraphs, embedded, ranked by relevance to your query
- **Multi-hop reasoning** — agentic loop chains up to 3 tool calls per message; each tool call the model emits in a single turn runs individually, so batched calls (Qwen3-family models often emit 3-4 in one response) all execute rather than being dropped
- **Multi-step planning** (opt-in, experimental) — for complex research-style queries, decomposes into 2–5 steps, executes each with its own mini tool loop, then synthesises a final answer
- **Token saver** (on by default) — a concise-output directive plus heuristic compression of large tool / search / page / document output before it enters the context (whitespace normalize + drop repeated lines + head/tail truncate, budget scaled to model context). Applied at the tool-result choke point and the Search / Deep Research / Compare injection points. Originals stay in the conversation + RAG.

## Runtimes

Three interchangeable backends behind one `LocalMind.runtime` adapter (a model's `backend` field routes `loadModel`; everything downstream — the agent loop, tools, RAG, `generateOnce` — is shared):

1. **ONNX + WebGPU** (default) — Transformers.js runs ONNX models on the GPU, in-tab.
2. **wllama (in-browser GGUF)** — llama.cpp compiled to WASM; loads a GGUF from a URL, WebGPU-accelerated or pure CPU. Its worker speaks the same postMessage protocol as the ONNX chat worker, so it reuses `attachWorkerHandlers` + `generateOnce`.
3. **Local endpoint** — an OpenAI-compatible server (Ollama / LM Studio / llama.cpp) over `/v1/chat/completions`; no in-browser inference (no worker).
4. **LFM2 WebGPU kernels** (`backend: 'lfm2-webgpu'`) — a from-scratch WebGPU inference engine (`lfm2_5.js`, exporting `Lfm2Mobile`) ported from the `webml-community/lfm2-webgpu-kernels` Space, where every kernel — RoPE, RMSNorm, Q4_0/Q8_0 dequant, the LFM2 short-conv depthwise+gating, GQA attention, the GEMVs — is hand-written WGSL reading a Q4_0 GGUF directly (no onnxruntime, no llama.cpp). Its worker (`#lfm2WebgpuWorkerSrc`) dynamically imports the engine by an absolute URL injected at blob-build time, adapts the engine's cumulative-`{text}` stream into the shared per-token-delta protocol, and otherwise reuses `attachWorkerHandlers` + `generateOnce` like every other in-browser backend. The engine runs its own ranged GGUF download + CacheStorage cache and needs only WebGPU (no SharedArrayBuffer / COOP-COEP).
5. **Gemma 4 WebGPU kernels** (`backend: 'gemma4-webgpu'`) — the same pattern as (4) for Google's Gemma 4 E2B (QAT mobile): a from-scratch WebGPU engine (`gemma-4-e2b.js`, exporting `Gemma4Mobile`) ported from `webml-community/gemma-4-webgpu-kernels`, with hand-written WGSL for QAT int4 matmul (gemm / split-K / sgmat variants), embed-gather-norm, RoPE, RMSNorm, and GQA + sliding-window attention, reading Google's QAT-mobile weights directly. Its worker (`#gemma4WebgpuWorkerSrc`) folds any `system` message into the first user turn (Gemma's template has no system role) and otherwise reuses the same shared protocol as (4).

A WebGPU device error (OOM / lost device) on the ONNX path is detected, shown as a friendly message, and auto-recovered by reloading the model on a fresh device — capped at 2 retries.

## Tech stack

- **[Transformers.js](https://huggingface.co/docs/transformers.js)** v4 — runs Hugging Face ONNX models in the browser via WebGPU
- **[wllama](https://github.com/ngxson/wllama)** — llama.cpp compiled to WebAssembly; the in-browser GGUF chat runtime (WebGPU or CPU)
- **Image diffusion** — the FLUX.2-Klein 4B engine (ternary/1-bit) extracted from the `webml-community/bonsai-image-webgpu` Space, inlined as a worker
- **Text diffusion** — [kohra](https://github.com/NakliTechie/kohra) (Qwen3-0.6B MDLM) on onnxruntime-web / WebGPU, inlined as a worker
- **[Ternary Bonsai 1.7B / 4B / 8B](https://huggingface.co/collections/prism-ml/ternary-bonsai)** — 1.58-bit Qwen3-based LLMs, q2f16, Apache-2.0
- **[Gemma 3 1B](https://huggingface.co/onnx-community/gemma-3-1b-it-ONNX-GQA)** — text-only, q4f16
- **[Gemma 4 E2B](https://huggingface.co/onnx-community/gemma-4-E2B-it-ONNX)** — multimodal, 2.3B effective params, q4f16
- **[Gemma 4 E4B](https://huggingface.co/onnx-community/gemma-4-E4B-it-ONNX)** — multimodal, 4.5B effective params, q4f16
- **[MiniLM](https://huggingface.co/Xenova/all-MiniLM-L6-v2)** — 384-dim embeddings for RAG (~23 MB, WASM)
- **[Whisper base](https://huggingface.co/onnx-community/whisper-base)** — voice-to-text input, WebGPU (~80 MB, lazy-loaded)
- **[SlimSAM](https://huggingface.co/Xenova/slimsam-77-uniform)** / **[SAM 3](https://huggingface.co/onnx-community/sam3-tracker-ONNX)** — image segmentation (WASM, lazy-loaded)
- **[Pyodide](https://pyodide.org/)** v0.26 — Python runtime for the `run_python` tool (WASM, lazy-loaded, ~10 MB)
- **[KaTeX](https://katex.org/)** — inline + display math rendering
- **[Mermaid](https://mermaid.js.org/)** — flowchart / sequence diagram rendering (lazy-loaded)
- **[Readability.js](https://github.com/mozilla/readability)** — article extraction from fetched pages (lazy-loaded)
- **[PDF.js](https://mozilla.github.io/pdf.js/)** — PDF text extraction (lazy-loaded)
- **[mammoth.js](https://github.com/mwilliamson/mammoth.js)** — DOCX text extraction (lazy-loaded)
- Web Workers for off-main-thread inference (LLM on WebGPU, embeddings / SAM / Whisper on their own workers)
- IndexedDB for persistent vector store, user profile, and resumable-download chunk cache
- All static CDN dependencies pinned to exact versions and protected with **subresource integrity (SRI)** hashes where possible; the PDF.js worker is fetched via the Fetch-API SRI option and handed to `workerSrc` as a verified blob URL

## Worker topology

Workers spin up on demand, each with its own lifecycle and memory. Only **one WebGPU-heavy worker is resident at a time** — loading Image / Diffuse / wllama unloads the chat model; leaving brings it back.

| Worker | Created | Device | Purpose |
|---|---|---|---|
| **Chat (ONNX)** | On model load | WebGPU | Main LLM via Transformers.js |
| **wllama (GGUF)** | On loading a GGUF model | WebGPU / CPU | llama.cpp-wasm chat runtime |
| **LFM2 WebGPU** | On loading the `lfm2-webgpu` model | WebGPU | Custom-WGSL `Lfm2Mobile` engine (`lfm2_5.js`) |
| **Gemma 4 WebGPU** | On loading the `gemma4-webgpu` model | WebGPU | Custom-WGSL `Gemma4Mobile` engine (`gemma-4-e2b.js`) |
| **Image** | On entering Image mode | WebGPU | FLUX.2-Klein text-to-image |
| **Diffuse** | On entering Diffuse mode | WebGPU | kohra masked-diffusion text |
| **Embedding** | Lazy on first RAG/memory call | WASM | MiniLM 384-dim vectors |
| **SAM** | Lazy on first `segment_image` call | WASM | Image segmentation |
| **Whisper** | Lazy on first 🗣 click | WebGPU | Audio → text |
| **Pyodide** | Lazy on first `run_python` call | WASM | Python execution |

The local-endpoint runtime uses no worker (inference runs on the user's server). Inference through the chat worker is serialised through a single FIFO queue (`runInference`) so the chat UI, JS API, planner, and agent loop can't race each other.

## Resumable downloads

Model weight files are cached 5 MB at a time into an IndexedDB store (`localmind-downloads`). If the tab closes or the user cancels mid-download, partial chunks stay; the next attempt issues an HTTP Range request for the missing tail rather than restarting at byte 0.

Implementation details:

- The main model worker monkey-patches `self.fetch` to intercept `huggingface.co` URLs.
- HEAD request gets size + ETag. If ETag differs from a previously-cached copy, chunks are invalidated and the file starts over.
- A `ReadableStream` replays cached chunks first, then streams the new Range body, writing to IDB every 5 MB. Transformers.js reads the stream as if it were a fresh `fetch()` response.
- Any error in the resumable path falls back to the original `fetch`, so the model still loads — just without resume.
- On worker start, chunks for URLs already present in Cache Storage are dropped to recover disk.

Toggle: Settings → Model cache → "Resumable downloads" (on by default).

## Build & deployment

Zero build tooling. One HTML file (~15k lines, ~800 KB), plus two vendored sibling modules — `lfm2_5.js` (~650 KB) and `gemma-4-e2b.js` (~540 KB), the self-contained custom-WGSL `Lfm2Mobile` / `Gemma4Mobile` engines, each fetched same-origin by its worker. Everything else loads from CDN with SRI where possible.

Deploy by serving `index.html` (and the `lfm2_5.js` / `gemma-4-e2b.js` siblings alongside it) from any static host. GitHub Pages, Netlify, S3, or `python3 -m http.server`. Must be served over HTTP — `file://` won't work because ES module workers and WebGPU both require an HTTP origin.
