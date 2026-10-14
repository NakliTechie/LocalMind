// Tool-call battery: decides a model's `agentCapable` flag by a live run, never by the model card
// (history.md, 2026-09-07). 6 prompts must call the named tool with sensible arguments; 5 must answer
// without a tool. Runs in the page (the app's window.LocalMind.runtime.chat) or anywhere a `chat` like it
// exists. The tool list mirrors TOOL_REGISTRY in index.html minus the web and image tools.
//   const { runBattery } = await import('/scripts/tool-battery.mjs');
//   const report = await runBattery(LocalMind.runtime, { maxTokens: 1024 });

export const TOOLS = [
  { name: 'calculate', description: 'Evaluate a mathematical expression. Use for arithmetic, unit conversions, percentages.',
    parameters: { type: 'object', properties: { expression: { type: 'string', description: 'Math expression to evaluate, e.g. "2 * 3 + 1"' } }, required: ['expression'] } },
  { name: 'get_current_time', description: 'Get the current date and time.',
    parameters: { type: 'object', properties: { timezone: { type: 'string', description: 'IANA timezone, e.g. "America/New_York". Defaults to local.' } }, required: [] } },
  { name: 'store_memory', description: 'Store an important fact, preference, or finding for later recall. Memories persist across sessions.',
    parameters: { type: 'object', properties: { content: { type: 'string', description: 'The information to remember' }, category: { type: 'string', enum: ['fact', 'preference', 'finding', 'task'], description: 'Category of memory' } }, required: ['content'] } },
  { name: 'search_memory', description: 'Search your stored memories, past conversations, and documents. Use when the user asks about something you may have been told before.',
    parameters: { type: 'object', properties: { query: { type: 'string', description: 'What to search for in memory' } }, required: ['query'] } },
  { name: 'set_reminder', description: 'Set a reminder that will notify the user after a specified number of minutes. Uses browser notifications.',
    parameters: { type: 'object', properties: { message: { type: 'string', description: 'The reminder message to show' }, minutes: { type: 'number', description: 'Minutes from now (1-120)' } }, required: ['message', 'minutes'] } },
  { name: 'list_memories', description: 'List all stored memories grouped by category with counts. Use to see what you remember about the user.',
    parameters: { type: 'object', properties: {}, required: [] } },
  { name: 'delete_memory', description: 'Delete memories matching a search query. Use when the user asks you to forget something.',
    parameters: { type: 'object', properties: { query: { type: 'string', description: 'What to forget — will delete matching memories' } }, required: ['query'] } },
];

const s = (v) => String(v ?? '').toLowerCase();
const evalExpr = (e) => { try { return Function(`"use strict"; return (${String(e).replace(/[^0-9+\-*/().%\s]/g, '')})`)(); } catch { return NaN; } };

// expect: a tool name, or null for "answer without a tool". args(a) checks the arguments.
export const PROMPTS = [
  { id: 'calc-mul', text: 'What is 4821 * 377?', expect: 'calculate', args: (a) => evalExpr(a.expression) === 1817517 },
  { id: 'calc-pct', text: 'What is 17.5% of 2340, plus 99?', expect: 'calculate', args: (a) => Math.abs(evalExpr(s(a.expression).replace(/(\d+(?:\.\d+)?)\s*%\s*(of|\*)?/g, '($1/100)*')) - 508.5) < 1e-6 || /17\.5/.test(a.expression) },
  { id: 'time', text: 'What time is it right now?', expect: 'get_current_time', args: () => true },
  { id: 'store', text: "Remember that my sister's birthday is on 3 March.", expect: 'store_memory', args: (a) => /sister/.test(s(a.content)) && /march|3/.test(s(a.content)) },
  { id: 'search', text: "What did I tell you earlier about my sister's birthday?", expect: 'search_memory', args: (a) => /sister|birthday/.test(s(a.query)) },
  { id: 'remind', text: 'Remind me in 20 minutes to take the bread out of the oven.', expect: 'set_reminder', args: (a) => Number(a.minutes) === 20 && /bread|oven/.test(s(a.message)) },
  { id: 'haiku', text: 'Write a haiku about autumn.', expect: null },
  { id: 'capital', text: 'What is the capital of Japan?', expect: null },
  { id: 'explain', text: 'Explain what a hash table is in two sentences.', expect: null },
  { id: 'translate', text: "Translate 'good morning' into French.", expect: null },
  { id: 'greet', text: 'Hi, how are you today?', expect: null },
];

async function turn(runtime, messages, opts) {
  let text = ''; const calls = []; let reason = null; let error = null;
  const t0 = performance.now();
  try {
    for await (const ev of runtime.chat({ messages, tools: TOOLS, enableThinking: true, maxTokens: opts.maxTokens, temperature: opts.temperature })) {
      if (ev.type === 'token') text += ev.text;
      else if (ev.type === 'tool_call') calls.push({ name: ev.name, arguments: ev.arguments });
      else if (ev.type === 'done') { reason = ev.reason; break; }
      else if (ev.type === 'error') { error = String(ev.error?.message || ev.error); break; }
    }
  } catch (e) { error = String(e.message || e); }
  return { text, calls, reason, error, secs: +((performance.now() - t0) / 1000).toFixed(1) };
}

export async function runBattery(runtime, opts = {}) {
  const o = { maxTokens: 1024, temperature: 0, ...opts };
  const rows = [];
  for (const p of PROMPTS) {
    const r = await turn(runtime, [{ role: 'user', content: p.text }], o);
    const c = r.calls[0];
    let pass;
    if (p.expect === null) pass = r.calls.length === 0 && !r.error;
    else pass = !!c && c.name === p.expect && !!p.args(c.arguments || {});
    rows.push({ id: p.id, expect: p.expect, got: r.calls.map((x) => x.name), args: c?.arguments ?? null, pass, reason: r.reason, error: r.error, secs: r.secs, text: r.text.slice(-1200) });
    if (o.onRow) o.onRow(rows.at(-1));
  }
  // Round trip: run the calculator for real and check the model uses the result.
  let roundTrip = null;
  const first = rows.find((x) => x.id === 'calc-mul');
  if (first?.pass) {
    const result = evalExpr(first.args.expression);
    const msgs = [
      { role: 'user', content: PROMPTS[0].text },
      { role: 'assistant', content: first.text },
      { role: 'tool', name: 'calculate', content: JSON.stringify({ result }) },
    ];
    const r = await turn(runtime, msgs, o);
    const answer = r.text.replace(/<\|think\|>[\s\S]*?(<\|\/think\|>|$)/, '');
    roundTrip = { pass: r.calls.length === 0 && /1,?817,?517/.test(answer), calls: r.calls, secs: r.secs, answer: answer.slice(-400) };
  }
  const call = rows.filter((x) => x.expect !== null), rest = rows.filter((x) => x.expect === null);
  return {
    score: `${rows.filter((x) => x.pass).length}/${rows.length}`,
    calls: `${call.filter((x) => x.pass).length}/${call.length}`,
    restraint: `${rest.filter((x) => x.pass).length}/${rest.length}`,
    roundTrip, rows,
  };
}
