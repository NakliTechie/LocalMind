// Cut a valid N-layer GGUF from the front of a larger one (or from a partial download): the
// KV section is copied verbatim with `<arch>.block_count` patched to N, the tensor table keeps
// only blk.0..blk.N-1 plus the non-block tensors, and the data section is copied as a prefix.
// Works only when the kept tensors form a prefix of the data section (true for the official
// Qwen3-MoE GGUFs: output, output_norm, token_embd, then blk.0, blk.1, …).
//
//   node scripts/gguf-truncate.mjs <in.gguf> <out.gguf> <layers>
//
// Used to test the SSD-streaming engine against llama.cpp on a small model with the same
// tensors and kernels (the logits are meaningless as language, but both sides must agree).
import { openSync, readSync, writeSync, closeSync, fstatSync } from 'node:fs';

const [inPath, outPath, nStr] = process.argv.slice(2);
const N = Number(nStr);
if (!inPath || !outPath || !(N > 0)) { console.error('usage: gguf-truncate.mjs <in.gguf> <out.gguf> <layers>'); process.exit(2); }

const fd = openSync(inPath, 'r');
const head = Buffer.alloc(32 << 20);
const got = readSync(fd, head, 0, head.length, 0);
let p = 0;
const u32 = () => { const v = head.readUInt32LE(p); p += 4; return v; };
const u64 = () => { const v = Number(head.readBigUInt64LE(p)); p += 8; return v; };
const str = () => { const n = u64(); const s = head.toString('utf8', p, p + n); p += n; return s; };
const SZ = { 0: 1, 1: 1, 2: 2, 3: 2, 4: 4, 5: 4, 6: 4, 7: 1, 10: 8, 11: 8, 12: 8 };
const skipValue = (t) => {
  if (t === 8) { str(); return; }
  if (t === 9) { const at = u32(), n = u64(); for (let i = 0; i < n; i++) skipValue(at); return; }
  p += SZ[t];
};
if (head.toString('latin1', 0, 4) !== 'GGUF') throw new Error('not GGUF');
p = 4;
const version = u32(), nTensors = u64(), nKv = u64();
const kvStart = p;
let arch = null, blockCountAt = -1, align = 32;
const entries = [];   // each KV entry's byte range, so per-layer arrays can be trimmed
for (let i = 0; i < nKv; i++) {
  const s0 = p;
  const k = str(), t = u32();
  const vStart = p;
  if (k === 'general.architecture') { const s1 = p; arch = str(); p = s1; }
  if (k === 'general.alignment') { const s1 = p; align = u32(); p = s1; }
  if (arch && k === `${arch}.block_count`) blockCountAt = p;
  const arr = t === 9 ? { at: head.readUInt32LE(p), n: Number(head.readBigUInt64LE(p + 4)) } : null;
  skipValue(t);
  entries.push({ s0, vStart, end: p, k, arr });
}
const kvEnd = p;
const tensors = [];
for (let i = 0; i < nTensors; i++) {
  const name = str(), nd = u32(), dims = [];
  for (let d = 0; d < nd; d++) dims.push(u64());
  const type = u32(), offset = u64();
  tensors.push({ name, dims, type, offset });
}
const dataStart = Math.ceil(p / align) * align;
if (p > got) throw new Error('header larger than the 32 MB read');

const keep = tensors.filter((t) => { const m = /^blk\.(\d+)\./.exec(t.name); return !m || Number(m[1]) < N; });
const byteSize = (t) => {
  const n = t.dims.reduce((a, b) => a * b, 1);
  // ggml block sizes: F32, F16, Q4_0 (32 values in 18 bytes), Q8_0 (32 in 34), Q6_K (256 in 210)
  if (t.type === 0) return n * 4; if (t.type === 1) return n * 2;
  if (t.type === 2) return n / 32 * 18; if (t.type === 8) return n / 32 * 34; if (t.type === 14) return n / 256 * 210;
  throw new Error(`type ${t.type}`);
};
const dataEnd = Math.max(...keep.map((t) => t.offset + byteSize(t)));
const dropped = tensors.filter((t) => !keep.includes(t));
if (dropped.some((t) => t.offset < dataEnd)) throw new Error('kept tensors are not a prefix of the data section');

const st = fstatSync(fd);
if (dataStart + dataEnd > st.size) throw new Error(`input has ${st.size} bytes; need ${dataStart + dataEnd}`);

// New header: fixed part + KV (block_count patched to N, and every per-layer array of the arch — one fixed-size
// element per layer, e.g. Gemma 4's head_count_kv and sliding_window_pattern — trimmed to N) + filtered tensors.
const L0 = head.readUInt32LE(blockCountAt);
const kvParts = [];
for (const e of entries) {
  if (arch && e.k.startsWith(arch + '.') && e.arr && e.arr.n === L0 && SZ[e.arr.at]) {
    const h = Buffer.alloc(12); h.writeUInt32LE(e.arr.at, 0); h.writeBigUInt64LE(BigInt(N), 4);
    kvParts.push(head.subarray(e.s0, e.vStart), h, head.subarray(e.vStart + 12, e.vStart + 12 + N * SZ[e.arr.at]));
  } else if (e.vStart === blockCountAt) {
    const b = Buffer.from(head.subarray(e.s0, e.end)); b.writeUInt32LE(N, e.vStart - e.s0); kvParts.push(b);
  } else kvParts.push(head.subarray(e.s0, e.end));
}
const kv = Buffer.concat(kvParts);
const parts = [];
const fixed = Buffer.alloc(24);
fixed.write('GGUF', 0, 'latin1'); fixed.writeUInt32LE(version, 4);
fixed.writeBigUInt64LE(BigInt(keep.length), 8); fixed.writeBigUInt64LE(BigInt(nKv), 16);
parts.push(fixed, kv);
for (const t of keep) {
  const nb = Buffer.from(t.name, 'utf8');
  const b = Buffer.alloc(8 + nb.length + 4 + 8 * t.dims.length + 4 + 8);
  let o = 0;
  b.writeBigUInt64LE(BigInt(nb.length), o); o += 8; nb.copy(b, o); o += nb.length;
  b.writeUInt32LE(t.dims.length, o); o += 4;
  for (const d of t.dims) { b.writeBigUInt64LE(BigInt(d), o); o += 8; }
  b.writeUInt32LE(t.type, o); o += 4; b.writeBigUInt64LE(BigInt(t.offset), o);
  parts.push(b);
}
let header = Buffer.concat(parts);
const newDataStart = Math.ceil(header.length / align) * align;
header = Buffer.concat([header, Buffer.alloc(newDataStart - header.length)]);

const out = openSync(outPath, 'w');
writeSync(out, header, 0, header.length, 0);
const buf = Buffer.alloc(64 << 20);
for (let o = 0; o < dataEnd; o += buf.length) {
  const n = Math.min(buf.length, dataEnd - o);
  readSync(fd, buf, 0, n, dataStart + o);
  writeSync(out, buf, 0, n, newDataStart + o);
}
closeSync(out); closeSync(fd);
console.log(JSON.stringify({ arch, layers: N, tensors: keep.length, dataStart: newDataStart, bytes: newDataStart + dataEnd }));
