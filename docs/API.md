# LocalMind JavaScript API (`window.localmind`)

Settings → **JavaScript API** → tick the checkbox. An OpenAI-shaped object is exposed on `window.localmind` so any script in the same tab can drive the loaded model. Disabled by default, opt-in only, and detached when the toggle goes off.

## Usage

```js
const lm = window.localmind;
await lm.load('lfm2-230m-webgpu');             // any MODELS key, or an HF id you've added

// Non-streaming
const r = await lm.chat.completions.create({
  messages: [
    { role: 'system', content: 'You are concise.' },
    { role: 'user',   content: 'What is 2 + 2?' },
  ],
  max_tokens: 30,
});
console.log(r.choices[0].message.content);

// Streaming — async iterator yielding OpenAI-shaped chat.completion.chunk
const stream = await lm.chat.completions.create({
  messages: [{ role: 'user', content: 'Count to 10' }],
  stream: true,
});
for await (const chunk of stream) {
  const delta = chunk.choices[0].delta.content;
  if (delta) process.stdout.write(delta);
}
// Breaking out of the loop cancels the worker so the next call
// doesn't queue behind the abandoned generation.
```

## Surface (v1.0)

- `version`, `ready`, `model` — live getters reflecting current state
- `listModels()` — full registry incl. custom models, with `loaded` flag
- `load(idOrKey)` — accepts the short key or the full HF id
- `chat.completions.create(params)` — non-streaming or streaming via `stream: true`

## What's NOT exposed (intentional)

- `tools` / tool calling (would let callers spend search credits, write to memory, etc.)
- Memory read/write
- File system handles
- Web search
- Multimodal input
- API keys or user profile

The object is frozen (`Object.freeze`) and attached as a non-writable property, so scripts can't overwrite it with a malicious shim. Every call is logged to the in-memory **activity log** (last 50 entries) viewable via the `● API` chip in the toolbar or `Settings → View activity log`.

## Driving it from another page

A page served from the same origin can embed LocalMind in an iframe and use the iframe's `localmind` object:

```js
const iframe = document.querySelector('iframe');           // <iframe src="index.html">
await new Promise(r => iframe.addEventListener('load', r, { once: true }));
const doc = iframe.contentDocument;
const toggle = doc.getElementById('apiEnabledToggle');      // Settings → JavaScript API
if (!toggle.checked) {
  toggle.checked = true;
  toggle.dispatchEvent(new Event('change', { bubbles: true }));
}
const lm = iframe.contentWindow.localmind;
while (!lm.ready) await new Promise(r => setTimeout(r, 200));  // let the boot-time load finish first
await lm.load('lfm2-230m-webgpu');                              // no-op if it is already the loaded model
const r = await lm.chat.completions.create({
  messages: [{ role: 'user', content: 'What is 2 + 2?' }],
});
```

Wait for `lm.ready` before calling `load()`: LocalMind starts loading a model on boot, and a `load()` issued during that boot load is rejected with "Load superseded by another load". A cross-origin page cannot do any of this: reading `iframe.contentDocument` throws.

## Architecture / security

- Same-tab only — cross-origin scripts cannot reach `window.localmind` (Same-Origin Policy)
- Same-origin iframes *can* (see the snippet above)
- All chat-UI and API calls share a single FIFO inference queue, so a misbehaving caller can't race the user
- No tools means a stored-XSS attacker (e.g. via a compromised CDN or a poisoned web search result) can't trivially exfiltrate memory or burn search credits — they'd already need page-level XSS to read those, which the API doesn't make easier

## Stability

Experimental. v1.0 is a tech demonstrator; the shape may change before a stable v1.1.
