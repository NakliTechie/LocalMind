// test-gemma4-layout.mjs — rung 2c's ingest layout (gemma4_moe_ssd.js) and the Q4_0 split it relies on.
//   node scripts/test-gemma4-layout.mjs [path/to/gemma-4-26B_q4_0-it.gguf]
// 1. splitQ4 is bit-exact: values rebuilt from the nibble + scale planes equal ggml's Q4_0 dequant.
// 2. On the real GGUF header (skipped when the file is absent): every tensor byte maps to exactly one unit,
//    units are sorted and disjoint, destinations are disjoint and inside their files, each expert record is
//    filled exactly once, and the sizes match the model (3,345,408-byte records, 30 × 128 of them).
import assert from 'node:assert/strict';
import { openSync, readSync, closeSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { splitQ4, parseGguf, tensorBytes, Q4_BLOCK } from '../qwen3_moe_ssd.js';
import { planLayoutGemma4, planUnitsGemma4, configFromGgufGemma4 } from '../gemma4_moe_ssd.js';

const f16 = (h) => { const s = h >> 15 ? -1 : 1, e = (h >> 10) & 31, m = h & 1023; return e === 0 ? s * m * 2 ** -24 : e === 31 ? NaN : s * (1 + m / 1024) * 2 ** (e - 15); };

// 1. splitQ4 bit-exactness
{
  const nb = 97, src = new Uint8Array(nb * Q4_BLOCK);
  let x = 12345; const rnd = () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) & 255; };
  for (let i = 0; i < src.length; i++) src[i] = rnd();
  for (let b = 0; b < nb; b++) { src[b * Q4_BLOCK + 1] &= 0x3b; }   // keep scales finite
  const q = new Uint8Array(nb * 16), s = new Uint8Array(nb * 2);
  splitQ4(src, q, s);
  for (let b = 0; b < nb; b++) {
    const d = f16(src[b * Q4_BLOCK] | (src[b * Q4_BLOCK + 1] << 8));
    const d2 = f16(s[2 * b] | (s[2 * b + 1] << 8));
    for (let j = 0; j < 16; j++) {
      const byte = src[b * Q4_BLOCK + 2 + j], byte2 = q[b * 16 + j];
      assert.equal(((byte & 15) - 8) * d, ((byte2 & 15) - 8) * d2, `block ${b} value ${j}`);
      assert.equal(((byte >> 4) - 8) * d, ((byte2 >> 4) - 8) * d2, `block ${b} value ${j + 16}`);
    }
  }
}

// 2. the real header
const path = process.argv[2] || `${homedir()}/.cache/localmind-moe/gemma-4-26B_q4_0-it.gguf`;
if (!existsSync(path)) { console.log(`gemma4 layout: splitQ4 ok; header checks skipped (${path} not found)`); process.exit(0); }
const fd = openSync(path, 'r'); const head = new Uint8Array(32 << 20); readSync(fd, head, 0, head.length, 0); closeSync(fd);
const gguf = parseGguf(head);
const cfg = configFromGgufGemma4(gguf.kv);
assert.equal(cfg.layers, 30); assert.equal(cfg.experts, 128); assert.equal(cfg.topK, 8); assert.equal(cfg.expertFf, 704); assert.equal(cfg.hidden, 2816);
assert.deepEqual(cfg.swa.map((s, i) => s ? -1 : i).filter((i) => i >= 0), [5, 11, 17, 23, 29], 'full-attention layers');
const layout = planLayoutGemma4(gguf);
assert.equal(layout.experts.record, 3345408);
assert.equal(layout.experts.bytes, 3345408 * 30 * 128);
const units = planUnitsGemma4(gguf, layout);
const total = gguf.tensors.reduce((a, t) => a + tensorBytes(t), 0);
assert.equal(units.reduce((a, u) => a + u.len, 0), total, 'units cover every tensor byte');
for (let i = 1; i < units.length; i++) assert.ok(units[i].src >= units[i - 1].src + units[i - 1].len, `units ${i - 1}/${i} overlap`);
const ranges = { dense: [], experts: [] };
for (const u of units) {
  if (u.raw !== undefined) ranges[u.file].push([u.raw, u.raw + u.len]);
  else { const nb = u.len / Q4_BLOCK; ranges[u.file].push([u.q, u.q + nb * 16], [u.s, u.s + nb * 2]); }
}
const size = { dense: layout.dense.bytes, experts: layout.experts.bytes };
for (const [file, rs] of Object.entries(ranges)) {
  rs.sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < rs.length; i++) {
    assert.ok(rs[i][1] <= size[file], `${file} write past the end`);
    if (i) assert.ok(rs[i][0] >= rs[i - 1][1], `${file} writes overlap at ${rs[i][0]}`);
  }
}
const expertBytes = ranges.experts.reduce((a, [s0, e0]) => a + (e0 - s0), 0);
assert.equal(expertBytes, layout.experts.bytes, 'every expert record filled exactly once');
console.log(`gemma4 layout: ok — ${units.length} units, experts ${(layout.experts.bytes / 1e9).toFixed(2)} GB in ${30 * 128} records of ${layout.experts.record} B, dense ${(layout.dense.bytes / 1e9).toFixed(2)} GB`);
