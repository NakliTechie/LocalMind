# Can we generalise the custom WebGPU engine? — handoff

> Companion to [`WEBGPU_KERNELS_PLAN.md`](WEBGPU_KERNELS_PLAN.md). That doc is the
> integration record + the Qwen3 build plan. **This doc answers one question:**
> *how generalisable is the engine, really?* — grounded in a direct read of the
> two vendored bundles (`lfm2_5.js`, `gemma-4-e2b.js`), not just their upstream
> descriptions. Written 2026-06-27, after both engines were smoke-tested working
> in-browser and Gemma 4 E2B was made the default.

---

## 0. Verdict (read this first)

- **Yes, generalisable — but to one specific shape: a GGUF-fed, standard
  GQA-transformer engine.** The cleanest next target is a **Qwen3 kernel pack**
  (covers Bonsai 1.7/4/8B + Qwen3-4B). ~90% of the work is already in `lfm2_5.js`.
- **The two shipped engines are NOT one shared library you can extend.** They
  share a framework *design* (same manifest/variant validator, same device
  setup, same pass-graph system) but ship as **two independently-minified
  bundles** with **divergent weight loaders and divergent GPU feature
  requirements**. Only ~4% of 80-char windows are byte-identical between them.
  So "generalise" = **fork one bundle's lineage and re-template it**, not "call a
  shared core with a new config."
- **Fork the LFM2 engine, not Gemma.** LFM2 has the GGUF reader, the quant-bits
  templating axis, and standard `llama-attn` GQA blocks — which *are* Qwen3's
  blocks. Gemma's engine is the wrong base (QAT-only loader, fixed int4, sliding
  window, no GGUF).
- **The one real portability tax:** the LFM2 engine requires the **experimental
  `chromium-experimental-subgroup-matrix`** GPU feature. Anything forked from it
  inherits that. Confirm this is acceptable (or find its fallback) before
  committing — see §5.

---

## 1. What I actually inspected (evidence, not the upstream README)

Direct grep/structural read of the two bundles in this repo:

| Signal | `lfm2_5.js` (669 KB) | `gemma-4-e2b.js` (552 KB) | Reading |
|---|---|---|---|
| Self-label (header) | "LFM2.5-**350M** (Q4_0 GGUF)" | "Gemma-4 E2B (QAT mobile)" | LFM2 bundle is built for the 350M; we point it at the 230M GGUF and it reads dims from metadata. Works, but the bundle isn't 230M-specific. |
| `variantFamilies` / `"variant id must be stable"` / `kernel-author` / `manifest` | present | present | **Same framework design** in both. |
| `requiredFeatures` | `["shader-f16","subgroups","chromium-experimental-subgroup-matrix"]` | `["subgroups"]` | **Divergent GPU reqs.** LFM2 leans on an experimental Chromium feature; Gemma doesn't. |
| `quantBits` axis | **73 refs** | **0 refs** | Quant-bit templating (q4/q8) is **LFM2-only**. Gemma is fixed QAT-int4. |
| Weight loader | `GGUF`=31, `loadGGUF`=4, `qat`=0 | `GGUF`=0, `qat`=79, `safetensors`=11 | **Completely different loaders.** LFM2 eats GGUF; Gemma eats Google's QAT-mobile safetensors. |
| Arch-specific block | `shortconv`=4 | `sliding_window`=4 | Each carries its architecture's special block. |
| Pass graph (`passes`) | 79; `decode-`=88, `prefill-`=20 | 73; `decode-`=22, `prefill-`=0 | Both are pass-graph engines, but the graphs are model-specific. |
| Byte-identical 80-char windows (lfm2→gemma) | — | **~4%** | Shared *design*, **independently minified** → not a shared module. |

---

## 2. The architecture, precisely

Both engines are the same three layers:

1. **Framework** (shared design): a WebGPU runtime that takes a **manifest** of
   **variants**, each variant a list of **passes** (compute dispatches). A
   validator enforces stable variant ids (`"variant id must be stable"`). Device
   setup, pipeline/buffer management, the variant/axis/pass system — identical in
   shape across both. **This is the part that's 100% reusable** — but only by
   *forking source*, because it's minified per-bundle, not extracted.

2. **Weight loader** (model-family-specific): LFM2 → a real **GGUF reader**
   (metadata parse, Q4_0/Q8_0 dequant, ggml-type enum, ranged download +
   CacheStorage). Gemma → a **QAT-mobile safetensors** reader. **These do not
   overlap.** A new architecture inherits whichever loader its base has.

3. **Kernel pack** (model-specific WGSL): the actual passes — RoPE, RMSNorm,
   GQA attention, GEMVs, plus the architecture's special block (`shortconv` for
   LFM2, sliding-window for Gemma). Wired into a layer graph.

**Generalising = swap layer 3 + retarget layer 2's metadata keys, keep layer 1.**

---

## 3. The three seams that decide every "can it run X?"

For any candidate model, ask three questions in order:

1. **Can the loader eat its weights?** — This is the gate the plan doc calls "the
   real gate." LFM2's GGUF reader handles Q4_0/Q8_0/Q4_K/Q5_K/Q6_K + F16/F32/BF16
   copy, and the ggml-type enum already lists `TQ1_0`/`TQ2_0` (ternary) even
   though the JS dequant for those isn't written yet. **If a llama.cpp GGUF
   exists for the model, the loader is ~done.**
2. **Is the block shape already in the kernel pack?** — LFM2's standard block is
   literally named `llama-attn` / `llama-normed` (GQA + per-head QK-norm + RoPE +
   SwiGLU + RMSNorm). **That is Qwen3's block, verbatim.** Drop `shortconv`,
   make every layer attention.
3. **Does it need the experimental GPU feature?** — `chromium-experimental-
   subgroup-matrix`. See §5.

---

## 4. Generalisation verdict, per target

| Target | Loader (seam 1) | Block (seam 2) | Net work | Verdict |
|---|---|---|---|---|
| **Qwen3-4B** | ✅ standard Qwen3 GGUFs exist | ✅ = LFM2 std block, drop conv | metadata key remap `lfm2.*`→`qwen3.*`, RoPE θ=1e6, per-size config | **Do this. The flagship win — it's also the only family with no upstream engine.** |
| **Bonsai 1.7/4/8B (ternary)** | ⚠️ Prism ships ONNX/MLX, not GGUF | ✅ Qwen3 backbone | v1: convert→GGUF Q4_0/Q8_0 (loses 1.58-bit win); v2: export `TQ2_0` + author a ternary GEMV (the one genuinely new kernel) | **v1 free with Qwen3 pack; v2 = the only net-new kernel work.** |
| **LFM2 8B A1B (MoE)** | ✅ GGUF | ❌ MoE routing not in pack | new expert-gather + routing kernels | Deferred — real new work. |
| **Gemma 4 E4B / Gemma 3 1B** | via Gemma engine (QAT) | ✅ Gemma block exists | config + QAT weights availability | Cheap *if* QAT-mobile weights exist; uses the Gemma bundle, not LFM2. |
| **Apertus 4B, Llama 3.2 1B, etc.** | ✅ GGUF | mostly standard | per-arch config | Fine on the Qwen3/LFM2 base once it exists; already fine on wllama today. |

**The mismatch worth repeating:** the two *shipped* engines cover the *smallest*
models; the highest-value family (Qwen3, incl. the would-be default Bonsai 1.7B)
is exactly the one with **no upstream kernel engine**. "Wait for webml-community
to ship it" doesn't cover the hot path.

---

## 5. The real costs / risks (ranked)

1. ~~**Experimental GPU feature.**~~ **RESOLVED (2026-06-27) — not a blocker.**
   Inspected the bundle: of **53 kernel-variant declarations, exactly 1** requires
   `chromium-experimental-subgroup-matrix` (the `subgroup_matrix` matmul fast-path,
   `priority:100`). The other **52** (`scalar`, `tiled`, `vec4_f16`, `vec4_f32`,
   `q4`, `dense`, `q1`…) run on standard WebGPU. The device requests **only the
   features the adapter actually advertises** (`requiredFeatures` is filtered to
   `adapter.features.has(...)`), and the variant selector picks the best *available*
   variant. So the experimental feature **bounds matmul speed, not availability** —
   a forked Qwen3 engine degrades gracefully and runs on any WebGPU browser
   (Chrome/Edge with the flag just gets the faster matmul). De-risks reach
   substantially.
2. **No shared library — and the fork base flips (RESOLVED 2026-06-27).** You
   can't `import` a core; you fork source. Checked both upstreams:
   - **LFM2 Space (`webml-community/lfm2-webgpu-kernels`) ships ONLY the minified
     `lfm2_5.js`** (same bundle we vendor) — no `src/`, no `.wgsl`. So despite
     being the architecturally-right base (GGUF reader, quant axis, `llama-attn`
     GQA blocks), it's a **poor fork base** — reverse-engineering from minified.
   - **Gemma repo [`tylerstraub/gemma4-webgpu`](https://github.com/tylerstraub/gemma4-webgpu)
     is Apache-2.0 readable source**: `src/` (engine + shader registry + variant/
     tuning), `shaders/` (one `.wgsl` per kernel), **`reference/` (PyTorch parity
     generators)**, `docs/`. Moderately Gemma-specific but with documented
     extension points.
   - **Revised recommendation:** fork **the Gemma repo for the framework + kernel
     scaffolding + the PyTorch parity harness**, then graft the **GGUF loader +
     q4/q8 dequant** (reverse-engineered from our `lfm2_5.js` bundle as reference,
     or an off-the-shelf JS GGUF parser) and swap **sliding-window → full-causal
     GQA** with Qwen3 config (RoPE θ=1e6, per-head QK-norm). Qwen3 is *simpler*
     than Gemma (no sliding window) and than LFM2 (no conv), so most of Gemma's
     attention path carries over. The `reference/` harness directly serves the
     logit-parity gate that §3/risk #3 calls the time-sink.
3. **Numerical parity is the time sink** (per the plan doc): RoPE convention,
   QK-norm ordering, f16 accumulation. Budget most of Phase 1 here; gate on
   logit-diff vs llama.cpp.
4. **transformers.js v4 competition.** v4 rewrote its runtime in C++/WebGPU
   (~3–10× over v3) on the ONNX path we already use. The bespoke win is clearest
   on **Bonsai 1.7B** and the **ternary** case; re-benchmark Qwen3-4B before
   investing past Phase 1.

---

## 5b. New requirement — per-family chat-template + tool-format handling

> Added 2026-06-27 after a tool-calling audit of LFM2.5 + Gemma 4. The engine is
> only half the story — the **harness around it must be per-family**, because each
> model family ships a different chat template *and* a different tool-call dialect.
> A generalised engine that assumes one format silently underserves models.

Two concrete traps, both hit in LocalMind and now fixed (commit `71d5965`):

1. **Chat templates break naive Jinja.** LFM2's template wraps the assistant turn
   in `{% generation %}…{% endgeneration %}` (a training-mask no-op); the pinned
   transformers.js Jinja throws `Unknown statement type: generation` → LocalMind
   used to fall back to **bare ChatML**, dropping the model's native BOS *and* its
   tool scaffolding. Fix: strip the `generation` markers and re-apply the model's
   own template. **Qwen3's template has its own quirks** — budget a
   template-compatibility pass per family, don't assume `apply_chat_template` just works.
2. **Tool-call dialects differ.** LFM2 emits `<|tool_call_start|>[ name(arg="v", n=1) ]<|tool_call_end|>`
   (Pythonic kwargs in special tokens); **Qwen3 emits `<tool_call>{"name":…}` JSON**
   (which already matches LocalMind's parser); Gemma is inconsistent. The generalised
   engine's adapter must **carry a per-family tool-format encoder + parser**, not one
   generic XML prompt. (LocalMind now parses LFM2's native format too.)

**Capability caveat (audit result):** even with the harness fixed, **LFM2.5 230M is
an unreliable tool *decider* (~1–2/6, prompt-insensitive)** — it's a good chat / query-
extraction / summarization model, not an agent. Reliable agentic tool-use starts
around **Gemma 4 E2B / Qwen3-4B**, which is itself an argument for the Qwen3 pack:
the Qwen3 family is explicitly tool-tuned and emits clean `<tool_call>` JSON, so it
should clear the bar both engines' small models miss. **Implication for Phase 1:**
include a tool-calling check (not just logit parity) in the Qwen3 validation — clean
`<tool_call>` JSON on a few tool prompts — since tool-use is a primary reason to want
the bigger Qwen3 models on this engine at all.

---

## 6. Recommended path (concrete, gated)

**Phase 0 — throwaway spike (days, not weeks).** Fork **`tylerstraub/gemma4-webgpu`**
(Apache-2.0, readable WGSL — see resolved risk #2), swap **sliding-window → full-
causal GQA** with Qwen3 config, graft a **GGUF loader** (LFM2 bundle as reference),
load a **Qwen3-4B Q4_0 GGUF**, greedy-decode ~20 tokens, and **diff logits against
the repo's `reference/` PyTorch harness (and/or llama.cpp)**. This one
experiment validates the entire 90%-carry-over thesis. *(Risk #1 — the experimental
GPU feature — is already resolved: it's 1 of 53 variants with graceful fallback, so
no Chromium-flag gate. One less thing to spike.)* Add a **tool-calling check** to
the validation too (clean `<tool_call>` JSON on a few tool prompts) per §5b — it's a
primary reason to want Qwen3 on this engine.

Then Phase 1 (Qwen3 family at q4/q8) and Phase 2 (ternary `TQ2_0` GEMV) exactly
as `WEBGPU_KERNELS_PLAN.md` §5 lays out.

**Integration is the cheap half** — you've now done it twice (LFM2, Gemma). A new
engine that speaks the same `load`/`generate(cumulative)`/`reset` contract drops
into a worker factory + a MODELS entry in ~1 hour. The expensive half is the
kernel pack + numerical parity, and that's where Phase 0 buys/kills the bet.

---

## 7. Open questions to resolve before Phase 1

1. ~~Does the LFM2 engine fall back when `chromium-experimental-subgroup-matrix`
   is absent?~~ **RESOLVED — yes, gracefully (1/53 variants need it). See §5 risk #1.**
2. ~~Is the LFM2 engine's source openly forkable?~~ **RESOLVED — no (minified-only
   Space). Fork the Gemma repo instead; LFM2 bundle is the GGUF/quant reference.
   See risk #2.**
3. **Is Bonsai a vanilla Qwen3 backbone** (no custom ops beyond ternary weight
   encoding)? Verify before committing the ternary kernel.
4. **Does transformers.js v4 already close the Qwen3-4B gap** enough that the
   bespoke engine only pays off on Bonsai 1.7B + ternary? Re-benchmark.
