# LocalMind JavaScript API (`window.localmind`)

Settings → **JavaScript API** → tick the checkbox. An OpenAI-shaped object is exposed on `window.localmind` so any script in the same tab can drive the loaded model. Disabled by default, opt-in only, and detached when the toggle goes off.

## Usage

```js
const lm = window.localmind;
await lm.load('gemma3-1b');                    // or any HF id you've added

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

## Demo

Open [`demo.html`](./demo.html) in the same folder. It iframes `index.html`, auto-flips the toggle, waits for the model, and runs both a non-streaming and a streaming completion against `iframe.contentWindow.localmind`.

## Architecture / security

- Same-tab only — cross-origin scripts cannot reach `window.localmind` (Same-Origin Policy)
- Same-origin iframes *can* (used by `demo.html`)
- All chat-UI and API calls share a single FIFO inference queue, so a misbehaving caller can't race the user
- No tools means a stored-XSS attacker (e.g. via a compromised CDN or a poisoned web search result) can't trivially exfiltrate memory or burn search credits — they'd already need page-level XSS to read those, which the API doesn't make easier

## Stability

Experimental. v1.0 is a tech demonstrator; the shape may change before a stable v1.1.
