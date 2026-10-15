// test-agent-tools.mjs — get_weather, wikipedia_lookup and create_calendar_event, read out of the shipped index.html
// (the AGENT-TOOLS-PURE block) and run in Node with canned Open-Meteo and Wikipedia replies. No network.
// Checks argument validation, response shaping, the .ics text (RFC 5545 line endings, escaping, folding) and the
// wiring that hides the web tools behind their setting and sends them through the approval card.
//
//   node scripts/test-agent-tools.mjs
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const block = /\/\/ AGENT-TOOLS-PURE-START[\s\S]*?\/\/ AGENT-TOOLS-PURE-END/.exec(html);
assert.ok(block, 'AGENT-TOOLS-PURE block missing from index.html');
const T = new Function(`${block[0]}\nreturn { runGetWeather, shapeWeather, runWikipediaLookup, shapeWikipedia, parseCalendarArgs, buildIcs, icsFold, runCreateCalendarEvent, toolResultSources, zonedWallToUtc };`)();
let checks = 0;
const ok = (...a) => { assert.ok(...a); checks++; };
const eq = (...a) => { assert.equal(...a); checks++; };

// ── get_weather ───────────────────────────────────────────────
const GEO_PARIS = { results: [
  { name: 'Paris', latitude: 33.66, longitude: -95.55, country: 'United States', country_code: 'US', admin1: 'Texas', population: 24782, timezone: 'America/Chicago' },
  { name: 'Paris', latitude: 48.85341, longitude: 2.3488, country: 'France', country_code: 'FR', admin1: 'Île-de-France', population: 2138551, timezone: 'Europe/Paris' },
] };
const FORECAST = { timezone: 'Europe/Paris',
  current: { time: '2026-10-15T15:00', temperature_2m: 21.6, apparent_temperature: 21.3, relative_humidity_2m: 60, precipitation: 0, weather_code: 2, wind_speed_10m: 9 },
  daily: { time: ['2026-10-15', '2026-10-16'], weather_code: [3, 61], temperature_2m_max: [22.9, 21.3], temperature_2m_min: [11.2, 12.3], precipitation_probability_max: [0, 53], precipitation_sum: [0, 2.6] } };
function canned(replies) {
  const urls = [];
  return { urls, fetchJson: async (url) => { urls.push(url); const r = replies.find(([re]) => re.test(url)); if (!r) throw new Error('unexpected ' + url); return r[1]; } };
}
{
  const c = canned([[/geocoding-api/, GEO_PARIS], [/api\.open-meteo\.com\/v1\/forecast/, FORECAST]]);
  const w = await T.runGetWeather({ location: 'Paris', days: 2 }, c.fetchJson);
  eq(c.urls.length, 2);
  ok(c.urls[0].includes('name=Paris') && c.urls[0].includes('count=10'), c.urls[0]);
  ok(c.urls[1].includes('latitude=48.85341') && c.urls[1].includes('longitude=2.3488') && c.urls[1].includes('forecast_days=2'), 'largest Paris wins: ' + c.urls[1]);
  eq(w.location, 'Paris, Île-de-France, France');
  eq(w.current.conditions, 'partly cloudy');
  eq(w.current.temperature_c, 21.6);
  eq(w.daily.length, 2);
  assert.deepEqual(w.daily[1], { date: '2026-10-16', conditions: 'light rain', max_c: 21.3, min_c: 12.3, rain_chance_pct: 53, precipitation_mm: 2.6 }); checks++;
  ok(/Open-Meteo/.test(w.source.title) && /CC BY 4\.0/.test(w.source.title), 'attribution');
}
{
  const c = canned([[/geocoding-api/, GEO_PARIS], [/forecast/, FORECAST]]);
  await T.runGetWeather({ location: 'Paris, Texas' }, c.fetchJson);
  ok(c.urls[0].includes('name=Paris&') || c.urls[0].endsWith('name=Paris'), 'the qualifier is not sent to the geocoder');
  ok(c.urls[1].includes('latitude=33.66'), 'qualifier picks Texas');
  ok(c.urls[1].includes('forecast_days=3'), 'default 3 days');
}
{
  const c = canned([[/geocoding-api/, { results: [{ name: 'Mumbai', latitude: 19.07, longitude: 72.88, country: 'India', population: 12691836 }] }], [/forecast/, FORECAST]]);
  await T.runGetWeather({ location: 'Bombay', days: 99 }, c.fetchJson);
  ok(c.urls[0].includes('name=Mumbai'), 'Bombay is looked up as Mumbai');
  ok(c.urls[1].includes('forecast_days=7'), 'days clamps to 7');
}
{
  const c = canned([[/geocoding-api/, {}]]);
  ok(/No place called "Atlantis"/.test((await T.runGetWeather({ location: 'Atlantis' }, c.fetchJson)).error));
  ok((await T.runGetWeather({ location: '  ' }, c.fetchJson)).error, 'empty location refused');
  ok((await T.runGetWeather({}, c.fetchJson)).error, 'missing location refused');
  eq(c.urls.length, 1, 'refusals make no request');
}

// ── wikipedia_lookup ──────────────────────────────────────────
const WIKI = { query: { pages: [{ pageid: 9232, title: 'Eiffel Tower', fullurl: 'https://en.wikipedia.org/wiki/Eiffel_Tower',
  extract: 'The Eiffel Tower is a lattice tower on the Champ de Mars in Paris, France.\n\n\nIt is named after Gustave Eiffel.' }] } };
{
  const c = canned([[/wikipedia\.org/, WIKI]]);
  const r = await T.runWikipediaLookup({ query: 'Eiffel Tower height' }, c.fetchJson);
  ok(c.urls[0].startsWith('https://en.wikipedia.org/w/api.php?') && c.urls[0].includes('origin=*') && c.urls[0].includes('gsrsearch=Eiffel%20Tower%20height'), c.urls[0]);
  eq(r.found, true);
  eq(r.title, 'Eiffel Tower');
  eq(r.url, 'https://en.wikipedia.org/wiki/Eiffel_Tower');
  eq(r.summary, 'The Eiffel Tower is a lattice tower on the Champ de Mars in Paris, France.\nIt is named after Gustave Eiffel.');
  assert.deepEqual(r.source, { title: 'Wikipedia: Eiffel Tower', url: 'https://en.wikipedia.org/wiki/Eiffel_Tower' }); checks++;
  assert.deepEqual(T.toolResultSources('wikipedia_lookup', r), [r.source]); checks++;
}
{
  const long = Array.from({ length: 60 }, (_, i) => `Sentence number ${i} says something long enough to count.`).join(' ');
  const r = T.shapeWikipedia({ query: { pages: [{ title: 'Long', fullurl: 'https://en.wikipedia.org/wiki/Long', extract: long }] } }, 'long');
  ok(r.summary.length <= 1503 && r.summary.endsWith('. …'), 'long extracts cut at a sentence: ' + r.summary.slice(-20));
  eq(T.shapeWikipedia({ batchcomplete: true }, 'zzqx').found, false);
  const c = canned([[/wikipedia\.org/, WIKI]]);
  await T.runWikipediaLookup({ query: 'Tour Eiffel', lang: 'fr' }, c.fetchJson);
  await T.runWikipediaLookup({ query: 'x', lang: 'evil.com/' }, c.fetchJson);
  ok(c.urls[0].startsWith('https://fr.wikipedia.org/'), 'lang fr');
  ok(c.urls[1].startsWith('https://en.wikipedia.org/'), 'a bad lang falls back to en');
  ok((await T.runWikipediaLookup({ query: '' }, c.fetchJson)).error, 'empty query refused');
}

// ── create_calendar_event ─────────────────────────────────────
const now = new Date('2026-10-15T10:00:00Z');
const cal = (args) => T.runCreateCalendarEvent(args, { now, uid: 'test-uid@localmind' });
{
  const r = cal({ title: 'Dentist, Dr. Rao; check-up', start: '2026-10-20T15:00', timezone: 'Asia/Kolkata', duration_minutes: 30, location: 'Colaba, Mumbai' });
  eq(r.created, true);
  eq(r.start_utc, '2026-10-20T09:30:00.000Z');
  eq(r.end_utc, '2026-10-20T10:00:00.000Z');
  eq(r.filename, 'dentist-dr-rao-check-up-2026-10-20.ics');
  ok(/20 October 2026.*15:00.*Asia\/Kolkata/.test(r.when), r.when);
  const ics = r._ics;
  ok(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n') && ics.endsWith('END:VEVENT\r\nEND:VCALENDAR\r\n'), 'CRLF frame');
  ok(!/[^\r]\n/.test(ics), 'every newline is CRLF');
  ok(ics.includes('\r\nDTSTART:20261020T093000Z\r\nDTEND:20261020T100000Z\r\n'), 'UTC start and end');
  ok(ics.includes('\r\nDTSTAMP:20261015T100000Z\r\n') && ics.includes('\r\nUID:test-uid@localmind\r\n'), 'DTSTAMP and UID');
  ok(ics.includes('SUMMARY:Dentist\\, Dr. Rao\\; check-up') && ics.includes('LOCATION:Colaba\\, Mumbai'), 'text escaping');
}
eq(cal({ title: 'a', start: '2026-10-20T15:00+05:30' }).start_utc, '2026-10-20T09:30:00.000Z');
eq(cal({ title: 'a', start: '2026-10-20T15:00:00Z' }).start_utc, '2026-10-20T15:00:00.000Z');
eq(cal({ title: 'a', start: '2026-10-20 15:00' }).start_utc, new Date(2026, 9, 20, 15, 0).toISOString(), 'no zone: the user\'s local time');
eq(cal({ title: 'a', start: '2027-07-01T09:00', timezone: 'America/New_York' }).start_utc, '2027-07-01T13:00:00.000Z', 'summer time');
eq(cal({ title: 'a', start: '2027-01-01T09:00', timezone: 'America/New_York' }).start_utc, '2027-01-01T14:00:00.000Z', 'winter time');
eq(cal({ title: 'a', start: '2027-03-14T03:30', timezone: 'America/New_York' }).start_utc, '2027-03-14T07:30:00.000Z', 'just after the spring change');
{
  const r = cal({ title: 'Diwali', start: '2026-11-08' });
  eq(r.all_day, true);
  ok(r._ics.includes('\r\nDTSTART;VALUE=DATE:20261108\r\nDTEND;VALUE=DATE:20261109\r\n'), 'all-day dates');
  eq(r.filename, 'diwali-2026-11-08.ics');
  eq(cal({ title: 'today', start: '2026-10-15' }).created, true, 'today, all day, is not past');
}
const refusals = [
  [{ title: '', start: '2026-10-20T15:00' }, /title is required/],
  [{ start: '2026-10-20T15:00' }, /title is required/],
  [{ title: 'x'.repeat(201), start: '2026-10-20T15:00' }, /too long/],
  [{ title: 'a' }, /ISO date/],
  [{ title: 'a', start: 'next Tuesday at 3' }, /ISO date/],
  [{ title: 'a', start: '20/10/2026 15:00' }, /ISO date/],
  [{ title: 'a', start: '2026-02-30T10:00' }, /not a real date/],
  [{ title: 'a', start: '2027-02-29' }, /not a real date/],
  [{ title: 'a', start: '2026-13-01T10:00' }, /not a real date/],
  [{ title: 'a', start: '2026-10-20T25:00' }, /not a real date/],
  [{ title: 'a', start: '2026-10-20T10:61' }, /not a real date/],
  [{ title: 'a', start: '2026-10-20+05:30' }, /ISO date|offset/],
  [{ title: 'a', start: '2024-10-20T15:00' }, /in the past.*get_current_time/],
  [{ title: 'a', start: '2026-10-13' }, /in the past/],
  [{ title: 'a', start: '2040-01-01T10:00' }, /ten years/],
  [{ title: 'a', start: '2026-10-20T15:00', duration_minutes: 0 }, /duration_minutes/],
  [{ title: 'a', start: '2026-10-20T15:00', duration_minutes: -30 }, /duration_minutes/],
  [{ title: 'a', start: '2026-10-20T15:00', duration_minutes: 20000 }, /duration_minutes/],
  [{ title: 'a', start: '2026-10-20T15:00', duration_minutes: 'an hour' }, /duration_minutes/],
  [{ title: 'a', start: '2026-10-20T15:00', timezone: 'Mars/Olympus_Mons' }, /unknown time zone/],
];
for (const [args, re] of refusals) {
  const r = cal(args);
  ok(r.error && re.test(r.error) && !r._ics, `should refuse ${JSON.stringify(args)}: got ${JSON.stringify(r).slice(0, 160)}`);
}
eq(cal({ title: 'a', start: '2026-10-20T15:00', duration_minutes: '90' }).end_utc, new Date(2026, 9, 20, 16, 30).toISOString(), 'numeric string duration');
{
  // Folding: no line over 75 octets, and unfolding gives the original text back (multi-byte characters intact).
  const title = 'चाय पर चर्चा — ' + 'a long meeting title with many words '.repeat(5);
  const ics = cal({ title, start: '2026-10-20T15:00', timezone: 'Asia/Kolkata' })._ics;
  const lines = ics.split('\r\n');
  ok(lines.every((l) => Buffer.byteLength(l) <= 75), 'every line at most 75 octets');
  const unfolded = ics.replace(/\r\n /g, '');
  ok(unfolded.includes('SUMMARY:' + title.trim()), 'unfolds to the original title');
}

// ── wiring in the app ─────────────────────────────────────────
ok(/\.filter\(\(\[_, t\]\) => !t\.requiresKeylessWeb \|\| keylessWebOn\(\)\)/.test(html), 'buildToolsForRuntime hides keyless web tools until the setting is on');
ok(/tool\._custom \|\| tool\._mcp \|\| tool\.approvalHost/.test(html), 'approvalHost tools go through the approval card');
ok(/TOOL_REGISTRY\.get_weather = \{[\s\S]*?requiresKeylessWeb: true,\s*approvalHost: 'open-meteo\.com'/.test(html), 'get_weather is gated');
ok(/TOOL_REGISTRY\.wikipedia_lookup = \{[\s\S]*?requiresKeylessWeb: true,\s*approvalHost: 'wikipedia\.org'/.test(html), 'wikipedia_lookup is gated');
ok(!/TOOL_REGISTRY\.create_calendar_event = \{[^}]*?(requiresKeylessWeb|approvalHost)/.test(html), 'the calendar tool is offline and ungated');
eq((html.match(/attachToolDownload\(/g) || []).length, 3, 'both agent loops attach the .ics download (plus the definition)');
eq((html.match(/\.\.\.toolResultSources\(tc\.name, toolResult\)/g) || []).length, 2, 'both agent loops collect tool sources');
ok(/<input type="checkbox" id="keylessWebToggle">/.test(html), 'the setting defaults off');

console.log(`agent tools: ${checks} checks passed (weather, Wikipedia, calendar with ${refusals.length} refusals, wiring)`);
