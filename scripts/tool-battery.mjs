// Tool-call battery: decides a model's `agentCapable` flag by a live run, never by the model card
// (history.md, 2026-09-07). 13 prompts must call the named tool with sensible arguments; 11 must answer
// without a tool (or only with a tool named in `allow`). Runs in the page (the app's window.LocalMind.runtime.chat)
// or anywhere a `chat` like it exists. The tool list mirrors TOOL_REGISTRY in index.html minus web_search,
// fetch_page, run_python, save_skill and segment_image. Each row has a `group` (core, time-zone, weather,
// wikipedia, calendar) so a report can count per tool.
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
  { name: 'get_weather', description: 'Get current weather and a daily forecast (up to 7 days) for a place. Use when the user asks about weather, temperature, rain or wind somewhere.',
    parameters: { type: 'object', properties: { location: { type: 'string', description: 'City or place name, e.g. "Paris" or "Springfield, Illinois"' }, days: { type: 'number', description: 'Days of forecast, 1-7 (default 3)' } }, required: ['location'] } },
  { name: 'wikipedia_lookup', description: 'Look up a topic on Wikipedia and return the article title, URL and a short summary. Use when the user asks to look something up or wants details about a specific person, place, organisation or event; answer common knowledge directly. Cite the URL.',
    parameters: { type: 'object', properties: { query: { type: 'string', description: 'Topic to look up, e.g. "Eiffel Tower"' }, lang: { type: 'string', description: 'Wikipedia language code (default "en")' } }, required: ['query'] } },
  { name: 'create_calendar_event', description: 'Create a calendar event as an .ics file the user can download and open in their calendar app. Works offline. For relative dates ("next Tuesday") call get_current_time first.',
    parameters: { type: 'object', properties: { title: { type: 'string', description: 'Event title, e.g. "Dentist appointment"' }, start: { type: 'string', description: 'Start as ISO date-time, e.g. "2026-10-20T15:00", or a date "2026-10-20" for an all-day event' }, duration_minutes: { type: 'number', description: 'Length in minutes (default 60)' }, location: { type: 'string', description: 'Where the event happens (optional)' }, timezone: { type: 'string', description: 'IANA time zone of the start time, e.g. "Asia/Kolkata". Defaults to the user\'s own.' } }, required: ['title', 'start'] } },
];

const s = (v) => String(v ?? '').toLowerCase();
const evalExpr = (e) => { try { return Function(`"use strict"; return (${String(e).replace(/[^0-9+\-*/().%\s]/g, '')})`)(); } catch { return NaN; } };

// expect: a tool name, or null for "answer without a tool" (allow: tools that do not count against restraint).
// args(a) checks the arguments.
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
  { id: 'time-tokyo', group: 'time-zone', text: 'What time is it in Tokyo right now?', expect: 'get_current_time', args: (a) => a.timezone === 'Asia/Tokyo' },
  { id: 'weather-paris', group: 'weather', text: "What's the weather in Paris tomorrow?", expect: 'get_weather', args: (a) => /paris/.test(s(a.location)) },
  { id: 'weather-bombay', group: 'weather', text: 'Will it rain in Bombay this week?', expect: 'get_weather', args: (a) => /bombay|mumbai/.test(s(a.location)) },
  { id: 'no-weather-sky', group: 'weather', text: 'Why is the sky blue?', expect: null },
  { id: 'no-weather-poem', group: 'weather', text: 'Write a short poem about monsoon rain.', expect: null },
  { id: 'wiki-eiffel', group: 'wikipedia', text: 'Look up the Eiffel Tower on Wikipedia and tell me how tall it is.', expect: 'wikipedia_lookup', args: (a) => /eiffel/.test(s(a.query)) },
  { id: 'wiki-isro', group: 'wikipedia', text: 'According to Wikipedia, when was the Indian Space Research Organisation founded?', expect: 'wikipedia_lookup', args: (a) => /isro|indian space/.test(s(a.query)) },
  { id: 'no-wiki-math', group: 'wikipedia', text: 'What is 12 times 12?', expect: null, allow: ['calculate'] },
  { id: 'no-wiki-limerick', group: 'wikipedia', text: 'Write a limerick about a cat.', expect: null },
  { id: 'cal-dentist', group: 'calendar', text: 'Add a dentist appointment on 20 October 2026 at 3 pm to my calendar.', expect: 'create_calendar_event', args: (a) => /dentist/.test(s(a.title)) && /^2026-10-20[t ]15:00/.test(s(a.start)) },
  { id: 'cal-lunch', group: 'calendar', text: 'Make a calendar invite for lunch with Om on 22 October 2026 at 1 pm at Cafe Mondegar.', expect: 'create_calendar_event', args: (a) => /mondegar/.test(s(a.location)) && /^2026-10-22[t ]13:00/.test(s(a.start)) },
  { id: 'no-cal-leap', group: 'calendar', text: 'How many days are there in a leap year?', expect: null },
  { id: 'no-cal-joke', group: 'calendar', text: 'Tell me a joke about Mondays.', expect: null },
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
    if (p.expect === null) pass = r.calls.every((x) => (p.allow || []).includes(x.name)) && !r.error;
    else pass = !!c && c.name === p.expect && !!p.args(c.arguments || {});
    rows.push({ id: p.id, group: p.group || 'core', expect: p.expect, got: r.calls.map((x) => x.name), args: c?.arguments ?? null, pass, reason: r.reason, error: r.error, secs: r.secs, text: r.text.slice(-1200) });
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
  const count = (list) => {
    const call = list.filter((x) => x.expect !== null), rest = list.filter((x) => x.expect === null);
    return { score: `${list.filter((x) => x.pass).length}/${list.length}`,
      calls: `${call.filter((x) => x.pass).length}/${call.length}`, restraint: `${rest.filter((x) => x.pass).length}/${rest.length}` };
  };
  const groups = {};
  for (const g of [...new Set(rows.map((x) => x.group))]) groups[g] = count(rows.filter((x) => x.group === g));
  return { ...count(rows), groups, roundTrip, rows };
}
