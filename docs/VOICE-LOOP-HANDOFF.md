# Agent Handoff — LocalMind Voice Loop

**For:** Claude Code. **Target:** `index.html` (+ CDN deps). **Date:** July 1, 2026.
**Why:** see `ROADMAP-TIER5.md` §1. This doc is the *how*; the roadmap is the *why*.

Two milestones, one spec. Ship **v1.0** first, gate it, then open **v1.1**. Same
URL, same codebase, two deploys. Proceed autonomously on all naming, implementation,
debugging, and alternatives — stop only per the Escalation Protocol at the end.

---

## 0. Milestones

- **v1.0 — 🔊 Read aloud.** Per-bubble "speak" button. Kokoro-82M TTS, WASM default,
  sentence-streamed playback. Runs *after* generation (chat model idle), so no
  device contention. This is the anchor; it must stand alone.
- **v1.1 — 🎙 Voice mode.** A mode chip beside 🎨/🌫️. Push-to-talk → Moonshine
  streaming STT → chat model (via the existing FIFO) → Kokoro TTS. Turn-based.
  Scaffolds nothing v1.0 needs; activates the STT half + the loop controller.

---

## 1. Locked decisions (do not re-litigate)

| Axis | Decision |
|---|---|
| **TTS engine** | `kokoro-js` (purpose-built: streaming `tts.stream()`, voice list, built-in phonemization). Model `onnx-community/Kokoro-82M-v1.0-ONNX`. |
| **TTS dtype/device** | `q8` on WASM (default), `fp32` on WebGPU. **WASM is the default** so TTS never contends with the chat model's WebGPU. |
| **TTS default voice** | `af_heart`. Expose Kokoro's full voice list incl. non-English (Hindi lang code `h`, + ja/zh/fr/es/it/pt/ko) in voice-mode settings. |
| **STT engine (voice mode)** | **Moonshine** via transformers.js `automatic-speech-recognition` (per `webml-community/moonshine-web`). Default `onnx-community/moonshine-base-ONNX`; `moonshine-tiny` (27 MB) as the low-mem fallback. English-first, streaming. |
| **STT device** | WASM default (real-time on CPU, streams); WebGPU **only** when the chat model is on the endpoint backend (GPU free) — detect, don't ask. |
| **Existing Whisper** | **Keep it.** Do not remove. Moonshine is additive (fast English streaming); Whisper-base stays as the multilingual one-shot transcriber the 🗣 button already uses. Voice-mode language toggle: English → Moonshine, other → Whisper. |
| **Turn model (v1.1)** | Push-to-talk floor (hold the mic control to speak, release to send). VAD-gated auto-endpoint is a v1.1 *stretch*, only if Moonshine's streaming endpoint proves reliable. **No full-duplex / no barge-in** this milestone. |
| **Dep loading** | CDN (jsDelivr), pinned to exact version, lazy-loaded on first use, SRI where the endpoint allows (kokoro-js is a versioned bundle → SRI-able; the transformers `+esm` redirect issue is pre-existing and documented — same handling as today). Probe before committing; degrade if absent. |
| **Agent face** | Extend `window.localmind`: `tts.speak(text, {voice, speed})` and `stt.transcribe(blob) → text`, gated behind the existing JavaScript-API dev setting, frozen/non-writable like the rest. |

---

## 2. Where it plugs (seams — reuse, don't reinvent)

- **Worker pattern:** the same blob-URL / `postMessage` worker factory used by the
  Whisper, Image, and Diffuse workers. TTS and STT each get their own lazy worker.
- **Whisper worker** is the template for the STT worker (mic → `OfflineAudioContext`
  → 16 kHz mono `Float32Array` → transfer). Reuse that capture path verbatim for
  Moonshine; only the model/pipeline differs.
- **FIFO (`runInference`):** the v1.1 loop's generation step goes **through the
  existing queue** — do not add a parallel generation path. STT and TTS are outside
  the queue (they don't touch the chat worker).
- **Mode chips:** the 🎨/🌫️ handler is the pattern for the 🎙 chip — same
  enter/leave lifecycle, same "unload the heavy resident on enter" hook (but see §3
  — voice mode does **not** unload the chat model).
- **JS API:** the `window.localmind` object (chat.completions today) is the mount
  point for `tts` / `stt`.
- **Settings → General/Models:** voice settings live here (engine, voice, speed,
  autoplay, language). Same localStorage + sub-tab pattern as the rest.

---

## 3. Worker topology + the WebGPU-residency resolution (read this twice)

The house rule is *one WebGPU-heavy worker resident at a time* (Image/Diffuse/wllama
unload the chat model). Voice must **not** break that rule and must **not** unload
the chat model — the conversation needs it resident. Resolution:

- **TTS and STT ride WASM by default.** Kokoro is 1.5–2× real-time on WASM; Moonshine
  is real-time on CPU. At sub-200 MB each on WASM they don't touch the WebGPU budget,
  so the chat model stays the sole WebGPU-heavy resident. The rule holds untouched.
- **The turn is sequential, never simultaneous.** STT (user talking) → generation
  (chat) → TTS (assistant talking). At any instant one stage is active. No three-way
  contention exists to design around.
- **GPU-free fast path (detected):** if the chat model is on the **endpoint backend**
  (inference on the user's server), the local GPU is idle → STT/TTS may use WebGPU
  for lower latency. Detect via the model's `backend`/`_backend`; never surface it as
  a choice.

Resulting residency: chat model (WebGPU, resident) + Kokoro (WASM, lazy) + Moonshine
(WASM, lazy). Endpoint-backend case: chat (server) + Kokoro/Moonshine (WebGPU ok).

---

## 4. Repo / build / deploy

Single `index.html` + CDN deps; **no build step, no new sibling files** (Kokoro and
Moonshine are CDN bundles, not vendored engines — unlike the WGSL kernels). Deploy is
unchanged: serve `index.html` (+ the existing `lfm2_5.js` / `gemma-4-e2b.js`) from
any static host, over HTTP. GitHub Pages / Netlify / `python3 -m http.server`.

**Browser floor:** WebGPU not required — WASM is the default path for both engines,
so voice works on any modern browser that runs LocalMind today. WebGPU is an
opportunistic speedup, never a gate. Mic requires `getUserMedia` (already used).

---

## 5. Design tokens + icons

- CSS **custom properties only** — reuse the existing house variables; a new theme
  stays one entry. No hard-coded colours.
- Icons: **🔊** = read-aloud button (per bubble, beside the existing Save/copy
  affordances). **🎙** = voice-mode chip (beside 🎨/🌫️). Match the existing chip
  markup and states.
- TTS playback UI: a compact inline player on the bubble (play/pause, a progress
  line). Voice mode: a large mic control with three visible states — idle /
  listening / speaking — plus a live partial-transcript line while listening.

---

## 6. Empty + error UX (degrade, never wall)

- **No WebGPU** → WASM path, silently. No error.
- **Model uncached** → prompt before download (Kokoro ~80 MB, Moonshine base
  ~150 MB). Never surprise-fetch. Same confirm pattern as existing model loads.
- **Autoplay blocked** (browser needs a user gesture) → don't error; show the ▶
  button and play on tap. Common on first load — handle it, don't log-and-die.
- **Mic permission denied** → clear inline message; the mode still works as
  text-only (type instead of talk). Voice is an enhancement, not a lock.
- **TTS generation fails** → degrade to text-only for that turn, one quiet notice.
- **Language mismatch** → Kokoro covers 9 languages incl. Hindi; route TTS to the
  matching voice. If the text is in a language Kokoro can't speak, disable the speak
  button for that bubble with a tooltip rather than mispronouncing.
- **Worker error surfacing** — keep the progress/status region **visible** on error
  with the message inline (do not repeat the Whisper-path bug where the section is
  hidden then written into).

---

## 7. Persistence

- Voice settings (engine, voice, speed, autoplay, STT language) → localStorage,
  same store/pattern as other settings. Restored on load.
- **Generated audio is ephemeral — never persist audio blobs.** Session-only.
- Transcripts are just messages: they flow into the normal conversation → history →
  RAG pipeline unchanged. No special persistence.

---

## 8. CSP + security posture (the sovereignty invariant)

- **Zero new network egress.** All STT/TTS runs on-device; audio never leaves. This
  is the hard invariant of the whole feature — a `/forward-pass` finding of *any*
  server call in the voice path blocks the milestone.
- Add the two CDN origins (kokoro-js, the Moonshine model host) to the existing CSP
  allowlist; SRI where the endpoint allows, matching current dep handling.
- Blob-URL workers, same isolation as the existing engine workers.
- `getUserMedia` is the only new permission; it's already requested for Whisper.

---

## 9. Accessibility + keyboard

- Voice output **is** an a11y win — wire the 🔊 button with a proper `aria-label` and
  make it keyboard-reachable; announce state changes (speaking/idle) politely.
- **Push-to-talk key:** primary is **hold the mic control** (zero conflict). A key
  binding is a convenience only — **read the existing keyboard-guard registry first
  and pick a non-colliding key**; default proposal is hold-`V` *only when the text
  input is unfocused/empty* so it never eats typing. If no clean key exists, ship
  mic-control-only and note it. Resolve against the existing shortcut set, don't
  assume.

---

## 10. Agent face (JS API)

Extend `window.localmind` (opt-in, existing dev setting; frozen; clean detach on
disable; logged in the existing activity log):

- `localmind.tts.speak(text, { voice?, speed? })` → plays audio; resolves when
  done; cancellable (mirror the streaming-iterator `stop` pattern).
- `localmind.stt.transcribe(blob | Float32Array) → Promise<string>`.

These make the loop headless-testable (the same hooks that back the UI) — one
mechanism, two doors, per the two-entry-points rule.

---

## 11. README + help-modal patches (ship in the same PR)

- **README:** add a **Voice** row to Features; add Kokoro (TTS) and Moonshine (STT)
  to the model/runtime table; add a line to the NakliTechie-series entry ("private AI
  chatbot — now with on-device voice in and out"). No model line-counts, plain
  what-it-does-for-a-user phrasing.
- **Help modal (`?` → Try these):** add a voice-mode example and a one-line "hold to
  talk, it reads back — nothing leaves your device" note.
- **Version string:** bump the visible UI + meta-tag version before push (v1.0 on
  read-aloud ship, again on v1.1).

---

## 12. What NOT to do (hard rules)

1. **No network calls in the voice path.** On-device only. This is the invariant.
2. **Do not use the Web Speech API** — it phones home; already rejected for the 🗣
   button for exactly this reason.
3. **Do not persist audio blobs.**
4. **Do not let STT/TTS take WebGPU from the chat model by default** — WASM for both;
   WebGPU only on the detected GPU-free (endpoint-backend) path.
5. **Do not unload the chat model on entering voice mode** — the conversation needs
   it resident (this is the one mode that keeps it).
6. **Do not remove or replace the existing Whisper worker** — Moonshine is additive.
7. **Do not build full-duplex / barge-in** in v1.1 — turn-based only.
8. **Do not surprise-download** either model — prompt first.

---

## 13. Escalation protocol

Proceed autonomously on everything else. Stop and ask **only** if:

- `kokoro-js` or the Moonshine pipeline **cannot load/parse under the CSP** and no
  working CDN+SRI (or same-origin vendor) path exists — a genuine dependency block;
- a **locked decision here conflicts with the actual code** (e.g., the keyboard guard
  has no free key, or the JS-API object can't be extended cleanly);
- WASM STT/TTS **cannot reach usable turn latency** and the only fix is contending
  for the chat model's WebGPU — i.e., the residency architecture in §3 doesn't hold
  and the product shape has to change.

Anything short of those — naming, layout, which voice UI, debugging, library quirks —
is yours to decide and move on.

---

## 14. Gate artifacts (per milestone)

**v1.0 gate:**
- 🔊 on any chat answer produces audible, sentence-streamed speech.
- Works with WebGPU **disabled** (WASM path).
- Download-prompt fires before first fetch; autoplay-blocked degrades to ▶.
- English + Hindi voices both speak; unsupported-language bubble disables 🔊 cleanly.
- `localmind.tts.speak()` works headless behind the dev setting.
- `/forward-pass` clean — **specifically: no network call in the TTS path.**

**v1.1 gate:**
- A full hands-free turn completes via push-to-talk: speak → live partial transcript
  → send → generate (through the FIFO) → read back.
- Chat model holds WebGPU throughout; STT/TTS on WASM — **no device contention**
  observed across the turn.
- Endpoint-backend case: STT/TTS opportunistically use WebGPU (detected, not asked).
- Language toggle routes English→Moonshine, other→Whisper.
- `localmind.stt.transcribe()` works headless.
- `/walkthrough` through voice mode (idle/listening/speaking states, mic-denied
  fallback, mid-turn cancel) with fixes in place.
- README + help-modal + version string updated.
