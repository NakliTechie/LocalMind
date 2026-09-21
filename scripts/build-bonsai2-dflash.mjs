// build-bonsai2-dflash.mjs
// Produce LocalMind's vendored `ternary_bonsai_2_dflash.js` (exporting `DFlashRunner`
// and the drafter `CFG`) from the NakliTechie/dflash-mlx-bonsai2 checkout's browser
// port: lab/webgpu/drafter/gguf.js (GGUF reader + K-quant layouts), drafter.js (the
// DFlash 2 drafter forward in WGSL) and runner/spec-runner.js (the generate loop
// behind the engine's specDecodeRunner() seam).
//
// The three files are ES modules that only import each other; the bundle is their
// concatenation with the import lines dropped and the `export` keywords stripped,
// plus one export line at the end. Guard errors if the upstream shape changes.
//   node scripts/build-bonsai2-dflash.mjs ~/Code/dflash-mlx-bonsai2
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const PARTS = ['lab/webgpu/drafter/gguf.js', 'lab/webgpu/drafter/drafter.js', 'lab/webgpu/runner/spec-runner.js'];

export async function buildDFlashModule(checkout) {
  const chunks = [];
  for (const rel of PARTS) {
    let src = await readFile(new URL(rel, checkout), 'utf8');
    const imports = src.match(/^import\s.*$/gm) || [];
    for (const line of imports) {
      if (!/from '\.\.?\/(drafter\/)?(gguf|drafter)\.js'/.test(line)) throw new Error(`${rel}: unexpected import: ${line}`);
      src = src.replace(line, '');
    }
    src = src.replace(/^export\s+(?=(async\s+)?(function|class|const|let)\b)/gm, '');
    if (/^export\b/m.test(src)) throw new Error(`${rel}: an export form the bundler does not handle`);
    chunks.push(`// ---- ${rel} ----\n` + src.trim() + '\n');
  }
  let rev = 'unknown';
  try { rev = execFileSync('git', ['-C', fileURLToPath(checkout), 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim(); } catch (_) {}
  return (
    '/* ternary_bonsai_2_dflash.js — DFlash 2 speculative decoding for the vendored Ternary\n' +
    '   Bonsai 2 engine: the block drafter (5 Qwen3 layers, WGSL, weights stay Q4_K/Q6_K on\n' +
    '   the GPU) + the generate loop behind ternary_bonsai_2_27b.js\'s specDecodeRunner()\n' +
    '   seam. Output is greedy-identical to the engine\'s own decode. Built from\n' +
    `   NakliTechie/dflash-mlx-bonsai2 @ ${rev} (Apache-2.0) by scripts/build-bonsai2-dflash.mjs;\n` +
    '   drafter weights: naklitechie/Qwen3.8-27B-DFlash2-ternary-bonsai2 (Q4_K_M GGUF, 1.14 GB). */\n' +
    chunks.join('\n') +
    '\nexport { DFlashRunner, Drafter, CFG };\n'
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2];
  if (!dir) throw new Error('usage: node scripts/build-bonsai2-dflash.mjs <dflash-mlx-bonsai2 checkout>');
  const checkout = new URL(dir.endsWith('/') ? dir : dir + '/', `file://${process.cwd()}/`);
  const source = await buildDFlashModule(checkout);
  await writeFile(new URL('ternary_bonsai_2_dflash.js', root), source);
  console.log(`Wrote ternary_bonsai_2_dflash.js (${source.length} bytes)`);
}
