// Node proof of the fetch_page proxy question (PAGE-PROXY block, index.html): a site that blocks direct reads is
// fetched through allorigins.win only after a yes.
//   1. The setting is off by default, so the app asks on a card; "Fetch" allows once, "Don't fetch" declines,
//      "Always" allows and turns the setting on (and ticks the Settings switch); with it on, no card.
//   2. Stop while the card is open counts as Don't fetch; no chat bubble (no card possible) declines.
//   3. fetchAndExtract asks before the proxy request, and the decline is an error the model sees.
// Run: node scripts/test-page-proxy.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const src = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const block = /\/\/ PAGE-PROXY[\s\S]*?\/\/ END PAGE-PROXY/.exec(src);
assert.ok(block, 'PAGE-PROXY block missing from index.html');

// A minimal DOM: elements with children, buttons that click, a Settings checkbox.
const el = () => ({ children: [], attrs: {}, style: {}, classList: { add() {} }, setAttribute(k, v) { this.attrs[k] = v; },
  append(...c) { this.children.push(...c); }, appendChild(c) { this.children.push(c); return c; },
  insertBefore(c) { this.children.push(c); }, replaceChildren(...c) { this.children = c; },
  addEventListener(t, f) { this['on' + t] = f; }, focus() {}, querySelector() { return this.children[0]; } });
const toggle = el();
const make = () => {
  const store = new Map(), cards = [];
  const localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) };
  const msg = el(); msg.insertBefore = (c) => cards.push(c);
  const env = { generating: true, currentAssistantEl: { bubble: { parentElement: msg } } };
  const document = { createElement: el, getElementById: (id) => (id === 'pageProxyToggle' ? toggle : null) };
  const api = new Function('localStorage', 'document', 'env',
    `with (env) { ${block[0]}\nreturn { pageProxyOn, askPageProxy, PAGE_PROXY_KEY }; }`)(localStorage, document, env);
  return { api, store, cards, env };
};
const click = (card, label) => card.children[1].children.find((b) => b.textContent.startsWith(label)).onclick();

// 1. Off by default; each answer.
{
  const { api, cards, store } = make();
  assert.equal(api.pageProxyOn(), false, 'off by default');
  let p = api.askPageProxy('https://blocked.example/a');
  assert.equal(cards[0].children[0].textContent, 'blocked.example blocks direct reading. Fetch it through allorigins.win? That service will see the address.');
  click(cards[0], 'Fetch'); assert.equal(await p, 'allow');
  assert.match(cards[0].children[0].textContent, /Fetched blocked\.example/);
  p = api.askPageProxy('https://blocked.example/b'); click(cards[1], "Don't"); assert.equal(await p, 'deny');
  assert.equal(api.pageProxyOn(), false, 'one-time answers do not change the setting');
  p = api.askPageProxy('https://blocked.example/c'); click(cards[2], 'Always'); assert.equal(await p, 'always');
  assert.equal(api.pageProxyOn(), true); assert.equal(store.get(api.PAGE_PROXY_KEY), 'on'); assert.equal(toggle.checked, true, 'Settings switch ticked');
  assert.equal(await api.askPageProxy('https://blocked.example/d'), 'allow'); assert.equal(cards.length, 3, 'no card once on');
}
// 2. Stop = decline; no bubble = decline.
{
  const { api, cards, env } = make();
  const p = api.askPageProxy('https://blocked.example/'); assert.equal(cards.length, 1);
  env.generating = false; assert.equal(await p, 'deny', 'Stop while asking declines');
  env.currentAssistantEl = null; assert.equal(await api.askPageProxy('https://blocked.example/'), 'deny', 'no chat bubble: decline');
}
// 3. Wiring.
const fx = /async function fetchAndExtract[\s\S]*?\n    }\n/.exec(src)[0];
assert.ok(fx.indexOf("await askPageProxy(url) === 'deny'") > 0 && fx.indexOf("await askPageProxy(url)") < fx.indexOf('api.allorigins.win'), 'asks before the proxy request');
assert.match(fx, /declined to fetch it through allorigins\.win/);
assert.match(src, /<input type="checkbox" id="pageProxyToggle">/, 'Settings switch, unticked in the markup');
console.log('page proxy: 3 groups pass');
