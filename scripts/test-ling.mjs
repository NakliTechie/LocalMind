// test-ling.mjs — the parts of ling_moe_ssd.js (rung 2h, Ling 3.0 Flash) that run without a GPU:
//   splitFetch  a Range request over two parts laid end to end, inside one part and across the boundary
//   template    lingChatPrompt against the GGUF template's output for a fixed conversation (checked once against
//               llama-server /apply-template on 2026-10-22: 8 of 8 cases, plan/2026-10-22-ling-harness)
//   node scripts/test-ling.mjs
import assert from 'node:assert/strict';
import { splitFetch, lingChatPrompt, LING_FLASH } from '../src/ling_moe_ssd.js';
import { fileFetch } from '../src/ingest.js';

// splitFetch: two parts of 10 and 7 bytes, served by fileFetch from blobs.
const a = new Uint8Array(10).map((_, i) => i), b = new Uint8Array(7).map((_, i) => 100 + i);
const parts = { A: new Blob([a]), B: new Blob([b]) };
const f = splitFetch(['A', 'B'], [10, 7], (u, i) => fileFetch(parts[u])(u, i));
const get = async (lo, hi) => { const r = await f('split:A', { headers: { Range: `bytes=${lo}-${hi}` } }); return { st: r.status, cr: r.headers.get('content-range'), v: [...new Uint8Array(await r.arrayBuffer())] }; };
assert.deepEqual(await get(2, 5), { st: 206, cr: 'bytes 2-5/17', v: [2, 3, 4, 5] });
assert.deepEqual(await get(8, 12), { st: 206, cr: 'bytes 8-12/17', v: [8, 9, 100, 101, 102] });
assert.deepEqual(await get(11, 99), { st: 206, cr: 'bytes 11-16/17', v: [101, 102, 103, 104, 105, 106] });
assert.deepEqual((await get(0, 16)).v, [...a, ...b]);
await assert.rejects(f('split:A', {}), /only Range requests/);
assert.equal(LING_FLASH.size, LING_FLASH.parts.reduce((n, p) => n + p.size, 0));

// Template: system + a reply with reasoning + a new turn, thinking on and off.
const msgs = [{ role: 'system', content: 'Be concise.' }, { role: 'user', content: 'Q1' }, { role: 'assistant', content: '<think>\nr\n</think>\n\nA1' }, { role: 'user', content: 'Q2' }];
assert.equal(lingChatPrompt(msgs), '<role>SYSTEM</role>Be concise.\ndetailed thinking on<|role_end|><role>HUMAN</role>Q1<|role_end|><role>ASSISTANT</role>\n<think>r</think>A1<|role_end|><role>HUMAN</role>Q2<|role_end|><role>ASSISTANT</role>\n<think>');
assert.equal(lingChatPrompt([{ role: 'user', content: 'Hi' }], { enableThinking: false }), '<role>SYSTEM</role>detailed thinking off<|role_end|><role>HUMAN</role>Hi<|role_end|><role>ASSISTANT</role>\n<think></think>');

console.log('test-ling: all checks passed');
