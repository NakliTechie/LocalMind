/* anyformer_models.js — models LocalMind loads through anyformer (github.com/NakliTechie/anyformer.js), not through an
 * engine of its own: the convergence plan of 2026-10-22 (LocalMind → anyformer → transformers.js / diskformer).
 * anyformer picks the back end per model; LocalMind sees one call shape.
 *
 * AnyformerModel gives an anyformer session the engine interface LocalMind's SSD worker drives (moeSsdWorkerSrc):
 * static load(null, { maxCtx, onProgress, signal }), generate(messages, { maxNewTokens, signal }) streaming
 * { text }, reset(), dispose(), and the think markers. One subclass per model names its repo.
 *
 * anyformer loads from jsDelivr by GitHub tag until it is on npm. Through diskformer's llama.cpp path reasoning is off
 * unless generate() passes { thinking: true } (llama.cpp path since anyformer v0.2.1, hand engines since v0.2.4), and the reply is text only (no token ids). With
 * reasoning on, the reply opens inside the thought; the class drops the literal <think> and </think> from the text
 * and marks the boundary with a chunk whose token is THINK_CLOSE (the worker's close event).
 */
const THINK_CLOSE = -2;

export const ANYFORMER_URL = 'https://cdn.jsdelivr.net/gh/NakliTechie/anyformer.js@v0.2.4/index.js';

// anyformer's progress events → the engine events the SSD worker posts. The llama.cpp path reports 'download' (bytes
// into OPFS) and 'load' / 'plan'; a hand engine (diskformer back end) reports its own engine events, 'weights' with
// bytes while it ingests and with kind 'tensors' while it uploads, and 'init'. Every byte event must reach the worker:
// the page's load watchdog ends a load that reports no progress for 3 minutes (the Ling production check, 2026-10-23).
function toEngineProgress(e) {
  if (!e) return null;
  if (e.status === 'download') return { status: 'weights', loaded: e.loaded, total: e.total };
  if (e.status === 'weights') return { status: 'weights', kind: e.kind, loaded: e.loaded, total: e.total };
  if (e.status === 'load' || e.status === 'plan' || e.status === 'init') return { status: 'init' };
  return null;
}

export class AnyformerModel {
  static repo = null;
  static file = undefined;   // a GGUF in the repo; undefined lets anyformer pick (the file diskformer checked)
  static budget = 4e9;   // GPU bytes; the llama.cpp path plans its expert slots from it

  static async load(_id, opts = {}) {
    const { load } = await import(ANYFORMER_URL);
    const session = await load(this.repo, {
      budget: opts.budget || this.budget, maxCtx: opts.maxCtx, signal: opts.signal, ...(this.file ? { file: this.file } : {}),
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

// Z.ai's GLM-4.7-Flash (deepseek2 architecture, 30B-A3B): unsloth's Q4_K_M GGUF (18.3 GB), live-checked in LocalMind
// 2026-10-23 (plan/2026-10-23-glm-anyformer). diskformer gated the architecture on this model's Q3_K_M (14.6 GB, 8/9),
// which anyformer would pick by default; Q4_K_M keeps the higher-precision file.
export class Glm47Flash extends AnyformerModel {
  static repo = 'unsloth/GLM-4.7-Flash-GGUF';
  static file = 'GLM-4.7-Flash-Q4_K_M.gguf';
}

// inclusionAI's Ling 3.0 Flash (bailingmoe3, 124B-A5B): the two-part Q4_K_M; anyformer (v0.2.3+) sends it to diskformer's
// LingMoeSsd hand engine (built in LocalMind 2026-10-22, now diskformer's; gate plan/2026-10-22-ling-harness), which
// needs a GPU budget of 6.8 GB. With reasoning on, its template opens <think> in the prompt.
export class Ling3Flash extends AnyformerModel {
  static repo = 'inclusionAI/Ling-3.0-flash-GGUF';
  static budget = 7e9;
}
