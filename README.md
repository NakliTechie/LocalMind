# LocalMind

A private AI research agent that runs entirely inside your browser. Tool calling, persistent memory, web search, multimodal input — all on-device via WebGPU. No server, no API keys required, no data leaving your device.

**[Try it live](https://naklitechie.github.io/LocalMind)**

## What it does

LocalMind runs Google's Gemma models directly in your browser tab using WebGPU. Models download once, are cached locally, and run offline from that point on. Your conversations, reasoning, and memories never leave your device. Only web search queries touch the network — and only when you explicitly choose to.

**Six models, your choice:**

| Model | Size | Capabilities | Best for |
|---|---|---|---|
| **Ternary Bonsai 1.7B** (default) | ~470 MB | Text + agent (tool calling) | Smallest download with tool calling; strong reasoning |
| **Ternary Bonsai 4B** | ~1.1 GB | Text + agent | Same capabilities, better quality |
| **Ternary Bonsai 8B** | ~2.2 GB | Text + agent | Best Bonsai quality; 65K context |
| **Gemma 3 1B** | ~760 MB | Text chat only | Fallback if Bonsai doesn't suit |
| **Gemma 4 E2B** | ~1.5 GB | Text + image + audio + agent | Multimodal on any device |
| **Gemma 4 E4B** | ~4.9 GB | Text + image + audio + agent | Best multimodal quality |

The Bonsai family are 1.58-bit ternary-weight LLMs from Prism ML (Apache-2.0, Qwen3 backbone). They benchmark materially higher than Gemma 3 1B on reasoning/code/tool-calling at roughly half the download size. Multimodal input (images/audio) still goes through Gemma 4.

## Agent tools (Ternary Bonsai + Gemma 4 models)

Tool-capable models have built-in tool calling. The model decides when to use tools based on your question.

| Tool | What it does |
|---|---|
| **calculate** | Arithmetic, percentages, unit conversions |
| **get_current_time** | Date and time with timezone support |
| **store_memory** | Save facts to persistent memory (IndexedDB + embeddings) |
| **search_memory** | Semantic search over stored memories |
| **list_memories** | Show what's stored, grouped by category |
| **delete_memory** | Forget specific memories by query |
| **set_reminder** | Browser notification after N minutes |
| **web_search** | Search the web via Brave, Tavily, or SearXNG (BYOK) |
| **fetch_page** | Fetch and read a URL's content with Readability.js extraction |
| **segment_image** | Segment objects in attached images using SAM (Segment Anything Model) |
| **run_python** | Execute Python in a sandboxed Pyodide worker (numpy/pandas/matplotlib auto-install) |

**Translation:** Gemma 4 supports 140+ languages natively — just ask it to translate. No separate model needed.

**Multi-step planning (experimental):** Settings → tick *Multi-step planning*. Each message is planned into 2–5 steps, each executed with tools, then synthesised into a final answer. Plan + per-step outputs appear as collapsible blocks. 3×+ slower but handles research-style queries ("compare X and Y, cite sources") better than a single pass.

**Custom tools:** Settings → *Custom tools*. Paste a JSON tool definition (`name`, `description`, `parameters` as a JSON-schema object, `endpoint`). When the model decides to call the tool, LocalMind `POST`s the args to your endpoint as a JSON body and feeds the response back. The endpoint must allow CORS for this origin. Useful for connecting to local dev servers or CORS-enabled APIs.

**MCP servers:**

1. **Settings → MCP servers.** Paste the server's Streamable HTTP URL (the one that accepts JSON-RPC POSTs — often ends in `/mcp` or `/sse`). If the server requires auth, paste a bearer token in the second field. Click *Add server*.
2. On success you'll see e.g. `Connected. Discovered 7 tool(s).` and the tools appear in `TOOL_REGISTRY` with the `mcp_` prefix (so `fetch_url` from the server becomes `mcp_fetch_url` for the model). They're included in any chat with an agent-capable model automatically — no extra toggle.
3. Ask the model to use one: *"Use mcp_fetch_url to grab https://example.com/robots.txt and summarise it."*
4. Removing the server also unregisters its tools. Connections re-establish on page load.

**Finding an MCP server to try:**

- **[modelcontextprotocol.io/servers](https://modelcontextprotocol.io/servers)** — the official registry. Most are stdio (local only) and need an MCP-over-HTTP bridge. Look specifically for ones labelled *Streamable HTTP* or *SSE*.
- **Your own local server.** Any MCP server that speaks HTTP can be proxied: `npx @modelcontextprotocol/inspector --transport http <your-server>` exposes a local endpoint. Point LocalMind at `http://localhost:PORT`.
- **Remote hosted servers.** Some SaaS products (Zapier, Linear, Notion) ship hosted MCP endpoints with auth. Paste the URL + your API token.

**Requirements the server must satisfy:**

- **CORS:** it must send `Access-Control-Allow-Origin: https://naklitechie.github.io` (or `*` for public endpoints). Browsers refuse cross-origin JSON-RPC without this. Local servers: either add CORS middleware, or run LocalMind from the same origin (e.g. `python3 -m http.server` next to your MCP server).
- **JSON-RPC 2.0 over HTTP POST** at the given URL. Streaming SSE responses are partially supported (the first `data:` frame is parsed); long-running stream tools won't work yet.
- **Protocol:** LocalMind sends `protocolVersion: 2025-03-26` on `initialize`. Most current servers accept this.

Tools are discovered once on add (and again on page reload). If the server adds new tools later, remove and re-add the entry to pick them up.

**Math & diagrams:** inline `$\int x^2 dx$` and display `$$\sum i$$` math render via KaTeX; ` ```mermaid ` blocks render as SVG via lazy-loaded Mermaid.

**Artifact preview:** ` ```html `, ` ```svg ` or ` ```artifact ` code blocks get a live sandboxed iframe beneath the code (`sandbox="allow-scripts"`, no same-origin). Safe to run model-generated UI inline.

**Voice to text:** the 🗣 button to the left of the input records mic audio, decodes to 16 kHz mono PCM on-device, and runs Whisper-base on WebGPU to transcribe into the input. ~80 MB first-use download.

**Branch from here:** right-click (or long-press) any user message → *Branch from here*. Archives the current conversation, then forks a new one containing messages up to that point. Open the History sidebar to switch back.

## Persistent memory (RAG)

LocalMind remembers across sessions. Powered by a local RAG pipeline:

- **MiniLM embeddings** (~23 MB, runs on CPU alongside the main model)
- **IndexedDB vector store** with cosine similarity search
- **Document upload** — PDF, DOCX, .txt, .md, .json, .csv — text extracted, chunked, and stored as searchable knowledge
- **Folder ingestion** — click "Folder" to open a local directory via the File System Access API; all `.md`, `.txt`, `.pdf`, `.docx` files are recursively ingested. Re-open the same folder to sync only changed files (fingerprint-based, size + last-modified)
- **Auto-summarize on upload** — documents are summarized on ingestion for quick retrieval
- **Post-session summarization** — conversations are summarized and stored when you start a new chat
- **Memory browser** — click "Memory" to open the browser panel:
  - Filter by category (fact, preference, finding, document, doc summary, conversation) with live chunk counts per pill
  - Document chunks grouped by source file with a bulk "Delete all per source" button — essential after folder ingestion
  - Relative timestamps ("2h ago", "3d ago") and coloured category badges
- **Memory audit** — "Audit" button in the memory panel flags three issue types:
  - **Stale** — chunks older than 60 days
  - **Near-duplicate** — pairs with cosine similarity ≥ 0.92 within the same category (keeps one, flags the other)
  - **Outlier** — chunks whose average similarity to category peers is < 0.20 (requires ≥ 5 members in category)
  - Each group has a "Delete all" button; individual deletes rerun the audit automatically; green pass when nothing is flagged
- **Export / Import** — download all data (memories, conversations, profile) as JSON, or import from a previous export
- **Auto-backup** — optional setting to auto-download a backup on every New Chat

Every search result and fetched page is cached in the RAG index. The context window stays fixed. The accessible knowledge grows without limit.

## Conversation history

- **New Chat** — archives the current conversation to History, then starts fresh
- **Clear** — deletes the current conversation without saving
- **History sidebar** — slides in from the left showing past conversations sorted by date. Click any to resume, or delete individual entries.

Conversations are automatically summarized and embedded into the RAG index when archived, so the model can recall past discussions.

## Web search (BYOK)

Open Settings, pick a provider, enter your API key. The key stays in your browser's localStorage and is sent directly from your device to the search provider.

| Provider | Free tier | Best for |
|---|---|---|
| **Tavily** | 1,000 credits/month, no card | Lowest barrier, AI-optimized results |
| **Brave Search** | $5/month credit | Privacy-first, independent index |
| **SearXNG** | Free (self-hosted) | Maximum privacy, no corporate entity |

Two send buttons: **Send** (offline, no network) and **Search+Send** (globe icon, web-enriched). The globe button only appears when a provider is configured.

Every response shows a transparency badge: **On-device** (pure local), **Agent** (tools used), or **Web-enriched** (search results with clickable source links).

## Multimodal input (Gemma 4 models)

- **Attach** — images, audio, MP4 video, or documents (PDF, DOCX, .txt, .md, .json, .csv)
- **Camera** — snap a photo with your webcam
- **Mic** — record a voice clip
- **Paste** — Ctrl/Cmd+V an image from clipboard
- **Drag and drop** — drop files onto the chat

Documents are extracted, chunked, embedded, and auto-summarized on upload. Video is experimental — keyframes and audio are extracted separately.

## Image segmentation (SAM)

Gemma 4 can call the **Segment Anything Model** to segment objects in attached images. Attach an image, ask "segment the dog" or "outline the person on the left" — Gemma estimates point coordinates from the image, calls SAM, and renders a colored mask overlay in the chat bubble. The overlay is downloadable.

**SAM model picker** (Settings, visible with Gemma 4):

| Model | Size | Notes |
|---|---|---|
| **SlimSAM 50** | ~10 MB | Fastest, lower accuracy |
| **SlimSAM 77** (default) | ~14 MB | Good balance |
| **SAM ViT-Base** | ~350 MB | Full SAM 1 quality |
| **SAM 3** | Latest | Newest architecture from Meta |

SAM runs in a separate WASM worker (independent of Gemma's WebGPU worker). Loaded lazily on first use — a progress bar shows download and inference status. Models are cached after first download.

## Batch prompts

Click **Batch** in the toolbar to open the batch panel. Enter one prompt per line and click **Run** — each prompt is sent sequentially through the full agent loop (including tool calls and web search if configured), with results appearing in the main chat as normal messages.

**Chaining** — two modes, combinable:

| Mode | How |
|---|---|
| **Explicit `{{previous}}`** | Write `{{previous}}` anywhere in a prompt — it's substituted with the full text of the previous response before sending |
| **Auto-inject** | Checkbox (on by default) — if a prompt has no `{{previous}}`, the previous response is appended as `[Previous response for context: …]` automatically |

**Stop** halts the run after the current generation completes (never mid-stream). Progress is shown live (`2 / 5`).

Example pipeline:
```
Summarise the history of the Suez Canal
Now extract the 5 most important dates from this: {{previous}}
Translate that list to Hindi: {{previous}}
```

## Sharing conversations

Click **Share** in the toolbar to generate a shareable link for the current conversation:

- **Plain link** — conversation is base64-encoded into the URL fragment (`#lm:…`). No server involved.
- **Encrypted link** — AES-256-GCM with PBKDF2 key derivation (200k rounds). Encoded as `#lme:<salt>.<iv>.<ciphertext>`. Only someone with the passphrase can read it.

The recipient opens the URL, sees an import banner, and clicks "Load conversation" (entering the passphrase if encrypted). No account, no server, no data in transit beyond the URL itself.

Image and audio attachments are stripped — text content only.

## Output artifacts

- **Save as Markdown** — download any assistant response as a .md file. If a folder is open via Folder ingestion, the file is written directly into that folder instead of downloading.
- **Code download** — hover over code blocks for a download button (saves with correct extension)
- **Model cache management** — view cached model sizes and clear cache in Settings

## Custom models (paste a HF ONNX repo)

Settings → **Custom models** → paste a Hugging Face repo id (e.g. `HuggingFaceTB/SmolLM-135M-Instruct`, `Xenova/distilgpt2`, `onnx-community/Phi-3.5-mini-instruct-onnx-web`) → click **Add**. The validator probes the HF API and:

- Confirms the repo exists and has `.onnx` files
- Detects available quantisations from filenames (`q4f16` > `q4` > `int8` > `q8` > `uint8` > `bnb4` > `q4f8` > `fp16` > `quantized` > `fp32`) and picks the smallest workable one
- Estimates the *real* load size — `max(.onnx) + max(.onnx_data)` across the chosen dtype, so it doesn't overcount when a repo ships multiple alternative variants (`model_*`, `decoder_model_*`, `decoder_model_merged_*`, etc.)
- Queries the device's WebGPU adapter for `maxBufferSize` and **hard-blocks** if any single weight file exceeds it
- **Hard-blocks** anything over 6 GB total (LocalMind's absolute ceiling for in-browser inference)
- **Soft-warns** anything over 2 GB (download time + low-end GPU concerns)
- Reads `config.json` for context window and architecture; rejects anything with `vision_config` or `audio_config` (multimodal custom models are deferred — see ROADMAP)

Successful adds appear in the model selector dropdown immediately and persist in `localStorage` across reloads. The Remove button next to each entry strips it from both the dropdown and storage. v1 supports causal LMs only.

## Developer API

Scripts in the same tab can drive the loaded model via an OpenAI-shaped `window.localmind` object. Opt-in under Settings → JavaScript API. Non-streaming + streaming (async iterator), model loading, frozen surface. Tools / memory / web search intentionally not exposed.

Full reference: **[API.md](./API.md)** · live demo: **[demo.html](./demo.html)**.

## Example prompts

A full gallery is inside the app — click the **?** help button → *Try these* tab. Click any prompt to paste it. Covers math, code, research, diagrams, artifacts, voice-to-text, planner workflows, and more.

## How to run

Serve from any static host — GitHub Pages, Netlify, or a local server:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

No build step. No dependencies. No backend.

**Note:** Requires a browser with WebGPU support (Chrome 113+, Edge 113+, Firefox 130+). Will not work from `file://` — needs an HTTP server.

## Architecture & tech stack

Single HTML file. Five on-demand Web Workers (chat, embeddings, SAM, Whisper, Pyodide). Transformers.js v4 on WebGPU for LLMs; WASM for the sidecars. Resumable 5 MB-chunked downloads backed by IndexedDB. Sliding-window context + RAG retrieval + semantic pre-filtering.

Full details, worker topology, and resumable-download internals: **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

## Browser support

| Browser | Status |
|---|---|
| Chrome 113+ | Supported |
| Edge 113+ | Supported |
| Firefox 130+ | Supported |
| Safari | Not yet (WebGPU incomplete) |

## Compared to other in-browser chat apps

There's a growing set of "run an LLM in your browser tab" projects. LocalMind overlaps with them on the core idea — WebGPU inference, no server, data stays local — but diverges on scope. Most of the others are **chat UIs for a model**; LocalMind is a **research agent with persistent memory, tools, and web enrichment**.

| Feature | **LocalMind** | [WebLLM Chat](https://chat.webllm.ai) | [Chatty (ChattyUI)](https://github.com/addyosmani/chatty) | [Transformers.js WebGPU chat](https://github.com/huggingface/transformers.js/tree/v3/examples/webgpu-chat) |
|---|---|---|---|---|
| Runs fully in-browser (WebGPU) | ✅ | ✅ | ✅ | ✅ |
| Works offline after download | ✅ | ✅ | ✅ | ✅ |
| Open source | ✅ (MIT) | ✅ (Apache 2.0) | ✅ (MIT) | ✅ (Apache 2.0) |
| **Single HTML file, zero build** | ✅ (one file, ~7k lines) | ❌ (Next.js app) | ❌ (Next.js app) | ❌ (Vite demo) |
| Runtime | Transformers.js v4 | WebLLM (MLC) | WebLLM + Transformers.js | Transformers.js v3 |
| Default models | Gemma 3 1B / Gemma 4 E2B & E4B | Llama 3, Phi-3, Mistral, Gemma, Qwen | Gemma, Llama 2/3, Mistral | Phi-3.5, Llama-3.2 |
| **Vision input** (image → text) | ✅ (Gemma 4) | ✅ | ⚠️ (model-dependent) | ⚠️ (separate demos) |
| **Audio input** | ✅ (Gemma 4) | ❌ | ⚠️ (voice-to-text only) | ⚠️ (separate Whisper demo) |
| **Tool calling / agent loop** | ✅ (10 built-in tools) | ❌ | ❌ | ❌ |
| **Persistent memory (RAG)** | ✅ (MiniLM + IndexedDB vector store) | ❌ | ⚠️ (session memory, transient embeddings) | ❌ |
| **PDF / DOCX ingestion** | ✅ (PDF.js + mammoth.js, auto-summarized) | ❌ | ⚠️ (PDF/text only) | ❌ |
| **Folder ingestion** (FS Access API + sync) | ✅ | ❌ | ❌ | ❌ |
| **Web search** (BYOK Brave/Tavily/SearXNG) | ✅ | ❌ | ❌ | ❌ |
| **Page fetch + Readability extraction** | ✅ | ❌ | ❌ | ❌ |
| Conversation history & archive | ✅ | ✅ | ✅ | ❌ |
| **Post-session summarization into RAG** | ✅ | ❌ | ❌ | ❌ |
| **Memory audit** (stale / duplicate / outlier) | ✅ | ❌ | ❌ | ❌ |
| **Batch prompts with `{{previous}}` chaining** | ✅ | ❌ | ❌ | ❌ |
| **Encrypted shareable links** (AES-256-GCM) | ✅ | ❌ | ❌ | ❌ |
| Export / import full data as JSON | ✅ | ⚠️ (chats only) | ❌ | ❌ |
| Reminders / timers | ✅ | ❌ | ❌ | ❌ |
| Transparency badges (on-device / agent / web) | ✅ | ❌ | ❌ | ❌ |
| **OpenAI-shaped JS API** (`window.localmind`, streaming via async iterator) | ✅ (opt-in, same-tab, frozen object) | ⚠️ (in-process SDK shape only) | ❌ | ❌ |
| **Paste a HF ONNX repo to add a model** | ✅ (validates dtype + WebGPU limits) | ⚠️ (custom MLC models) | ❌ | ❌ |
| **CDN deps protected with SRI hashes** | ✅ | — | — | — |
| Runs from `file://` | ❌ (needs HTTP) | ❌ | ❌ | ❌ |

**Other adjacent projects worth knowing about:**

- **[Chrome Built-in AI / Prompt API](https://developer.chrome.com/docs/ai/built-in)** — Gemini Nano shipped with Chrome; no model download, no UI, API-only. Text-only, Chrome-only, behind a flag today.
- **[Ratchet](https://github.com/huggingface/ratchet)** — Rust+WebGPU inference engine (Phi-3 demo). Low-level runtime, not an end-user chat app.
- **[MLC LLM](https://llm.mlc.ai/)** — The engine underneath WebLLM Chat. Used as a library in other projects.
- **[window.ai](https://github.com/alexanderatallah/window.ai)** — Browser-extension bridge to remote/local models; not a chat app and not WebGPU-native.
- **[transformers.js-examples](https://github.com/huggingface/transformers.js-examples)** — Hugging Face's 25+ demos (Phi-3.5, SmolVLM, Whisper, etc.). Each demo is single-task; none combine chat + RAG + tools + web search.

**Where LocalMind is distinct:** agent + RAG + live web search + batch pipelines + multimodal + five concurrent workers, all in a single HTML file with zero build. Memory persists across sessions and can be audited (stale / duplicate / outlier); fetched pages are chunked and fed back into RAG. Bring-your-own-key for web search so the privacy story stays clean.

---

## Part of the NakliTechie series

A growing collection of browser-native tools that run entirely on your device. Highlights:

| Project | Description |
|---|---|
| **[BOFH](https://naklitechie.github.io/BOFH)** | Browser-native dev toolkit — one HTML file, twenty tools, zero data leaving your device |
| **[MoD](https://naklitechie.github.io/mod)** | Merge or Die — arcade-style number merge game |

Full portfolio: **[naklitechie.github.io](https://naklitechie.github.io/)**.

---

Built by [Chirag Patnaik](https://github.com/NakliTechie) · with [Claude Code](https://claude.ai/code).
