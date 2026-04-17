# LocalMind — Roadmap

**Last updated:** April 11, 2026

## Current state

Single-file (~5.8k lines) private AI research agent running entirely in-browser. Zero backend.

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

## Status

| Capability | Status |
|-----------|--------|
| Chat UI | Strong |
| Model management | Strong (cache view/clear, custom HF ONNX loading) |
| Multi-model | Strong (3 Gemma + custom HF ONNX + MiniLM sidecar + SAM sidecar) |
| RAG | Strong (PDF/DOCX/text, auto-summarize, audit) |
| Tools | Strong (10 tools incl. SAM segmentation) |
| Agents | Partial (single-agent loop, no planning) |
| JavaScript API | Strong (v1.0 — chat completions with streaming) |
| Plugins | Not started |

---

## Next — Tier 3

### 1. Conversation branching
- Right-click or long-press a user message → "Branch from here"
- Creates new conversation in history with messages up to that point

**~40 lines.**

### 2. Plugin / custom tool API
- Settings: "Custom Tools" section
- User defines tools as JSON: `{ name, description, parameters, endpoint }`
- On tool call: `fetch(endpoint, { method: 'POST', body: JSON.stringify(args) })`
- Store definitions in localStorage
- Risk: CORS blocks most endpoints. Best with local servers or CORS-enabled APIs.

**~100 lines.**

### 4. Voice mode
- Web Speech API (`SpeechRecognition`) for input (free, built into Chrome)
- Web Speech API (`SpeechSynthesis`) for output
- Toggle button in input bar

**~60 lines.**

### 5. Custom model dtype picker
Today the validator picks the best-available quantisation automatically. Some users may want to force `q4` or `int8` for compatibility or quality reasons.

**~40 lines.**

### 6. Multimodal custom models
The worker hardcodes `Gemma4ForConditionalGeneration`. To support other multimodal architectures (LLaVA, Idefics, PaliGemma), the worker needs to dispatch on `model_type` and import the right class.

**~120 lines.**

### 7. SRI for `transformers@4 +esm`
The `+esm` jsDelivr endpoint internally redirects to content-addressed URLs, so a static hash can't be pinned without hardcoding the resolved URL. Either pin the resolved URL (brittle across releases) or self-host the bundle.

### 8. Brave / restricted-WebGPU diagnostics (pending)
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
