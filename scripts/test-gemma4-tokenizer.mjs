// GemmaTokenizer (gemma4_moe_ssd.js) against llama.cpp b9830's tokenization of the Gemma 4 vocab:
// every case in gemma4-token-fixtures.json (llama-server /tokenize, plus the 8 gate prompts) must encode to
// the same ids and decode back to its text. Needs the GGUF header (skipped when the file is absent).
//   node scripts/test-gemma4-tokenizer.mjs [path/to/gemma-4-26B_q4_0-it.gguf]
import assert from 'node:assert/strict';
import { openSync, readSync, closeSync, existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { parseGguf } from '../qwen3_moe_ssd.js';
import { GemmaTokenizer } from '../gemma4_moe_ssd.js';

const path = process.argv[2] || `${homedir()}/.cache/localmind-moe/gemma-4-26B_q4_0-it.gguf`;
if (!existsSync(path)) { console.log(`gemma4 tokenizer: skipped (${path} not found)`); process.exit(0); }
const fd = openSync(path, 'r'); const head = new Uint8Array(64 << 20); readSync(fd, head, 0, head.length, 0); closeSync(fd);
const t0 = performance.now();
const tok = new GemmaTokenizer(parseGguf(head).kv);
const buildMs = performance.now() - t0;
const { cases } = JSON.parse(readFileSync(new URL('./gemma4-token-fixtures.json', import.meta.url), 'utf8'));
let n = 0;
for (const c of cases) {
  assert.deepEqual(tok.encode(c.text), c.ids, `encode ${JSON.stringify(c.text).slice(0, 60)}`);
  assert.equal(tok.decode(c.ids), c.text, `decode ${JSON.stringify(c.text).slice(0, 60)}`);
  n++;
}
// '#', '//' and '<?' each exist twice, once with a leading byte-order mark (EF BB BF). Decoded with the BOM kept,
// every token string is distinct and the plain spelling maps to the plain token, as in llama.cpp.
assert.equal(new Set(tok.tokens).size, tok.tokens.length, 'token strings must be distinct');
assert.deepEqual(['#', '//', '<?'].map((t) => tok.ids.get(t)), [236865, 715, 8510]);
assert.equal(tok.decode([135260]), '\uFEFF//');
// Byte fallback: a character outside the vocab becomes its UTF-8 bytes as <0xXX> tokens and decodes back.
const rare = '\u{1D11E}\u{10FFFD}';
assert.equal(tok.decode(tok.encode(rare)), rare);
const long = 'word '.repeat(20000);
const t1 = performance.now(); const ids = tok.encode(long); const encMs = performance.now() - t1;
assert.equal(tok.decode(ids), long);
console.log(`gemma4 tokenizer: ok — ${n} cases identical to llama.cpp; build ${buildMs.toFixed(0)} ms; 100 KB one-line text in ${encMs.toFixed(0)} ms (${ids.length} tokens)`);
