# LocalMind — Expansion Roadmap

**Last updated:** April 4, 2026

## Current state

Single-file (3,934 lines) private AI research agent running entirely in-browser. Zero backend.

**Shipped:**
- 9 agent tools (calculate, time, memory CRUD, reminder, web_search, fetch_page)
- RAG pipeline (MiniLM embeddings on WASM, IndexedDB vector store, semantic search, auto-injection)
- Web search (BYOK: Brave, Tavily, SearXNG) with Readability.js extraction + semantic pre-filtering
- Multimodal input (image, audio, video via Gemma 4)
- Context engineering (sliding window, rolling summary, 12K budget)
- Conversation history (sidebar, archive/resume, post-session summarization)
- Export/import (full data portability as JSON)
- Transparency badges (On-device / Agent / Web-enriched) + source links

## Honest assessment

| Capability | Status | Gap |
|-----------|--------|-----|
| Chat UI | Strong | — |
| Model management | Partial | No cache management, no GPU memory display |
| Multi-model | Strong | 3 Gemma + MiniLM sidecar |
| RAG | Strong | No PDF/DOCX ingestion |
| Tools | Strong | 9 tools, hardcoded — no plugin API |
| Agents | Partial | Single-agent loop, no planning |
| Document ingestion | Partial | .txt/.md/.json/.csv only |

---

## Tier 1 — High impact, buildable now

### 1.1 PDF & DOCX ingestion
Documents are the most common knowledge format. Without PDF support, "upload your documents" is half a promise.

- Lazy-load [PDF.js](https://cdn.jsdelivr.net/npm/pdfjs-dist) (~500 KB) on first PDF upload
- Lazy-load [mammoth.js](https://cdn.jsdelivr.net/npm/mammoth) (~80 KB) on first DOCX upload
- Extract text → existing `chunkText()` → `embedAndStore()` pipeline
- Add `.pdf,.docx` to file input accept + handler regex
- Toast: page count + chunk count

**~60 lines.**

### 1.2 Auto-backup on New Chat
IndexedDB can be wiped by browser cleanup. The export button exists but nobody clicks it proactively.

- Settings toggle: "Auto-download backup on New Chat" (off by default)
- When enabled, trigger JSON download after archiving conversation
- Fallback: rolling backup to `localStorage` key (capped at 5MB)

**~20 lines.**

### 1.3 Model cache management
Users download 4.9 GB and can't see where it went or free it.

- Show cached model sizes via Cache Storage API
- "Delete cached model" button per model in Settings
- GPU memory estimate via `navigator.gpu.requestAdapter()` → `adapter.limits`
- Auto-suggest context tier based on available memory

**~80 lines.**

### 1.4 Output artifacts
Responses with code, tables, or structured content should be downloadable — not just readable.

- Download button on code blocks (save as file with inferred extension)
- "Save as Markdown" button on any assistant response
- For structured tool results (calculate, search): offer CSV/JSON export

**~40 lines.**

### 1.5 Auto-summarize on document ingestion
When a user uploads a document, show a preview summary before storing — confirms the right file and gives immediate value.

- After chunking, run a quick extractive summary (top 3 sentences by keyword density, done in JS — no model call)
- Show in toast or inline: "Stored 12 chunks from report.pdf — Summary: ..."
- Store the summary as a separate `document_summary` category chunk for fast retrieval

**~30 lines.**

### 1.6 Task progress enhancement
Tool call blocks show what happened, but multi-step sequences lack a clear progress indicator.

- Step counter in the assistant bubble during agentic loop: "Step 1/3: Searching..." → "Step 2/3: Fetching..." → "Step 3/3: Synthesizing..."
- Reuses existing tool call block rendering, just adds a counter label

**~15 lines.**

---

## Tier 2 — Medium effort, meaningful differentiation

### 2.1 Plugin / custom tool API
9 hardcoded tools covers common cases. Power users need extensibility.

- Settings: "Custom Tools" section
- User defines tools as JSON: `{ name, description, parameters, endpoint }`
- On tool call: `fetch(endpoint, { method: 'POST', body: JSON.stringify(args) })`
- Store definitions in localStorage
- Risk: CORS blocks most endpoints. Best with local servers or CORS-enabled APIs.

**~100 lines.**

### 2.2 Multi-step planner agent
Complex queries need decomposition. Current loop handles 1-3 tool calls but doesn't plan.

- First pass: "Break this into steps" → parse plan → execute each step with tools → synthesize
- Same model, different system prompts per phase
- Reliability depends on model quality at 4.5B

**~80 lines.**

### 2.3 Conversation branching
Fork a conversation at any message, explore alternatives without losing the original.

- Right-click or long-press a user message → "Branch from here"
- Creates new conversation in history with messages up to that point

**~40 lines.**

### 2.4 Voice mode
Hands-free interaction. Accessibility.

- Web Speech API (`SpeechRecognition`) for input (free, built into Chrome)
- Web Speech API (`SpeechSynthesis`) for output
- Toggle button in input bar

**~60 lines.**

---

## Tier 3 — Blocked on ecosystem

| Feature | Blocker | When |
|---------|---------|------|
| Gemma 4 26B MoE in-browser | ~15 GB weight load, exceeds browser GPU | ~2027 |
| KV cache quantization (2x context) | ONNX Runtime WebGPU support | Unknown |
| KV cache offload to system RAM | WebGPU API limitation | Unknown |
| Cross-device sync | OAuth complexity in single-file app | Could build, low priority |

---

## Priority order

| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 1 | PDF/DOCX ingestion | ~60 lines | High — most requested |
| 2 | Auto-backup | ~20 lines | High — fixes data loss risk |
| 3 | Output artifacts | ~40 lines | Medium — practical utility |
| 4 | Auto-summarize on ingestion | ~30 lines | Medium — immediate value on upload |
| 5 | Task progress | ~15 lines | Low — polish |
| 6 | Model cache management | ~80 lines | Medium — reduces friction |
| 7 | Plugin API | ~100 lines | Medium — power users only |
| 8 | Voice mode | ~60 lines | Medium — accessibility |
| 9 | Multi-step planner | ~80 lines | Medium — reliability uncertain |
| 10 | Conversation branching | ~40 lines | Low — nice-to-have |

**Privacy story:** Documented in README with concrete comparison (what cloud AI sees vs what LocalMind leaks). No in-app page — avoids unnecessary weight.

---

## The honest pitch

LocalMind is not a ChatGPT replacement. It's the only AI assistant where:

1. **Your search queries are the ceiling of what anyone can learn about you** — and even those are optional.
2. **Your knowledge base compounds privately** — every conversation, document, and search result builds a personal RAG index that never leaves your device.
3. **The architecture is ready for frontier models** — when Gemma 4 26B MoE runs in-browser, the orchestration layer works unchanged. Only `contextSize` changes.
