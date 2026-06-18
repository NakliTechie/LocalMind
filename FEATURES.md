# LocalMind — Full feature guide

The detailed reference for every LocalMind feature. For the short version, see the **[README](./README.md)**; for the internals, **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

---

## Models

Pick a model from the dropdown. It downloads once, caches in the browser, and runs offline after that.

| Model | Size | Runtime | Capabilities | Best for |
|---|---|---|---|---|
| **Ternary Bonsai 1.7B** (default) | ~470 MB | WebGPU | Text + agent (tools) | Smallest download with tool calling; strong reasoning |
| **Ternary Bonsai 4B** | ~1.1 GB | WebGPU | Text + agent | Same, better quality |
| **Ternary Bonsai 8B** | ~2.2 GB | WebGPU | Text + agent | Best Bonsai quality; 65K context |
| **Qwen3 4B** | ~2.8 GB | WebGPU | Text + agent | Stock Qwen3 at q4f16; native tool calling |
| **LFM2 8B A1B** | ~4.8 GB | WebGPU | Text + agent | Liquid AI sparse-MoE (8B total / ~1B active); needs a capable GPU + ~8 GB RAM |
| **Gemma 3 1B** | ~760 MB | WebGPU | Text only | Lightweight fallback |
| **Gemma 4 E2B** | ~1.5 GB | WebGPU | Text + image + audio + agent | Multimodal on any device |
| **Gemma 4 E4B** | ~4.9 GB | WebGPU | Text + image + audio + agent | Best multimodal quality |
| **SmolLM2 360M · GGUF** | ~270 MB | wllama (in-tab) | Text + agent | Tiniest; runs on CPU without WebGPU |
| **Llama 3.2 1B · GGUF** | ~810 MB | wllama (in-tab) | Text + agent | Popular GGUF instruct model |
| **Qwen2.5 1.5B · GGUF** | ~1.1 GB | wllama (in-tab) | Text + agent | More capable GGUF option |

Plus any **custom Hugging Face ONNX model** (paste a repo id) or any model served by **your own Ollama / LM Studio** (see Runtimes).

The Bonsai family are 1.58-bit ternary-weight LLMs from Prism ML (Apache-2.0, Qwen3 backbone) — they punch above their download size on reasoning/code/tool-calling. LFM2 8B A1B is Liquid AI's sparse mixture-of-experts; note the **symmetric** QMoE export (`onnx-community/LFM2-8B-A1B-ONNX`) is the one that loads on WebGPU — the asymmetric/zero-point builds don't.

## Runtimes — three ways to run a model

You're not locked into one engine. Every option is local; nothing leaves your device.

1. **In your browser (ONNX + WebGPU)** — the default. Models run on your GPU via Transformers.js. Zero setup, fully private, supports multimodal + tools.
2. **In-browser GGUF (wllama)** — load a GGUF model straight from a Hugging Face URL into the tab (llama.cpp compiled to WebAssembly). Taps the huge GGUF ecosystem with no ONNX export needed; WebGPU-accelerated when available (~48 tok/s on a 360M), or pure CPU when not — **the only in-tab path that works without WebGPU**.
3. **Your own local server (endpoint)** — point LocalMind at an OpenAI-compatible server on your machine (Ollama, LM Studio, llama.cpp, Atomic) in Settings → Models. The model runs on the server at native speed; the browser just streams. Lets you use big models (7B–70B+) and the whole Ollama / LM Studio library. Still local (localhost) — nothing leaves the device.

## Generation modes

Beyond chat, LocalMind has two on-device generation paradigms (mode chips above the input):

- **🎨 Image** — text-to-image diffusion in the tab (FLUX.2-Klein 4B, ternary/1-bit, WebGPU). The chat model is freed while it runs; one click brings it back. No server, no API key. Size / steps / seed controls + a re-roll button.
- **🌫️ Diffuse** — masked-diffusion *text* (a different paradigm from normal left-to-right generation; Qwen3-0.6B MDLM). The answer "denoises" out of a fog of masked tokens. A showcase of the paradigm, not a daily driver.

## Token saver

On by default (Settings → General). Small local models have small context windows and slow generation, so big inputs are expensive. The token saver:

- steers the model to answer **concisely** (skip preamble, don't restate the question);
- **compresses large tool / search / page / document output** before it enters the context — whitespace normalize, drop repeated lines, keep the head + tail with a marker.

The full result still lives in your conversation and memory; only the copy fed to the model is shrunk. Turn it off if you want maximally verbose replies.

## Reliability — WebGPU error recovery

Large models on the browser's WebGPU backend can occasionally run out of GPU memory or lose the device mid-answer. LocalMind detects that, shows a plain-language message ("the model ran out of GPU memory — try a smaller model or shorter prompt") instead of a raw error, and **automatically reloads the model on a fresh GPU device and retries — up to 2 times**, so a single hiccup doesn't wedge your session.

## Agent tools

Tool-capable models (Bonsai, Qwen3, LFM2, Gemma 4) decide when to use tools based on your question.

| Tool | What it does |
|---|---|
| **calculate** | Arithmetic, percentages, unit conversions |
| **get_current_time** | Date and time with timezone support |
| **store_memory** | Save facts to persistent memory (IndexedDB + embeddings) |
| **search_memory** | Semantic search over stored memories |
| **list_memories** | Show what's stored, grouped by category |
| **delete_memory** | Forget specific memories by query |
| **set_reminder** | Browser notification after N minutes |
| **web_search** | Search the web via Brave, Tavily, or SearXNG (bring your own key) |
| **fetch_page** | Fetch + read a URL with Readability.js extraction |
| **segment_image** | Segment objects in attached images using SAM |
| **run_python** | Execute Python in a sandboxed Pyodide worker (numpy/pandas/matplotlib) |

**Translation:** Gemma 4 supports 140+ languages natively — just ask.

**Multi-step planning (experimental):** Settings → *Multi-step planning*. Each message is planned into 2–5 steps, each executed with tools, then synthesised. Slower, but better on research-style queries.

**Custom tools:** Settings → *Custom tools*. Paste a JSON tool definition (`name`, `description`, `parameters` JSON-schema, `endpoint`). When the model calls it, LocalMind POSTs the args to your endpoint and feeds back the response (the endpoint must allow CORS for this origin).

**MCP servers:** Settings → *MCP servers*. Paste a Streamable-HTTP JSON-RPC URL (+ optional bearer token); discovered tools register with an `mcp_` prefix and are available to any agent-capable model. The server must send CORS headers for this origin and speak JSON-RPC 2.0 over HTTP POST. Connections re-establish on reload; remove + re-add to pick up new tools. Find servers at [modelcontextprotocol.io/servers](https://modelcontextprotocol.io/servers) (look for *Streamable HTTP* / *SSE*).

**Multi-model & research:**
- **Compare / council** — run one prompt through 2–3 models, then a judge picks the best.
- **Deep Research** — sub-queries → web search → read sources → a cited report, on-device.
- **Self-improving skills** — the agent saves reusable skills that auto-apply in later chats.

**Math & diagrams:** inline `$\int x^2 dx$` / display `$$\sum i$$` render via KaTeX; ` ```mermaid ` blocks render as SVG.

**Artifact preview:** ` ```html `, ` ```svg `, ` ```artifact ` code blocks get a live sandboxed iframe (`sandbox="allow-scripts"`, no same-origin) — safe to run model-generated UI inline.

**Voice to text:** the 🗣 button records mic audio, decodes to 16 kHz mono on-device, and runs Whisper-base on WebGPU to transcribe into the input (~80 MB first-use download). Works on any model.

**Branch from here:** right-click (or long-press) any user message → *Branch from here* forks a new conversation up to that point.

## Persistent memory (RAG)

LocalMind remembers across sessions via a local RAG pipeline — MiniLM embeddings (~23 MB, on CPU) + an IndexedDB vector store with cosine-similarity search.

- **Document upload** — PDF, DOCX, .txt, .md, .json, .csv — extracted, chunked, embedded, auto-summarized.
- **Folder ingestion** — click *Folder* to open a local directory (File System Access API); all `.md`/`.txt`/`.pdf`/`.docx` files are ingested. Re-open the same folder to sync only changed files.
- **Folder sync** — mirror all data (skills, memory, documents, chats) to a folder you own; syncs across devices; API keys stay local.
- **Memory browser** (*Memory* button) — filter by category with live counts; document chunks grouped by source with bulk delete; relative timestamps + category badges.
- **Memory audit** — flags **stale** (>60 days), **near-duplicate** (cosine ≥ 0.92), and **outlier** chunks, each with a delete-all button.
- **Export / Import** — all data as JSON; optional auto-backup on every New Chat.

Every search result and fetched page is cached in the RAG index, so accessible knowledge grows while the context window stays fixed.

## Conversation history

- **New Chat** archives the current conversation (summarized + embedded into RAG so it can be recalled) and starts fresh; **Clear** discards without saving.
- **History** — a persistent left rail on desktop (a slide-over on mobile) of past conversations by date; click to resume, or delete entries.

## Web search (bring your own key)

Settings → pick a provider → enter your API key (stays in your browser's localStorage, sent straight to the provider).

| Provider | Free tier | Best for |
|---|---|---|
| **Tavily** | 1,000 credits/month, no card | Lowest barrier, AI-optimized |
| **Brave Search** | $5/month credit | Privacy-first independent index |
| **SearXNG** | Free (self-hosted) | Maximum privacy |

Use the **Search** chip (or Search+Send) to web-enrich a message. Every response shows a transparency badge: **On-device**, **Agent** (tools used), or **Web-enriched** (with clickable sources).

## Multimodal input (Gemma 4)

Attach images, audio, MP4 video, or documents; snap a webcam photo; record a mic clip; paste an image; or drag-and-drop files. Documents are extracted, chunked, embedded, and summarized on upload. Video is experimental.

## Image segmentation (SAM)

Gemma 4 can call the **Segment Anything Model**: attach an image, ask "segment the dog", and it renders a downloadable mask overlay. SAM picker in Settings (SlimSAM 50 / 77 / SAM ViT-Base / SAM 3); runs in a separate WASM worker, lazy-loaded.

## Batch prompts

The **Batch** chip runs one prompt per line sequentially through the full agent loop. Chaining: write `{{previous}}` to substitute the prior response, or rely on auto-inject (on by default). **Stop** halts after the current generation.

```
Summarise the history of the Suez Canal
Now extract the 5 most important dates from this: {{previous}}
Translate that list to Hindi: {{previous}}
```

## Sharing conversations

**Share** generates a link — **plain** (base64 in the URL fragment, `#lm:…`) or **encrypted** (AES-256-GCM + PBKDF2, `#lme:…`, passphrase required). No server, no account; the recipient gets an import banner. Attachments are stripped (text only).

## Output artifacts

- **Save as Markdown** — download any response (or write it straight into your open folder).
- **Code download** — per code-block download button with the right extension.
- **Model cache** — view cached model sizes and clear cache in Settings.

## Custom models (paste a HF ONNX repo)

Settings → **Custom models** → paste a Hugging Face repo id (e.g. `onnx-community/Phi-3.5-mini-instruct-onnx-web`) → **Add**. The validator confirms `.onnx` files exist, picks the best quantisation, estimates the real load size, checks it against your WebGPU limits (hard-block over 6 GB, soft-warn over 2 GB), and rejects multimodal repos (deferred). Added models persist across reloads. Causal LMs only.

## Developer API

Scripts in the same tab can drive the loaded model via an OpenAI-shaped `window.localmind` object (opt-in, Settings → JavaScript API). Non-streaming + streaming. Full reference: **[API.md](./API.md)** · live demo: **[demo.html](./demo.html)**.

## Example prompts

A gallery is built into the app — the **?** help button → *Try these* tab. Click any to paste it.

## Compared to other in-browser chat apps

Most "run an LLM in your browser" projects are **chat UIs for a model**. LocalMind is a **research agent with persistent memory, tools, web enrichment, image + text-diffusion generation, and three interchangeable runtimes** — in a single HTML file with zero build.

| Feature | **LocalMind** | [WebLLM Chat](https://chat.webllm.ai) | [Chatty](https://github.com/addyosmani/chatty) | [Transformers.js chat](https://github.com/huggingface/transformers.js/tree/v3/examples/webgpu-chat) |
|---|---|---|---|---|
| Fully in-browser (WebGPU) | ✅ | ✅ | ✅ | ✅ |
| Single HTML file, zero build | ✅ | ❌ | ❌ | ❌ |
| In-browser GGUF (no ONNX needed) | ✅ (wllama) | ⚠️ (MLC format) | ❌ | ❌ |
| Use your own Ollama / LM Studio | ✅ | ❌ | ❌ | ❌ |
| Image generation | ✅ | ❌ | ❌ | ❌ |
| Text-diffusion mode | ✅ | ❌ | ❌ | ❌ |
| Tool calling / agent loop | ✅ (11 tools) | ❌ | ❌ | ❌ |
| Persistent memory (RAG) | ✅ | ❌ | ⚠️ transient | ❌ |
| PDF / DOCX / folder ingestion | ✅ | ❌ | ⚠️ PDF/text | ❌ |
| Web search (BYOK) | ✅ | ❌ | ❌ | ❌ |
| Encrypted shareable links | ✅ | ❌ | ❌ | ❌ |
| MCP client | ✅ | ❌ | ❌ | ❌ |
| OpenAI-shaped JS API | ✅ | ⚠️ | ❌ | ❌ |

**Adjacent projects:** [Chrome Built-in AI](https://developer.chrome.com/docs/ai/built-in) (Gemini Nano, API-only, Chrome-only), [Ratchet](https://github.com/huggingface/ratchet) (Rust+WebGPU engine), [MLC LLM](https://llm.mlc.ai/) (the engine under WebLLM), [transformers.js-examples](https://github.com/huggingface/transformers.js-examples) (single-task demos).
