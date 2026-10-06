// Node proof that every gen mode pauses the chat model through one helper that also updates the header
// (night run 2026-10-06 item 7: the header kept "Warming up…" / "Loading…" while Vision ran).
// Run: node scripts/test-suspend-chat.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const src = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const helper = /function suspendChatModel\(\) \{([\s\S]*?)\n    \}/.exec(src);
assert.ok(helper, 'suspendChatModel missing');
assert.match(helper[1], /lastChatModelKey = activeModelKey/);
assert.match(helper[1], /LocalMind\.runtime\.unload\(\)/);
assert.match(helper[1], /statusText\.textContent = 'Chat model paused'/);
for (const fn of ['ensureImageModel', 'ensureDiffusionModel', 'loadVisionModel', 'loadCloneModel', 'ensureOCRModel']) {
  const body = new RegExp(`function ${fn}\\(\\) \\{[\\s\\S]*?\\n    \\}`).exec(src);
  assert.ok(body, fn); assert.match(body[0], /suspendChatModel\(\);/, `${fn} pauses through the helper`);
}
assert.equal((src.match(/LocalMind\.runtime\.unload\(\); \} catch \{\}\n\s*worker = null; modelReady = false;/g) || []).length, 1, 'only the helper unloads this way');
console.log('suspend chat model: all checks passed');
