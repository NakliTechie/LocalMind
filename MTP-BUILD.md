# MTP draft head for Ternary Bonsai 2 27B: build record

Branch `worktree-agent-ac590fa169b5b3501`. The feature ships behind a Settings toggle that is off by default.

## What it is

- The draft head is ProCreations' MTP block for this model: one Q8_0 decoder layer of 451 MB. It is grafted onto the end of `CaryPalmer/Ternary-Bonsai-2-27B-262k-GGUF` (Apache-2.0, pinned to revision `9f9b92cd…`).
- The app range-reads only the head's bytes and the trunk's 20 KB `output_norm` from that file. It stores them in Cache Storage (`mtp-head-v1`). The trunk download does not change.
- `src/ternary_bonsai_2_mtp.js` holds the code:
  - `MTPHead` is the head forward in WGSL. It runs a Q8_0 matmul for M ≤ 8 rows, RMS norms, per-head q/k norm, NEOX RoPE on 64 dims, causal attention over the head's own KV cache, and the sigmoid gate.
  - `MTPRunner` sits behind the engine's `specDecodeRunner()` seam, the same one DFlash uses. It drafts N tokens and verifies them in one batched pass through the DFlash verify graph. It accepts the longest matching prefix and uses the DFlash checkpoint and rewind to undo rejected rows.
  - After each verify, the runner re-runs the accepted rows with the trunk's own hidden state. That keeps the head's KV cache equal to what llama.cpp `draft-mtp` keeps.
- One engine patch was added (`finalHidden`, in `scripts/bonsai2-dflash-patches.mjs`). It outputs the trunk's last-layer rows.
- Settings → Models has the toggle `lm_mtp` (default off) and a depth control `lm_mtp_depth` (1, 2, 3 or auto). When the toggle is on, MTP replaces DFlash. Like DFlash, it is gated to the 27B model.
- Adaptive depth ("auto"): the runner keeps a running estimate of how often each draft position is accepted. Before each cycle it picks the depth (0, 1 or 2) with the most expected tokens per unit of decode time.
  - The time costs come from step 1: depth 1 costs 1.8 decode steps and depth 2 costs 2.15.
  - Depth 0 decodes 32 tokens plainly through the engine's own decode graph, with 2 steps in flight. A checkpoint undoes any step submitted past an EOS or an abandoned stream. Then it probes again at depth 1.

## Step 1: cost measurement (headless Chrome, M4 Pro, `h/step1.js` harness)

| Measurement | Time |
|---|---:|
| Decode, 1 token | 35.0 ms |
| Verify T=1 | 50.8 ms |
| Verify T=2 | 54.3 ms |
| Verify T=3 | 61.7 ms |
| Verify T=5 | 82.9 ms |
| Checkpoint capture | 1.7 ms |
| Restore + rewind | 7 ms |
| Q8_0 matmul over all head weights, M=1 | 2.0 ms |
| Same, M=3 | 3.7 ms |
| Shared lm_head + argmax, 1 row | 1.8 ms |

The projection from these costs was 1.04x (chat) and 1.09x (code) at depth 1, and 1.09x and 1.21x at depth 2. That was a gain, so I went ahead with the build.

## Gate: identical output

- Harness (`gate1.json`): code, prose and story prompts at depths 1, 2 and 3 gave 9 of 9 identical to plain greedy.
- The trunk-hidden self-check (output_norm + lm_head over `mtp.hidden` equals the verify tokens) matched in every row.
- Acceptance matches the llama.cpp probe. On the probe's prose prompt, the head accepted 92/108 drafts here against 92/106 in llama.cpp.
- In-app bench, final run (`bench-mtp-5.json`): 12 of 12 speculative rows were identical to plain. The earlier runs 2, 3 and 4 were also all identical.

## Bench (in-app, `node scripts/bench-engines.mjs --suite mtp`, temperature 0, max 256 tokens, median of runs 2–3)

The machine was shared and swapping (swap 9–16 GB). Plain tok/s moved between 15.7 and 28.6 inside one row. Tokens/cycle and acceptance are deterministic; tok/s is indicative only.

| Prompt | Plain | DFlash 2 | MTP d1 | MTP d2 | MTP auto |
|---|---:|---:|---:|---:|---:|
| code (119 tokens), tok/s | 23.7 | **40.7** | 31.8 | 38.0 | 31.0 (runs 37.6/31.9/30.0) |
| code, tokens/cycle (acceptance) | – | 4.50 | 1.95 (0.98) | 2.79 (0.915) | 2.79 (0.915) |
| prose (256 tokens), tok/s | 17.8 | 17.4 | 20.1 | 24.9 | **26.0** |
| prose, tokens/cycle (acceptance) | – | 3.11 | 1.85 (0.85) | 2.45 (0.735) | 2.45 (0.735) |
| story (96 tokens), tok/s | 19.8 | 20.0 | 21.5 | **26.8** | 23.2 |
| story, tokens/cycle (acceptance) | – | 2.50 | 1.64 (0.66) | 2.11 (0.565) | 2.12 (0.571), 40 plain tokens |

On a quieter stretch (`bench-mtp-4.json`, plain vs auto only):

| Prompt | Plain | MTP auto | Change |
|---|---:|---:|---:|
| code | 24.3 | 34.6 | +42% |
| prose | 23.8 | 30.2 | +27% |
| story | 26.7 | 24.5 | −8% |

Last night's harness run (`gate1.json`) had fixed depth 2 at +38% on code, +20% on prose and a slowdown on the story.

## Not done

- No optimisation pass yet. Two levers are known:
  - Verify T=1 costs 51 ms against 35 ms for decode, so each verify carries about 15 ms of fixed overhead.
  - Draft steps read back the token between head passes. Chaining the argmax into the embed on the GPU would remove that readback.
- The Q8_0 kernel is naive for M ≥ 3 rows.
- Prompt rows beyond the last 1,024 do not feed the head's KV cache, and a prefix imported from the snapshot restarts the head's attention. Both lower acceptance and leave output unchanged.
- I did not run a quiet-machine re-bench. The tok/s numbers above come from a contended box.
- The harness found a silent failure twice: a Chrome profile whose engine IndexedDB chunk cache returned all-zero output ("!!!!") after loading from a local range server. Fresh profiles fixed it. I did not root-cause it.
