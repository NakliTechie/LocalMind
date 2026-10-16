// bonsai2-small-patches.mjs
// Lets the vendored Ternary Bonsai 2 engine (ternary_bonsai_2_27b.js) read PrismML's small siblings, Ternary Bonsai 2
// 2B / 4B / 9B (2026-10-15, Qwen3.5 backbones). Applied by scripts/extract-ternary-bonsai-2-27b.mjs after the DFlash
// patches; marker-guarded (every marker must match once, or the extractor throws and nothing is written).
//
// The small GGUFs use prism.hadamard version 2: no output.weight, the head reuses the rotated token embedding
// (prism.hadamard.tied_output = true). Upstream llama.cpp (src/llama-model.cpp load_hparams_hadamard) treats the
// tied head as a rotated weight named token_embd.weight on the output path. The engine already ties the head to the
// embedding when output.weight is absent (tie_word_embeddings); these patches
//   (a) accept version 2 when tied_output is true (version 1 stays as it was), and
//   (b) list "output.weight" among the rotated weights for a tied head, so the head rotates its input as the
//       27B's separate output.weight does. The existence check runs before (b), so the absent tensor is not looked up.
//   (c), (d) see below.

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function applySmallModelPatches(src) {
  let out = src;
  const replaceOnce = (marker, repl, what) => {
    const n = out.split(marker).length - 1;
    if (n !== 1) throw new Error(`bonsai2 small patch: ${what}: expected 1 match, got ${n}`);
    out = out.replace(new RegExp(esc(marker)), () => repl);
  };
  replaceOnce('t[r+"version"]!==1&&u("unsupported version")',
    't[r+"version"]!==1&&!(t[r+"version"]===2&&t[r+"tied_output"]===!0)&&u("unsupported version")', '(a) version 2 with tied_output');
  replaceOnce('return c!==void 0&&typeof c!="boolean"&&u("invalid gdn_v_grouped"),{blockSize:a,weights:n,',
    'return c!==void 0&&typeof c!="boolean"&&u("invalid gdn_v_grouped"),{blockSize:a,weights:t[r+"tied_output"]===!0&&!e.has("output.weight")?[...n,"output.weight"]:n,', '(b) tied head is rotated');
  // (c) the packed path (headPacked, embedFormat) already builds the tied head from token_embd and keeps the
  //     embedding out of the state dict, so the dense loader skips a tied lm_head it cannot find instead of throwing.
  replaceOnce('if(s.top.embed_tokens===void 0)throw new Error(`${a}: tied lm_head requires embed_tokens to come first in entries`);',
    'if(s.top.embed_tokens===void 0)continue;', '(c) tied head left to the packed path');
  // (d) the same in the streaming loader: embed_tokens is in skipDenseIds (packed path), so the tied lm_head is too.
  replaceOnce('if(I.id==="lm_head"&&m){if(!_.has("embed_tokens"))throw',
    'if(I.id==="lm_head"&&m){if(!_.has("embed_tokens")&&d?.has("embed_tokens"))continue;if(!_.has("embed_tokens"))throw', '(d) streaming loader skips the packed tied head');
  return out;
}
