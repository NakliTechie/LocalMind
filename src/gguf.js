/* gguf.js — read a GGUF header and split quantized blocks into GPU-friendly planes. No dependencies.
 * Extracted unchanged from LocalMind's qwen3_moe_ssd.js (2026-10-05).
 *
 *   const { kv, tensors, dataStart } = parseGguf(headerBytes);   // throws { needBytes } if too short
 *   tensorBytes(tensor)                                            // bytes of one tensor in the file
 *   splitQ8(src, q, s) / splitQ4(src, q, s)                        // blocks → value plane + f16-scale plane, bit-exact
 */

export const GGML = { F32: 0, F16: 1, Q4_0: 2, Q8_0: 8, Q6_K: 14 };
export const Q8_BLOCK = 34;  // f16 scale + 32 × int8
export const Q4_BLOCK = 18;  // f16 scale + 32 × 4-bit (16 bytes)
export const Q6K_BLOCK = 210; // 256 values: ql[128] + qh[64] + scales[16] + f16 d

// Parses a GGUF header. Throws { needBytes } when `u8` stops before the header ends.
export function parseGguf(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let p = 0;
  const need = (n) => { if (p + n > u8.byteLength) { const e = new Error('GGUF header truncated'); e.needBytes = Math.max(u8.byteLength * 2, p + n + (1 << 20)); throw e; } };
  const u32 = () => { need(4); const v = dv.getUint32(p, true); p += 4; return v; };
  const u64 = () => { need(8); const v = Number(dv.getBigUint64(p, true)); p += 8; return v; };
  // ignoreBOM: keep a leading U+FEFF (Gemma 4's vocab has '#', '//' and '<?' twice, once with a byte-order mark).
  const dec = new TextDecoder('utf-8', { ignoreBOM: true });
  const str = () => { const n = u64(); need(n); const s = dec.decode(u8.subarray(p, p + n)); p += n; return s; };
  const scalar = {
    0: () => { need(1); return dv.getUint8(p++); }, 1: () => { need(1); return dv.getInt8(p++); },
    2: () => { need(2); const v = dv.getUint16(p, true); p += 2; return v; }, 3: () => { need(2); const v = dv.getInt16(p, true); p += 2; return v; },
    4: u32, 5: () => { need(4); const v = dv.getInt32(p, true); p += 4; return v; },
    6: () => { need(4); const v = dv.getFloat32(p, true); p += 4; return v; },
    7: () => { need(1); return dv.getUint8(p++) !== 0; },
    10: u64, 11: () => { need(8); const v = Number(dv.getBigInt64(p, true)); p += 8; return v; },
    12: () => { need(8); const v = dv.getFloat64(p, true); p += 8; return v; },
  };
  const value = (t) => {
    if (t === 8) return str();
    if (t === 9) { const at = u32(), n = u64(); const a = new Array(n); for (let i = 0; i < n; i++) a[i] = value(at); return a; }
    const f = scalar[t];
    if (!f) throw new Error(`GGUF: unknown value type ${t}`);
    return f();
  };
  need(4);
  if (dec.decode(u8.subarray(0, 4)) !== 'GGUF') throw new Error('not a GGUF file');
  p = 4;
  const version = u32(), nTensors = u64(), nKv = u64();
  const kv = {};
  for (let i = 0; i < nKv; i++) { const k = str(); kv[k] = value(u32()); }
  const tensors = [];
  for (let i = 0; i < nTensors; i++) {
    const name = str(), nd = u32(), dims = [];
    for (let d = 0; d < nd; d++) dims.push(u64());
    const type = u32(), offset = u64();
    tensors.push({ name, dims, type, offset });
  }
  const align = kv['general.alignment'] || 32;
  const dataStart = Math.ceil(p / align) * align;
  return { version, kv, tensors, headerBytes: p, dataStart };
}

export function tensorBytes(t) {
  const n = t.dims.reduce((a, b) => a * b, 1);
  if (t.type === GGML.F32) return n * 4;
  if (t.type === GGML.F16) return n * 2;
  if (t.type === GGML.Q8_0) return (n / 32) * Q8_BLOCK;
  if (t.type === GGML.Q4_0) return (n / 32) * Q4_BLOCK;
  if (t.type === GGML.Q6_K) return (n / 256) * Q6K_BLOCK;
  throw new Error(`unsupported tensor type ${t.type} (${t.name})`);
}

// Q8_0 blocks → an int8 plane + an f16-scale plane, bit-exact. `src` holds whole blocks and
// starts at an even byte offset, so both planes copy as u16 lanes.
export function splitQ8(src, q, s) {
  const nb = src.byteLength / Q8_BLOCK;
  const a = new Uint16Array(src.buffer, src.byteOffset, nb * 17);
  const qd = new Uint16Array(q.buffer, q.byteOffset, nb * 16);
  const sd = new Uint16Array(s.buffer, s.byteOffset, nb);
  for (let b = 0, i = 0, o = 0; b < nb; b++, i += 17, o += 16) {
    sd[b] = a[i];
    qd[o] = a[i + 1]; qd[o + 1] = a[i + 2]; qd[o + 2] = a[i + 3]; qd[o + 3] = a[i + 4];
    qd[o + 4] = a[i + 5]; qd[o + 5] = a[i + 6]; qd[o + 6] = a[i + 7]; qd[o + 7] = a[i + 8];
    qd[o + 8] = a[i + 9]; qd[o + 9] = a[i + 10]; qd[o + 10] = a[i + 11]; qd[o + 11] = a[i + 12];
    qd[o + 12] = a[i + 13]; qd[o + 13] = a[i + 14]; qd[o + 14] = a[i + 15]; qd[o + 15] = a[i + 16];
  }
}

// Q4_0 blocks → a nibble plane (16 bytes per 32 values, ggml's order: low nibbles are values 0..15,
// high nibbles 16..31) + an f16-scale plane, bit-exact.
export function splitQ4(src, q, s) {
  const nb = src.byteLength / Q4_BLOCK;
  const a = new Uint16Array(src.buffer, src.byteOffset, nb * 9);
  const qd = new Uint16Array(q.buffer, q.byteOffset, nb * 8);
  const sd = new Uint16Array(s.buffer, s.byteOffset, nb);
  for (let b = 0, i = 0, o = 0; b < nb; b++, i += 9, o += 8) {
    sd[b] = a[i];
    qd[o] = a[i + 1]; qd[o + 1] = a[i + 2]; qd[o + 2] = a[i + 3]; qd[o + 3] = a[i + 4];
    qd[o + 4] = a[i + 5]; qd[o + 5] = a[i + 6]; qd[o + 6] = a[i + 7]; qd[o + 7] = a[i + 8];
  }
}
