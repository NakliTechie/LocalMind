// test-memory-writer.mjs — the memory writer's pure helpers (memoryWriter block in index.html), read out of the
// shipped file: Mem0's prompts rendered byte for byte as Mem0's Python does, JSON parsing of model output (fences,
// prose, reasoning, Python literals, truncation), events → operations, and operations applied to a list.
// Also pins the wiring: the Memory panel button, the Settings switch with its description, the after-reply hook,
// the cancel-before-send hook, and the greedy path for temperature 0 in the Transformers.js worker.
//
//   node scripts/test-memory-writer.mjs
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const fixtures = JSON.parse(await readFile(new URL('./memory-writer-fixtures.json', import.meta.url), 'utf8'));
const block = /\/\* memoryWriter:start \*\/([\s\S]*?)\/\* memoryWriter:end \*\//.exec(html);
assert.ok(block, 'memoryWriter block not found in index.html');
const W = new Function(`${block[1]}; return { pyRepr, stripWriterThinking, formatTurnsForWriter, lastExchange, pendingMessages,
  buildFactExtractionMessages, buildMemoryUpdatePrompt, extractJsonValue, parseExtractedFacts, parseMemoryEvents,
  planMemoryOps, applyMemoryOps, countMemoryOps, isHyMemoryModel, memoryWriterTemplateKwargs, MEMORY_WRITER_CATEGORIES };`)();
let n = 0;
const ok = (name, fn) => { fn(); n++; };

// 1. Prompts: identical to Mem0's Python rendering (scripts/memory-writer-fixtures.json, made from mem0 v1.0.0's
//    prompts.py with its own f-strings).
ok('extraction prompt', () => {
  const [sys, user] = W.buildFactExtractionMessages('user: hi\n', '2026-10-16');
  assert.equal(sys.role, 'system');
  assert.equal(sys.content, fixtures.ext);
  assert.deepEqual(user, { role: 'user', content: 'Input:\nuser: hi\n' });
});
ok('update prompt with memories', () => {
  const p = W.buildMemoryUpdatePrompt([{ id: '0', text: 'Lives in Pune' }, { id: '1', text: "User's dog is named Bruno" }],
    ['Moved from Pune to Delhi', 'Says "hi" a lot']);
  assert.equal(p, fixtures.upd);
});
ok('update prompt, empty memory', () => {
  assert.equal(W.buildMemoryUpdatePrompt([], ['Moved from Pune to Delhi', 'Says "hi" a lot']), fixtures.upd_empty);
});
ok('missing colon after a key', () => {
  const raw = '{\n    "memory" : [\n        {\n            "id" : "2",\n            "text" "Works as a nurse at a children\'s hospital",\n            "event" : "ADD"\n        }\n    ]\n}';
  const ev = W.parseMemoryEvents(raw);
  assert.equal(ev.length, 1);
  assert.equal(ev[0].text, "Works as a nurse at a children's hospital");
  assert.equal(ev[0].event, 'ADD');
});
ok('writer model setting: off by default, Hy-Memory wired to its engine', () => {
  assert.match(html, /return WRITER_MODELS\[k\] \? k : 'chat';/);
  assert.match(html, /<option value="chat">the chat model<\/option>\s*<option value="hy-memory-30b-a3b">Hy-Memory 30B-A3B &middot; tech demo/);
  assert.match(html, /'hy-memory-30b-a3b': \{ label: 'Hy-Memory 30B-A3B', backend: 'hyv3-ssd'/);
  assert.match(html, /'hyv3-ssd': \{ engine: 'hy_v3_moe_ssd\.js', exportName: 'HyV3MoeSsd'/);
  assert.ok(!/value="hy-memory-30b-a3b-ssd"/.test(html), 'Hy-Memory is the writer only, not in the chat picker');
});
ok('python repr', () => {
  assert.equal(W.pyRepr(['a', "it's", 'say "x"', `both ' and "`]), `['a', "it's", 'say "x"', 'both \\' and "']`);
  assert.equal(W.pyRepr({ id: '0', text: 'x\ny' }), "{'id': '0', 'text': 'x\\ny'}");
  assert.equal(W.pyRepr('back\\slash'), "'back\\\\slash'");
});

// 2. Turns: user/assistant text only, reasoning and error notes dropped, newest kept under the cap.
ok('turns', () => {
  const msgs = [
    { role: 'system', content: 'secret' },
    { role: 'user', content: 'I live in Pune.' },
    { role: 'assistant', content: '<think>the user lives in Pune</think>Nice city.' },
    { role: 'tool', content: '{"x":1}' },
    { role: 'user', content: [{ type: 'image' }, { type: 'text', text: 'My dog is Bruno.' }] },
    { role: 'assistant', content: 'Hello\n\n*Error: GPU lost*' },
    { role: 'user', content: '(attachments only)' },
  ];
  assert.equal(W.formatTurnsForWriter(msgs), 'user: I live in Pune.\nassistant: Nice city.\nuser: My dog is Bruno.\nassistant: Hello\n');
  assert.equal(W.formatTurnsForWriter(msgs, 40), 'user: My dog is Bruno.\nassistant: Hello\n');
  assert.deepEqual(W.lastExchange(msgs.slice(0, 3)).map(m => m.role), ['user', 'assistant']);
  assert.deepEqual(W.lastExchange([{ role: 'assistant', content: 'x' }]), []);
  // The prompt's own example shape for models other than Hy-Memory.
  assert.equal(W.formatTurnsForWriter(msgs.slice(1, 3), 12000, 'fewshot'), 'User: I live in Pune.\nAssistant: Nice city.\n');
});
ok('pending messages after a dropped run', () => {
  const a = { role: 'user', content: 'I live in Pune.' }, b = { role: 'assistant', content: 'Nice.' };
  const c = { role: 'user', content: 'I play the violin.' }, d = { role: 'assistant', content: 'Lovely.' };
  const e = { role: 'user', content: 'My name?' }, f = { role: 'assistant', content: 'Asha.' };
  const msgs = [a, b, c, d, e, f];
  // The last finished run read up to b; the run for c/d was dropped, so the next run reads c..f.
  assert.deepEqual(W.pendingMessages(msgs, { msg: b, upto: 2 }), [c, d, e, f]);
  // No mark, or a mark from another chat: the newest exchange only.
  assert.deepEqual(W.pendingMessages(msgs, null), [e, f]);
  assert.deepEqual(W.pendingMessages(msgs, { msg: { role: 'assistant', content: 'other chat' }, upto: 2 }), [e, f]);
  assert.deepEqual(W.pendingMessages([a, b], { msg: d, upto: 4 }), [a, b]);
  assert.deepEqual(W.pendingMessages(msgs, { msg: f, upto: 6 }), []);
});

// 3. Facts: Mem0's shape, the model card's shape, fences, prose, reasoning, Python literals, truncation.
ok('facts parse', () => {
  const F = W.parseExtractedFacts;
  assert.deepEqual(F('{"facts" : ["Name is John", "Is a Software engineer"]}'), ['Name is John', 'Is a Software engineer']);
  assert.deepEqual(F('{"facts": []}'), []);
  assert.deepEqual(F('```json\n{"facts": ["Lives in Pune"]}\n```'), ['Lives in Pune']);
  assert.deepEqual(F('Here are the facts:\n{"facts": ["Lives in Pune"]}\nHope that helps.'), ['Lives in Pune']);
  assert.deepEqual(F('<think>\nI should list {"facts": ["wrong"]}\n</think>\n{"facts": ["Right"]}'), ['Right']);
  assert.deepEqual(F('<think:abc123>x</think:abc123>{"facts": ["Hy tag"]}'), ['Hy tag']);
  assert.deepEqual(F('<think>reasoning that never closes {"facts": ["Kept"]}'), ['Kept']);
  assert.deepEqual(F("{'facts': ['Single quoted', \"It's fine\"]}"), ['Single quoted', "It's fine"]);
  assert.deepEqual(F('{"facts": ["Trailing comma",]}'), ['Trailing comma']);
  assert.deepEqual(F('{"memories": ["Model card shape"]}'), ['Model card shape']);
  assert.deepEqual(F('["Bare list"]'), ['Bare list']);
  assert.deepEqual(F('{"facts": ["Complete one", "Complete two", "Cut off mid'), ['Complete one', 'Complete two']);
  assert.deepEqual(F('{"facts": ["  Lives   in Pune ", "lives in pune", "", 42, "Has a dog"]}'), ['Lives in Pune', 'Has a dog']);
  for (const bad of ['', 'no json here', '{"other": 1}', '[1, 2]', null, undefined]) assert.equal(F(bad), null, `facts from ${JSON.stringify(bad)}`);
});

// 4. Events: Mem0's shape, bare list, case, truncation, junk entries.
ok('events parse', () => {
  const E = W.parseMemoryEvents;
  const full = '{"memory": [{"id": "0", "text": "Lives in Delhi", "event": "UPDATE", "old_memory": "Lives in Pune"}, {"id": "1", "text": "Has a dog", "event": "NONE"}]}';
  assert.deepEqual(E(full), [
    { id: '0', text: 'Lives in Delhi', event: 'UPDATE', old_memory: 'Lives in Pune' },
    { id: '1', text: 'Has a dog', event: 'NONE', old_memory: undefined },
  ]);
  assert.equal(E('```\n' + full + '\n```').length, 2);
  assert.equal(E('Sure! ' + full).length, 2);
  assert.deepEqual(E('[{"id": 2, "text": "x", "event": "add"}]'), [{ id: '2', text: 'x', event: 'ADD', old_memory: undefined }]);
  // Cut off after the first entry: the complete entry survives.
  assert.deepEqual(E('{"memory": [{"id": "0", "text": "Lives in Delhi", "event": "UPDATE"}, {"id": "1", "text": "Has a d').map(e => e.text), ['Lives in Delhi']);
  // Python-style dicts copied from the prompt.
  assert.equal(E("{'memory': [{'id': '0', 'text': \"User's city is Delhi\", 'event': 'UPDATE'}]}")[0].text, "User's city is Delhi");
  assert.deepEqual(E('{"memory": [{"id": "0", "text": "no event"}, {"id": "1", "text": "ok", "event": "DELETE"}]}').map(e => e.event), ['DELETE']);
  for (const bad of ['', 'nothing', '{"memory": "x"}', '{"facts": ["a"]}', null]) assert.equal(E(bad), null, `events from ${JSON.stringify(bad)}`);
});

// 5. Events → operations.
const old = [{ id: '0', chunkId: 'c-pune', text: 'Lives in Pune' }, { id: '1', chunkId: 'c-dog', text: 'Has a dog named Bruno' }];
ok('plan: update, add, none, delete', () => {
  const { ops, skipped } = W.planMemoryOps([
    { id: '0', text: 'Lives in Delhi, moved from Pune', event: 'UPDATE' },
    { id: '1', text: 'Has a dog named Bruno', event: 'NONE' },
    { id: '2', text: 'Works as a nurse', event: 'ADD' },
  ], old);
  assert.equal(skipped, 0);
  assert.deepEqual(ops, [
    { op: 'UPDATE', chunkId: 'c-pune', text: 'Lives in Delhi, moved from Pune', old: 'Lives in Pune' },
    { op: 'ADD', text: 'Works as a nurse' },
  ]);
  assert.deepEqual(W.planMemoryOps([{ id: '1', text: 'Has a dog named Bruno', event: 'DELETE' }], old).ops,
    [{ op: 'DELETE', chunkId: 'c-dog', text: 'Has a dog named Bruno' }]);
});
ok('plan: guards', () => {
  const { ops, skipped } = W.planMemoryOps([
    { id: '7', text: 'Made-up id', event: 'UPDATE' },          // unknown id
    { id: '9', text: 'x', event: 'DELETE' },                   // unknown id
    { id: '0', text: 'Lives in Pune.', event: 'UPDATE' },      // same text as stored
    { id: '3', text: 'lives in pune', event: 'ADD' },          // repeats a stored memory
    { id: '4', text: 'Likes chai', event: 'ADD' },
    { id: '5', text: 'Likes chai', event: 'ADD' },             // repeats an earlier ADD
    { id: '1', text: 'Has a dog named Max', event: 'UPDATE' },
    { id: '1', text: 'x', event: 'DELETE' },                   // second op on the same memory
    { id: '0', text: '', event: 'ADD' },                       // empty
    { id: '0', text: 'y', event: 'MERGE' },                    // not an event
  ], old);
  assert.deepEqual(ops, [{ op: 'ADD', text: 'Likes chai' }, { op: 'UPDATE', chunkId: 'c-dog', text: 'Has a dog named Max', old: 'Has a dog named Bruno' }]);
  assert.equal(skipped, 8);
});
ok('plan: a new fact under a made-up id is added', () => {
  // LFM2.5 1.2B's live answer (2026-10-16): the stored memory as ADD, the two new facts as NONE under ids 1 and 2,
  // plus a line copied from the prompt's examples.
  const stored = [{ id: '0', chunkId: 'c-name', text: 'Name is Asha' }];
  const facts = ['Name is Asha', 'Lives in Pune', "Works as a nurse at a children's hospital"];
  const { ops } = W.planMemoryOps([
    { id: '0', text: 'Name is Asha', event: 'ADD' },
    { id: '1', text: 'Lives in Pune', event: 'NONE' },
    { id: '2', text: "Works as a nurse at a children's hospital", event: 'NONE' },
    { id: '3', text: 'Loves cheese pizza', event: 'UPDATE' },
  ], stored, facts);
  assert.deepEqual(ops, [{ op: 'ADD', text: 'Lives in Pune' }, { op: 'ADD', text: "Works as a nurse at a children's hospital" }]);
});
ok('plan: update onto an existing text deletes the duplicate', () => {
  const two = [...old, { id: '2', chunkId: 'c-delhi', text: 'Lives in Delhi' }];
  assert.deepEqual(W.planMemoryOps([{ id: '0', text: 'Lives in Delhi', event: 'UPDATE' }], two).ops,
    [{ op: 'DELETE', chunkId: 'c-pune', text: 'Lives in Pune' }]);
});
ok('plan: unparseable answer', () => {
  // Empty memory: every fact is added (Mem0's own instruction for that case).
  assert.deepEqual(W.planMemoryOps(null, [], ['Lives in Pune', 'lives in pune', 'Has a dog']).ops,
    [{ op: 'ADD', text: 'Lives in Pune' }, { op: 'ADD', text: 'Has a dog' }]);
  // Memories were shown: nothing changes, because the model's choice is unknown.
  assert.deepEqual(W.planMemoryOps(null, old, ['Lives in Delhi']).ops, []);
});

// 6. Operations applied to a list.
ok('apply', () => {
  const list = [{ id: 'c-pune', text: 'Lives in Pune' }, { id: 'c-dog', text: 'Has a dog named Bruno' }, { id: 'c-x', text: 'Likes tea' }];
  const out = W.applyMemoryOps(list, [
    { op: 'UPDATE', chunkId: 'c-pune', text: 'Lives in Delhi' },
    { op: 'DELETE', chunkId: 'c-x', text: 'Likes tea' },
    { op: 'ADD', text: 'Works as a nurse' },
    { op: 'ADD', text: 'Plays chess' },
    { op: 'DELETE', chunkId: 'missing', text: '?' },
  ]);
  assert.deepEqual(out, [
    { id: 'c-pune', text: 'Lives in Delhi' }, { id: 'c-dog', text: 'Has a dog named Bruno' },
    { id: 'new-0', text: 'Works as a nurse' }, { id: 'new-1', text: 'Plays chess' },
  ]);
  assert.equal(list[0].text, 'Lives in Pune', 'input list unchanged');
  assert.deepEqual(W.countMemoryOps([{ op: 'ADD' }, { op: 'ADD' }, { op: 'UPDATE' }, { op: 'DELETE' }]), { added: 2, updated: 1, deleted: 1 });
});
ok('end to end on text', () => {
  // The Pune → Delhi move as a small model writes it: prose, a fence, one UPDATE.
  const facts = W.parseExtractedFacts('Sure.\n```json\n{"facts": ["Moved from Pune to Delhi"]}\n```');
  const events = W.parseMemoryEvents('{"memory": [{"id": "0", "text": "Lives in Delhi (moved from Pune)", "event": "UPDATE", "old_memory": "Lives in Pune"}, {"id": "1", "text": "Has a dog named Bruno", "event": "NONE"}]}');
  const { ops } = W.planMemoryOps(events, old, facts);
  const after = W.applyMemoryOps(old.map(m => ({ id: m.chunkId, text: m.text })), ops);
  assert.deepEqual(after.map(m => m.text), ['Lives in Delhi (moved from Pune)', 'Has a dog named Bruno']);
});

// 7. Thinking off: Hy-Memory gets reasoning_effort no_think (its template's switch), others enable_thinking false.
ok('template kwargs', () => {
  assert.deepEqual(W.memoryWriterTemplateKwargs({ id: 'tencent/Hy-Memory-30B-A3B' }, 'hy-memory-30b-a3b-ssd'), { reasoning_effort: 'no_think', enable_thinking: false });
  assert.deepEqual(W.memoryWriterTemplateKwargs({ endpointModel: 'hy-memory', id: 'endpoint:x' }, 'ep-1'), { reasoning_effort: 'no_think', enable_thinking: false });
  assert.deepEqual(W.memoryWriterTemplateKwargs({ id: 'LiquidAI/LFM3-1.7B-ONNX' }, 'lfm3-1.7b'), { enable_thinking: false });
  assert.deepEqual(W.MEMORY_WRITER_CATEGORIES, ['fact', 'preference', 'task']);
});

// 8. Wiring in the page.
ok('wiring', () => {
  assert.match(html, /<button[^>]*id="memoryWriteBtn"[^>]*>Write memories from this chat<\/button>/);
  assert.match(html, /<input type="checkbox" id="memoryWriterAutoToggle"> Write memories after each reply <span[^>]*>\([^)]{40,}/);
  assert.match(html, /'lm_memory_writer_auto'/);
  // Two doors: the same action is a command (palette and window.localmind.commands).
  assert.match(html, /\{ id: 'memory\.write', title: 'Write memories from this chat', group: 'Data', run: \(\) => memoryWriteBtn\.click\(\)/);
  assert.ok(/SYNC_SETTINGS_KEYS = \[[^\]]*'lm_memory_writer_auto'/.test(html), 'switch is mirrored with the other settings');
  // After a reply: queued from finishGeneration; before a send: the writer yields.
  const fin = html.slice(html.indexOf('function finishGeneration('), html.indexOf('function finishGeneration(') + 6000);
  assert.match(fin, /queueMemoryWriterAfterReply\(/);
  const send = html.slice(html.indexOf('async function sendMessage()'), html.indexOf('async function sendMessage()') + 1500);
  assert.match(send, /await yieldMemoryWriter\(\)/);
  // runtime.chat forwards chat template kwargs; the endpoint request carries them.
  assert.match(html, /request\.chatTemplateKwargs/);
  assert.match(html, /if \(cfg\.chat_template_kwargs\) body\.chat_template_kwargs = cfg\.chat_template_kwargs;/);
  // Temperature 0 means greedy decoding in the Transformers.js worker (sampling at 0 divides by zero).
  assert.ok((html.match(/do_sample: false \}/g) || []).length >= 2, 'greedy branch in both generate paths');
});

console.log(`test-memory-writer: ${n} checks passed`);
