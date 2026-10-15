// test-mcp-client.mjs — the MCP Streamable HTTP client (MCP-CLIENT block in index.html), run in Node against a
// strict local server written here. The server refuses what the 2025-06-18 spec forbids: a request before
// notifications/initialized, a request without the Mcp-Session-Id it issued, a request without
// MCP-Protocol-Version. It also answers tools/list as an SSE stream with a notification ahead of the reply, and
// can end the session (404) to check that the client starts a new one. The old client failed the first of these.
//
//   node scripts/test-mcp-client.mjs
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const block = /\/\/ MCP-CLIENT-START[\s\S]*?\/\/ MCP-CLIENT-END/.exec(html);
assert.ok(block, 'MCP-CLIENT block missing from index.html');
const C = new Function(`${block[0]}\nreturn { mcpInitialize, mcpRequest, mcpEndSession, mcpToolResult, MCP_PROTOCOL_VERSION };`)();

const log = [];
const state = { sessions: new Map(), next: 1 };   // id → { initialized }
const server = createServer(async (req, res) => {
  let raw = '';
  for await (const c of req) raw += c;
  const sid = req.headers['mcp-session-id'];
  const pv = req.headers['mcp-protocol-version'];
  const auth = req.headers.authorization;
  if (req.method === 'DELETE') { log.push({ m: 'DELETE', sid }); state.sessions.delete(sid); res.writeHead(200).end(); return; }
  const msg = JSON.parse(raw);
  log.push({ m: msg.method, sid, pv, auth });
  const fail = (code, text) => { res.writeHead(code, { 'content-type': 'text/plain' }).end(text); };
  const reply = (result, extra = {}) => { res.writeHead(200, { 'content-type': 'application/json', ...extra }).end(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result })); };
  if (msg.method === 'initialize') {
    if (sid) return fail(400, 'initialize must not carry a session');
    const id = 'sess-' + state.next++;
    state.sessions.set(id, { initialized: false });
    return reply({ protocolVersion: msg.params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: 'strict', version: '1' } }, { 'mcp-session-id': id });
  }
  if (!sid) return fail(400, 'missing Mcp-Session-Id');
  const s = state.sessions.get(sid);
  if (!s) return fail(404, 'session not found');
  if (msg.method === 'notifications/initialized') { if (msg.id !== undefined) return fail(400, 'a notification has no id'); s.initialized = true; res.writeHead(202).end(); return; }
  if (!s.initialized) return fail(400, 'not initialized');
  if (pv !== '2025-06-18') return fail(400, 'missing or wrong MCP-Protocol-Version: ' + pv);
  if (msg.method === 'tools/list') {
    res.writeHead(200, { 'content-type': 'text/event-stream' });
    res.write('event: message\ndata: ' + JSON.stringify({ jsonrpc: '2.0', method: 'notifications/message', params: { level: 'info', data: 'hello' } }) + '\n\n');
    res.end('event: message\ndata: ' + JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { tools: [{ name: 'add', description: 'Add two numbers', inputSchema: { type: 'object', properties: { a: { type: 'number' }, b: { type: 'number' } } } }] } }) + '\n\n');
    return;
  }
  if (msg.method === 'tools/call') {
    if (msg.params.name !== 'add') return reply({ content: [{ type: 'text', text: 'no such tool' }], isError: true });
    return reply({ content: [{ type: 'text', text: String(msg.params.arguments.a + msg.params.arguments.b) }] });
  }
  fail(400, 'unknown method');
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/mcp`;
let checks = 0;
const eq = (...a) => { assert.equal(...a); checks++; };
const deq = (...a) => { assert.deepEqual(...a); checks++; };

try {
  const session = { url, auth: 'tok', sessionId: null, protocolVersion: null };
  const init = await C.mcpInitialize(session);
  eq(init.serverInfo.name, 'strict');
  eq(session.sessionId, 'sess-1', 'the session id from the initialize reply is kept');
  eq(session.protocolVersion, '2025-06-18');
  deq(log.map((x) => x.m), ['initialize', 'notifications/initialized'], 'handshake order');
  eq(log[0].sid, undefined, 'initialize carries no session id');
  eq(log[1].sid, 'sess-1', 'notifications/initialized carries the session id');

  const list = await C.mcpRequest(session, 'tools/list');
  deq(list.tools.map((t) => t.name), ['add'], 'SSE reply found past a server notification');
  eq(log.at(-1).sid, 'sess-1');
  eq(log.at(-1).pv, '2025-06-18');
  eq(log.at(-1).auth, 'Bearer tok');

  eq(C.mcpToolResult(await C.mcpRequest(session, 'tools/call', { name: 'add', arguments: { a: 2, b: 40 } })), '42');
  deq(C.mcpToolResult(await C.mcpRequest(session, 'tools/call', { name: 'nope', arguments: {} })), { error: 'no such tool' });

  // The server ends the session: the next call gets 404, so the client re-initializes and retries once.
  state.sessions.delete('sess-1');
  const n = log.length;
  eq(C.mcpToolResult(await C.mcpRequest(session, 'tools/call', { name: 'add', arguments: { a: 1, b: 1 } })), '2');
  deq(log.slice(n).map((x) => x.m), ['tools/call', 'initialize', 'notifications/initialized', 'tools/call'], 'new session after a 404');
  eq(session.sessionId, 'sess-2');
  eq(log.at(-1).sid, 'sess-2');

  // Other HTTP errors are not retried.
  await assert.rejects(C.mcpRequest({ url, auth: '', sessionId: null, protocolVersion: null }, 'tools/list'), /HTTP 400/); checks++;

  C.mcpEndSession(session);
  for (let i = 0; i < 50 && !log.some((x) => x.m === 'DELETE'); i++) await new Promise((r) => setTimeout(r, 10));
  deq(log.filter((x) => x.m === 'DELETE').map((x) => x.sid), ['sess-2'], 'DELETE ends the session');
} finally {
  server.close();
}
assert.match(html, /const \{ names, session \} = await mcpConnectServer\(url, auth\);/); checks++;
assert.match(html, /mcpEndSession\(__mcpServers\[idx\]\.session\);/); checks++;
console.log(`mcp client: ${checks} checks passed against a strict Streamable HTTP server`);
