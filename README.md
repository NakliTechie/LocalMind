# LocalMind

**Private AI in your browser tab.** Chat, generate images, search the web, and talk to your documents — running entirely on your own device. No server, no API keys, no data leaving your machine.

**▶ [Try it live](https://naklitechie.github.io/LocalMind)**  ·  **[Guided tour](https://naklitechie.github.io/LocalMind/guide/)**

![LocalMind running on-device](guide/img/01-overview.jpg)

## What is it?

LocalMind is a single web page that runs real AI models **on your own device**. Open the link, pick a model, and start chatting — the model downloads once, caches in your browser, and works offline after that. Your conversations, files, and memory never leave your machine.

It began as a private chatbot and grew into a small **AI workbench**: chat, image generation, document Q&A, OCR, web research, and voice — all local.

> **The promise: no server · no API keys · no data leaving your device.** The only thing that ever touches the network is a web search — and only when *you* press the search button.

## What you can do

- 💬 **Chat with private local models** — several to choose from, from a tiny ~470 MB model up to multi-GB ones. They reason, write, and code.
- 🎨 **Generate images** — text-to-image on your GPU, right in the tab.
- 🌫️ **Watch text "denoise"** — an experimental diffusion-text mode (a different way of generating).
- 🌐 **Search the web** *(optional)* — bring your own free search key; answers come back with clickable sources.
- 📄 **Chat with your documents** — drop in PDFs, Word docs, notes, or a whole folder and ask questions across them. It remembers across sessions.
- 🔎 **Extract text from images & PDFs (OCR)** — drop in a photo, screenshot, or scanned PDF and get back clean, selectable text or Markdown — tables and formulas included. Runs entirely on your GPU (GLM-OCR); the document never leaves your device. Needs WebGPU (Chrome/Edge); the model downloads once (~1.4 GB), then works offline. You can also point it at the model folder on disk for zero runtime fetch.
- 🖼️ **See & hear** — some models accept images and audio; voice-to-text works on any model.
- 🧠 **It remembers** — a private, on-device memory you can browse, search, and tidy up.
- 🔌 **Use *any* model** — point it at your own Ollama / LM Studio, or load a GGUF model straight into the tab.
- 📱 **Phone to desktop** — installable as an app; works offline.

*Every feature, in detail → [FEATURES.md](./FEATURES.md).*

## Three ways to run a model

Pick whatever fits your hardware — all three are local, nothing leaves your device:

| | How it runs | Best for |
|---|---|---|
| **In your browser** | On your GPU via WebGPU — zero setup | The private default; nothing to install |
| **In-browser GGUF** | A GGUF model loaded into the tab (llama.cpp → WebAssembly) | The huge GGUF ecosystem, no setup; runs on CPU even without a GPU |
| **Your own server** | Point it at Ollama / LM Studio on your machine | Big models (7B–70B+) at full speed |

### Custom WebGPU engine (the default)

The default model, **Gemma 4 E2B**, runs on a **from-scratch WebGPU inference engine** — every kernel (matmul, attention, RoPE, RMSNorm, the int4 dequant) is hand-written WGSL, reading the quantized weights directly with **no ONNX runtime and no llama.cpp**. It's tuned purely for in-tab decode throughput (~250 tok/s on an M4 Max). A second model, **LFM2.5 230M**, runs on the same approach. Both are WebGPU-only.

These two engines are ported, largely verbatim, from the open-source [`webml-community`](https://huggingface.co/webml-community) Spaces on Hugging Face — [`gemma-4-webgpu-kernels`](https://huggingface.co/spaces/webml-community/gemma-4-webgpu-kernels) and [`lfm2-webgpu-kernels`](https://huggingface.co/spaces/webml-community/lfm2-webgpu-kernels). `webml-community` is the home of [**Transformers.js**](https://github.com/huggingface/transformers.js), the in-browser ML library by **[Xenova](https://github.com/xenova) (Joshua Lochner)** at Hugging Face — the foundation this entire project is built on, and where these WebGPU-kernel engines come from. The Gemma engine also has a standalone home at [tylerstraub/gemma4-webgpu](https://github.com/tylerstraub/gemma4-webgpu). LocalMind's contribution is the integration: adapting each engine's stream into the shared chat protocol and slotting it in next to the other backends. **Full credit for Transformers.js and the WGSL kernels goes upstream.**

## Try it in 30 seconds

1. Open **[naklitechie.github.io/LocalMind](https://naklitechie.github.io/LocalMind)** in Chrome or Edge.
2. Pick a model — the default is **Gemma 4 E2B** (~2 GB, on the custom WebGPU engine); or choose a smaller one like the ~470 MB Bonsai 1.7B to start faster.
3. Wait for the one-time download, then chat.

To run it yourself, it's one HTML file with no build step:

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

No dependencies, no backend. (Needs an HTTP server — it won't run from a `file://` path.)

## Privacy

Everything runs on your device. Models download from Hugging Face once and cache locally; after that you can go fully offline. There's no account, no telemetry, no backend. Web search is opt-in and uses *your* key, sent straight from your browser to the provider you chose.

## Browser support

Works in **Chrome / Edge 113+** and **Firefox 130+** — in-browser models need WebGPU (the "your own server" mode works without it). Safari's WebGPU support isn't there yet.

## Learn more

- 📖 **[Full feature guide](./FEATURES.md)** — models, agent tools, memory, web search, batch, sharing, MCP, custom models, and more
- 🛠️ **[How it works](./ARCHITECTURE.md)** — architecture, the runtimes, workers, and tech stack
- 🧑‍💻 **[Developer API](./API.md)** — drive the model from your own page (`window.localmind`)
- 🗺️ **[Roadmap](./ROADMAP.md)** — what's shipped and what's next

---

## Part of the NakliTechie series

A growing collection of browser-native tools that run entirely on your device — no server, no data leaving your machine. Full portfolio: **[naklitechie.github.io](https://naklitechie.github.io/)**.

Built by [Chirag Patnaik](https://github.com/NakliTechie) · MIT licensed · with [Claude Code](https://claude.com/claude-code).
