/* anyformer_models.js — models LocalMind loads through anyformer (github.com/NakliTechie/anyformer.js), not through an
 * engine of its own: the convergence plan of 2026-10-22 (LocalMind → anyformer → transformers.js / diskformer).
 * anyformer picks the back end per model; LocalMind sees one call shape.
 *
 * AnyformerModel gives an anyformer session the engine interface LocalMind's SSD worker drives (moeSsdWorkerSrc):
 * static load(null, { maxCtx, localFile, onProgress, signal }), generate(messages, { maxNewTokens, signal,
 * enableThinking }) streaming { text, token }, prime(), ensureVision(), reset(), dispose(), and the think markers. One
 * subclass per model names its repo. anyformer loads from npm through jsDelivr, at an exact version.
 *
 * Two shapes of session (anyformer v0.3.0):
 *   - a diskformer hand engine: chunks carry the engine's token ids and session.think its markers, so they pass
 *     through unchanged and the worker handles reasoning as it does for LocalMind's own engines;
 *   - diskformer's llama.cpp path: text only, session.think null. With reasoning on, the reply opens inside the
 *     thought; the class drops the literal <think> and </think> from the text and marks the boundary with a chunk
 *     whose token is THINK_CLOSE (the worker's close event).
 */
const THINK_CLOSE = -2;

export const ANYFORMER_URL = 'https://cdn.jsdelivr.net/npm/anyformer@0.3.2/index.js';

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
  static budget = 4e9;   // GPU bytes: the llama.cpp path plans its expert slots from it; for a hand engine, the fit check
  static poolBytes = undefined;   // a hand engine's expert cache (LocalMind's own engines ran with 4 GiB)

  static async load(_id, opts = {}) {
    const { load } = await import(ANYFORMER_URL);
    const session = await load(this.repo, {
      budget: opts.budget || this.budget, maxCtx: opts.maxCtx, signal: opts.signal, ...(this.file ? { file: this.file } : {}),
      ...(this.poolBytes ? { poolBytes: this.poolBytes } : {}), ...(opts.localFile ? { localFile: opts.localFile } : {}),
      onProgress: (e) => { const ev = toEngineProgress(e); if (ev && opts.onProgress) opts.onProgress(ev); },
    });
    return new this(session);
  }

  constructor(session) {
    this.session = session; this.backend = session.backend; this.think = session.think || null;
    // Present only where the engine has them (Qwen3.6: both), so the worker's own checks still work.
    if (session.prime) this.prime = (system) => session.prime(system);
    if (session.ensureVision) this.ensureVision = (o) => session.ensureVision(o);
  }

  get thinkOpenTokenId() { return this.think ? this.think.openId : null; }
  get thinkCloseTokenId() { return this.think ? this.think.closeId : THINK_CLOSE; }
  get thinkInPrompt() { return this.think ? this.think.inPrompt ?? undefined : true; }
  get thinkPreamble() { return this.think ? this.think.preamble ?? '' : ''; }
  get alwaysThinks() { return this.think ? this.think.always === true : false; }

  // A hand engine's chunks pass through. On the llama.cpp path: the reply text without its <think> / </think> tags; when
  // </think> first appears, the text up to it goes out, then the same text again with token THINK_CLOSE (an empty
  // delta), so the worker closes the thought with no text lost.
  async *generate(messages, { maxNewTokens = 1024, signal, enableThinking = false } = {}) {
    if (this.think) {
      for await (const c of this.session.generate(messages, { maxNewTokens, signal, thinking: enableThinking })) yield c;
      return;
    }
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

// Qwen3.6 35B-A3B: unsloth's Q8_0 GGUF (36.9 GB) on diskformer's Qwen35MoeSsd hand engine, which LocalMind ran itself
// until 2026-10-23 (same engine code; the store under localmind-ssd/ is the same one, so a stored copy is reused).
// A 4 GiB expert cache as before; the budget covers it, the dense weights and the KV cache.
export class Qwen36 extends AnyformerModel {
  static repo = 'unsloth/Qwen3.6-35B-A3B-GGUF';
  static budget = 9e9;
  static poolBytes = 4 * 2 ** 30;
}

// Gemma 4 26B-A4B: Google's QAT Q4_0 GGUF (14.4 GB) on diskformer's Gemma4MoeSsd hand engine, which LocalMind ran
// itself until 2026-10-23; the stored copy is reused. Its thought channel (<|channel>thought … <channel|>) comes
// through session.think (preamble 'thought\n'). A 4 GiB expert cache as before.
export class Gemma4_26B extends AnyformerModel {
  static repo = 'google/gemma-4-26B-A4B-it-qat-q4_0-gguf';
  static budget = 7.5e9;
  static poolBytes = 4 * 2 ** 30;
}
