// Node proof of the local-endpoint backend's settings + streaming contract.
// The functions under test are sliced out of index.html verbatim and loaded as
// a module with stubs for the DOM / localStorage / chat-UI globals they touch:
//   1. per-endpoint temperature: stored value → registerEndpointModel genConfig
//      → the /chat/completions request body; clamp + default; presets.
//   2. local-network-access hint: a fetch TypeError against a loopback /
//      private host names Chrome's permission in both error paths; an HTTP
//      status, a non-TypeError, or a public host does not.
//   3. tool-call text passthrough: raw <tool_call>…</tool_call> text streamed
//      from an endpoint (dflash serve with its tool parser off), split across
//      SSE deltas AND across reader chunks mid-line, is accumulated by
//      generateViaEndpoint and parsed by _adapterParseToolCalls — the same
//      parse-after-completion seam runtime.chat uses for in-browser models.
// Run: node scripts/test-endpoint.mjs
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const indexSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');

const slice = (startMarker, endMarker) => {
  const a = indexSource.indexOf(startMarker);
  assert.ok(a !== -1, `marker missing: ${startMarker}`);
  const b = indexSource.indexOf(endMarker, a);
  assert.ok(b !== -1, `marker missing: ${endMarker}`);
  return indexSource.slice(a, b);
};
const endpointBlock = slice('    function normalizeEndpointBase(input) {', '    function clearEndpointModels() {');
const adapterBlock = slice('    function _adapterRepairJSON(str) {', '    function _adapterFormatToolResultMessage(');
const sinkBlock = slice('    let endpointAbort = null;', '    // ── Chrome built-in AI');
const streamBlock = slice('    async function generateViaEndpoint(chatMessages, genConfig) {', '    function generateOnce(chatMessages, attData, enableThinking, genConfig) {');

// Static wiring facts (source-level).
assert.match(indexSource, /<input type="number" id="endpointTempInput" class="settings-input" min="0" max="2" step="0\.1" value="0\.7"/);
assert.match(indexSource, /0 = greedy\. Required for lossless speculative decoding on dflash serve\./);
assert.match(indexSource, /<select id="endpointPresetSelect"/);
assert.match(indexSource, /genConfig: \{ temperature: getEndpointTemperature\(\), max_new_tokens: 2048, top_p: 1 \}/);
assert.doesNotMatch(endpointBlock, /temperature: 0\.7,/, 'registerEndpointModel must not hard-code 0.7');
assert.match(indexSource, /endpointTempInput\.addEventListener\('change', \(\) => \{ endpointTempInput\.value = String\(setEndpointTemperature\(endpointTempInput\.value\)\); \}\);/);
assert.match(indexSource, /endpointTempInput\.value = String\(getEndpointTemperature\(\)\);/);
// generateOnce routes endpoint models to generateViaEndpoint, and runtime.chat
// parses the resolved full text with _adapterParseToolCalls — same seam for
// every backend, so endpoint content needs no separate tool-call path.
assert.match(indexSource, /if \(LocalMind\.runtime\.isEndpoint && LocalMind\.runtime\.isEndpoint\(\)\) \{\s*return generateViaEndpoint\(chatMessages, genConfig\);/);
assert.match(indexSource, /inferencePromise\.then\(\s*\(fullText\) => \{[\s\S]*?const \{ toolCalls \} = _adapterParseToolCalls\(fullText, knownToolNames, tools\);/);
assert.match(streamBlock, /const msg = endpointErrorMessage\(e, ep\.base\);/);

// Load the sliced functions as one module with worker-shaped stubs.
const dir = await mkdtemp(join(tmpdir(), 'lm-endpoint-'));
const modPath = join(dir, 'endpoint.mjs');
await writeFile(modPath, `
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const MODELS = {};
const modelSelect = { options: [], appendChild(o) { this.options.push(o); } };
globalThis.document = { createElement: () => ({}) };
let currentAssistantText = '';
let currentAssistantEl = null;
let currentInferenceContext = null;
const bubbles = [];
const toasts = [];
function updateAssistantBubble(bubble, text) { bubbles.push(text); }
function showToast(msg) { toasts.push(msg); }
const LocalMind = { runtime: { _ep: null, getEndpoint() { return this._ep; } } };
${endpointBlock}
${adapterBlock}
${sinkBlock}
${streamBlock}
export const harness = {
  MODELS, store, bubbles, toasts, LocalMind,
  setEp(ep) { LocalMind.runtime._ep = ep; },
  setBubble(on) { currentAssistantEl = on ? { bubble: {} } : null; },
  setSink(fn) { currentInferenceContext = fn ? { onToken: fn } : null; },
  reset() { currentAssistantText = ''; bubbles.length = 0; toasts.length = 0; },
  text() { return currentAssistantText; },
};
export { normalizeEndpointBase, discoverEndpointModels, clampEndpointTemperature, getEndpointTemperature,
  setEndpointTemperature, ENDPOINT_PRESETS, isLocalNetworkHost, endpointErrorMessage, LOCAL_NETWORK_HINT,
  registerEndpointModel, generateViaEndpoint, _adapterParseToolCalls };
`);
const mod = await import(pathToFileURL(modPath).href);
const { harness, discoverEndpointModels, clampEndpointTemperature, getEndpointTemperature, setEndpointTemperature,
  ENDPOINT_PRESETS, isLocalNetworkHost, endpointErrorMessage, LOCAL_NETWORK_HINT, registerEndpointModel,
  generateViaEndpoint, _adapterParseToolCalls } = mod;

// SSE helper: `chunks` is an array of raw byte-strings handed to the reader one
// per read() — a chunk boundary can fall anywhere, including mid-line.
const sseResponse = (chunks) => {
  const enc = new TextEncoder();
  let i = 0;
  const body = new ReadableStream({
    pull(controller) {
      if (i < chunks.length) controller.enqueue(enc.encode(chunks[i++]));
      else controller.close();
    },
  });
  return new Response(body, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
};
const sseLine = (content) => `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n`;

const requests = [];
let fetchImpl = async () => new Response('', { status: 404 });
globalThis.fetch = async (url, init = {}) => { requests.push({ url: String(url), init }); return fetchImpl(url, init); };
const reset = () => { requests.length = 0; harness.reset(); for (const k of Object.keys(harness.MODELS)) delete harness.MODELS[k]; harness.store.clear(); };

// ── 1. Temperature ─────────────────────────────────────────────
{
  reset();
  // Default when nothing is stored.
  assert.equal(getEndpointTemperature(), 0.7);
  const idDefault = registerEndpointModel('http://localhost:11434/v1', 'llama3');
  assert.equal(harness.MODELS[idDefault].genConfig.temperature, 0.7);
  assert.deepEqual(harness.MODELS[idDefault].genConfig, { temperature: 0.7, max_new_tokens: 2048, top_p: 1 });
  // Stored 0 (greedy) flows into a fresh registration.
  harness.store.set('lm_endpoint_temp', '0');
  assert.equal(getEndpointTemperature(), 0);
  const id0 = registerEndpointModel('http://127.0.0.1:8790/v1', 'ternary-bonsai-2');
  assert.equal(harness.MODELS[id0].genConfig.temperature, 0);
  // Clamp + garbage.
  assert.equal(clampEndpointTemperature('5'), 2);
  assert.equal(clampEndpointTemperature(-1), 0);
  assert.equal(clampEndpointTemperature('abc'), 0.7);
  harness.store.set('lm_endpoint_temp', 'abc');
  assert.equal(getEndpointTemperature(), 0.7);
  // setEndpointTemperature persists and re-applies to models already registered.
  assert.equal(setEndpointTemperature('0.3'), 0.3);
  assert.equal(harness.store.get('lm_endpoint_temp'), '0.3');
  assert.equal(harness.MODELS[idDefault].genConfig.temperature, 0.3);
  assert.equal(harness.MODELS[id0].genConfig.temperature, 0.3);
  // …and the stored value reaches the wire: the request body carries genConfig.temperature.
  setEndpointTemperature(0);
  harness.setEp({ base: 'http://127.0.0.1:8790/v1', model: 'ternary-bonsai-2' });
  fetchImpl = async () => sseResponse([sseLine('ok'), 'data: [DONE]\n']);
  const out = await generateViaEndpoint([{ role: 'user', content: 'hi' }], harness.MODELS[id0].genConfig);
  assert.equal(out, 'ok');
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'http://127.0.0.1:8790/v1/chat/completions');
  const body = JSON.parse(requests[0].init.body);
  assert.equal(body.temperature, 0);
  assert.equal(body.max_tokens, 2048);
  assert.equal(body.top_p, 1);
  assert.equal(body.stream, true);
  assert.equal(body.model, 'ternary-bonsai-2');
  console.log('endpoint temperature: stored value → genConfig → request body: ok');
}

// ── 4. Preset ──────────────────────────────────────────────────
{
  const dflash = ENDPOINT_PRESETS.find((p) => p.label === 'Ternary Bonsai 2 — fast (Mac, dflash serve)');
  assert.ok(dflash, 'dflash preset missing');
  assert.equal(dflash.base, 'http://127.0.0.1:8790/v1');
  assert.equal(dflash.temperature, 0);
  assert.deepEqual(ENDPOINT_PRESETS.map((p) => p.label), ['Ollama', 'LM Studio', 'llama.cpp', 'Atomic Chat', 'Ternary Bonsai 2 — fast (Mac, dflash serve)']);
  for (const p of ENDPOINT_PRESETS) assert.match(p.base, /^http:\/\/(localhost|127\.0\.0\.1):\d+\/v1$/);
  console.log('endpoint preset: dflash serve entry fills base + temperature 0: ok');
}

// ── 2. Local-network-access hint ───────────────────────────────
{
  for (const h of ['http://127.0.0.1:8790/v1', 'http://localhost:11434/v1', 'http://[::1]:8080/v1', 'http://10.0.0.5:1234/v1',
    'http://192.168.1.20:8080/v1', 'http://172.16.4.4/v1', 'http://studio.local:1234/v1', 'http://app.localhost/v1']) {
    assert.equal(isLocalNetworkHost(h), true, h);
  }
  for (const h of ['https://api.example.com/v1', 'http://172.32.0.1/v1', 'http://8.8.8.8/v1', 'not a url', '']) {
    assert.equal(isLocalNetworkHost(h), false, h);
  }
  const net = new TypeError('Failed to fetch');
  assert.equal(endpointErrorMessage(net, 'http://127.0.0.1:8790/v1'), 'Failed to fetch. ' + LOCAL_NETWORK_HINT);
  assert.equal(endpointErrorMessage(net, 'https://api.example.com/v1'), 'Failed to fetch');
  assert.equal(endpointErrorMessage(new Error('endpoint HTTP 500'), 'http://127.0.0.1:8790/v1'), 'endpoint HTTP 500');
  assert.match(LOCAL_NETWORK_HINT, /local network access/i);
  assert.match(LOCAL_NETWORK_HINT, /Allow/);

  // Discovery path: both probes reject with a TypeError on a loopback host → hint.
  reset();
  fetchImpl = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(discoverEndpointModels('http://127.0.0.1:8790/v1'), (e) => e.message.includes(LOCAL_NETWORK_HINT));
  await assert.rejects(discoverEndpointModels('https://api.example.com/v1'), (e) => !e.message.includes(LOCAL_NETWORK_HINT));
  // HTTP status (server up, nothing found) on a loopback host → no hint.
  fetchImpl = async () => new Response('{}', { status: 404 });
  await assert.rejects(discoverEndpointModels('http://127.0.0.1:8790/v1'), (e) => !e.message.includes(LOCAL_NETWORK_HINT) && /No models found/.test(e.message));

  // Streaming path: network TypeError → hint in the bubble; HTTP status → plain error.
  reset();
  harness.setEp({ base: 'http://127.0.0.1:8790/v1', model: 'm' });
  harness.setBubble(true);
  fetchImpl = async () => { throw new TypeError('Failed to fetch'); };
  await generateViaEndpoint([{ role: 'user', content: 'hi' }], { temperature: 0 });
  assert.ok(harness.text().includes(LOCAL_NETWORK_HINT), 'bubble carries the hint');
  assert.ok(harness.bubbles.at(-1).includes(LOCAL_NETWORK_HINT));
  harness.reset();
  fetchImpl = async () => new Response('boom', { status: 500 });
  await generateViaEndpoint([{ role: 'user', content: 'hi' }], { temperature: 0 });
  assert.ok(harness.text().includes('*Error: endpoint HTTP 500: boom*'));
  assert.ok(!harness.text().includes(LOCAL_NETWORK_HINT), 'HTTP status is not a network error');
  harness.reset();
  harness.setEp({ base: 'https://api.example.com/v1', model: 'm' });
  fetchImpl = async () => { throw new TypeError('Failed to fetch'); };
  await generateViaEndpoint([{ role: 'user', content: 'hi' }], { temperature: 0 });
  assert.equal(harness.text(), '\n\n*Error: Failed to fetch*', 'non-local host unchanged');
  // No bubble → toast path.
  harness.reset(); harness.setBubble(false);
  harness.setEp({ base: 'http://localhost:11434/v1', model: 'm' });
  await generateViaEndpoint([{ role: 'user', content: 'hi' }], { temperature: 0 });
  assert.equal(harness.toasts.length, 1);
  assert.ok(harness.toasts[0].includes(LOCAL_NETWORK_HINT));
  console.log('endpoint local-network-access hint: discovery + streaming paths: ok');
}

// ── 3. Tool-call text passthrough ──────────────────────────────
{
  const tools = [{ name: 'calculator', description: 'math', parameters: { type: 'object', properties: { expression: { type: 'string' } } } }];
  const known = tools.map((t) => t.name);
  reset();
  harness.setEp({ base: 'http://127.0.0.1:8790/v1', model: 'ternary-bonsai-2' });
  harness.setBubble(true);
  const tokens = [];
  harness.setSink((t) => tokens.push(t));
  // The JSON is split across SEVEN deltas, and two of the SSE lines are
  // further split across reader chunks mid-line (chunk 3/4 and 6/7).
  const deltas = ['Let me compute that.\n', '<tool_call>', '{"name": "calcu', 'lator", "argu', 'ments": {"expression": "2 + 2 * ', '3"}}', '</tool_call>'];
  const lines = deltas.map(sseLine);
  const l3 = lines[3], l6 = lines[6];
  const chunks = [
    lines[0] + lines[1], lines[2], l3.slice(0, 12), l3.slice(12) + lines[4] + lines[5], l6.slice(0, 20), l6.slice(20), 'data: [DONE]\n',
  ];
  fetchImpl = async () => sseResponse(chunks);
  const full = await generateViaEndpoint([{ role: 'user', content: 'what is 2+2*3' }], { temperature: 0 });
  assert.equal(full, deltas.join(''));
  assert.deepEqual(tokens, deltas, 'every delta reached the token sink in order');
  assert.equal(harness.bubbles.length, deltas.length);
  const { toolCalls, cleanText } = _adapterParseToolCalls(full, known, tools);
  assert.deepEqual(toolCalls, [{ name: 'calculator', arguments: { expression: '2 + 2 * 3' } }]);
  assert.equal(cleanText, 'Let me compute that.');

  // Unclosed block (server stopped at EOS before </tool_call>) still parses.
  harness.reset(); tokens.length = 0;
  fetchImpl = async () => sseResponse([sseLine('<tool_call>{"name":"calcul'), sseLine('ator","arguments":{"expression":"1+1"}}'), 'data: [DONE]\n']);
  const partial = await generateViaEndpoint([{ role: 'user', content: '1+1' }], { temperature: 0 });
  assert.deepEqual(_adapterParseToolCalls(partial, known, tools).toolCalls, [{ name: 'calculator', arguments: { expression: '1+1' } }]);

  // Plain prose with no tool call → no phantom calls.
  harness.reset();
  fetchImpl = async () => sseResponse([sseLine('The answer '), sseLine('is 7.'), 'data: [DONE]\n']);
  const prose = await generateViaEndpoint([{ role: 'user', content: 'x' }], { temperature: 0 });
  assert.equal(prose, 'The answer is 7.');
  assert.deepEqual(_adapterParseToolCalls(prose, known, tools).toolCalls, []);
  console.log('endpoint tool-call text passthrough (split deltas, split chunks, unclosed block): ok');
}

console.log('LocalMind endpoint backend: ok');
