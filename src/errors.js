/* errors.js — coded errors for the store, ingest and the engines. A host branches on `code`, never on the
 * message text and never on `instanceof` (two copies of this module, e.g. a CDN copy and a vendored one, make
 * instanceof false for the same error). Check with isDiskformerError(e, code).
 *
 *   try { await Engine.load(…) } catch (e) { if (isDiskformerError(e, 'LOAD_ABORTED')) … }
 *
 * Codes:
 *   LOAD_FAILED         ingest or load failed (HTTP, quota, a GGUF the engine cannot run); `cause` holds the original
 *   LOAD_ABORTED        the caller's signal aborted a load or ingest; decided from `signal.aborted`, not the error name
 *   UNSUPPORTED_DEVICE  no WebGPU, no adapter, or a missing required feature (shader-f16)
 *   BUDGET_TOO_SMALL    gpuBudgetBytes cannot hold the fixed GPU part plus the smallest expert cache; `detail` has the bytes
 *   CONTEXT_FULL        the conversation outgrew the engine's context
 *   EXECUTION_FAILED    a prefill or decode step failed; `cause` holds the original
 *   RESOURCE_DISPOSED   the engine was disposed: no further generate()
 */

export const ERROR_CODES = Object.freeze(['LOAD_FAILED', 'LOAD_ABORTED', 'UNSUPPORTED_DEVICE', 'BUDGET_TOO_SMALL', 'CONTEXT_FULL', 'EXECUTION_FAILED', 'RESOURCE_DISPOSED']);

export class DiskformerError extends Error {
  constructor(code, message, { cause, detail } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'DiskformerError';
    this.code = code;
    if (detail !== undefined) this.detail = detail;
  }
}

export const isDiskformerError = (e, code) => !!e && e.name === 'DiskformerError' && typeof e.code === 'string' && (code === undefined || e.code === code);

// Re-code an error from a load or ingest: an aborted signal wins over whatever the abort threw; a coded error
// passes through; anything else becomes `fallback` with the original as `cause`.
export function codedError(e, { signal, fallback = 'LOAD_FAILED', what = 'load' } = {}) {
  if (signal && signal.aborted) return isDiskformerError(e, 'LOAD_ABORTED') ? e : new DiskformerError('LOAD_ABORTED', `${what} aborted`, { cause: e });
  if (isDiskformerError(e)) return e;
  return new DiskformerError(fallback, `${what} failed: ${(e && e.message) || e}`, { cause: e });
}
