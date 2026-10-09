import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { extractImageWorkerSource } from './extract-image-worker.mjs';

const source = await readFile(new URL('../src/inference-worker.js', import.meta.url), 'utf8');
const onnxSource = await readFile(new URL('../host/onnx-inference-worker.js', import.meta.url), 'utf8');
const imageSource = await readFile(new URL('../host/image-inference-worker.js', import.meta.url), 'utf8');
const indexSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const protocol = await readFile(new URL('../docs/INFERENCE-PROTOCOL.md', import.meta.url), 'utf8');
await import(new URL('../host/host-model-catalog.js', import.meta.url));
const catalog = globalThis.LocalMindHostCatalog;

assert.match(source, /localmind\.inference\.v1/);
assert.match(source, /new URL\('\.\/lfm2_5\.js', import\.meta\.url\)/);
assert.match(source, /type: 'ready'/);
assert.match(source, /type: 'token'/);
assert.match(source, /type: 'complete'/);
assert.match(source, /type: 'error'/);
assert.match(source, /request\.type === 'stop'/);
assert.match(source, /request\.type === 'unload'/);
assert.match(source, /config\.reset === true/);
assert.match(protocol, /Only one generation can be active/);
assert.match(onnxSource, /localmind\.inference\.v1/);
assert.match(onnxSource, /@huggingface\/transformers@4\.2\.0/);
assert.match(onnxSource, /Gemma4ForConditionalGeneration/);
assert.match(onnxSource, /Qwen3_5ForConditionalGeneration/);
assert.match(onnxSource, /AutoModelForCausalLM/);
assert.match(onnxSource, /request\.type === 'unload'/);
assert.doesNotMatch(onnxSource, /transformers@4\/\+esm/);
assert.match(indexSource, /Qwen3_5ForConditionalGeneration/);
assert.doesNotMatch(indexSource, /transformers@4\/\+esm/);
// Ternary Bonsai 2 27B: the worker block, its engine file, and the registry entry agree.
const bonsai2Engine = await readFile(new URL('../src/ternary_bonsai_2_27b.js', import.meta.url), 'utf8');
assert.match(bonsai2Engine, /export\{[^}]*zl as TernaryBonsai2[^}]*\}/);
assert.match(bonsai2Engine, /var Ri="prism-ml\/Ternary-Bonsai-2-27B-gguf",Cl="Ternary-Bonsai-2-27B-PTQ1_0\.gguf"/);
// System-prefix priming survives Qwen3.8's "No user query found" template: on a refused system-only
// render the prefix is the token prefix two renders with different user turns share.
assert.match(bonsai2Engine, /let n;try\{n=this\.tokenizer\.encode\(this\.#h\(s,!1,t\),\{add_special_tokens:!1\}\)\.ids\}catch\{try\{let x=this\.tokenizer\.encode\(this\.#h\(\[\.\.\.s,\{role:"user",content:"hello"\}\],!1,t\)/);
assert.match(bonsai2Engine, /for\(;k<x\.length&&k<y\.length&&x\[k\]===y\[k\];\)\+\+k;n=x\.slice\(0,k\)\}catch\{return 0\}\}if\(n\.length===0\|\|n\.length>=r\.length\)return 0;for\(let o=0;o<n\.length;\+\+o\)if\(n\[o\]!==r\[o\]\)return 0;/);
assert.match(indexSource, /id="ternaryBonsai2WebgpuWorkerSrc"/);
// Image mode: its caption must not read like the Diffuse mode's ("On-device diffusion"), and both
// server-engine failure sites name Chrome's local-network permission as a possible cause.
assert.doesNotMatch(indexSource, /activeMode === 'image' \? \([^\n]*On-device diffusion/);
assert.match(indexSource, /No image server at ' \+ imageServerBase\(\) \+ [^\n]*endpointErrorMessage\(e, imageServerBase\(\)\)/);
assert.match(indexSource, /const emsg = isImageServer\(\) \? endpointErrorMessage\(e, imageServerBase\(\)\)/);
assert.match(indexSource, /async function syncImageEngineUi\(\) \{[^]*?if \(activeMode === 'image'\) refreshModeUI\(\);\s*if \(!server\) return;/);
// ...and leaving the server engine clears its readiness line (it kept saying "No image server").
assert.match(indexSource, /const leaving = [^\n]*\n[^]*?if \(!server && imageStepsWasServer\) \{\s*imageProgressFill\.style\.width = '0%';\s*imageProgressText\.textContent = imageIdleText\(\);/);
assert.match(indexSource, /moduleUrl\('ternary_bonsai_2_27b\.js'\)/);
assert.match(indexSource, /\(\{ TernaryBonsai2 \} = await import\(ENGINE_URL\)\)/);
assert.match(indexSource, /id: 'prism-ml\/Ternary-Bonsai-2-27B-gguf',\s*label: 'Ternary Bonsai 2 27B',\s*backend: 'bonsai2-webgpu'/);
assert.doesNotMatch(indexSource, /bonsai_27b\.js|Bonsai27bMobile|bonsai27b-webgpu/);
// DFlash 2 speculative decoding: the engine carries the seam + internals hook (scripts/bonsai2-dflash-patches.mjs),
// the vendored runner module exports DFlashRunner, and the worker attaches it after `ready` behind the Settings toggle.
{
  assert.match(bonsai2Engine, /specDecodeRunner\(\)\{return this\.dflashRunner\?\?null\}/);
  assert.match(bonsai2Engine, /zl\.__dflashInternals=\{/);
  assert.match(bonsai2Engine, /Lf\.set\("com\.xenova\.Lut2SmallMGemm"/);
  assert.match(bonsai2Engine, /class \$RewindSession\{/);
  assert.match(bonsai2Engine, /function lh\(e,t,r,\$v\)\{/);
  const dflashModule = await readFile(new URL('../src/ternary_bonsai_2_dflash.js', import.meta.url), 'utf8');
  // Every engine internal the runner reaches for (I.x) is exported by the hook. A stale engine
  // once lacked r2, so release() threw inside its try and leaked the checkpoint slot's buffers.
  const internals = new Set([...(/zl\.__dflashInternals=\{([\s\S]*?)\};/.exec(bonsai2Engine)[1]).matchAll(/get ([\w$]+)\(\)/g)].map((m) => m[1]));
  const reached = new Set([...dflashModule.matchAll(/\bI\.([\w$]+)/g)].map((m) => m[1]));
  assert.ok(reached.has('r2') && reached.size >= 10, 'runner internals scan found ' + [...reached]);
  for (const name of reached) assert.ok(internals.has(name), `runner uses I.${name}, the engine's __dflashInternals does not export it`);
  assert.match(dflashModule, /^export \{ DFlashRunner, Drafter, CFG \};$/m);
  assert.match(dflashModule, /async \*generate\(tokenIds, cache, generationArgs, beginDecode, eosTokenId\)/);
  assert.match(dflashModule, /release\(cache\)/);
  assert.doesNotMatch(dflashModule, /^import\s/m);
  assert.match(indexSource, /moduleUrl\('ternary_bonsai_2_dflash\.js'\)/);
  assert.match(indexSource, /const DRAFTER_URL = 'https:\/\/huggingface\.co\/naklitechie\/Qwen3\.8-27B-DFlash2-ternary-bonsai2\/resolve\/main\/Qwen3\.8-27B-DFlash2-r3-Q4_K_M\.gguf'/);
  assert.match(indexSource, /post\(\{ type: 'ready', backend: 'webgpu' \}\);\s*if \(d\.dflash !== false\) attachDFlash\(\)/);
  assert.match(indexSource, /target\.model\.dflashRunner = runner;/);
  assert.match(indexSource, /id="dflashToggle"/);
  assert.match(indexSource, /dflash: isBonsai2Webgpu \? dflashEnabled\(\) : false/);
  assert.match(indexSource, /data\.type === 'dflash'/);
}
// Picker ↔ registry parity: every <option> in #modelSelect has a MODELS entry and vice versa.
{
  const select = /<select[^>]*\bid="modelSelect"[^>]*>([\s\S]*?)<\/select>/.exec(indexSource);
  assert.ok(select, '#modelSelect missing');
  const options = [...select[1].matchAll(/<option value="([^"]+)"/g)].map((m) => m[1]);
  const registry = indexSource.slice(indexSource.indexOf('const MODELS = {'));
  const keys = [...registry.slice(0, registry.indexOf('\n    };')).matchAll(/^      '([^']+)': \{/gm)].map((m) => m[1]);
  assert.deepEqual([...options].sort(), [...keys].sort(), 'picker options and MODELS registry keys must match');
  assert.equal(options.length, 15);
}
// window.localmind.load() sets the select before loading, so the composer's picker names the loaded model.
assert.match(indexSource, /function loadModelViaApi\(idOrKey\) \{[^]*?try \{ modelSelect\.value = key; \} catch \{\}\s*loadModel\(key\);/);
// SSD-streamed MoE engines (rungs 2b, 2c): one worker source (#moeSsdWorkerSrc) serves both; the factory
// injects the engine file, its export and its display name. The source must parse once filled in.
{
  assert.match(indexSource, /'gemma4-26b-a4b-ssd': \{\s*id: 'google\/gemma-4-26B-A4B-it-qat-q4_0-gguf',[^]*?backend: 'gemma4moe-ssd'/);
  assert.match(indexSource, /'qwen36-35b-a3b-ssd': \{\s*id: 'unsloth\/Qwen3\.6-35B-A3B-GGUF',[^]*?backend: 'qwen35moe-ssd'/);
  assert.match(indexSource, /'gemma4moe-ssd': \{ engine: 'gemma4_moe_ssd\.js', exportName: 'Gemma4MoeSsd'/);
  assert.match(indexSource, /'qwen35moe-ssd': \{ engine: 'qwen35_moe_ssd\.js', exportName: 'Qwen35MoeSsd'/);
  // Dense qwen35 from an IQ-mix GGUF (Underdog Saluki 27B) rides the same worker and on-disk store.
  assert.match(indexSource, /'underdog-saluki-27b': \{\s*id: 'ConwayResearch\/Underdog-Saluki-27B-1\.0',[^]*?backend: 'qwen35dense'/);
  assert.match(indexSource, /'qwen35dense': \{ engine: 'qwen35_dense\.js', exportName: 'Qwen35Dense'/);
  assert.match(indexSource, /'qwen35dense': \['on disk \(OPFS\)'\]/);
  assert.match(indexSource, /: moeSsd \? createMoeSsdWorker\(moeSsd\)/);
  const src = /<script type="text\/worker" id="moeSsdWorkerSrc">([\s\S]*?)<\/script>/.exec(indexSource);
  assert.ok(src, '#moeSsdWorkerSrc missing');
  const filled = src[1].replaceAll('__MOE_SSD_ENGINE_URL__', 'https://x/gemma4_moe_ssd.js').replaceAll('__MOE_SSD_EXPORT__', 'Gemma4MoeSsd').replaceAll('__MOE_SSD_LABEL__', 'Gemma 4 26B-A4B (Q4_0)');
  assert.doesNotMatch(filled, /__MOE_SSD_/);
  new Function(`let hfToken = null; const engineFetch = fetch;\n${filled}`);   // parses, or throws SyntaxError
  for (const [file, cls] of [['gemma4_moe_ssd.js', 'Gemma4MoeSsd'], ['qwen35_moe_ssd.js', 'Qwen35MoeSsd'], ['qwen35_dense.js', 'Qwen35Dense']]) {
    assert.match(await readFile(new URL(`../src/${file}`, import.meta.url), 'utf8'), new RegExp(`export class ${cls} extends Qwen3MoeSsd`));
  }
}
// Gemma 4 E2B WebGPU kernels (restored 2026-09-24): the engine file is generated by
// scripts/build-gemma-4-e2b.mjs from the pinned upstream webml-community Space build (its sha256 is
// pinned in that script) plus the PLE-from-OPFS patches. After a rebuild, update the second pin.
// Wired to its factory, and NOT on the retired-cache sweep.
{
  const { createHash } = await import('node:crypto');
  const build = await readFile(new URL('./build-gemma-4-e2b.mjs', import.meta.url), 'utf8');
  assert.match(build, /UPSTREAM_SHA256 = '0234c0e866bfaa9623e938a7cfa7f5740cca22532cc1112dd4e8915b97f78d62'/);
  const engine = await readFile(new URL('../src/gemma-4-e2b.js', import.meta.url));
  assert.equal(createHash('sha256').update(engine).digest('hex'), '84540424d55384146e0dd695d303f0d84090809606f6ee77c0d5e44b40609d23', 'gemma-4-e2b.js differs from the last build: rerun scripts/build-gemma-4-e2b.mjs and update this pin');
  assert.match(indexSource, /moduleUrl\('ple-opfs\.js'\)/);
  assert.match(indexSource, /'gemma4-e2b-webgpu': \{\s*id: 'google\/gemma-4-E2B-it-qat-mobile-transformers',[^]*?backend: 'gemma4-webgpu'/);
  assert.match(indexSource, /: isGemma4Webgpu \? createGemma4WebgpuWorker\(\)/);
  assert.match(indexSource, /moduleUrl\('gemma-4-e2b\.js'\)/);
  const retired = indexSource.slice(indexSource.indexOf('const RETIRED_MODEL_REPOS = ['), indexSource.indexOf('];', indexSource.indexOf('const RETIRED_MODEL_REPOS = [')));
  assert.doesNotMatch(retired, /gemma-4-E2B-it-qat-mobile-transformers/, 'a live model must not be swept as retired');
  assert.match(indexSource, /'gemma4-e4b-webgpu': \{\s*id: 'google\/gemma-4-E4B-it-qat-mobile-transformers',[^]*?backend: 'gemma4-webgpu'/);
  assert.doesNotMatch(retired, /gemma-4-E4B-it-qat-mobile-transformers/, 'a live model must not be swept as retired');
}
// Retired-repo list drives the boot cache sweep: it must never name a live registry model.
{
  const retiredSrc = /const RETIRED_MODEL_REPOS = \[([\s\S]*?)\];/.exec(indexSource);
  assert.ok(retiredSrc, 'RETIRED_MODEL_REPOS missing');
  const retired = [...retiredSrc[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const registry = indexSource.slice(indexSource.indexOf('const MODELS = {'));
  const liveIds = [...registry.slice(0, registry.indexOf('\n    };')).matchAll(/^\s+id: '([^']+)'/gm)].map((m) => m[1]);
  const liveRepos = liveIds.map((id) => (/^https?:/.test(id) ? (/huggingface\.co\/([^/]+\/[^/]+)\//.exec(id) || [])[1] || id : id));
  for (const repo of retired) assert.ok(!liveRepos.includes(repo), `retired repo still in the registry: ${repo}`);
  for (const repo of ['onnx-community/Ternary-Bonsai-1.7B-ONNX', 'onnx-community/Ternary-Bonsai-8B-ONNX', 'LiquidAI/LFM2.5-230M-ONNX',
    'onnx-community/LFM2-8B-A1B-ONNX', 'HuggingFaceTB/SmolLM3-3B-ONNX', 'onnx-community/gemma-3-1b-it-ONNX-GQA',
    'bartowski/SmolLM2-360M-Instruct-GGUF', 'Qwen/Qwen2.5-1.5B-Instruct-GGUF',
    'lmstudio-community/Bonsai-27B-GGUF']) assert.ok(retired.includes(repo), `retired list lacks ${repo}`);
  assert.match(indexSource, /^\s+sweepRetiredModelCaches\(\);/m);
  // A retired repo the user re-adds as a custom model is live again: its cache is neither swept at
  // boot nor tagged "retired" (2026-10-02, LFM2.5-230M-ONNX lost 404 MB on every reload). Run the
  // registry helpers against a fake MODELS, then pin that the inventory uses them and that the
  // boot sweep runs after custom models are restored from storage.
  const helpersSrc = indexSource.slice(indexSource.indexOf('    function repoOfUrl(url) {'), indexSource.indexOf('    const fmtBytes = '));
  const helpers = (models) => new Function('MODELS', 'RETIRED_MODEL_REPOS', helpersSrc + '\nreturn { isRetiredRepo };')(models, retired);
  const lfm = 'LiquidAI/LFM2.5-230M-ONNX', smol = 'bartowski/SmolLM2-360M-Instruct-GGUF';
  assert.equal(helpers({}).isRetiredRepo(lfm), true);
  assert.equal(helpers({ [lfm]: { id: lfm, label: 'LFM2.5-230M-ONNX (custom)', custom: true } }).isRetiredRepo(lfm), false, 're-added custom ONNX repo swept as retired');
  const ggufUrl = `https://huggingface.co/${smol}/resolve/main/SmolLM2-360M-Instruct-Q8_0.gguf`;
  assert.equal(helpers({ [ggufUrl]: { id: ggufUrl, label: 'SmolLM2 · GGUF (custom)', backend: 'wllama', custom: true } }).isRetiredRepo(smol), false, 're-added custom GGUF URL swept as retired');
  assert.equal(helpers({ [lfm]: { id: lfm, custom: true } }).isRetiredRepo(smol), true);
  assert.equal(helpers({}).isRetiredRepo('prism-ml/Ternary-Bonsai-2-27B-gguf'), false);
  assert.match(indexSource, /retired: isRetiredRepo\(repo\),/);
  assert.match(indexSource, /const retired = \[\.\.\.groups\.values\(\)\]\.filter\(g => g\.retired\);/);
  const restoreAt = indexSource.indexOf('for (const m of loadCustomModelsFromStorage()) {');
  const sweepAt = indexSource.search(/^\s+sweepRetiredModelCaches\(\);/m);
  assert.ok(restoreAt > -1 && sweepAt > restoreAt, 'the boot sweep must run after custom models are restored');
  // scripts/bench-engines.mjs registers every custom baseline (from ROWS, not the suite-filtered rows) on
  // every row. Its LFM2.5-230M-ONNX baseline is retired, so a row that dropped it let that boot's sweep
  // delete the cache, and every bench run downloaded it again.
  const bench = await readFile(new URL('./bench-engines.mjs', import.meta.url), 'utf8');
  assert.ok(retired.includes(/const LFM230_ONNX = \{ id: '([^']+)'/.exec(bench)[1]), 'bench 230M ONNX baseline is no longer retired; revisit this check');
  assert.match(bench, /const CUSTOM_MODELS = \[\.\.\.new Map\(ROWS\.filter\(\(r\) => r\.custom\)\.map\(\(r\) => \[r\.custom\.id, r\.custom\]\)\)\.values\(\)\];/);
  assert.match(bench, /localStorage\.setItem\('lm_custom_models', \$\{JSON\.stringify\(JSON\.stringify\(CUSTOM_MODELS\)\)\}\);/);
  assert.doesNotMatch(bench, /lm_custom_models', \$\{JSON\.stringify\(JSON\.stringify\(\[row\.custom\]\)\)\}|removeItem\('lm_custom_models'\)/);
  // Every row runs under the no-progress watchdog (2026-10-02: a frozen worker held a bench run for two days):
  // the row races the watchdog, an abandoned row is aborted at its next page call, the next row gets a fresh
  // tab, and a CDP error (the page navigated away mid-await) throws instead of reading as a successful step.
  assert.match(bench, /const ROW_TIMEOUT_MS = Number\(opt\('row-timeout', 20\)\) \* 60000;/);
  assert.match(bench, /results\.push\(await runRowWatched\(cdp, row\)\)/);
  assert.doesNotMatch(bench, /await runRow\(cdp, row\)/);
  assert.match(bench, /return await Promise\.race\(\[work, stalled\]\);\s*\} catch \(err\) \{\s*ctl\.abort\(err\);/);
  assert.match(bench, /log\(`\$\{row\.model\} · \$\{row\.engine\}: ERROR \$\{err\.message\}`\);\s*cdp = await freshTab\(cdp\);/);
  assert.match(bench, /async function freshTab\(old\) \{\s*const tab = await \(await fetch\(`\$\{cdpBase\}\/json\/new\?about:blank`, \{ method: 'PUT' \}\)\)\.json\(\);[^]*?\/json\/close\/\$\{old\.targetId\}[^]*?return connect\(tab\);/);
  // Chrome 154 may serve DevTools on [::1] only: connect() probes both loopback addresses.
  assert.match(bench, /for \(const host of \['127\.0\.0\.1', '\[::1\]'\]\)/);
  assert.match(bench, /const ev = async \(expression\) => \{ ctx\.signal\.throwIfAborted\(\); const v = await cdp\.ev\(expression\); ctx\.signal\.throwIfAborted\(\); return v; \};/);
  assert.equal((bench.slice(bench.indexOf('async function runRow('), bench.indexOf('async function runRowWatched(')).match(/\bcdp\.ev\(/g) || []).length, 1, 'runRow must reach the page only through its guarded ev');
  assert.match(bench, /if \(r\.error\) throw new Error\(r\.error\.message\);/);
}
assert.equal(catalog.defaultKey, 'lfm2-230m-webgpu');
assert.deepEqual(
  catalog.models.map((model) => model.key),
  ['lfm2-230m-webgpu', 'gemma4-e2b', 'gemma4-e4b', 'qwen35-4b'],
);
const qwen35 = catalog.get('qwen35-4b');
assert.equal(qwen35.id, 'onnx-community/Qwen3.5-4B-ONNX-OPT');
assert.equal(qwen35.modelType, 'multimodal');
assert.equal(qwen35.modelClass, 'qwen3_5');
assert.ok(catalog.models.every((model) => model.worker));
assert.equal(catalog.defaultImageKey, 'flux2-klein-4b-webgpu');
assert.deepEqual(
  catalog.imageModels.map((model) => model.key),
  ['flux2-klein-4b-webgpu'],
);
assert.equal(
  imageSource,
  extractImageWorkerSource(indexSource),
  'the published image worker must be regenerated from LocalMind index.html',
);
assert.match(imageSource, /localmind\.image\.v1/);
assert.match(imageSource, /prism-ml\/bonsai-image-ternary-4B-mlx-2bit/);
assert.match(imageSource, /type: 'progress'/);
assert.match(imageSource, /type: 'image'/);
assert.match(protocol, /Image protocol/);

// Image Steps is per engine: the in-tab turbo models want ~4, a server flow model ~20.
// The outgoing value must be read BEFORE `max` is lowered — a range input clamps its
// value the moment max shrinks, so reading after would remember the clamp, not the choice.
assert.match(indexSource, /const imageStepsByEngine = \{ tab: 4, server: 20 \};/);
const stepsSync = indexSource.slice(indexSource.indexOf('async function syncImageEngineUi'));
const leavingAt = stepsSync.indexOf('const leaving = parseInt(imageStepsInput.value');
const maxAt = stepsSync.indexOf('imageStepsInput.max = server ? 50 : 20;');
assert.ok(leavingAt > -1 && maxAt > -1, 'syncImageEngineUi must keep per-engine step counts');
assert.ok(leavingAt < maxAt, 'the outgoing Steps value must be read before imageStepsInput.max is lowered');

// The DFlash drafter is downloaded on purpose but is not a picker entry, so the
// model-cache list needs an explicit label for it. Pin the key to DRAFTER_URL:
// the row is grouped by the repo `repoOfUrl` extracts, so the two must agree.
const drafterUrl = indexSource.match(/const DRAFTER_URL = '([^']+)'/);
assert.ok(drafterUrl, 'DRAFTER_URL must be declared in the Bonsai 2 worker');
const drafterRepo = drafterUrl[1].match(/huggingface\.co\/([^/]+\/[^/]+)/)[1];
assert.match(
  indexSource,
  new RegExp(`COMPONENT_CACHE_LABELS = \\{\\s*'${drafterRepo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}':`),
  'COMPONENT_CACHE_LABELS must name the repo DRAFTER_URL points at',
);

// Bonsai 2's prefix snapshot (~390 MB in IndexedDB, the engine's own store name) is listed in the Bonsai 2 row,
// and its Delete clears the stores: deleteDatabase never settles while the engine holds a connection.
assert.match(bonsai2Engine, /var Uy="webgpu-prefix-snapshots",qm="prefix-snapshot-slot"/);
assert.match(indexSource, /if \(dbNames\.includes\('webgpu-prefix-snapshots'\)\) \{[^]*?get\('prefix-snapshot-slot'\)[^]*?add\('prism-ml\/Ternary-Bonsai-2-27B-gguf', 'prefix snapshot', bytes, async \(\) => \{\s*for \(const s of stores\) await idbReq\(db\.transaction\(s, 'readwrite'\)\.objectStore\(s\)\.clear\(\)\);/);
assert.match(indexSource, /id: 'prism-ml\/Ternary-Bonsai-2-27B-gguf',/);

// Sidebar navigation (Chunk L layer 1): every item drives an element that exists, the modes it
// lists have a matching chip, and the shell exposes nav + main landmarks.
{
  const nav = /<nav class="app-nav" id="appNav" aria-label="Main">([\s\S]*?)<\/nav>/.exec(indexSource);
  assert.ok(nav, 'sidebar nav missing');
  const targets = [...indexSource.matchAll(/data-click="([\w]+)"/g)].map((m) => m[1]);
  assert.ok(targets.length >= 12, 'nav targets: ' + targets);
  for (const id of targets) assert.match(indexSource, new RegExp(`id="${id}"`), `nav item drives #${id}, which does not exist`);
  for (const mode of ['image', 'voice', 'compare', 'batch', 'diffuse', 'ocr', 'vision', 'clone']) {
    assert.match(nav[1], new RegExp(`data-mode="${mode}"`), `nav lacks the ${mode} mode`);
    assert.match(indexSource, new RegExp(`activeMode === '${mode}'`), `no ${mode} mode in refreshModeUI`);
  }
  assert.match(indexSource, /class="card" role="main"/);
  assert.match(indexSource, /\.mode-chip\.moved:not\(\.active\) \{ display: none; \}/);
}

// Image screen (Chunk L layer 6): Image mode marks the body, wide screens swap the chat for the
// controls | preview workspace, every result reaches the preview, and a model becoming ready
// does not overwrite a mode's placeholder.
{
  assert.match(indexSource, /document\.body\.classList\.toggle\('image-mode', activeMode === 'image'\);/);
  assert.match(indexSource, /@media \(min-width: 900px\) \{\s*body\.image-mode #chatArea \{ display: none; \}/);
  assert.match(indexSource, /imageGallery\.appendChild\(thumb\);\s*showImagePreview\(shown\);/);
  const keeps = indexSource.split("if (activeMode !== 'chat') refreshModeUI();   // keep the mode's placeholder").length - 1;
  assert.equal(keeps, 3, 'each model-ready path keeps the active mode placeholder');
}

// Dark theme + contrast (Chunk L layer 6, UX review A1): the dark block redefines every colour token
// the light :root defines, no text is set in the decorative --gray-400, the accent as text uses
// --accent-text, and the stored theme is applied in <head> before first paint.
{
  const root = /:root \{([\s\S]*?)\n    \}/.exec(indexSource)[1];
  const tokens = [...root.matchAll(/(--[\w-]+):/g)].map((m) => m[1]).filter((n) => n !== '--indigo-focus-ring' || true);
  const dark = /:root\[data-theme="dark"\] \{([\s\S]*?)\n    \}/.exec(indexSource)[1];
  for (const tok of tokens) assert.ok(dark.includes(tok + ':'), `dark theme does not set ${tok}`);
  assert.doesNotMatch(indexSource, /(?<![-\w])color: ?var\(--gray-400\)/, 'text set in the decorative --gray-400');
  assert.doesNotMatch(indexSource, /(?<![-\w])color: ?var\(--indigo-(?:500|600)\)/, 'accent text must use --accent-text');
  assert.match(indexSource, /@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-theme="light"\]\) \{/);
  assert.ok(indexSource.indexOf("localStorage.getItem('lm_theme')") < indexSource.indexOf('<style>'), 'theme must apply before the stylesheet');
}

// Command manifest (Chunk L layer 5, hard rule 6): every sidebar item is backed by a COMMANDS
// entry that drives the same element, the palette and window.localmind.commands read the same
// list, and agent:false guards the destructive / gesture-only commands.
{
  const manifest = /const STATIC_COMMANDS = \[([\s\S]*?)\n    \];/.exec(indexSource);
  assert.ok(manifest, 'STATIC_COMMANDS missing');
  const nav = /<nav class="app-nav" id="appNav" aria-label="Main">([\s\S]*?)<\/nav>/.exec(indexSource)[1];
  for (const id of [...nav.matchAll(/data-click="(\w+)"/g)].map((m) => m[1])) {
    const drives = manifest[1].includes(`${id}.click()`) || manifest[1].includes(`'${id}')`);
    assert.ok(drives, `sidebar item #${id} has no COMMANDS entry`);
  }
  assert.match(manifest[1], /id: 'settings\.models'/, 'the sidebar Models item has no command');
  // Library: the sidebar item has a command, search reads message text, and Recents links to it.
  assert.match(nav, /<button type="button" data-library>Library<\/button>/);
  assert.match(manifest[1], /id: 'library\.chats'[^\n]*openLibrary\('chats'\)/, 'the sidebar Library item has no command');
  assert.match(indexSource, /const body = \(conv\.messages \|\| \[\]\)\.map\(messageText\)\.join/);
  assert.match(indexSource, /more\.addEventListener\('click', \(\) => openLibrary\('chats'\)\);/);
  for (const id of ['chat.clear', 'chat.share', 'folder.ingest']) {
    assert.match(manifest[1], new RegExp(`id: '${id.replace('.', '\\.')}'[^\\n]*agent: false`), `${id} must be agent:false`);
  }
  assert.match(indexSource, /commands: Object\.freeze\(\{\s*list\(\) \{\s*return commandList\(\)/);
  assert.match(indexSource, /runCommand\(String\(id\), \{ fromAgent: true \}\)/);
  assert.match(indexSource, /const hits = commandList\(\)\.filter/);
}

// Empty state + load failure (Chunk L layer 4): every path that marks a load failed also shows
// the cause with Retry / Choose another model; the welcome has no mascot and no stale "Pick a
// … model" copy; Things to Try moved out of About into the empty chat.
{
  const failures = indexSource.split("statusBadge.className = 'status-badge error';").length - 1;
  const handled = indexSource.split('showLoadError(').length - 1 - 1; // minus the definition
  assert.ok(failures >= 3, 'load-failure paths: ' + failures);
  for (const marker of ["statusText.textContent = 'Worker error';", "statusText.textContent = 'Error';", "statusText.textContent = 'Gemini Nano unavailable';"]) {
    const at = indexSource.indexOf(marker);
    assert.ok(at > 0, marker);
    assert.match(indexSource.slice(at, at + 400), /showLoadError\(/, `no showLoadError after ${marker}`);
  }
  assert.ok(handled >= 3);
  assert.match(indexSource, /try \{ hideLoadError\(\); \} catch \{\}/);
  const welcome = /<div class="welcome" id="welcomeMsg">([\s\S]*?)<p class="mobile-tip"/.exec(indexSource)[1];
  assert.doesNotMatch(welcome, /&#129504;|Pick a Ternary Bonsai/);
  assert.match(welcome, /id="welcomeStatus" role="status"/);
  assert.ok((welcome.match(/class="try-prompt"/g) || []).length >= 4);
  assert.doesNotMatch(indexSource, /data-tab="try"/);
}

// Settings + models (Chunk L layer 3): sections are reached by deep link, never a blocking
// confirm(); the tab row leads the panel; the model descriptions live once, in Settings →
// Models, and name every model in the picker.
{
  assert.doesNotMatch(indexSource, /confirm\([^)]*Settings/, 'a confirm() still sends the user to Settings');
  assert.match(indexSource, /function needsSearchOrConfigure\(what\) \{\s*if \(isSearchConfigured\(\)\) return true;\s*openSettings\('tools', 'searchSettingsSection'\);/);
  assert.match(indexSource, /<div class="settings-panel" id="settingsPanel">\s*<div class="settings-tabs" id="settingsTabs"/);
  assert.equal(indexSource.split('About each model').length, 2);
  const docs = /<details class="model-docs">([\s\S]*?)<\/details>/.exec(indexSource)[1];
  const documented = new Set([...docs.matchAll(/<strong>([^<]+)<\/strong> \(/g)].map((m) => m[1].replace(/&middot;/g, '·')));
  const registry = indexSource.slice(indexSource.indexOf('const MODELS = {'), indexSource.indexOf('\n    };', indexSource.indexOf('const MODELS = {')));
  const labels = [...registry.matchAll(/^\s{8}label: '([^']+)'/gm)].map((m) => m[1]);
  assert.ok(labels.length >= 11, 'registry labels: ' + labels);
  for (const label of labels) assert.ok(documented.has(label), `Settings → Models does not describe ${label}`);
}

// Model picker (Chunk L layer 2): the hidden select stays the source of truth, every in-tab
// engine in the roster has a cache store to check, and the inventory tracks bytes per store.
{
  assert.match(indexSource, /modelSelect\.value = value;\s*modelSelect\.dispatchEvent\(new Event\('change', \{ bubbles: true \}\)\);/);
  const stores = /const ENGINE_STORES = \{([\s\S]*?)\};/.exec(indexSource);
  assert.ok(stores, 'ENGINE_STORES missing');
  const backends = new Set([...indexSource.matchAll(/^\s{8}backend: '([\w-]+)',/gm)].map((m) => m[1]));
  assert.ok(backends.size >= 5, 'roster backends: ' + [...backends]);
  for (const b of backends) {
    if (b === 'chrome-ai' || b === 'endpoint') continue;
    assert.match(stores[1], new RegExp(`'${b}':`), `engine ${b} has no cache store in ENGINE_STORES`);
  }
  assert.match(indexSource, /g\.byStore\[store\] = \(g\.byStore\[store\] \|\| 0\) \+ \(bytes \|\| 0\);/);
  assert.match(indexSource, /<button type="button" class="model-select model-picker-btn" id="modelPickerBtn" aria-haspopup="listbox"/);
}

console.log('LocalMind inference workers and host catalog: ok');
