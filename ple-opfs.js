// ple-opfs.js — rows of a large lookup table served from OPFS into a small GPU-resident cache.
//
// Rung 1 of LocalMind's SSD-streaming ladder: Gemma 4 E2B's per-layer embedding (PLE) table
// (262,144 tokens x 35 layers x 256 values; 4-bit codes + one f32 scale per layer = 4,620 bytes a
// token, ~1.2 GB) stays on disk. The engine keeps only the rows its current tokens need on the
// GPU and gathers from those with its own, unchanged kernel. The two classes below know nothing
// about Gemma, so the same row path can carry other tables or MoE experts later.
//
//   RowFile   fixed-size rows in one OPFS file plus manifest.json; synchronous reads through
//             opfs-reader.js in inline mode, so it must live in a dedicated worker (LocalMind runs
//             every engine in one).
//   RowCache  `slots` rows on the GPU, split into planes (byte ranges of a row that live in
//             separate GPU buffers), an O(1) LRU, and a CPU id->slot mirror. lookup(ids) makes
//             every id resident and returns its slot, writing missing rows with queue.writeBuffer.
//
// createGemmaPle(opts) is the object the patched gemma-4-e2b.js receives as `load(..., { ple })`.

import { RowFile, RowCache, fingerprint } from './rows.js';

const ROOT_DIR = 'localmind-ssd';
// RowFile, RowCache and fingerprint are diskformer.js's (rows.js, a byte-identical copy); this file keeps the Gemma parts.
export { RowFile, RowCache, fingerprint } from './rows.js';

// The object gemma-4-e2b.js receives as `load(modelId, { ple })`. The engine calls attach() from
// its weight loader with the PLE tensors' raw bytes; attach() writes the OPFS file when it is
// missing or stale, opens it for reading, allocates the GPU slots through the engine and returns
// the table the engine's graphs gather from. It returns null when OPFS cannot be used, and the
// engine then keeps the table resident as before.
// warm: [[firstRow, count], ...] loaded at attach. Gemma 4's vocabulary is in SentencePiece score
// order, so low ids are the frequent merged pieces, and its single characters form one block from
// id 236,743, also most frequent first (the first 256 hold 94 of the 108 ASCII characters).
export const GEMMA4_WARM = [[0, 28672], [236743, 4096]];

// Defaults are the measured choice (2026-10-04, M4 Pro): 32,768 slots (151 MB) warmed with the
// ranges above, a GPU slot map, and part A = 60% of each decode step (a shorter part A ends before
// the token's readback and the GPU waits; a longer one wastes more on a miss). gpuMap: false gives the
// simpler mode where the CPU looks every decode token up and decode runs one step at a time.
// The OPFS directory under localmind-ssd/: one per model, from its repo name
// ('google/gemma-4-E2B-it-qat-mobile-transformers' -> 'gemma-4-e2b').
export function gemmaPleKey(repo) {
  return repo ? repo.split('/').pop().toLowerCase().replace(/-it-qat-mobile-transformers$/, '') : 'gemma-4-e2b';
}

export function createGemmaPle({ key = null, slots = 32768, warm = GEMMA4_WARM, gpuMap = true, split = 0.6, source = null, onStatus = () => {} } = {}) {
  return {
    async attach({ bits, scale, vocab, hidden, groups, codeBits, device, alloc }) {
      const wordsPerRow = (hidden * codeBits) / 32;
      const bitsBytes = wordsPerRow * 4, scaleBytes = groups * 4, rowBytes = bitsBytes + scaleBytes;
      if (bits.byteLength !== vocab * bitsBytes || scale.byteLength !== vocab * scaleBytes) {
        throw new Error(`PLE: unexpected sizes bits=${bits.byteLength} scale=${scale.byteLength} for vocab ${vocab}`);
      }
      let file;
      try {
        file = await RowFile.open({ key: key || gemmaPleKey(source && source.repo), name: 'ple.bin', rowBytes, rows: vocab, root: ROOT_DIR });
        const fp = fingerprint([bits, scale]);
        let wroteMs = null;
        if (!file.matches(fp)) {
          onStatus({ phase: 'write', bytes: vocab * rowBytes });
          wroteMs = await file.write(fp, (row0, n, dst) => {
            for (let i = 0; i < n; i++) {
              const t = row0 + i, o = i * rowBytes;
              dst.set(bits.subarray(t * bitsBytes, (t + 1) * bitsBytes), o);
              dst.set(scale.subarray(t * scaleBytes, (t + 1) * scaleBytes), o + bitsBytes);
            }
          }, { extra: { source, layout: 'per token: packed codes (u32 words, LSB first) then f32 group scales', vocab, hidden, groups, codeBits } });
        }
        await file.openRead();
        const warmRows = warm.reduce((k, [, c]) => k + c, 0);
        const n = Math.max(slots, warmRows, 256);
        const bitsT = alloc(n * bitsBytes, 'uint32', [n, wordsPerRow], 'ple-cache.bits');
        const scaleT = alloc(n * scaleBytes, 'float32', [n, groups], 'ple-cache.scale');
        let mapT = null;
        if (gpuMap) {
          mapT = alloc(vocab * 4, 'uint32', [vocab], 'ple-cache.map');
          device.queue.writeBuffer(mapT.buffer, 0, new Uint32Array(vocab).fill(0xffffffff));
        }
        const cache = new RowCache({
          file, slots: n, queue: device.queue, mapBuffer: mapT ? mapT.buffer : null,
          planes: [{ offset: 0, bytes: bitsBytes, buffer: bitsT.buffer }, { offset: bitsBytes, bytes: scaleBytes, buffer: scaleT.buffer }],
        });
        let warmMs = 0;
        for (const [row0, count] of warm) warmMs += cache.warm(row0, count);
        onStatus({ phase: 'ready', wroteMs, warmMs, slots: n });
        return {
          mode: 'opfs', slots: n, bitsT, scaleT, mapT, cache, wroteMs, warmMs, warmRows, split,
          lookup: (ids, out) => cache.lookup(ids, out),
          // For a one-off graph over `ids` (the engine's whole-sequence fallback): its own rows,
          // gathered with iota ids, independent of the cache size.
          gather(ids) {
            const b = new Uint32Array(ids.length * wordsPerRow), s = new Float32Array(ids.length * groups);
            const b8 = new Uint8Array(b.buffer), s8 = new Uint8Array(s.buffer), row = new Uint8Array(rowBytes);
            for (let i = 0; i < ids.length; i++) {
              file.readRows(ids[i], 1, row);
              b8.set(row.subarray(0, bitsBytes), i * bitsBytes);
              s8.set(row.subarray(bitsBytes), i * scaleBytes);
            }
            return { bits: b, scale: s };
          },
          close: () => file.close(),
        };
      } catch (err) {
        if (file) file.close();
        onStatus({ phase: 'fallback', error: String((err && err.message) || err) });
        return null;
      }
    },
  };
}
