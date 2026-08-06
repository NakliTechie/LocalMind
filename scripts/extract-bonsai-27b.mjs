// extract-bonsai-27b.mjs
// Produce LocalMind's vendored `bonsai_27b.js` (exporting `Bonsai27bMobile`)
// from the downloaded webml-community/bonsai-webgpu-kernels Space bundle.
//
// House style mirrors scripts/extract-image-worker.mjs: marker-based string
// surgery with hard guard errors if the upstream bundle shape has changed.
// Verification (a real WebGPU generate) happens later in a foreground browser.
//
// The Space bundle is NOT vendored in the repo (it is an ~814 KB external app).
// Download it first, then point this script at it:
//   curl -L -o /tmp/bonsai_index.html \
//     https://huggingface.co/spaces/webml-community/bonsai-webgpu-kernels/raw/main/index.html
//   node scripts/extract-bonsai-27b.mjs /tmp/bonsai_index.html
// Writes ../bonsai_27b.js next to the other vendored engines.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);

// The ungated Apache-2.0 weights mirror to bake in as the null-modelId fallback.
// resolveGGUFUrl(null) -> Rl(DEFAULT_MODEL_ID, {file: DEFAULT_GGUF_FILE, revision:'main'})
//   -> https://huggingface.co/lmstudio-community/Bonsai-27B-GGUF/resolve/main/Bonsai-27B-Q1_0.gguf
const BAKED_REPO = 'lmstudio-community/Bonsai-27B-GGUF';
// DEFAULT_GGUF_FILE (Pw) is already "Bonsai-27B-Q1_0.gguf" — same file name on the mirror; leave it.

export function extractBonsaiEngine(html) {
  // 1. Isolate the inline engine module: the SINGLE `<script type="module">…</script>`.
  const m = html.match(/<script type="module">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('bonsai bundle: <script type="module"> engine module not found');
  const mod = m[1];

  // 2. Split engine-library from Space UI at the SINGLE `export{…}` line.
  //    Everything up to and including the export{} is the engine; the
  //    `const Bonsai27B=di; … BonsaiApp … BonsaiLoader … three.js … marked/katex`
  //    tail is the demo UI and is dropped.
  const exportRe = /export\{di as Bonsai27B,Pw as DEFAULT_GGUF_FILE,Pd as DEFAULT_MODEL_ID,oT as default,Dd as resolveGGUFUrl\}/;
  const exportMatch = mod.match(exportRe);
  if (!exportMatch) throw new Error('bonsai bundle: expected export{} boundary line not found (upstream minifier ids may have changed)');
  const cut = exportMatch.index + exportMatch[0].length;
  let engine = mod.slice(0, cut);

  // 3. Rename the exported class to LocalMind's expected name `Bonsai27bMobile`
  //    (mirrors `Mt as Gemma4Mobile` / `na as Lfm2Mobile`). Keep the rest.
  engine = engine.replace(
    exportRe,
    'export{di as Bonsai27bMobile,Pw as DEFAULT_GGUF_FILE,Pd as DEFAULT_MODEL_ID,oT as default,Dd as resolveGGUFUrl}',
  );

  // 4. Point DEFAULT_MODEL_ID (Pd) at the ungated lmstudio mirror repo.
  //    Unique `var Pd=` declaration inside the engine slice; Pw stays as-is.
  const pdMarker = 'var Pd="prism-ml/Bonsai-27B-gguf",Pw="Bonsai-27B-Q1_0.gguf"';
  if (!engine.includes(pdMarker)) {
    throw new Error('bonsai bundle: DEFAULT_MODEL_ID (var Pd=…) marker changed; re-locate before overriding');
  }
  engine = engine.replace(
    pdMarker,
    `var Pd="${BAKED_REPO}",Pw="Bonsai-27B-Q1_0.gguf"`,
  );

  return (
    '/* bonsai_27b.js — vendored engine, extracted near-verbatim from the\n' +
    '   webml-community/bonsai-webgpu-kernels HF Space (custom-WGSL Qwen3.6 / Bonsai\n' +
    '   1-bit engine). Upstream ships NO explicit license; vendored consistent with\n' +
    "   LocalMind's other webml-community engines (lfm2_5.js, gemma-4-e2b.js).\n" +
    '   Space UI (three.js / marked / katex) stripped; export renamed di->Bonsai27bMobile;\n' +
    '   DEFAULT_MODEL_ID pointed at the ungated lmstudio-community/Bonsai-27B-GGUF mirror.\n' +
    '   Model weights are Apache-2.0 (prism-ml Bonsai, Qwen3.6 backbone).\n' +
    '   Regenerate with scripts/extract-bonsai-27b.mjs. */\n' +
    engine.trimStart() + '\n'
  );
}

export async function writeBonsaiEngine(htmlPath) {
  const html = await readFile(htmlPath, 'utf8');
  const source = extractBonsaiEngine(html);
  await writeFile(new URL('bonsai_27b.js', root), source);
  return source;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const htmlPath = process.argv[2];
  if (!htmlPath) throw new Error('usage: node scripts/extract-bonsai-27b.mjs <bonsai_index.html>');
  const source = await writeBonsaiEngine(htmlPath);
  console.log(`Wrote bonsai_27b.js (${source.length} bytes)`);
}
