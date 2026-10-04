// Dedicated module worker for the rung-2a harness: the engine runs here, as in LocalMind.
import { makeApi } from './qwen3-moe-api.mjs';
const api = makeApi((o) => { self.postMessage({ log: o }); return o; });
self.onmessage = async (e) => {
  const { id, method, args } = e.data;
  try { self.postMessage({ id, result: await api[method](...args) }); }
  catch (err) { self.postMessage({ id, error: `${err && err.message || err}\n${err && err.stack || ''}` }); }
};
