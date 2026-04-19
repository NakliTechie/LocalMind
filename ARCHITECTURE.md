# LocalMind Architecture

## Context engineering

The raw context window is 4K–65K tokens depending on model. The effective knowledge is unlimited:

- **Sliding window** — last 3 turn-pairs verbatim, older turns compressed to rolling summary
- **RAG retrieval** — top relevant memories auto-injected into system prompt
- **Semantic pre-filtering** — fetched web pages split into paragraphs, embedded, ranked by relevance to your query
- **Multi-hop reasoning** — agentic loop chains up to 3 tool calls per message; each tool call the model emits in a single turn runs individually, so batched calls (Qwen3-family models often emit 3-4 in one response) all execute rather than being dropped
- **Multi-step planning** (opt-in, experimental) — for complex research-style queries, decomposes into 2–5 steps, executes each with its own mini tool loop, then synthesises a final answer

## Tech stack

- **[Transformers.js](https://huggingface.co/docs/transformers.js)** v4 — runs Hugging Face ONNX models in the browser via WebGPU
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

LocalMind runs up to five concurrent workers, each with its own lifecycle and memory:

| Worker | Created | Device | Purpose |
|---|---|---|---|
| **Chat** | On model load | WebGPU | Main LLM (Gemma / Ternary Bonsai) |
| **Embedding** | Lazy on first RAG/memory call | WASM | MiniLM 384-dim vectors |
| **SAM** | Lazy on first `segment_image` call | WASM | Image segmentation |
| **Whisper** | Lazy on first 🗣 voice-to-text click | WebGPU | Audio → text |
| **Pyodide** | Lazy on first `run_python` call | WASM | Python execution |

Inference through the chat worker is serialised through a single FIFO queue (`runInference`) so the chat UI, JS API, planner, and agent loop can't race each other.

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

Zero build tooling. One HTML file (~9k lines). Everything else loads from CDN with SRI where possible.

Deploy by serving `index.html` from any static host. GitHub Pages, Netlify, S3, or `python3 -m http.server`. Must be served over HTTP — `file://` won't work because ES module workers and WebGPU both require an HTTP origin.
