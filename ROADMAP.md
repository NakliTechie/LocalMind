# LocalMind — Roadmap

**Last updated:** April 4, 2026

## Current state

Single-file (4,220 lines) private AI research agent running entirely in-browser. Zero backend.

**Shipped:**
- 9 agent tools (calculate, time, memory CRUD, reminder, web_search, fetch_page)
- RAG pipeline (MiniLM embeddings on WASM, IndexedDB vector store, semantic search, auto-injection)
- Document ingestion: PDF (via PDF.js), DOCX (via mammoth.js), .txt, .md, .json, .csv
- Auto-summarize on document upload (extractive, stored as document_summary)
- Web search (BYOK: Brave, Tavily, SearXNG) with Readability.js extraction + semantic pre-filtering
- Multimodal input (image, audio, video via Gemma 4)
- Context engineering (sliding window, rolling summary, 12K budget)
- Conversation history (sidebar, archive/resume, post-session summarization)
- Export/import (full data portability as JSON)
- Auto-backup toggle (download on New Chat)
- Output artifacts (Save as MD, code block download)
- Model cache management (view size, clear cache)
- Task progress counter (Step 1/3 labels in agentic loop)
- Transparency badges (On-device / Agent / Web-enriched) + source links
- Thinking mode with auto-collapse on completion

## Status

| Capability | Status |
|-----------|--------|
| Chat UI | Strong |
| Model management | Strong (cache view/clear shipped) |
| Multi-model | Strong (3 Gemma + MiniLM sidecar) |
| RAG | Strong (PDF/DOCX/text, auto-summarize) |
| Tools | Strong (9 tools, hardcoded) |
| Agents | Partial (single-agent loop, no planning) |
| Plugins | Not started |

---

## Next — Tier 2

### Plugin / custom tool API
- Settings: "Custom Tools" section
- User defines tools as JSON: `{ name, description, parameters, endpoint }`
- On tool call: `fetch(endpoint, { method: 'POST', body: JSON.stringify(args) })`
- Store definitions in localStorage
- Risk: CORS blocks most endpoints. Best with local servers or CORS-enabled APIs.

**~100 lines.**

### Multi-step planner agent
- First pass: "Break this into steps" → parse plan → execute each step with tools → synthesize
- Same model, different system prompts per phase
- Reliability depends on model quality at 4.5B

**~80 lines.**

### Conversation branching
- Right-click or long-press a user message → "Branch from here"
- Creates new conversation in history with messages up to that point

**~40 lines.**

### Voice mode
- Web Speech API (`SpeechRecognition`) for input (free, built into Chrome)
- Web Speech API (`SpeechSynthesis`) for output
- Toggle button in input bar

**~60 lines.**

### Custom model loading
- User pastes a Hugging Face model ID in Settings
- Validate before loading: check ONNX format available, check quantized size, check architecture compatibility (causal or multimodal)
- Use `fetch()` to probe `config.json` from the HF hub for model type and size
- If valid, add to model selector dropdown and load via existing `AutoModelForCausalLM` or `Gemma4ForConditionalGeneration` paths
- Store custom model IDs in localStorage
- Limits: must be ONNX-exported, must fit in GPU memory, must be a supported architecture (causal LM or Gemma4-style multimodal)

**~80 lines.**

---

## Tier 3 — Blocked on ecosystem

| Feature | Blocker | When |
|---------|---------|------|
| Gemma 4 26B MoE in-browser | ~15 GB weight load, exceeds browser GPU | ~2027 |
| KV cache quantization (2x context) | ONNX Runtime WebGPU support | Unknown |
| KV cache offload to system RAM | WebGPU API limitation | Unknown |
| Cross-device sync | OAuth complexity in single-file app | Low priority |
