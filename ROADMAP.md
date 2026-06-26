# LocalMind — Roadmap

**Last updated:** June 12, 2026

## Current state

Single-file (~15.3k lines, ~788 KB) private AI workbench running entirely in-browser. Zero backend by default — and now optionally able to drive a local OpenAI-compatible server (Ollama / LM Studio / llama.cpp) as a backend, for any model your own machine can run.

Three generation paradigms live in the one file: **autoregressive chat** (ONNX + WebGPU), **🎨 image diffusion** (FLUX.2-Klein, on-device), and **🌫️ masked-diffusion text** (kohra). The UI reads well phone → desktop.

**Tier 1 — shipped:**
- 10 agent tools (calculate, time, memory CRUD, reminder, web_search, fetch_page, segment_image)
- RAG pipeline (MiniLM embeddings on WASM, IndexedDB vector store, semantic search, auto-injection)
- Document ingestion: PDF (PDF.js), DOCX (mammoth.js), .txt, .md, .json, .csv
- Folder ingestion via File System Access API with incremental sync
- Auto-summarize on document upload
- Web search (BYOK: Brave, Tavily, SearXNG) with Readability.js extraction + semantic pre-filtering
- Multimodal input (image, audio, video via Gemma 4)
- Context engineering (sliding window, rolling summary, 12K budget)
- Conversation history (sidebar, archive/resume, post-session summarization)
- Memory browser with category filters, source grouping, audit (stale/duplicate/outlier)
- Export/import (full data portability as JSON)
- Auto-backup toggle (download on New Chat)
- Output artifacts (Save as MD, code block download)
- Model cache management (view size, clear cache)
- Encrypted shareable links (AES-256-GCM with passphrase)
- Batch prompts with `{{previous}}` chaining and auto-inject
- Transparency badges (On-device / Agent / Web-enriched) + source links
- Thinking mode with auto-collapse on completion

**Tier 2 — shipped:**
- **XSS hardening** of model output rendering (per-call nonce, escape-before-markdown, lang sanitisation)
- **SRI on CDN dependencies** (Readability, mammoth, PDF.js module + worker via Fetch-API SRI)
- **Inference FIFO queue** (`runInference`) — chat UI and JS API both serialise through it; bounded queue with synchronous overflow rejection
- **`window.localmind` JavaScript API** (v1.0) — opt-in via Settings, same-tab only
  - Properties: `version`, `ready`, `model`, `listModels()`, `load(idOrKey)`
  - `chat.completions.create({ messages, max_tokens, temperature, top_p, model })` — non-streaming
  - `chat.completions.create({ ..., stream: true })` — async iterator yielding OpenAI-shaped `chat.completion.chunk` objects
  - Tools, multimodal, response_format intentionally not exposed
  - Activity log (last 50 calls) with chip indicator and modal viewer
  - Frozen + non-writable object; clean detach on disable
- **Custom model loading** — paste a Hugging Face ONNX repo id in Settings
  - Validates against HF API: format check, ONNX-files-exist check, dtype detection from filenames (`q4f16` > `q4` > `int8` > `q8` > `uint8` > `bnb4` > `q4f8` > `fp16` > `quantized` > `fp32`)
  - Picks best available quantisation automatically
  - Estimates real load size (max .onnx + max .onnx_data, not naive sum across variants)
  - WebGPU adapter limits queried for hard-block on per-buffer size + absolute 6 GB ceiling
  - Soft warning above 2 GB
  - Persisted in localStorage; restored on reload; remove button per entry
- **`demo.html`** — standalone same-origin iframe page demonstrating the JS API end-to-end (non-streaming + streaming)
- **README benchmark** — comparison table vs WebLLM Chat, Chatty, Transformers.js demos
- **SAM image segmentation** — `segment_image` tool calling Segment Anything Model (SlimSAM 50/77, SAM ViT-Base, SAM 3)
  - Separate WASM blob-URL worker, lazy-loaded on first use
  - SAM model picker in Settings (4 options, default SlimSAM 77 ~14 MB)
  - Gemma estimates point coordinates from the image, SAM returns masks
  - Overlay rendered on image in chat bubble, downloadable
  - Full-width progress bar + header chip for download/inference status
  - Tool call parser extended to accept `"function"` key alongside `"name"`
- **Stream cancellation on consumer early-break** — JS API's streaming iterator posts `{type:'stop'}` to the worker on `return()`, so `for await` + `break` doesn't leave the worker chugging to `max_tokens` while the next call waits in the FIFO
- **Resumable model downloads** — HF CDN fetches checkpoint to IndexedDB every 5 MB
  - Monkey-patched `self.fetch` inside the main model worker; HEAD → ETag-keyed chunk store → Range request for missing tail
  - Dynamic import of `transformers@4` so the patch lands before the module captures `globalThis.fetch`; `env.fetch = self.fetch` as belt-and-braces
  - Fallback to original fetch on any error in the resumable path — model still loads, just can't resume
  - Settings toggle (default on) as a kill switch
  - Worker-boot cleanup drops IDB chunks for URLs already in Cache Storage
- **Multi-step planner agent** (experimental, agent-capable models only) — Settings toggle off by default
  - Plan phase: one model call asks for a 2–5 step numbered list; tolerant parser; <2 parsed steps → fall back to single-pass
  - Execute phase: per-step mini tool loop (2 iterations max) with prior-step outputs passed in as context
  - Synthesize phase: one model call combines step outputs into the final answer, streaming into the bubble
  - Plan + per-step outputs render as collapsible blocks on the msg container (survive bubble innerHTML rewrites)
  - 3×+ model calls per message — clearly labelled "experimental" because Gemma 4 E2B/E4B at ~4.5B plans even trivial questions
- **Conversation branching** — right-click (or long-press) a user message → "Branch from here". Archives the current conversation, slices messages up to that index into a new conversation record, and switches to it. If no `activeConversationId` existed yet (fresh session), mints one so the original isn't orphaned.
- **Custom tools** (agent-capable models) — Settings accepts a JSON tool definition (`name`, `description`, `parameters`, `endpoint`) persisted in localStorage. Registered into `TOOL_REGISTRY` like a built-in. On tool call, `POST`s args as JSON to the endpoint; CORS must allow this origin. Name must match `/^[a-zA-Z_][a-zA-Z0-9_]*$/` and not collide with a built-in. Auto-restored on page load.
- **MCP client** (agent-capable models) — Streamable HTTP JSON-RPC 2.0. Add an MCP server URL (+ optional bearer) in Settings → `initialize` + `tools/list` → each remote tool registers into `TOOL_REGISTRY` with an `mcp_` prefix. Tool calls route back as `tools/call`; result `content[text]` is fed to the model. Stateless, no SSE streaming yet (first `data:` frame read for servers that always use SSE).
- **KaTeX + Mermaid in bubbles** — inline `$…$` and display `$$…$$` render via KaTeX (eager-loaded in `<head>` with defer); ` ```mermaid ` blocks lazy-load Mermaid and render to SVG. Render happens on the msg container (not inside the bubble) so streaming token updates don't wipe rendered SVGs.
- **Artifact preview** — ` ```html `, ` ```svg `, ` ```artifact ` code blocks get a live `<iframe sandbox="allow-scripts">` beneath them. No `allow-same-origin` — the frame runs in an opaque origin with no access to localStorage, IDB, cookies, or the parent.
- **Voice to text (Whisper WebGPU)** — 🗣 button records mic, main thread decodes+resamples to 16 kHz mono PCM via OfflineAudioContext, transfers Float32Array to a Whisper-base worker (`onnx-community/whisper-base`, encoder fp16 + decoder q4, WebGPU). Transcribed text inserted into the input. Always visible, works on any model. Replaces the planned Web Speech API path (which phoned home).
- **`run_python` agent tool (Pyodide)** — 11th tool. Model can execute Python in a sandboxed Pyodide worker; `loadPackagesFromImports` auto-installs numpy / pandas / matplotlib. Returns `{ stdout, stderr, result }`. Lazy-loaded on first call (~10 MB). Matplotlib image capture not yet shipped — stdout-only.

**Tier 2 (cont.) — multi-paradigm workbench + endpoint backend + responsive (June 2026):**
- **🎨 Image mode** — on-device text-to-image. The FLUX.2-Klein 4B engine (ternary/1-bit, Apache-2.0) was extracted from the `webml-community/bonsai-image-webgpu` HF Space — the DOM-free engine slice only (63 WGSL kernels + a safetensors range-loader + euler scheduler + VAE), inlined as an inert `<script type="text/worker">` blob-URL worker. Size / steps / seed controls, re-roll, session gallery. Unloads the chat model first (one WebGPU-heavy worker resident at a time).
- **🌫️ Diffuse mode** — masked-diffusion TEXT, a genuinely different paradigm from autoregressive chat. Engine = **kohra** (a clean transformers.js-style module; model `Qwen3-0.6B-MDLM` on ORT-web WebGPU). The answer denoises out of a "fog" of masked tokens (live reveal via `onStep`). Honestly scoped as a paradigm showcase, not a daily-driver (0.6B rambles).
- **Local-endpoint backend** — point LocalMind at a local OpenAI-compatible server (Ollama / LM Studio / llama.cpp / Atomic): `/v1/chat/completions` SSE streaming + `/v1/models` discovery (Ollama `/api/tags` fallback). A single branch point in `generateOnce()` → `generateViaEndpoint()`; text tool-calling, Deep Research, and Compare all route through it unchanged. Sidesteps the WebGPU bottleneck and unlocks any GGUF model the host can run. Local-first (localhost); cloud endpoints intentionally not encouraged (would break the no-data-leaves ethos).
- **Settings sub-tabs** — General / Models / Tools / Data, with the tab bar at the bottom (the panel opens upward), so the now-large Settings surface stays navigable.
- **Responsive pass.** Mobile: toolbar + model-picker reflow, bigger tap targets, the heavy WebGPU modes (Image/Diffuse) gated on touch devices, a memory warning for chat models >1.5 GB, and an endpoint-hero tip (use the phone as a thin client to a desktop Ollama). Desktop: an app-shell — a full-width top bar + a docked conversation-history left rail + a widened main area, with the chat reading column capped at 720 px for legibility.
- **Custom-WGSL WebGPU-kernel runtimes (June 2026).** A fourth runtime family: from-scratch in-browser inference engines where *every* kernel is hand-written WGSL — no ONNX runtime, no llama.cpp. Two are bundled, each ported from its `webml-community/*-webgpu-kernels` HF Space as a self-contained sibling module imported by a blob-URL worker: **LFM2.5 230M** (`Lfm2Mobile` / `lfm2_5.js` — RoPE, RMSNorm, Q4_0/Q8_0 dequant, the LFM2 short-conv depthwise+gating, GQA attention, GEMVs; reads a Q4_0 GGUF directly) and **Gemma 4 E2B** (`Gemma4Mobile` / `gemma-4-e2b.js` — QAT int4 matmul (gemm / split-K / sgmat), embed-gather-norm, RoPE/RMSNorm, GQA + sliding-window attention; reads Google's QAT-mobile weights). Each engine runs its own ranged weight download + CacheStorage cache, applies its chat template internally, and needs only WebGPU (no SharedArrayBuffer / COOP-COEP). They reuse the shared chat-worker protocol (`attachWorkerHandlers` + `generateOnce`) unchanged — a new worker adapts the engine's cumulative-`{text}` stream into per-token deltas, and `loadModel()` routes on `backend: 'lfm2-webgpu' | 'gemma4-webgpu'`. WebGPU-only (no CPU fallback).

## Status

| Capability | Status |
|-----------|--------|
| Chat UI | Strong |
| Model management | Strong (cache view/clear, custom HF ONNX loading) |
| Multi-model | Strong (3 Gemma + LFM2/Qwen3/Bonsai + custom HF ONNX + MiniLM sidecar + SAM sidecar) |
| RAG | Strong (PDF/DOCX/text, auto-summarize, audit) |
| Tools | Strong (11 tools incl. SAM segmentation + Pyodide Python runtime) |
| Agents | Strong (single-agent loop + experimental multi-step planner) |
| JavaScript API | Strong (v1.0 — chat completions with streaming) |
| Plugins | Strong (user-defined HTTP tools + MCP server discovery + Pyodide Python) |
| Image generation | Strong (on-device FLUX.2-Klein, dedicated 🎨 mode) |
| Text diffusion | Showcase (kohra Qwen3-0.6B MDLM, dedicated 🌫️ mode) |
| Local endpoint | Strong (OpenAI-compatible: Ollama / LM Studio / llama.cpp) |
| Responsive | Strong (mobile gate + endpoint-hero; desktop app-shell) |
| Runtimes | ONNX/WebGPU + in-browser GGUF (wllama) + custom-WGSL engines (LFM2 / Gemma 4) + local-endpoint (server) |

---

## Next — Tier 3

### 1. Custom model dtype picker
Today the validator picks the best-available quantisation automatically. Some users may want to force `q4` or `int8` for compatibility or quality reasons.

**~40 lines.**

### 2. Multimodal custom models
The worker hardcodes `Gemma4ForConditionalGeneration`. To support other multimodal architectures (LLaVA, Idefics, PaliGemma), the worker needs to dispatch on `model_type` and import the right class.

**~120 lines.**

### 3. SRI for `transformers@4 +esm`
The `+esm` jsDelivr endpoint internally redirects to content-addressed URLs, so a static hash can't be pinned without hardcoding the resolved URL. Either pin the resolved URL (brittle across releases) or self-host the bundle.

### 4. Pyodide plot capture
`run_python` returns stdout/stderr only; matplotlib figures go nowhere. Capture via `pyplot.savefig(BytesIO)` → base64 → image in the tool-result block.

### 5. Second runtime adapter — in-browser GGUF via wllama  · **IN PROGRESS (June 2026)**
The runtime adapter boundary at [index.html:11615+](index.html) (`LocalMind.runtime`) was deliberately built so a second backend can be slotted in — the code comments already reference this ("a second backend (WebLLM, wllama, …) can be slotted in by adding another adapter section without touching anything above"). The endpoint backend (Tier 2) was the first such addition.

A real GGUF path unlocks: (a) models with no ONNX export, (b) the native llama.cpp quant ladder (Q2_K, Q4_K_M, …) without waiting for ONNX exports, (c) interoperability with the broader local-LLM ecosystem where GGUF is the de facto format.

**Note on the escape hatch already shipped:** the local-endpoint backend already lets you run *any* GGUF model — via Ollama / LM Studio over `localhost`. So this item is specifically the **fully-offline, in-tab, no-local-server** GGUF path: open the page, pick a GGUF model, it runs in the browser with nothing else installed.

Approach: implement the `loadModel / chat / capabilities` contract against **wllama** (llama.cpp compiled to WASM) — the most drop-in option; WebLLM is heavier and uses MLC's own format, not raw GGUF. Constraint for the single-file / GitHub-Pages deployment: wllama's **multi-thread** mode needs cross-origin isolation (COOP/COEP), which a static single HTML file on GH Pages can't set — so the in-tab path runs **single-threaded** WASM (slower, but works everywhere with zero server config; the endpoint backend remains the fast path). Extend the MODELS registry entry to carry `runtime: 'onnx' | 'wllama' | 'endpoint'`; `loadModel()` + the picker route on it.

Sizeable: **~400-600 lines** (wllama bindings + a blob-worker + adapter section + per-entry runtime dispatch + UI + GGUF download/progress). De-risked with a standalone harness first (wllama is CPU/WASM, so unlike the WebGPU engines it can be verified headless).

### 6. Brave / restricted-WebGPU diagnostics (pending)
Github and Reddit users report model fails to load in Brave. Likely causes: `navigator.gpu` present but `requestAdapter()` returns null under strict fingerprinting; Shields blocking jsdelivr or huggingface.co; `device: 'webgpu'` failing in the worker. Current error surfacing is poor — on worker error the code hides the progress section *then* writes the error message into it (see `attachWorkerHandlers`), so users see a bare "Error" badge with zero detail.

Two small follow-ups:
- Probe `navigator.gpu.requestAdapter()` at startup and show a clear "WebGPU adapter unavailable — try disabling Shields or use a different browser" before the user wastes the download.
- Keep the progress section visible on worker error so the error message is readable; include the error text inline instead of in the console only.

Blocked on repro data from the Brave reporter (console log). **~40 lines.**

---

## Tier 4 — Blocked on ecosystem

| Feature | Blocker | When |
|---------|---------|------|
| Gemma 4 26B MoE in-browser | ~15 GB weight load, exceeds browser GPU | ~2027 |
| KV cache quantization (2x context) | ONNX Runtime WebGPU support | Unknown |
| KV cache offload to system RAM | WebGPU API limitation | Unknown |
| Cross-device sync | OAuth complexity in single-file app | Low priority |
