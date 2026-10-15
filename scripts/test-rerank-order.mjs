// Memory reranker (RERANK-ORDER block, index.html): the shipped ordering code, run on fake scores, and the
// wiring that sends both the memory tools and the per-message auto-injected memory through it.
// Run: node scripts/test-rerank-order.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const src = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const block = /\/\/ RERANK-ORDER[\s\S]*?\/\/ END RERANK-ORDER/.exec(src);
assert.ok(block, 'RERANK-ORDER block missing from index.html');
const { RERANK_MODEL, orderByRerank } = new Function(block[0] + '\nreturn { RERANK_MODEL, orderByRerank };')();

// 1. Model: bge-reranker-v2-m3 (owner decision 2026-10-14).
assert.equal(RERANK_MODEL, 'onnx-community/bge-reranker-v2-m3-ONNX');

// 2. Ordering by fake scores. Candidates arrive in vector order (a, b, c, d).
const cands = ['a', 'b', 'c', 'd'].map((id, i) => ({ id, text: id, score: 0.9 - i * 0.1 }));
assert.deepEqual(orderByRerank(cands, [-9.16, -0.02, -9.74, 3.5], 4).map((c) => c.id), ['d', 'b', 'a', 'c']);
assert.deepEqual(orderByRerank(cands, [-9.16, -0.02, -9.74, 3.5], 2).map((c) => c.id), ['d', 'b'], 'keeps topK');
assert.deepEqual(orderByRerank(cands, [1, 1, 1, 1], 4).map((c) => c.id), ['a', 'b', 'c', 'd'], 'ties keep vector order');
assert.deepEqual(orderByRerank(cands, [NaN, 2, undefined], 4).map((c) => c.id), ['b', 'a', 'c', 'd'], 'a missing or NaN score sorts last');
const out = orderByRerank(cands, [0.5, 0.1, 0.2, 0.3], 1)[0];
assert.equal(out.rerankScore, 0.5);
assert.equal(out.score, 0.9, 'the vector score is kept alongside');
assert.equal(cands[0].rerankScore, undefined, 'inputs are not mutated');

// 3. Wiring: off by default; the memory tools and the auto-inject both go through rankMemory; the worker
//    uses the raw SequenceClassification logit (the text-classification pipeline softmaxes it to 1.0).
assert.match(src, /if \(localStorage\.getItem\('lm_rag_rerank'\) !== '1'\) return searchByVector\(vec, topK, threshold\);/, 'off unless the setting is 1');
assert.match(src, /<input type="checkbox" id="ragRerankToggle">/, 'the toggle is unchecked in the markup');
assert.match(src, /const hits = await rankMemory\(userText, qVec, 12, \{ threshold: 0\.3 \}\);/, 'auto-inject goes through the reranker');
assert.doesNotMatch(src, /await searchByVector\(qVec, 12, 0\.3\)/, 'auto-inject no longer skips it');
assert.match(src, /return rankMemory\(query, vec, topK, \{ pool: Math\.max\(topK \* 4, 20\), rerankThreshold: 0\.2 \}\);/, 'the memory tools go through it');
assert.match(src, /LocalMind\.runtime\.rerank\(query, candidates\.map\(c => c\.text\), RERANK_MODEL\)/);
assert.match(src, /reranker = await AutoModelForSequenceClassification\.from_pretrained\(modelId, \{\s*device: 'wasm',\s*dtype: 'q8',/);
assert.match(src, /scores\.push\(Number\(res\.logits\.data\[0\]\)\);/, 'raw logit, not a pipeline score');
assert.doesNotMatch(src, /ragRerankModelSelect|lm_rag_rerank_model|Xenova\/ms-marco/, 'the MiniLM choice is gone');

console.log('memory reranker: all checks passed');
