// Greedy reference continuations from a running llama-server, for the qwen3_moe_ssd gate.
// Tokenizes each prompt with the server (special tokens parsed), asks for n greedy tokens with
// the top-5 log-probabilities at each step, and writes JSON the browser harness compares to.
//
//   node scripts/llama-ref.mjs <server-url> <out.json> [n=32] [label]
import { writeFileSync } from 'node:fs';
import { PROMPTS } from './qwen3-moe-prompts.mjs';

const [server = 'http://127.0.0.1:8191', outPath, nStr = '32', label = ''] = process.argv.slice(2);
if (!outPath) { console.error('usage: llama-ref.mjs <server-url> <out.json> [n] [label]'); process.exit(2); }
const n = Number(nStr);
const post = async (path, body) => {
  const r = await fetch(server + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status} ${await r.text()}`);
  return r.json();
};
const props = await (await fetch(server + '/props')).json().catch(() => ({}));
const results = [];
for (const p of PROMPTS) {
  const { tokens } = await post('/tokenize', { content: p.text, add_special: false, parse_special: true });
  const t0 = Date.now();
  // Streamed: the server's final content parser can reject odd text (it does on the truncated
  // test models); the per-token probabilities arrive before that, one SSE event per token.
  const res = await fetch(server + '/completion', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: tokens, n_predict: n, temperature: 0, top_k: 1, samplers: ['top_k'], n_probs: 5,
      cache_prompt: false, ignore_eos: true, stream: true,
    }),
  });
  const probs = [];
  let content = '', buf = '';
  const dec = new TextDecoder();
  for await (const chunk of res.body) {
    buf += dec.decode(chunk, { stream: true });
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line.startsWith('data:')) continue;
      const ev = JSON.parse(line.slice(5));
      if (ev.completion_probabilities) probs.push(...ev.completion_probabilities);
      if (typeof ev.content === 'string') content += ev.content;
    }
  }
  const r = { content };
  results.push({
    name: p.name, text: p.text, ids: tokens,
    gen: probs.map((q) => q.id), content: r.content,
    top: probs.map((q) => q.top_logprobs.map((t) => [t.id, +t.logprob.toFixed(5)])),
    secs: (Date.now() - t0) / 1000,
  });
  console.error(`${p.name}: ${tokens.length} prompt tokens → ${probs.length} generated in ${(Date.now() - t0) / 1000}s: ${JSON.stringify(r.content).slice(0, 80)}`);
}
writeFileSync(outPath, JSON.stringify({ server, label, model: props.model_path || null, n, results }, null, 1));
