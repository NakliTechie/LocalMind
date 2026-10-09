// test-rollin.mjs — LocalMind ships as one file. Checks that index.html carries every src/ module byte for byte,
// that the page fetches no sibling .js file, and that the page's own rewriteModuleImports() links the module graph:
// every module is rebuilt as a data: URL the way moduleUrl() builds blob URLs, then imported in Node.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readModules, rollIn } from './roll-in.mjs';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const modules = await readModules();
const names = new Set(modules.map((m) => m.file));

// 1. The page is what roll-in.mjs would write: every module present and unchanged, none extra.
assert.equal(rollIn(html, modules), html, 'index.html is out of date with src/; run `node scripts/roll-in.mjs`');
const blocks = [...html.matchAll(/<script type="text\/plain" data-module="([^"]+)">([\s\S]*?)<\/script>/g)];
assert.deepEqual(blocks.map((b) => b[1]).sort(), [...names].sort(), 'one block per src/ module');
for (const [, file, code] of blocks) assert.equal(code, modules.find((m) => m.file === file).code, `${file} differs from src/`);

// 2. Nothing outside the rolled-in blocks loads a same-origin script file by URL.
const page = html.replace(/<script type="text\/plain" data-module="[^"]+">[\s\S]*?<\/script>/g, '');
for (const file of names) {
  assert.doesNotMatch(page, new RegExp(`new URL\\(['"]\\.?/?${file.replace(/[.]/g, '\\.')}['"]`), `index.html still builds a URL for ${file}`);
}
assert.doesNotMatch(page, /<script[^>]+src=["'](?!https?:)[^"']+\.m?js["']/, 'index.html loads a local script file');

// 3. The page's rewriteModuleImports(), run on every module: each relative import names a rolled-in module,
//    and the linked graph imports and exports what the workers expect.
const fn = /\/\* rewriteModuleImports:start \*\/([\s\S]*?)\/\* rewriteModuleImports:end \*\//.exec(html);
assert.ok(fn, 'rewriteModuleImports() markers missing from index.html');
const rewriteModuleImports = new Function(`${fn[1]}; return rewriteModuleImports;`)();
const urls = new Map();
const dataUrl = (file) => {
  assert.ok(names.has(file), `a module imports ./${file}, which is not in src/`);
  if (!urls.has(file)) {
    urls.set(file, null);
    const code = rewriteModuleImports(modules.find((m) => m.file === file).code, dataUrl);
    urls.set(file, `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  }
  assert.ok(urls.get(file), `import cycle through ${file}`);
  return urls.get(file);
};
for (const { file, code } of modules) {
  const out = rewriteModuleImports(code, dataUrl);
  assert.doesNotMatch(out, /(\bfrom\s*|\bimport\s*\(?\s*)['"]\.\.?\//, `${file}: a relative import survived the rewrite`);
  assert.doesNotMatch(out, /new URL\(['"]\.\.?\/[^'"]+['"]\s*,\s*import\.meta\.url\)/, `${file}: a relative new URL() survived the rewrite`);
}
// The SSD engines and the PLE module import their dependencies at load; prove those links resolve in a real loader.
const expect = { 'gemma4_moe_ssd.js': 'Gemma4MoeSsd', 'qwen35_moe_ssd.js': 'Qwen35MoeSsd', 'qwen3_moe_ssd.js': 'Qwen3MoeSsd', 'qwen35_dense.js': 'Qwen35Dense', 'ple-opfs.js': 'createGemmaPle' };
for (const [file, name] of Object.entries(expect)) {
  const mod = await import(dataUrl(file));
  assert.equal(typeof mod[name], 'function', `${file} does not export ${name} once rolled in`);
}
// inference-worker.js reaches lfm2_5.js through new URL('./lfm2_5.js', import.meta.url).
assert.match(rewriteModuleImports(modules.find((m) => m.file === 'inference-worker.js').code, dataUrl), /new URL\('data:text\/javascript;base64,/);

console.log(`single file: ok — ${modules.length} modules rolled in, graph linked, ${(Buffer.byteLength(html) / 1e6).toFixed(2)} MB`);
