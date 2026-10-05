# Custom WebGPU-kernel engines — integration record & forward plan

> **Working/design doc.** Captures (1) what shipped on branch
> `claude/lfm2-webgpu-kernels-nmupjs`, (2) how the engines work and what
> generalises, (3) the quant/8-bit findings, and (4) a scoped plan for a
> Qwen3 kernel pack. Written to hand off to a desktop session — read this
> top-to-bottom to resume cold.

---

## 0. TL;DR / resume here

- **Shipped & pushed:** two from-scratch WebGPU inference engines integrated as
  new LocalMind backends — **LFM2.5 230M** (`lfm2-webgpu`) and **Gemma 4 E2B**
  (`gemma4-webgpu`). Both run hand-written WGSL, no onnxruntime / no llama.cpp.
- **Not yet runtime-tested** in a real browser (no WebGPU in the build env where
  this was done). **First desktop task: smoke-test both** — pick each
  "· WebGPU kernels" model, confirm download → warmup → streaming reply →
  Stop → New Chat.
- **The big opportunity:** the two engines share one reusable framework; a
  **Qwen3 kernel pack** would cover Bonsai 1.7/4/8B + Qwen3-4B (4 models incl.
  the default) and is ~90% carry-over from the LFM2 engine. No upstream Qwen3
  kernels engine exists yet — see §5 for the build plan.
- **Open question to decide before Phase 2:** whether transformers.js v4's own
  WebGPU backend already closes the gap for Qwen3-4B (bespoke wins are clearest
  on the small/default Bonsai 1.7B and the ternary case).

---

## 1. What shipped (branch `claude/lfm2-webgpu-kernels-nmupjs`)

Three commits:

| Commit | Summary |
|---|---|
| `e88523d` | LFM2.5 230M custom-WGSL runtime (`Lfm2Mobile` / `lfm2_5.js`) |
| `f326a28` | Gemma 4 E2B custom-WGSL runtime (`Gemma4Mobile` / `gemma-4-e2b.js`) |
| `7e1ff2e` | Docs (FEATURES.md + ROADMAP.md) |
| *(+ this doc)* | Plan/handoff |

### Files
- `lfm2_5.js` (~650 KB) — vendored LFM2.5 engine, exports `Lfm2Mobile`. From
  the HF Space `webml-community/lfm2-webgpu-kernels`. Reads a **Q4_0 GGUF**.
- `gemma-4-e2b.js` (~540 KB) — vendored Gemma 4 E2B engine, exports
  `Gemma4Mobile`. From `webml-community/gemma-4-webgpu-kernels`. Reads
  Google's **QAT-mobile transformers** weights (`google/gemma-4-E2B-it-qat-mobile-transformers`).
- Both allowlisted in `.gitignore` (repo uses an ignore-`*`-then-allowlist scheme).

### Integration points in `index.html` (all mirror the wllama backend)
- **Worker source blocks:** `#lfm2WebgpuWorkerSrc`, `#gemma4WebgpuWorkerSrc`
  (inert `<script type="text/worker">`). Each dynamically `import()`s its engine
  by an **absolute same-origin URL injected at blob-build time** (a blob worker
  can't resolve a relative specifier).
- **Factories:** `createLfm2WebgpuWorker()`, `createGemma4WebgpuWorker()`
  (next to `createWllamaWorker()`).
- **Dispatch:** `runtime.loadModel()` routes on
  `options.backend === 'lfm2-webgpu' | 'gemma4-webgpu'`.
- **Model entries:** `'lfm2-230m-webgpu'`, `'gemma4-e2b-webgpu'` in the MODELS
  registry; picker `<option>`s; in-app help entries.
- **Reuse:** `attachWorkerHandlers()` + `generateOnce()` unchanged. The
  `noWebGPU` picker-gating disables them (WebGPU-only); `recoverModel()` skips
  them (they carry a `backend` field).

### The one adapter subtlety
The engines' `generate(messages, {maxNewTokens, signal})` yields **cumulative**
`{text}`; LocalMind's shared protocol streams **per-token deltas**. The workers
diff cumulative→delta (`full.slice(prev.length)`). They also reset KV state on a
fresh chat (first turn / shrinking history) and, for Gemma, **fold any `system`
message into the first user turn** (Gemma's template has no system role).

### Engine API (both identical)
```
Lfm2Mobile.load(repoIdOrUrlOrNull, { onProgress })   // onProgress: {status: init|tokenizer|weights|ready, fraction, loaded, total}
model.warmup()                                        // compile pipelines + ramp GPU clock
model.generate(messages, { maxNewTokens, signal })   // async iterable -> { text }  (CUMULATIVE)
model.reset()                                         // clear KV/conversation state
Lfm2Mobile.checkAvailability(id)                      // {ok, reason?}
```
`load()` accepts a repo id **or a direct `https://….gguf` URL** (verified in
code). Engines run their **own** ranged weight download + CacheStorage cache and
apply the chat template internally. WebGPU only — **no SharedArrayBuffer /
COOP-COEP** needed.

---

## 2. How the engines work (the lesson)

Both engines are **two model-specific kernel packs on top of ONE shared
framework** — confirmed by identical scaffolding in both bundles: the
`WebGPU manifest` schema, `variantFamilies`/`axes`/`passes` system, the verbatim
`"variant id must be stable"` validator, the `kernel-author` doc ref, identical
device setup (`requiredFeatures`, `powerPreference`), f16 + barrier-heavy tiled
kernels.

**Why they're fast (things onnxruntime-web structurally can't do):**
- **Kernel fusion** — e.g. LFM2's `decode-conv-in-proj-norm-q4` fuses RMSNorm +
  in-proj GEMV + dequant in one dispatch.
- **Dequant inside the matmul** — weights unpacked in-register during the GEMV
  (`q4wp`/`q8dot`), never materialised to f16 in VRAM.
- **Decode-specialised** (batch=1, single token) kernels, not general shapes.
- **Everything resident** on GPU (weights + KV); on-GPU argmax/sampling
  (`*-argmax-tiled`).
- **Bandwidth-first** — decode of a small model is memory-bound, so minimise
  weight bytes (4-bit, fused) and maximise occupancy.

The kernels were authored AI-assisted (per the Spaces' own descriptions, with
Fable 5 + Opus 4.8) — **AI-assisted kernel authoring is the actual unlock**, not
the framework alone.

---

## 3. Quant / 8-bit findings (from reading `lfm2_5.js`)

**The kernels are templated on a `quantBits` axis — NOT 4-bit-only.**
- WGSL dequant has both paths: `{% if quantBits == 8 %}` → `q8dot()` via
  `unpack4xI8` (Q8_0, 34-byte blocks); else `q4_lo/q4_hi/q4wp` (Q4_0, 18-byte).
- Every body matmul (qkv, o_proj, up/down_proj, conv_in_proj) validates
  `(args.quantBits == 4 or args.quantBits == 8)`. lm-head ships a compiled q8
  variant. The GGUF reader handles Q8_0 blocks and maps ggml-type → bit-width.
- **So an 8-bit (Q8_0) LFM2.5 should run** — point the engine at a Q8_0 GGUF
  (the only Q4_0 assumption is the default *filename* resolver `…-Q4_0.gguf`,
  overridden by passing a direct URL). Watch for an `Unsupported GGML tensor
  type` throw (covered: Q4_0/Q8_0/Q4_K/Q5_K/Q6_K + F16/BF16/F32 copy).
- **Tradeoff:** 8-bit = 2× the weight bytes of 4-bit → roughly **~2× slower
  decode** and 2× VRAM/download (decode is bandwidth-bound), same kernels.
- **bf16 weights** won't run as compute weights (no f16/bf16 *matmul* kernel;
  bf16 is only a read-and-copy path for norms/scales). Quantise the projections.
- **LoRA:** no runtime adapter path (all "adapter" refs are `GPUAdapter`).
  **Merge LoRA into the base before quantising.**
- **Context (e.g. 8k):** fine — read from GGUF metadata (`max_position_embeddings`)
  and used to size the KV cache (`cacheLen`). 8k ≤ native 32K.

**User's case (train bf16 → quantise to 8-bit):** merge LoRA → export GGUF →
`llama-quantize … Q8_0` → point the engine at the Q8_0 URL. Should run on the
same fast kernels at ~½ the 4-bit tok/s. If int8 quality/speed disappoints,
fall back to wllama (any quant, incl. Q5_K/Q6_K) or the ONNX path.

---

## 4. Generalisation survey

### LocalMind chat lineup by architecture family
| Family | Models | Custom-kernel engine? |
|---|---|---|
| **Qwen3** | Bonsai 1.7B/4B/8B (ternary `q2f16`) + Qwen3-4B (`q4f16`) — *4 incl. default* | ❌ **none upstream — author** |
| **Gemma** | Gemma 4 E2B; Gemma 4 E4B; Gemma 3 1B | ✅ E2B done · E4B/3-1B not covered |
| **LFM2** | LFM2.5 230M; LFM2 8B A1B (MoE) | ✅ 230M done · 8B-A1B (MoE) not covered |
| **Apertus** | Apertus 4B | ❌ |
| **Llama/misc (GGUF/wllama)** | Llama 3.2 1B, SmolLM2 360M, Qwen2.5 1.5B | ❌ (already fine on wllama) |

### Upstream availability (HF `webml-community`)
- Custom-kernel family today = **only** `lfm2-webgpu-kernels` + `gemma-4-webgpu-kernels`.
  (`qwen3-webgpu` / `Qwen3.5-WebGPU` are **transformers.js demos**, not kernel engines.)
- Engines are **open source** — e.g. `github.com/tylerstraub/gemma4-webgpu`
  ("purpose-built WGSL and raw WebGPU"). llama.cpp's WebGPU backend also supports
  LFM2 with custom WGSL (another reference). `github.com/Beledarian/wgpu-llm` is a
  generic from-scratch WGSL transformer engine.
- webml-community ships these ~monthly → a Qwen3 kernels engine may land on its
  own. Integration is the cheap ~1-hour half you've now done twice.

**Mismatch worth noting:** your highest-value family (Qwen3, incl. the default
Bonsai 1.7B) is exactly the one with no upstream engine; the two that exist cover
your *smallest* models. So "wait for upstream" doesn't cover the hot path.

---

## 5. Qwen3 kernel pack — build plan

### Base to fork: the LFM2 engine (not Gemma)
LFM2 interleaves conv blocks with **standard GQA-transformer blocks** — its
kernels are literally named `llama-attn`, `llama-normed`, `llama-prefill-attn`.
That standard block (GQA + per-head QK-norm + RoPE + SwiGLU + RMSNorm) **is
Qwen3's block**. A Qwen3 engine ≈ "LFM2 engine, conv blocks removed, every layer
on the attention path." Qwen3 is *simpler* than both LFM2 (no conv) and Gemma
(no sliding window).

### Component inventory — reuse vs author
| Component | Source | Carry-over | Work |
|---|---|---|---|
| Framework (manifest/variant runtime, device/pipeline/buffer mgmt) | both | **100%** | none |
| GGUF reader + dequant (q4/q8) + upload | LFM2 | ~95% | metadata keys `lfm2.*`→`qwen3.*`, drop shortconv |
| RMSNorm, RoPE, KV-cache, embed gather, sampling | LFM2 | **100%** | config (Qwen3 RoPE θ=1e6) |
| QK-norm (per-head q/k RMSNorm) | LFM2 | **100%** | Qwen3 has it — present |
| GQA attention (flash-split-k + merge, prefill) | LFM2 `llama-attn` | ~100% | full-causal, no sliding window; config heads/kv |
| SwiGLU MLP (gate-up/down) | LFM2 | **100%** | config intermediate size |
| LM head + tiled argmax (q4/q8) | LFM2 | **100%** | config vocab |
| Layer graph wiring | LFM2 | rewrite | all-attention blocks (drop conv) — mostly config |
| **Ternary GEMV (Bonsai 1.58-bit)** | q1-binary as template | **new** | the one genuinely novel kernel |

~**90% carry-over.** Only net-new kernel = ternary GEMV (and it's optional for v1).

### Weight-format decision (the real gate — engine eats GGUF)
- **Qwen3-4B:** standard llama.cpp Qwen3 GGUFs exist (Q4_0/Q8_0/Q4_K). Drop-in. ✅
- **Bonsai 1.7/4/8B:** Prism ML ships ONNX/MLX, not GGUF. Two routes:
  - **v1 (no new kernel):** convert Bonsai (Qwen3-arch) → GGUF, quantise
    **Q4_0/Q8_0**. Runs on existing kernels now; loses the 1.58-bit memory win.
  - **v2 (ternary win):** export Bonsai as **`TQ2_0`** (llama.cpp's standard
    2.06-bpw ternary type — already in the engine's ggml-type enum) and author a
    `TQ2_0` GEMV. Template = the existing `q1` *binary* kernel
    (`q1_signs4_unit`, which is `{-1,+1}` — NOT ternary, so the zero state is the
    new bit) + BitNet WGSL prior art.

### Phased plan + effort (expert + AI-assisted)
- **Phase 0 — Spike (2–4 days):** fork framework, strip conv, wire all-attention
  graph, load a Qwen3-4B Q4_0 GGUF, greedy-decode a few tokens, **diff logits vs
  llama.cpp**. Proves the carry-over thesis. Output: working Qwen3-4B. **Gate
  everything on this.**
- **Phase 1 — Qwen3 family at q4/q8 (1–2 wk):** metadata mapping, per-size
  configs, numerical-parity validation, integrate as a `qwen3-webgpu` backend
  (the ~1-hr part). Covers Qwen3-4B + Bonsai ×3 (via Q4_0).
- **Phase 2 — Ternary kernel (1–2 wk):** author `TQ2_0` GEMV, export Bonsai as
  `TQ2_0`, validate. Recovers Bonsai's 1.58-bit edge.

Calendar ~**3–5 weeks** for someone fluent in WGSL + transformer internals.
2–3× longer without forking real source.

### Risks / unknowns (ranked)
1. **Numerical parity is the time sink** — RoPE convention, QK-norm ordering,
   f16 accumulation. Most of Phase 1.
2. **Forkable framework source** — Gemma repo is public; confirm it's clean to
   fork. LFM2 bundle is minified (good kernel *reference*, not ideal to fork).
3. **transformers.js v4 competition** — v4 rewrote its runtime in C++/WebGPU
   (~3–10× over v3) on the ONNX path you already use. Bespoke wins are clearest
   on **Bonsai 1.7B (default)** and **ternary**. Re-confirm the gap before Phase 2.
4. **Bonsai = vanilla Qwen3?** — "Qwen3 backbone" implies yes (ternary only
   changes weight encoding); verify no custom ops before committing.

### Recommended first move
Do **Phase 0 only**, as a throwaway spike; gate the rest on it. Days, not weeks,
to a go/no-go.

---

## 6. Key code references (in the vendored bundles)

`lfm2_5.js` kernel ids (grep `decode-`, `llama-`, `prefill-`):
- Attention/Qwen3-relevant: `llama-attn`, `decode-attention`,
  `decode-flash-attention-split-k`, `decode-flash-attention-merge`,
  `decode-qk-norm`, `decode-qk-norm-rope-cache-kv`, `decode-rope-cache-kv`,
  `decode-rms-norm`, `prefill-attention`, `prefill-rms-norm`.
- MLP / heads: `decode-gate-up`, `decode-gate-up-norm`, `decode-down-proj`,
  `decode-lm-head-q4/q8/q1-argmax-tiled`, `prefill-embed`.
- Quant unpack WGSL fns: `q4_lo`/`q4_hi`/`q4wp` (4-bit), `q8dot` (8-bit),
  `q1_signs4_unit`/`q1_scale`/`q1_weight` (1-bit binary).
- **Drop for Qwen3:** `decode-conv-depthwise`, `decode-conv-in-proj-norm-q4`,
  `decode-conv-in-update`, `llama-conv-proj`, `llama-conv-snapshots`.
- GGUF metadata keys parsed: `general.architecture`, `general.alignment`,
  `lfm2.attention.head_count{,_kv}`, `lfm2.attention.layer_norm_rms_epsilon`,
  `lfm2.block_count`, `lfm2.embedding_length`, `lfm2.feed_forward_length`,
  `lfm2.rope.freq_base`, `lfm2.shortconv.l_cache`, `lfm2.vocab_size`.
  → For Qwen3, map to `qwen3.*` equivalents and drop `shortconv.l_cache`.

ggml type enum in the engine (so you know what dequant already exists):
`F32,F16,Q4_0,Q4_1,Q5_0,Q5_1,Q8_0,Q8_1,Q2_K,Q3_K,Q4_K,Q5_K,Q6_K,Q8_K,…,BF16(30),TQ1_0(34),TQ2_0(35),MXFP4(39),NVFP4(40),…`
(JS dequant implemented for: Q4_0, Q8_0, Q4_K, Q5_K, Q6_K + F16/F32/BF16 copy.)

---

## 7. Desktop resume checklist
1. **Smoke-test** the two shipped engines in Chrome/Edge (see §0). Fix the model
   entry's guessed values if needed: Gemma `~1.5 GB` size + `agentCapable: true`.
2. Decide whether to pursue the **Qwen3 pack** (§5). If yes → run **Phase 0
   spike** first and gate on logit parity.
3. Before Phase 2 (ternary), **benchmark transformers.js v4** on Qwen3-4B /
   Bonsai 1.7B to confirm the bespoke engine still wins enough to justify it.
4. Keep watching `webml-community` for an upstream `qwen3-webgpu-kernels` — if it
   lands, integration is ~1 hour (mirror the LFM2/Gemma worker + entry).

### Sources
- Spaces: `huggingface.co/spaces/webml-community/lfm2-webgpu-kernels`,
  `…/gemma-4-webgpu-kernels`.
- Open source: `github.com/tylerstraub/gemma4-webgpu`,
  `github.com/Beledarian/wgpu-llm`. llama.cpp WebGPU backend (LFM2 + WGSL).
