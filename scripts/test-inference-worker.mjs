import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { extractImageWorkerSource } from './extract-image-worker.mjs';

const source = await readFile(new URL('../inference-worker.js', import.meta.url), 'utf8');
const onnxSource = await readFile(new URL('../onnx-inference-worker.js', import.meta.url), 'utf8');
const imageSource = await readFile(new URL('../image-inference-worker.js', import.meta.url), 'utf8');
const indexSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const protocol = await readFile(new URL('../INFERENCE-PROTOCOL.md', import.meta.url), 'utf8');
await import(new URL('../host-model-catalog.js', import.meta.url));
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
const bonsai2Engine = await readFile(new URL('../ternary_bonsai_2_27b.js', import.meta.url), 'utf8');
assert.match(bonsai2Engine, /export\{[^}]*zl as TernaryBonsai2[^}]*\}/);
assert.match(bonsai2Engine, /var Ri="prism-ml\/Ternary-Bonsai-2-27B-gguf",Cl="Ternary-Bonsai-2-27B-PTQ1_0\.gguf"/);
assert.match(indexSource, /id="ternaryBonsai2WebgpuWorkerSrc"/);
// Image mode: its caption must not read like the Diffuse mode's ("On-device diffusion"), and both
// server-engine failure sites name Chrome's local-network permission as a possible cause.
assert.doesNotMatch(indexSource, /activeMode === 'image' \? \([^\n]*On-device diffusion/);
assert.match(indexSource, /No image server at ' \+ imageServerBase\(\) \+ [^\n]*endpointErrorMessage\(e, imageServerBase\(\)\)/);
assert.match(indexSource, /const emsg = isImageServer\(\) \? endpointErrorMessage\(e, imageServerBase\(\)\)/);
assert.match(indexSource, /async function syncImageEngineUi\(\) \{[^]*?if \(activeMode === 'image'\) refreshModeUI\(\);\s*if \(!server\) return;/);
// ...and leaving the server engine clears its readiness line (it kept saying "No image server").
assert.match(indexSource, /const leaving = [^\n]*\n[^]*?if \(!server && imageStepsWasServer\) \{\s*imageProgressFill\.style\.width = '0%';\s*imageProgressText\.textContent = imageIdleText\(\);/);
assert.match(indexSource, /new URL\('ternary_bonsai_2_27b\.js', document\.baseURI\)/);
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
  const dflashModule = await readFile(new URL('../ternary_bonsai_2_dflash.js', import.meta.url), 'utf8');
  assert.match(dflashModule, /^export \{ DFlashRunner, Drafter, CFG \};$/m);
  assert.match(dflashModule, /async \*generate\(tokenIds, cache, generationArgs, beginDecode, eosTokenId\)/);
  assert.match(dflashModule, /release\(cache\)/);
  assert.doesNotMatch(dflashModule, /^import\s/m);
  assert.match(indexSource, /new URL\('ternary_bonsai_2_dflash\.js', document\.baseURI\)/);
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
  assert.equal(options.length, 11);
}
// Gemma 4 E2B WebGPU kernels (restored 2026-09-24): engine file present and byte-identical to the
// upstream webml-community Space build, wired to its factory, and NOT on the retired-cache sweep.
{
  const { createHash } = await import('node:crypto');
  const engine = await readFile(new URL('../gemma-4-e2b.js', import.meta.url));
  assert.equal(createHash('sha256').update(engine).digest('hex'), '0234c0e866bfaa9623e938a7cfa7f5740cca22532cc1112dd4e8915b97f78d62');
  assert.match(indexSource, /'gemma4-e2b-webgpu': \{\s*id: 'google\/gemma-4-E2B-it-qat-mobile-transformers',[^]*?backend: 'gemma4-webgpu'/);
  assert.match(indexSource, /: isGemma4Webgpu \? createGemma4WebgpuWorker\(\)/);
  assert.match(indexSource, /new URL\('gemma-4-e2b\.js', document\.baseURI\)/);
  const retired = indexSource.slice(indexSource.indexOf('const RETIRED_MODEL_REPOS = ['), indexSource.indexOf('];', indexSource.indexOf('const RETIRED_MODEL_REPOS = [')));
  assert.doesNotMatch(retired, /gemma-4-E2B-it-qat-mobile-transformers/, 'a live model must not be swept as retired');
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

console.log('LocalMind inference workers and host catalog: ok');
