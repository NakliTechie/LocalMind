// extract-ternary-bonsai-2-27b.mjs
// Produce LocalMind's vendored `ternary_bonsai_2_27b.js` (exporting `TernaryBonsai2`)
// from the downloaded webml-community/ternary-bonsai-2-webgpu-kernels Space bundle.
//
// House style mirrors scripts/extract-image-worker.mjs: marker-based string
// surgery with hard guard errors if the upstream bundle shape has changed.
// Verification (a real WebGPU generate) happens later in a foreground browser.
//
// The Space bundle is NOT vendored in the repo (it is a ~1.5 MB external app).
// Download it first, then point this script at it:
//   curl -L -o /tmp/bonsai2_index.html \
//     https://huggingface.co/spaces/webml-community/ternary-bonsai-2-webgpu-kernels/raw/main/index.html
//   node scripts/extract-ternary-bonsai-2-27b.mjs /tmp/bonsai2_index.html
// Writes ../ternary_bonsai_2_27b.js next to the other vendored engines.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);

// Upstream's baked-in defaults. prism-ml/Ternary-Bonsai-2-27B-gguf is UNGATED
// (unlike v1's prism-ml/Bonsai-27B-gguf, which forced the lmstudio mirror), so
// the engine's own DEFAULT_MODEL_ID is left alone; the marker is only a guard.
const UPSTREAM_MODEL_ID = 'prism-ml/Ternary-Bonsai-2-27B-gguf';
const UPSTREAM_GGUF_FILE = 'Ternary-Bonsai-2-27B-PTQ1_0.gguf';

// Bundle shape (2026-09-17): TWO `<script type="module">` blocks. The first is the
// three.js-style boot scene (`window.PrismBootReady`); the second is the engine
// library followed by the Space UI (HF-token gate, chat panel, kernels overlay).
const EXPORT_LINE = 'export{Cl as DEFAULT_GGUF_FILE,Ri as DEFAULT_MODEL_ID,zl as TernaryBonsai2,Pm as createAssistantMarkdown,mx as default,Em as formatBytes,jm as initKernelsOverlay};';

export function extractTernaryBonsai2Engine(html) {
  // 1. Find the ONE module block that carries the engine's export{} line.
  const mods = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (mods.length === 0) throw new Error('bonsai2 bundle: no <script type="module"> blocks found');
  const engineMods = mods.filter((m) => m.includes(EXPORT_LINE));
  if (engineMods.length !== 1) {
    throw new Error(`bonsai2 bundle: expected exactly 1 module with the engine export{} line, found ${engineMods.length} (upstream minifier ids may have changed)`);
  }
  const mod = engineMods[0];

  // 2. Split engine-library from Space UI at the export{} line. Everything up to
  //    and including it is the engine; the `const Dm=zl,… gate … chat …` tail is
  //    the demo UI and is dropped. Exported names are kept verbatim
  //    (`TernaryBonsai2` is already the class LocalMind's worker imports).
  const cut = mod.indexOf(EXPORT_LINE) + EXPORT_LINE.length;
  let engine = mod.slice(0, cut);

  // 2b. System-prefix priming must not take the whole turn down. On a fresh
  //     cache the engine renders the LEADING system messages ALONE (no user
  //     turn, add_generation_prompt=false) to snapshot the KV state after the
  //     system prompt. Qwen3.8's chat template refuses that render outright
  //     (`raise_exception('No user query found in messages.')`), so every first
  //     turn that carries a system prompt threw — LocalMind always sends one; the
  //     upstream Space never does, which is why it never hit this. The snapshot is
  //     an optimisation only: on a template error, skip priming (return 0) and
  //     let generate() prefill the full prompt as usual.
  const primeMarker = 'let s=Dh(e);if(s.length===0)return 0;let i=this.#h(s,!1,t),n=this.tokenizer.encode(i,{add_special_tokens:!1}).ids;';
  if (engine.split(primeMarker).length !== 2) {
    throw new Error('bonsai2 bundle: system-prefix priming marker (#m: Dh/#h render) not found exactly once; re-locate before patching');
  }
  engine = engine.replace(
    primeMarker,
    'let s=Dh(e);if(s.length===0)return 0;let i;try{i=this.#h(s,!1,t)}catch{return 0}let n=this.tokenizer.encode(i,{add_special_tokens:!1}).ids;',
  );

  // 2c. More range streams in flight. The engine's parallel download is bounded
  //     by an in-flight byte budget, not by its concurrency cap (32): with the
  //     default 96 MB budget and 24 MB chunks only ~4 ranges stream at once.
  //     Hugging Face's CDN throttles PER CONNECTION (measured 2026-09-18: one
  //     stream 134 KB/s, eight parallel 548 KB/s aggregate), so 4 streams turn a
  //     5.9 GB load into hours. 256 MB → ~10 streams. Cost: up to 256 MB of
  //     in-flight buffers during download only — trivial next to the 6 GB of
  //     weights the same machine is about to hold on the GPU.
  const budgetMarker = 'Y1=24<<20,J1=1<<20,e3=96<<20,t3=32';
  if (engine.split(budgetMarker).length !== 2) {
    throw new Error('bonsai2 bundle: download tuning constants (Y1/J1/e3/t3) marker not found exactly once; re-locate before patching');
  }
  engine = engine.replace(budgetMarker, 'Y1=24<<20,J1=1<<20,e3=256<<20,t3=32');

  // 3. Guard the baked-in defaults so a silent upstream repoint is noticed.
  const idMarker = `var Ri="${UPSTREAM_MODEL_ID}",Cl="${UPSTREAM_GGUF_FILE}"`;
  if (!engine.includes(idMarker)) {
    throw new Error('bonsai2 bundle: DEFAULT_MODEL_ID / DEFAULT_GGUF_FILE marker (var Ri=…,Cl=…) changed; re-locate before vendoring');
  }
  // 4. The engine must not depend on the boot-scene module or the DOM at load time.
  if (engine.includes('PrismBootReady')) throw new Error('bonsai2 bundle: engine slice references PrismBootReady (UI leaked into the engine cut)');
  if (/^import\s/m.test(engine)) throw new Error('bonsai2 bundle: engine slice has a static import (expected a self-contained bundle)');

  return (
    '/* ternary_bonsai_2_27b.js — vendored engine, extracted near-verbatim from the\n' +
    '   webml-community/ternary-bonsai-2-webgpu-kernels HF Space (custom-WGSL Qwen3.8 /\n' +
    '   Ternary Bonsai 2 engine: PRISM_PTQ1_0 + PRISM_PQ2_0 ternary GGUF packings).\n' +
    '   Upstream ships NO explicit license; vendored consistent with LocalMind\'s other\n' +
    '   webml-community engines (lfm2_5.js, gemma-4-e2b.js).\n' +
    '   Boot scene + Space UI (token gate / chat panel) stripped; exports kept verbatim;\n' +
    '   TWO patches: (1) system-prefix priming (#m) returns 0 instead of throwing when the\n' +
    '   chat template refuses a system-only render (Qwen3.8: "No user query found in\n' +
    '   messages."); (2) download byteBudget 96 MB -> 256 MB (~10 range streams in flight\n' +
    '   instead of ~4; HF CDN throttles per connection).\n' +
    `   DEFAULT_MODEL_ID is upstream's own ungated ${UPSTREAM_MODEL_ID} (${UPSTREAM_GGUF_FILE}).\n` +
    '   Model weights are Apache-2.0 (prism-ml Ternary Bonsai 2, Qwen3.8-27B backbone).\n' +
    '   Regenerate with scripts/extract-ternary-bonsai-2-27b.mjs. */\n' +
    engine.trimStart() + '\n'
  );
}

export async function writeTernaryBonsai2Engine(htmlPath) {
  const html = await readFile(htmlPath, 'utf8');
  const source = extractTernaryBonsai2Engine(html);
  await writeFile(new URL('ternary_bonsai_2_27b.js', root), source);
  return source;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const htmlPath = process.argv[2];
  if (!htmlPath) throw new Error('usage: node scripts/extract-ternary-bonsai-2-27b.mjs <bonsai2_index.html>');
  const source = await writeTernaryBonsai2Engine(htmlPath);
  console.log(`Wrote ternary_bonsai_2_27b.js (${source.length} bytes)`);
}
