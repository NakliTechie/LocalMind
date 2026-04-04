# LocalMind

A private AI research agent that runs entirely inside your browser. Tool calling, persistent memory, web search, multimodal input — all on-device via WebGPU. No server, no API keys required, no data leaving your device.

**[Try it live](https://naklitechie.github.io/LocalMind)**

## What it does

LocalMind runs Google's Gemma models directly in your browser tab using WebGPU. Models download once, are cached locally, and run offline from that point on. Your conversations, reasoning, and memories never leave your device. Only web search queries touch the network — and only when you explicitly choose to.

**Three models, your choice:**

| Model | Size | Capabilities | Best for |
|---|---|---|---|
| **Gemma 3 1B** (default) | ~760 MB | Text chat | Quick everyday chat |
| **Gemma 4 E2B** | ~1.5 GB | Text + image + audio + agent | Multimodal on any device |
| **Gemma 4 E4B** | ~4.9 GB | Text + image + audio + agent | Best quality, needs more VRAM |

## Agent tools (Gemma 4 models)

Gemma 4 models have built-in tool calling. The model decides when to use tools based on your question.

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

**Translation:** Gemma 4 supports 140+ languages natively — just ask it to translate. No separate model needed.

## Persistent memory (RAG)

LocalMind remembers across sessions. Powered by a local RAG pipeline:

- **MiniLM embeddings** (~23 MB, runs on CPU alongside the main model)
- **IndexedDB vector store** with cosine similarity search
- **Document upload** — drop .txt, .md, .csv, or .json files to store as searchable knowledge
- **Post-session summarization** — conversations are summarized and stored when you start a new chat
- **Memory inspector** — click "Memory" to browse, search, and delete stored memories
- **Export / Import** — download all data (memories, conversations, profile) as JSON, or import from a previous export

Every search result and fetched page is cached in the RAG index. The context window stays fixed. The accessible knowledge grows without limit.

## Conversation history

- **New Chat** — archives the current conversation to History, then starts fresh
- **Clear** — deletes the current conversation without saving (with confirmation)
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

- **Attach** — images, audio files, MP4 video, or text documents (.txt, .md, .json, .csv)
- **Camera** — snap a photo with your webcam
- **Mic** — record a voice clip
- **Paste** — Ctrl/Cmd+V an image from clipboard
- **Drag and drop** — drop files onto the chat

Video is experimental — keyframes and audio are extracted and sent separately.

## Context engineering

The raw context window is 12-16K tokens depending on model. The effective knowledge is unlimited:

- **Sliding window** — last 3 turn-pairs verbatim, older turns compressed to rolling summary
- **RAG retrieval** — top relevant memories auto-injected into system prompt
- **Semantic pre-filtering** — fetched web pages split into paragraphs, embedded, ranked by relevance to your query
- **Multi-hop reasoning** — agentic loop chains up to 3 tool calls per message

## How to run

Serve from any static host — GitHub Pages, Netlify, or a local server:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

No build step. No dependencies. No backend.

**Note:** Requires a browser with WebGPU support (Chrome 113+, Edge 113+, Firefox 130+). Will not work from `file://` — needs an HTTP server.

## Tech

- **[Transformers.js](https://huggingface.co/docs/transformers.js)** v4 — runs Hugging Face models in the browser via WebGPU
- **[Gemma 3 1B](https://huggingface.co/onnx-community/gemma-3-1b-it-ONNX-GQA)** — text-only, q4f16 quantized
- **[Gemma 4 E2B](https://huggingface.co/onnx-community/gemma-4-E2B-it-ONNX)** — multimodal, 2.3B effective params, q4f16
- **[Gemma 4 E4B](https://huggingface.co/onnx-community/gemma-4-E4B-it-ONNX)** — multimodal, 4.5B effective params, q4f16
- **[MiniLM](https://huggingface.co/Xenova/all-MiniLM-L6-v2)** — 384-dim embeddings for RAG (~23 MB, WASM)
- **[Readability.js](https://github.com/mozilla/readability)** — article extraction from fetched pages (lazy-loaded)
- Web Workers for off-main-thread inference (LLM on WebGPU, embeddings on WASM)
- IndexedDB for persistent vector store + user profile
- Zero build tooling. One HTML file.

## Browser support

| Browser | Status |
|---|---|
| Chrome 113+ | Supported |
| Edge 113+ | Supported |
| Firefox 130+ | Supported |
| Safari | Not yet (WebGPU incomplete) |

---

## Part of the NakliTechie series

A collection of browser-native tools that run entirely on your device.

| Project | Description |
|---|---|
| **[BabelLocal](https://naklitechie.github.io/BabelLocal)** | Universal translator — 55 languages, NLLB model |
| **[VoiceVault](https://naklitechie.github.io/VoiceVault)** | Audio transcription — Whisper, offline-first |
| **[SnipLocal](https://naklitechie.github.io/SnipLocal)** | Background remover — RMBG-1.4, passport mode |
| **[StripLocal](https://naklitechie.github.io/StripLocal)** | EXIF metadata stripper — drag-and-drop |
| **[GambitLocal](https://naklitechie.github.io/GambitLocal)** | Chess vs Stockfish — correspondence mode |
| **[KingMe](https://naklitechie.github.io/KingMe)** | English draughts vs minimax AI |
| **[KoLocal](https://naklitechie.github.io/KoLocal)** | Go (Baduk) vs MCTS AI |
| **[PredictionMarket](https://naklitechie.github.io/PredictionMarket)** | Educational prediction market simulator |
| **[LocalMind](https://naklitechie.github.io/LocalMind)** | Private AI agent — Gemma, multimodal, WebGPU |

---

**Built by [Chirag Patnaik](https://github.com/NakliTechie)**

---

*Built with [Claude Code](https://claude.ai/code).*
