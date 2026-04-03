# LocalMind

A private AI chatbot that runs entirely inside your browser — no server, no API keys, no data leaving your device. Supports text, image, and audio input with Gemma 4 multimodal models.

**[Try it live](https://naklitechie.github.io/LocalMind)**

## What it does

Chat with Google's Gemma models directly in your browser tab using WebGPU. Models download once, are cached locally, and run offline from that point on. Your conversations never leave your device.

**Three models, your choice:**

| Model | Size | Type | Best for |
|---|---|---|---|
| **Gemma 3 1B** (default) | ~760 MB | Text only | Quick everyday chat |
| **Gemma 4 E2B** | ~1.5 GB | Text + image + audio | Multimodal on any device |
| **Gemma 4 E4B** | ~4.9 GB | Text + image + audio | Best quality, needs more VRAM |

The app starts with the lighter model so you can chat quickly. Switch to a multimodal model anytime via the dropdown — attachment buttons appear automatically.

## Multimodal features (Gemma 4 models)

When a Gemma 4 model is loaded, three input buttons appear next to the chat box:

- **📎 Attach** — upload images, audio files, or MP4 video
- **📷 Camera** — snap a photo with your webcam
- **🎤 Mic** — record a voice clip to send

You can also **paste** images from clipboard (Ctrl/Cmd+V) or **drag and drop** files onto the chat.

**Video (experimental):** When you upload an MP4, LocalMind extracts keyframes and the audio track, then sends them to the model as separate image + audio inputs. Quality depends on which frames are extracted.

**Thinking mode:** Open Settings and check "Show reasoning" to see the model's chain-of-thought before its final answer.

## How to run

Serve from any static host — GitHub Pages, Netlify, or a local server:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

No build step. No dependencies. No backend.

**Note:** Requires a browser with WebGPU support (Chrome 113+, Edge 113+, Firefox 130+). Will not work from `file://` — needs an HTTP server.

---

## Why would you need this?

**Privacy.** When you type into ChatGPT, Gemini, or any cloud chatbot, every word travels to a remote server and may be logged, stored, or used for training. For casual questions, that's usually fine. But what about drafting a sensitive email? Brainstorming around confidential business strategy? Asking about a medical symptom? The moment you type it into a cloud service, you've handed it to someone else. LocalMind keeps everything on your machine — nothing is transmitted anywhere.

**Offline.** After the first model download, LocalMind works without an internet connection. Useful on flights, in restricted networks, or anywhere connectivity is unreliable.

**No API costs.** Cloud AI APIs charge per token. LocalMind is free to use, forever. The model is open-source (Apache 2.0) and runs on your hardware.

**No account required.** No sign-up, no login, no email. Open the page and start chatting.

## Features

- Streaming token-by-token responses
- Multimodal input: images (upload, paste, camera), audio (mic, file), video (experimental)
- Markdown rendering (code blocks, bold, italic, lists)
- Thinking mode with collapsible chain-of-thought blocks
- System prompt support (collapsible settings panel)
- Stop generation mid-response
- Chat persists across page refreshes (sessionStorage)
- Model switching without page reload
- Progress bar with download size during model loading
- Drag-and-drop file attachments
- Attachment preview bar with remove buttons
- Audio playback in attachment bar before sending

## Tech

- **[Transformers.js](https://huggingface.co/docs/transformers.js)** — runs Hugging Face models in the browser via WebGPU
- **[Gemma 3 1B](https://huggingface.co/onnx-community/gemma-3-1b-it-ONNX-GQA)** — Google's lightweight instruction-tuned model, q4f16 quantised
- **[Gemma 4 E2B](https://huggingface.co/onnx-community/gemma-4-E2B-it-ONNX)** — Google's multimodal edge model, 2.3B effective params, q4f16 quantised
- **[Gemma 4 E4B](https://huggingface.co/onnx-community/gemma-4-E4B-it-ONNX)** — Google's larger multimodal model, 4.5B effective params, q4f16 quantised
- `AutoProcessor` + `Gemma4ForConditionalGeneration` for multimodal inference
- `AutoModelForCausalLM` + `AutoTokenizer` for text-only inference
- Web Worker for off-main-thread inference
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
| **[PredictionMarket](https://naklitechie.github.io/PredictionMarket)** | Educational prediction market simulator |
| **[LocalMind](https://naklitechie.github.io/LocalMind)** | Private AI chatbot — Gemma, multimodal, WebGPU |

---

**Built by [Chirag Patnaik](https://github.com/NakliTechie)**

---

*Built with [Claude Code](https://claude.ai/code).*
