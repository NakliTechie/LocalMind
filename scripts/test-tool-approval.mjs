// Node proof of the per-call tool approval gate (TOOL-APPROVAL block, index.html; Open Q#11):
//   1. custom and MCP tools need approval while the gate is on; built-ins never do; "Always" lifts it per tool;
//   2. the gate defaults ON (no stored value) and only the stored 'off' turns it off;
//   3. both agent loops run tools through executeToolWithApproval, and nothing else calls tool.execute.
// The card itself (Allow / Always / Deny, Stop = Deny) is checked in a browser.
// Run: node scripts/test-tool-approval.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const src = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const block = /\/\/ TOOL-APPROVAL[\s\S]*?\/\/ END TOOL-APPROVAL/.exec(src);
assert.ok(block, 'TOOL-APPROVAL block missing from index.html');
const store = new Map();
const localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) };
const api = new Function('localStorage', block[0] + '\nreturn { toolApprovalOn, toolNeedsApproval, toolDeclinedResult, TOOL_APPROVAL_KEY };')(localStorage);

// 1. Which calls wait.
const custom = { _custom: true, _endpoint: 'https://x.example/t' }, mcp = { _mcp: true, _mcpUrl: 'https://m.example' }, builtin = {};
const none = new Set();
assert.equal(api.toolNeedsApproval('my_tool', custom, true, none), true);
assert.equal(api.toolNeedsApproval('mcp_search', mcp, true, none), true);
assert.equal(api.toolNeedsApproval('web_search', builtin, true, none), false, 'built-ins run without a card');
assert.equal(api.toolNeedsApproval('my_tool', custom, false, none), false, 'gate off');
assert.equal(api.toolNeedsApproval('my_tool', custom, true, new Set(['my_tool'])), false, '"Always" for this tool');
assert.equal(api.toolNeedsApproval('other', custom, true, new Set(['my_tool'])), true, '"Always" is per tool');
assert.equal(api.toolNeedsApproval('ghost', undefined, true, none), false, 'unknown tools are handled by the loop');
assert.match(api.toolDeclinedResult('my_tool').error, /declined to run my_tool/);

// 2. Default ON.
assert.equal(api.toolApprovalOn(), true, 'no stored value: on');
store.set(api.TOOL_APPROVAL_KEY, 'off'); assert.equal(api.toolApprovalOn(), false);
store.set(api.TOOL_APPROVAL_KEY, 'on'); assert.equal(api.toolApprovalOn(), true);
assert.match(src, /<input type="checkbox" id="toolApprovalToggle" checked>/);

// 3. One choke point.
assert.equal((src.match(/await executeToolWithApproval\(tc, tool, /g) || []).length, 2, 'both agent loops use the gate');
assert.equal((src.match(/tool\.execute\(/g) || []).length, 1, 'tool.execute is called only inside the gate');
assert.match(src, /if \(!generating\) finish\('deny'\)/, 'Stop while the card is open counts as Deny');
assert.match(src, /if \(iter > 0 && !generating\) \{ finishGeneration\(currentAssistantText \|\| null, allSources, toolsUsedInLoop\); return; \}/, 'and the loop ends without another model turn');

console.log('tool approval: all checks passed');
