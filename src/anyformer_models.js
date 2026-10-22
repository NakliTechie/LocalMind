/* anyformer_models.js — models LocalMind loads through anyformer (github.com/NakliTechie/anyformer.js), not through an
 * engine of its own: the convergence plan of 2026-10-22 (LocalMind → anyformer → transformers.js / diskformer).
 * anyformer picks the back end per model; LocalMind sees one call shape.
 *
 * AnyformerModel gives an anyformer session the engine interface LocalMind's SSD worker drives (moeSsdWorkerSrc):
 * static load(null, { maxCtx, onProgress, signal }), generate(messages, { maxNewTokens, signal }) streaming
 * { text }, reset(), dispose(), and the think markers. One subclass per model names its repo.
 *
 * anyformer loads from jsDelivr by GitHub tag until it is on npm. Through diskformer's llama.cpp path reasoning is off
 * unless generate() passes { thinking: true } (anyformer v0.2.1), and the reply is text only (no token ids). With
 * reasoning on, the reply opens inside the thought; the class drops the literal <think> and </think> from the text
 * and marks the boundary with a chunk whose token is THINK_CLOSE (the worker's close event).
 */
const THINK_CLOSE = -2;

export const ANYFORMER_URL = 'https://cdn.jsdelivr.net/gh/NakliTechie/anyformer.js@v0.2.1/index.js';

// anyformer's progress events → the engine events the SSD worker posts: a download as 'weights', planning as 'init'.
function toEngineProgress(e) {
  if (!e) return null;
  if (e.status === 'download') return { status: 'weights', loaded: e.loaded, total: e.total };
  if (e.status === 'load' || e.status === 'plan') return { status: 'init' };
  return null;
}

export class AnyformerModel {
  static repo = null;
  static budget = 4e9;   // GPU bytes; the llama.cpp path plans its expert slots from it

  static async load(_id, opts = {}) {
    const { load } = await import(ANYFORMER_URL);
    const session = await load(this.repo, {
      budget: opts.budget || this.budget, maxCtx: opts.maxCtx, signal: opts.signal,
      onProgress: (e) => { const ev = toEngineProgress(e); if (ev && opts.onProgress) opts.onProgress(ev); },
    });
    return new this(session);
  }

  constructor(session) { this.session = session; this.backend = session.backend; }

  get thinkOpenTokenId() { return null; }
  get thinkCloseTokenId() { return THINK_CLOSE; }
  get thinkInPrompt() { return true; }
  get alwaysThinks() { return false; }

  // The reply text without its <think> / </think> tags. When </think> first appears, the text up to it goes out, then
  // the same text again with token THINK_CLOSE (an empty delta), so the worker closes the thought with no text lost.
  async *generate(messages, { maxNewTokens = 1024, signal, enableThinking = false } = {}) {
    let closed = false;
    for await (const c of this.session.generate(messages, { maxNewTokens, signal, thinking: enableThinking })) {
      const raw = String(c.text || '').replace(/^\s*<think>\n?/, '');
      const at = raw.indexOf('</think>');
      // The worker posts no text on its close event, so the thought's last text goes out first.
      if (at >= 0 && !closed) { closed = true; yield { text: raw.slice(0, at) }; yield { text: raw.slice(0, at), token: THINK_CLOSE }; }
      const text = at >= 0 ? raw.slice(0, at) + raw.slice(at + '</think>'.length).replace(/^\n+/, '') : raw;
      yield { text, tokens: c.tokens, tokPerSec: c.tokPerSec };
    }
  }

  reset() {}
  async dispose() { await this.session.dispose(); }
}

// Z.ai's GLM-4.7-Flash (deepseek2 architecture, 30B-A3B): unsloth's GGUF; anyformer's diskformer-llama back end
// picks the Q4_K_M file (18.3 GB). diskformer checked the architecture on this model (docs/coverage.md, Q3_K_M).
export class Glm47Flash extends AnyformerModel {
  static repo = 'unsloth/GLM-4.7-Flash-GGUF';
}
