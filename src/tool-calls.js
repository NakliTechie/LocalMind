// tool-calls.js — LocalMind's tool-calling text layer: the prompts that describe tools to a model, and the parser
// that reads a model's reply back into calls. Browser runtimes have no native tool-calling API, so the tools go into
// the system prompt and the reply is scanned for every call format the shipped models write: <tool_call> JSON
// (Gemma, Qwen), LFM2's Pythonic calls, Qwen3-Coder XML <function=…><parameter=…> (Ternary Bonsai 2, LFM3),
// MiniCPM5's XML, unclosed and name-less blocks. No DOM and no LocalMind state, so other hosts (NakliOS) can vendor
// this file as it is. index.html imports it through moduleUrl('tool-calls.js'); scripts/test-endpoint.mjs tests it.
//
// Entry points: _adapterBuildToolPrompt(tools, userPrompt) / _adapterBuildQwenXmlToolPrompt(tools, userPrompt) for
// the system prompt; _adapterParseToolCalls(text, knownToolNames, toolDefs) → { toolCalls: [{ name, arguments }],
// cleanText }, which runs only names in knownToolNames; _adapterFormatToolResultMessage(name, result) for the reply.

function _adapterRepairJSON(str) {
  try { return JSON.parse(str); } catch {}
  const fixed = String(str)
    .replace(/,\s*([}\]])/g, '$1')   // trailing commas
    .replace(/'/g, '"')              // single → double quotes
    // Empty args value, e.g. {"name":"foo","parameters": } — small models
    // sometimes open the args slot then bail. Default it to {} so a call
    // with a valid name still fires (the tool runs with its defaults).
    .replace(/"(arguments|parameters)"\s*:\s*(?=[}\],])/g, '"$1":{}')
    .replace(/(\w+)\s*:/g, '"$1":'); // unquoted keys
  try { return JSON.parse(fixed); } catch {}
  return null;
}

function _adapterBuildToolPrompt(tools, userPrompt) {
  // tools: [{ name, description, parameters }]
  const toolDefs = (tools || []).map(t => ({
    type: 'function',
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));
  let prompt = `You are a helpful AI assistant with access to tools. Use them when they would help answer the user's question. If tools aren't needed, respond directly.

<tools>
${JSON.stringify(toolDefs, null, 2)}
</tools>

To call a function, output EXACTLY this format (not inside thinking):
<tool_call>
{"name": "function_name", "arguments": {"arg1": "value1"}}
</tool_call>

Only call a tool when the request genuinely needs one (a calculation, a web search, code execution, reading/saving memory). For writing, explanation, analysis, translation, or anything you can answer yourself, respond directly with NO <tool_call> block. When you do call a tool, the <tool_call> block must appear in your main response, never inside your thinking/reasoning.

Rules:
- Call one tool at a time. Wait for the result before calling another.
- When citing sources, mention where the information came from.
- If you don't need tools, just answer directly.
- Never fabricate tool results.
- Always use the exact <tool_call> XML format shown above. Do not invent other formats like "tool.call:" or function-call syntax.
- The "name" field is REQUIRED in every <tool_call> block — set it to the exact function name from <tools>. A block with only arguments and no "name" is invalid.
- You can translate text between 140+ languages directly in your response — no tool needed for translation.`;
  if (userPrompt) prompt += '\n\n' + userPrompt;
  return prompt;
}

// Native tool prompt for Qwen3.8-family templates (Ternary Bonsai 2 27B: model entry `toolFormat:
// 'qwen3-xml'`). The text is byte for byte what the GGUF's own chat template renders into the system
// turn when it is given `tools` (the in-browser engine renders with tools:null, so the page supplies
// it): one JSON object per tool, then the Qwen3-Coder XML call format, then the caller's system text.
// The model answers with <tool_call><function=…><parameter=…>…</parameter></function></tool_call>,
// which _adapterParseQwenXmlCalls reads. bonsai-ada-surgery measured 9 of 9 calls parsed this way
// against 1 of 9 for JSON asked for in content (docs/QUALITY.md §3).
function _adapterPyJson(v) {
  // Python json.dumps spacing (", " and ": "), which the template's tojson produces.
  if (Array.isArray(v)) return '[' + v.map(_adapterPyJson).join(', ') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).map(k => JSON.stringify(k) + ': ' + _adapterPyJson(v[k])).join(', ') + '}';
  return JSON.stringify(v === undefined ? null : v);
}
function _adapterBuildQwenXmlToolPrompt(tools, userPrompt) {
  let p = '# Tools\n\nYou have access to the following functions:\n\n<tools>';
  for (const t of (tools || [])) {
    p += '\n' + _adapterPyJson({ type: 'function', function: { name: t.name, description: t.description, parameters: t.parameters } });
  }
  p += '\n</tools>';
  p += '\n\nIf you choose to call a function ONLY reply in the following format with NO suffix:\n\n<tool_call>\n<function=example_function_name>\n<parameter=example_parameter_1>\nvalue_1\n</parameter>\n<parameter=example_parameter_2>\nThis is the value for the second parameter\nthat can span\nmultiple lines\n</parameter>\n</function>\n</tool_call>\n\n<IMPORTANT>\nReminder:\n- Function calls MUST follow the specified format: an inner <function=...></function> block must be nested within <tool_call></tool_call> XML tags\n- Required parameters MUST be specified\n- You may provide optional reasoning for your function call in natural language BEFORE the function call, but NOT after\n- If there is no function call available, answer the question like normal with your current knowledge and do not tell the user about function calls\n</IMPORTANT>';
  if (userPrompt && userPrompt.trim()) p += '\n\n' + userPrompt.trim();
  return p;
}

// Native tool prompt for templates that call with <arg_key>/<arg_value> pairs (Flint 40B-A2.5B: model entry
// `toolFormat: 'arg-key'`; GLM-4.7 uses the same call shape). The text is what Flint's GGUF chat template renders as
// its tool preamble: one JSON object per tool inside <tools>, then the call format. The caller's system text follows.
function _adapterBuildArgKeyToolPrompt(tools, userPrompt) {
  let p = '# Tools\n\nYou may call one or more functions to assist with the user query.\n\nYou are provided with function signatures within <tools></tools> XML tags:\n<tools>';
  for (const t of (tools || [])) {
    p += '\n' + _adapterPyJson({ type: 'function', function: { name: t.name, description: t.description, parameters: t.parameters } });
  }
  p += '\n</tools>\n\nFor each function call, output the function name and arguments within the following XML format:\n<tool_call>{function-name}<arg_key>{arg-key-1}</arg_key><arg_value>{arg-value-1}</arg_value>...</tool_call>';
  if (userPrompt && userPrompt.trim()) p += '\n\n' + userPrompt.trim();
  return p;
}

// Read <arg_key>/<arg_value> tool calls:
//   <tool_call>NAME<arg_key>KEY</arg_key><arg_value>VALUE</arg_value>...</tool_call>
// The template writes a string value raw and any other value as JSON, so each value is coerced against the tool's
// JSON-schema type. Closing tags are optional (a reply cut at the token cap still yields the call). A call with no
// arguments is <tool_call>NAME</tool_call>. Returns [{ name, arguments, raw }], `raw` being the span to strip.
function _adapterParseArgKeyCalls(text, toolDefs) {
  const out = [];
  const re = /<tool_call>\s*([A-Za-z_][\w.-]*)\s*((?:<arg_key>[\s\S]*?)?)(?:<\/tool_call>|(?=<tool_call>)|$)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const name = m[1];
    const t = _adapterFindToolDef(toolDefs, name);
    const props = (t && t.parameters && t.parameters.properties) || {};
    const args = {};
    const pRe = /<arg_key>\s*([\s\S]*?)\s*<\/arg_key>\s*(?:<arg_value>([\s\S]*?)(?:<\/arg_value>|(?=<arg_key>)|$))?/g;
    let pm;
    while ((pm = pRe.exec(m[2])) !== null) {
      if (pm[1]) args[pm[1]] = _adapterCoerceXmlParam(pm[2] == null ? '' : pm[2].trim(), props[pm[1]]);
      if (pm[0].length === 0) pRe.lastIndex++;
    }
    out.push({ name, arguments: args, raw: m[0] });
    if (m[0].length === 0) re.lastIndex++;
  }
  return out;
}

// Read Qwen3-Coder XML tool calls:
//   <tool_call>\n<function=NAME>\n<parameter=KEY>\nVALUE\n</parameter>\n</function>\n</tool_call>
// A value is raw text (no escaping) between the newline after <parameter=KEY> and the newline before
// </parameter>; it is coerced against the tool's JSON-schema type, so a string stays a string and a
// number, boolean, object or array is parsed. Closing tags are optional (a reply cut at the token cap
// still yields the call). Returns [{ name, arguments, raw }], `raw` being the span to strip.
function _adapterParseQwenXmlCalls(text, toolDefs) {
  const out = [];
  const propsFor = (name) => {
    const t = _adapterFindToolDef(toolDefs, name);
    return (t && t.parameters && t.parameters.properties) || {};
  };
  const fnRe = /(?:<tool_call>\s*)?<function=([^>\n]+)>([\s\S]*?)(?:<\/function>\s*(?:<\/tool_call>)?|(?=<tool_call>|<function=)|$)/g;
  let m;
  while ((m = fnRe.exec(text)) !== null) {
    const name = m[1].trim();
    const props = propsFor(name);
    const args = {};
    const pRe = /<parameter=([^>\n]+)>([\s\S]*?)(?:<\/parameter>|(?=<parameter=)|$)/g;
    let pm;
    while ((pm = pRe.exec(m[2])) !== null) {
      const v = pm[2].replace(/^\n/, '').replace(/\n$/, '');
      args[pm[1].trim()] = _adapterCoerceXmlParam(v, props[pm[1].trim()]);
    }
    out.push({ name, arguments: args, raw: m[0] });
    if (m[0].length === 0) fnRe.lastIndex++;
  }
  return out;
}

// Some tool-tuned models (notably LFM2) emit the arguments inside a
// <tool_call> block but drop the {"name","arguments"} wrapper — e.g.
// <tool_call>{"timezone":"UTC"}</tool_call>. Recover the tool when the
// emitted argument keys uniquely match exactly one available tool's
// declared parameters; return null when ambiguous/unknowable so we never
// guess. Only consulted when the name is absent, so models that DO emit a
// name (Bonsai, Qwen3, Gemma) are unaffected.
function _adapterInferToolFromArgs(args, toolDefs) {
  if (!args || typeof args !== 'object' || !Array.isArray(toolDefs) || !toolDefs.length) return null;
  const keys = Object.keys(args);
  if (!keys.length) return null;
  const matches = toolDefs.filter(t => {
    const props = (t && t.parameters && t.parameters.properties) || {};
    return keys.every(k => k in props);
  });
  return matches.length === 1 ? matches[0].name : null;
}

// Parse Pythonic kwargs from a native LFM2 tool call — e.g.
//   query="running shoes", max_price=100, in_stock=true
// — into a JS object. Strings may be single- or double-quoted; bare numbers
// and booleans/None are coerced. Splits on top-level commas only (quotes and
// nested brackets are respected so commas inside values don't split).
function _adapterParsePythonicArgs(s) {
  const out = {};
  if (!s || !s.trim()) return out;
  const parts = [];
  let depth = 0, cur = '', q = null;
  for (const ch of s) {
    if (q) { cur += ch; if (ch === q) q = null; continue; }
    if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth <= 0) { parts.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  for (const p of parts) {
    const eq = p.indexOf('=');
    if (eq === -1) continue;
    const k = p.slice(0, eq).trim();
    let v = p.slice(eq + 1).trim();
    if (!k) continue;
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    } else if (/^-?\d+(\.\d+)?$/.test(v)) {
      v = Number(v);
    } else if (v === 'true' || v === 'True') { v = true; }
    else if (v === 'false' || v === 'False') { v = false; }
    else if (v === 'None' || v === 'null') { v = null; }
    out[k] = v;
  }
  return out;
}

// Parse MiniCPM5-style XML tool calls — the shape that model's own chat
// template is trained to emit:
//   <function name="fn"><param name="p">value</param></function>
// A param value may be multi-line, and the template wraps it in CDATA when
// it contains '<', '&' or a newline. XML carries no types, so values arrive
// as strings and are coerced against the tool's declared JSON-schema type —
// schema first, never guessing: a param with no schema stays a string, so
// e.g. calculate's expression "2+2" is not mangled into a number.
// Returns [{ name, arguments, raw }]; `raw` is the matched span so the
// caller can strip it from the visible reply.
function _adapterCoerceXmlParam(raw, schema) {
  const t = schema && schema.type;
  if (t === 'number' || t === 'integer') {
    const n = Number(String(raw).trim());
    return Number.isFinite(n) ? n : raw;
  }
  if (t === 'boolean') {
    const v = String(raw).trim().toLowerCase();
    if (v === 'true') return true;
    if (v === 'false') return false;
    return raw;
  }
  if (t === 'array' || t === 'object') {
    try { const p = JSON.parse(raw); if (p && typeof p === 'object') return p; } catch (_) {}
    return raw;
  }
  return raw;
}

function _adapterParseXmlFunctionCalls(text, toolDefs) {
  const out = [];
  const propsFor = (name) => {
    const t = _adapterFindToolDef(toolDefs, name);
    return (t && t.parameters && t.parameters.properties) || {};
  };
  const readParams = (body, name) => {
    const props = propsFor(name);
    const args = {};
    // Unclosed </param> is tolerated (small models truncate at EOS).
    const pRe = /<param\s+name\s*=\s*["']([^"']+)["']\s*>([\s\S]*?)(?:<\/param>|$)/g;
    let pm;
    while ((pm = pRe.exec(body)) !== null) {
      let v = pm[2];
      const cd = v.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
      v = cd ? cd[1] : v.trim();
      args[pm[1]] = _adapterCoerceXmlParam(v, props[pm[1]]);
    }
    return args;
  };
  // Self-closing / no-argument form: <function name="get_current_time"/>
  const selfRe = /<function\s+name\s*=\s*["']([^"']+)["']\s*\/>/g;
  let m;
  while ((m = selfRe.exec(text)) !== null) out.push({ name: m[1], arguments: {}, raw: m[0] });
  // Paired form, closing tag optional for the same truncation reason.
  const fnRe = /<function\s+name\s*=\s*["']([^"']+)["']\s*>([\s\S]*?)(?:<\/function>|$)/g;
  while ((m = fnRe.exec(text)) !== null) out.push({ name: m[1], arguments: readParams(m[2], m[1]), raw: m[0] });
  return out;
}

// Scan `str` from index `start` (which must point at '{') and return the
// first brace-balanced JSON object substring, honouring string literals so
// braces inside "…" don't miscount. Returns null if never balanced. Used to
// pull the JSON out of an UNCLOSED <tool_call> block (no </tool_call>),
// where a lazy regex would stop at the first nested '}' and break the JSON.
function _adapterExtractBalancedObject(str, start) {
  if (str[start] !== '{') return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < str.length; i++) {
    const c = str[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') { if (--depth === 0) return str.slice(start, i + 1); }
  }
  return null;
}

// Recover a MiniCPM5 XML tool call AFTER the runtime has eaten its tags.
// MiniCPM5's vocab defines <function (18), </function> (19), <param (20)
// and </param> (21) as CONTROL tokens, and llama.cpp renders control tokens
// as the empty string, so what actually reaches us is the residue:
//   <function name="fn"><param name="p">v</param></function>
//     arrives as:  name="fn"> name="p">v
// llama-server has a request param for keeping such tokens
// (preserved_tokens), but the OAI chat path overwrites it from the chat
// template (server-common.cpp), and the minicpm5 chat parser landed
// upstream in llama.cpp c818263f2 (2026-06-28), AFTER the llama.cpp commit
// wllama 3.4.1 pins (aa46bda, 2026-05-30) — so it cannot be reached from
// JS on this pin. Hence parsing the residue.
// Each ` name="X">` segment is a marker: the first names the function, the
// rest name params whose value runs to the next marker. Returns null unless
// the shape is unambiguous, so this can only ever fire on a real call.
function _adapterParseStrippedXmlCall(text) {
  const segRe = /\s*name\s*=\s*["']([^"']+)["']\s*>/g;
  const segs = [];
  let m;
  while ((m = segRe.exec(text)) !== null) segs.push({ name: m[1], start: m.index, end: m.index + m[0].length });
  if (!segs.length) return null;
  const args = {};
  for (let i = 1; i < segs.length; i++) {
    const stop = (i + 1 < segs.length) ? segs[i + 1].start : text.length;
    args[segs[i].name] = text.slice(segs[i].end, stop).trim();
  }
  return { name: segs[0].name, args, start: segs[0].start, end: text.length };
}

// The tool a model named, matched to the caller's list. Small models change the case of a name (LFM3 1.7B wrote
// <function=bash> for a tool named Bash, seen in NakliOS 2026-10-28), so an exact match wins, then a single
// case-insensitive match; two tools that differ only by case stay ambiguous and match nothing. With no list, the
// name passes through unchanged, as before.
function _adapterResolveToolName(name, knownToolNames) {
  if (!knownToolNames || !knownToolNames.length) return name;
  if (knownToolNames.indexOf(name) !== -1) return name;
  const lower = String(name).toLowerCase();
  const hits = knownToolNames.filter(n => String(n).toLowerCase() === lower);
  return hits.length === 1 ? hits[0] : null;
}
// The same match against tool definitions, for the argument schema.
function _adapterFindToolDef(toolDefs, name) {
  const defs = (toolDefs || []).filter(d => d && d.name);
  const resolved = _adapterResolveToolName(name, defs.map(d => d.name));
  return resolved == null ? undefined : defs.find(d => d.name === resolved);
}

function _adapterParseToolCalls(text, knownToolNames, toolDefs) {
  const toolCalls = [];
  let cleanText = text;

  // 1. Match <tool_call>…</tool_call> blocks
  const tagRegex = /<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g;
  let match;
  while ((match = tagRegex.exec(text)) !== null) {
    const parsed = _adapterRepairJSON(match[1].trim());
    const tcName = parsed && (parsed.name || parsed.function);
    if (tcName) {
      // `parameters` is accepted alongside `arguments`: Apertus (and some
      // other tool-tuned models) name the args object `parameters`.
      toolCalls.push({ name: tcName, arguments: parsed.arguments || parsed.parameters || {} });
    } else if (parsed && typeof parsed === 'object') {
      // Name-less tool_call (LFM2-style): the block holds bare arguments.
      // Infer the tool from the argument signature; skip if ambiguous.
      const argObj = (parsed.arguments && typeof parsed.arguments === 'object') ? parsed.arguments
                   : (parsed.parameters && typeof parsed.parameters === 'object') ? parsed.parameters
                   : parsed;
      const inferred = _adapterInferToolFromArgs(argObj, toolDefs);
      if (inferred) toolCalls.push({ name: inferred, arguments: argObj });
    }
    cleanText = cleanText.replace(match[0], '');
  }

  // 1c. <arg_key>/<arg_value> calls (Flint, GLM-4.7): <tool_call>NAME<arg_key>K</arg_key><arg_value>V</arg_value></tool_call>.
  // Pass 1 cannot read the body as JSON and has already cut the paired blocks from cleanText, so read `text` here.
  // Gated on nothing matching above, a bare name right after <tool_call>, and a known tool name.
  if (toolCalls.length === 0 && /<tool_call>\s*[A-Za-z_][\w.-]*\s*(?:<arg_key>|<\/tool_call>|$)/.test(text)) {
    for (const c of _adapterParseArgKeyCalls(text, toolDefs)) {
      const name = knownToolNames && knownToolNames.length ? _adapterResolveToolName(c.name, knownToolNames) : null;
      if (name != null) toolCalls.push({ name, arguments: c.arguments });
      cleanText = cleanText.replace(c.raw, '');
    }
    cleanText = cleanText.replace(/<\/?tool_call>/g, '').trim();
  }

  // 1a. Qwen3-Coder XML calls: <tool_call><function=NAME><parameter=KEY>VALUE</parameter></function></tool_call>.
  // Ternary Bonsai 2 is prompted for this format (_adapterBuildQwenXmlToolPrompt); any Qwen3.8-family model
  // may emit it unprompted. The JSON pass above cannot read the body, so read it here, paired or unclosed.
  // Gated on nothing matching above and on a known tool name, so a hallucinated name never runs.
  if (toolCalls.length === 0 && text.indexOf('<function=') !== -1) {
    for (const c of _adapterParseQwenXmlCalls(text, toolDefs)) {
      const name = _adapterResolveToolName(c.name, knownToolNames);
      if (name != null) toolCalls.push({ name, arguments: c.arguments });
      cleanText = cleanText.replace(c.raw, '');
    }
    cleanText = cleanText.replace(/<\/?tool_call>/g, '').trim();
  }

  // 1b. Unclosed <tool_call> blocks. Some tool-tuned models (notably
  // Apertus) open the block and emit the JSON but stop at EOS WITHOUT a
  // closing </tool_call>, so the paired regex above never matches and the
  // raw block would leak into the reply. Pull the first brace-balanced
  // object after each <tool_call> marker and treat it as a call. Guarded on
  // the paired pass finding nothing AND a stray marker still being present,
  // so closing-tag models (Bonsai/Qwen3/Gemma/LFM2) never reach here.
  if (toolCalls.length === 0 && cleanText.indexOf('<tool_call>') !== -1) {
    const marker = '<tool_call>';
    let idx;
    while ((idx = cleanText.indexOf(marker)) !== -1) {
      const braceStart = cleanText.indexOf('{', idx + marker.length);
      const objStr = braceStart !== -1 ? _adapterExtractBalancedObject(cleanText, braceStart) : null;
      if (objStr) {
        const parsed = _adapterRepairJSON(objStr);
        if (parsed && typeof parsed === 'object') {
          const tcName = parsed.name || parsed.function;
          const argObj = (parsed.arguments && typeof parsed.arguments === 'object') ? parsed.arguments
                       : (parsed.parameters && typeof parsed.parameters === 'object') ? parsed.parameters
                       : (tcName ? {} : parsed);
          if (tcName) {
            toolCalls.push({ name: tcName, arguments: argObj });
          } else {
            const inferred = _adapterInferToolFromArgs(argObj, toolDefs);
            if (inferred) toolCalls.push({ name: inferred, arguments: argObj });
          }
        }
        cleanText = (cleanText.slice(0, idx) + cleanText.slice(braceStart + objStr.length)).trim();
      } else {
        // No parseable object after this marker — strip just the marker so
        // the loop can't spin forever; leave any other text intact.
        cleanText = (cleanText.slice(0, idx) + cleanText.slice(idx + marker.length)).trim();
      }
    }
  }

  // 2. Bare JSON without tags
  if (toolCalls.length === 0) {
    const bareRegex = /\{\s*"(?:name|function)"\s*:\s*"(\w+)"\s*,\s*"(?:arguments|parameters)"\s*:\s*(\{[\s\S]*?\})\s*\}/g;
    while ((match = bareRegex.exec(text)) !== null) {
      const args = _adapterRepairJSON(match[2]);
      if (args) {
        toolCalls.push({ name: match[1], arguments: args });
        cleanText = cleanText.replace(match[0], '');
      }
    }
  }

  // 3. Inline tool.call:name{args} buried in thinking
  if (toolCalls.length === 0 && knownToolNames && knownToolNames.length) {
    const mainContent = text
      .replace(/<\|think\|>[\s\S]*?(<\|\/think\|>|$)/, '')
      .replace(/<\|channel>thought\n?[\s\S]*?(<channel\|>|$)/, '')
      .trim();
    if (!mainContent) {
      const namesAlt = knownToolNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      const intentRegex = new RegExp(`tool[._]?call\\s*[:.]\\s*(${namesAlt})\\s*[{(]([^})]*)`, 'i');
      const intentMatch = text.match(intentRegex);
      if (intentMatch) {
        const args = {};
        intentMatch[2].split(/[,;]/).forEach(pair => {
          const [k, ...rest] = pair.split(':');
          if (k && rest.length) args[k.trim()] = rest.join(':').trim().replace(/["']/g, '');
        });
        toolCalls.push({ name: intentMatch[1], arguments: args });
      }
    }
  }

  // 4. Native LFM2-style call: <|tool_call_start|>[ name(arg="v", n=1) ]<|tool_call_end|>
  // (Pythonic kwargs inside special tokens). LocalMind prompts for <tool_call>
  // XML, but LFM2 was trained to emit this native format and sometimes does —
  // which every pass above misses, so the call would be silently discarded and
  // shown raw. Parse it here. Gated on the distinctive start marker AND a known
  // tool name, so models that matched above never reach this and a hallucinated
  // tool name (e.g. a nonexistent "translate") is ignored rather than executed.
  if (toolCalls.length === 0 && text.indexOf('<|tool_call_start|>') !== -1) {
    const seg = text.split('<|tool_call_start|>')[1] || '';
    const callStr = seg.split('<|tool_call_end|>')[0];
    const m = callStr.match(/([a-zA-Z_]\w*)\s*\(([\s\S]*?)\)\s*\]?\s*$/) || callStr.match(/([a-zA-Z_]\w*)\s*\(([\s\S]*)/);
    if (m) {
      const name = _adapterResolveToolName(m[1], knownToolNames);
      if (name != null) {
        toolCalls.push({ name, arguments: _adapterParsePythonicArgs(m[2]) });
        cleanText = cleanText.replace(/<\|tool_call_start\|>[\s\S]*?(<\|tool_call_end\|>|$)/, '').trim();
      }
    }
  }

  // 5. Native MiniCPM5-style call: <function name="fn"><param …>v</param></function>
  // LocalMind prompts every model for <tool_call> JSON, but MiniCPM5 was
  // trained on this XML shape and emits it regardless — which every pass
  // above misses, so the call was silently dropped AND the markup leaked
  // into the reply (the browser parses <function>/<param> as unknown
  // elements, leaving a bare `name="…">` fragment on screen). Gated on
  // toolCalls being empty, the distinctive '<function' marker, AND a known
  // tool name, so no model that matched above ever reaches here and a
  // hallucinated name is ignored rather than executed.
  if (toolCalls.length === 0 && text.indexOf('<function') !== -1) {
    for (const c of _adapterParseXmlFunctionCalls(text, toolDefs)) {
      const name = _adapterResolveToolName(c.name, knownToolNames);
      if (name != null) toolCalls.push({ name, arguments: c.arguments });
      // Strip the markup either way — a rejected call must not render raw.
      cleanText = cleanText.replace(c.raw, '');
    }
  }

  // 6. The same MiniCPM5 XML call, but with its tags already stripped by the
  // runtime — see _adapterParseStrippedXmlCall for why that happens. Gated
  // hard: only when nothing above matched, only when the raw '<function'
  // marker is ABSENT (so a stream that did keep its tags goes to pass 5,
  // never here), and only when the first segment names a real tool. Prose
  // would have to contain a literal name="<a real tool name>"> to misfire.
  if (toolCalls.length === 0 && text.indexOf('<function') === -1 && /name\s*=\s*["'][^"']+["']\s*>/.test(text)) {
    const c = _adapterParseStrippedXmlCall(text);
    const name6 = c && knownToolNames && knownToolNames.length ? _adapterResolveToolName(c.name, knownToolNames) : null;
    if (name6 != null) {
      const t = _adapterFindToolDef(toolDefs, c.name);
      const props = (t && t.parameters && t.parameters.properties) || {};
      const args = {};
      for (const k of Object.keys(c.args)) args[k] = _adapterCoerceXmlParam(c.args[k], props[k]);
      toolCalls.push({ name: name6, arguments: args });
      cleanText = (cleanText.slice(0, c.start) + cleanText.slice(c.end)).trim();
    }
  }

  // 7. <tool_call> with XML CHILDREN instead of JSON:
  //   <tool_call><name>fn</name><arguments><p>v</p></arguments></tool_call>
  // Seen live from LFM2.5 230M GGUF (2026-09-17). Pass 1 wants a JSON
  // object after the marker and finds none, so the call was dropped and
  // the markup leaked into the bubble. Parse it: the name from <name>,
  // params from <arguments>'s child elements (or a JSON body, if the
  // model mixed shapes), coerced against the tool schema like pass 5.
  // Gated on toolCalls being empty, a <name> element, and a known tool.
  if (toolCalls.length === 0 && text.indexOf('<tool_call>') !== -1 && text.indexOf('<name>') !== -1) {
    const re = /<tool_call>\s*<name>\s*([a-zA-Z_][\w.-]*)\s*<\/name>\s*(?:<arguments>([\s\S]*?)(?:<\/arguments>|(?=<\/tool_call>)|$))?\s*(?:<\/tool_call>)?/g;
    let m7;
    while ((m7 = re.exec(text)) !== null) {
      const name = knownToolNames && knownToolNames.length ? _adapterResolveToolName(m7[1], knownToolNames) : null;
      if (name != null) {
        const body = (m7[2] || '').trim();
        const t = _adapterFindToolDef(toolDefs, name);
        const props = (t && t.parameters && t.parameters.properties) || {};
        let args = null;
        if (body[0] === '{') args = _adapterRepairJSON(body);
        if (!args) {
          args = {};
          const pr = /<([a-zA-Z_][\w.-]*)>([\s\S]*?)<\/\1>/g;
          let pm;
          while ((pm = pr.exec(body)) !== null) args[pm[1]] = _adapterCoerceXmlParam(pm[2].trim(), props[pm[1]]);
        }
        toolCalls.push({ name, arguments: args });
      }
      // Strip the markup either way — a rejected call must not render raw.
      // Pass 1 may already have removed the <tool_call> marker (its
      // no-JSON branch), so match from <name> and tolerate a missing tag.
      const esc = m7[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      cleanText = cleanText.replace(new RegExp('(?:<tool_call>\\s*)?<name>\\s*' + esc + '\\s*<\\/name>[\\s\\S]*?(?:<\\/tool_call>|$)'), '').trim();
    }
  }

  // Passes 1 and 3 keep the model's spelling; give every call the caller's spelling when one tool matches.
  for (const c of toolCalls) {
    const name = _adapterResolveToolName(c.name, knownToolNames);
    if (name != null) c.name = name;
  }
  return { toolCalls, cleanText: cleanText.trim() };
}

function _adapterFormatToolResultMessage(name, result) {
  // The string the model sees as the tool result. Wrapped as a
  // user-role message in apply_chat_template — Gemma's convention.
  return `<tool_response>
${JSON.stringify({ name, result })}
</tool_response>`;
}

export {
  _adapterRepairJSON,
  _adapterResolveToolName,
  _adapterBuildToolPrompt,
  _adapterPyJson,
  _adapterBuildQwenXmlToolPrompt,
  _adapterParseQwenXmlCalls,
  _adapterBuildArgKeyToolPrompt,
  _adapterParseArgKeyCalls,
  _adapterInferToolFromArgs,
  _adapterParsePythonicArgs,
  _adapterCoerceXmlParam,
  _adapterParseXmlFunctionCalls,
  _adapterExtractBalancedObject,
  _adapterParseStrippedXmlCall,
  _adapterParseToolCalls,
  _adapterFormatToolResultMessage,
};
