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

import { OpfsReaderPool, OpfsWriter, canInline, readOpfsText, writeOpfsText, removeOpfs } from './opfs-reader.js';

const ROOT_DIR = 'localmind-ssd';
const FORMAT = 'localmind-rows/1';

// FNV-1a over a few samples of each source buffer and their lengths: cheap enough to run on every
// load, and it changes when the model's weights change.
export function fingerprint(buffers, sample = 1 << 16) {
  let h = 0x811c9dc5;
  const mix = (b) => { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; };
  for (const u8 of buffers) {
    for (const v of [u8.length & 0xff, (u8.length >>> 8) & 0xff, (u8.length >>> 16) & 0xff, (u8.length >>> 24) & 0xff]) mix(v);
    const starts = [0, Math.max(0, (u8.length >> 1) - (sample >> 1)), Math.max(0, u8.length - sample)];
    for (const s of starts) for (let i = s, e = Math.min(u8.length, s + sample); i < e; i++) mix(u8[i]);
  }
  return h.toString(16).padStart(8, '0');
}

// Fixed-size rows in one OPFS file, localmind-ssd/<key>/<name>, with manifest.json beside it.
// The file I/O is opfs-reader.js in inline mode: the sync handle lives in this dedicated worker,
// so a row read is a plain synchronous call with no worker hop.
export class RowFile {
  #reader = null;

  constructor({ key, name, rowBytes, rows }) {
    this.path = `${ROOT_DIR}/${key}/${name}`;
    this.manifestPath = `${ROOT_DIR}/${key}/manifest.json`;
    this.name = name;
    this.rowBytes = rowBytes;
    this.rows = rows;
    this.manifest = null;
  }

  static async open({ key, name = 'rows.bin', rowBytes, rows }) {
    if (!canInline()) throw new Error('RowFile needs a dedicated worker (FileSystemSyncAccessHandle)');
    const f = new RowFile({ key, name, rowBytes, rows });
    try { f.manifest = JSON.parse(await readOpfsText(f.manifestPath)); } catch (_) { f.manifest = null; }
    return f;
  }

  matches(fp) {
    const m = this.manifest;
    return !!m && m.format === FORMAT && m.complete === true && m.name === this.name &&
      m.rowBytes === this.rowBytes && m.rows === this.rows && m.fingerprint === fp;
  }

  // fill(row0, count, dst) writes `count` rows starting at `row0` into dst (count * rowBytes bytes).
  // The manifest is removed first and written last, so an interrupted write is never taken as valid.
  async write(fp, fill, { batchRows = 8192, extra = {} } = {}) {
    this.close();
    await removeOpfs(this.manifestPath).catch(() => {});
    this.manifest = null;
    const total = this.rows * this.rowBytes;
    const t0 = performance.now();
    const w = await OpfsWriter.open(this.path, { truncate: true, inline: true });
    try {
      const buf = new Uint8Array(batchRows * this.rowBytes);
      for (let row0 = 0; row0 < this.rows; row0 += batchRows) {
        const n = Math.min(batchRows, this.rows - row0);
        const view = buf.subarray(0, n * this.rowBytes);
        fill(row0, n, view);
        await w.write(view, row0 * this.rowBytes);
      }
    } finally { await w.close(); }
    const writeMs = performance.now() - t0;
    this.manifest = { format: FORMAT, name: this.name, rowBytes: this.rowBytes, rows: this.rows, bytes: total,
      fingerprint: fp, complete: true, writtenAt: new Date().toISOString(), writeMs: Math.round(writeMs), ...extra };
    await writeOpfsText(this.manifestPath, JSON.stringify(this.manifest, null, 1));
    return writeMs;
  }

  async openRead() {
    if (this.#reader) return;
    const r = await OpfsReaderPool.open(this.path, { inline: true });
    if (r.size !== this.rows * this.rowBytes) {
      await r.close();
      throw new Error(`RowFile ${this.name}: size ${r.size} != ${this.rows * this.rowBytes}`);
    }
    this.#reader = r;
  }

  // Reads rows [row, row + count) to the start of dst (a Uint8Array that starts its buffer).
  readRows(row, count, dst) {
    if (dst.byteOffset !== 0) throw new Error('RowFile.readRows: dst must start at offset 0 of its buffer');
    const len = count * this.rowBytes;
    const got = this.#reader.readSync(row * this.rowBytes, len, dst.buffer);
    if (got !== len) throw new Error(`RowFile ${this.name}: read ${got} of ${len} bytes at row ${row}`);
  }

  // Closes the read handle. In inline mode the handle closes synchronously inside this call.
  close() {
    if (this.#reader) { this.#reader.close(); this.#reader = null; }
  }
}

export class RowCache {
  // file: an open RowFile. slots: rows held on the GPU. planes: [{ offset, bytes, buffer }], each
  // row byte range [offset, offset + bytes) is stored at buffer[slot * bytes]. queue: GPUQueue.
  // mapBuffer (optional): a GPU u32[file.rows] copy of the id->slot map, 0xFFFFFFFF when absent.
  constructor({ file, slots, planes, queue, mapBuffer = null }) {
    this.file = file;
    this.slots = slots;
    this.planes = planes;
    this.queue = queue;
    this.mapBuffer = mapBuffer;
    this.slotOf = new Int32Array(file.rows).fill(-1);
    this.idOf = new Int32Array(slots).fill(-1);
    // LRU as a doubly linked list over slots; head = least recently used. Starts as 0..slots-1.
    this.prev = new Int32Array(slots);
    this.next = new Int32Array(slots);
    for (let s = 0; s < slots; s++) { this.prev[s] = s - 1; this.next[s] = s + 1 < slots ? s + 1 : -1; }
    this.head = 0;
    this.tail = slots - 1;
    this.stamp = new Uint32Array(slots);
    this.clock = 0;
    this.row = new Uint8Array(file.rowBytes);
    this.u32 = new Uint32Array(1);
    this.stats = { lookups: 0, ids: 0, misses: 0, readMs: 0, replays: 0 };
    this.missLog = []; // the first 4,096 ids installed after load, for analysis
  }

  #touch(s) {
    if (s === this.tail) return;
    const p = this.prev[s], n = this.next[s];
    if (p >= 0) this.next[p] = n; else this.head = n;
    this.prev[n] = p;
    this.prev[s] = this.tail;
    this.next[s] = -1;
    this.next[this.tail] = s;
    this.tail = s;
  }

  #mapWrite(id, slot) {
    if (!this.mapBuffer) return;
    this.u32[0] = slot >>> 0;
    this.queue.writeBuffer(this.mapBuffer, id * 4, this.u32);
  }

  #install(id, s) {
    const old = this.idOf[s];
    if (old >= 0) { this.slotOf[old] = -1; this.#mapWrite(old, 0xffffffff); }
    const t0 = performance.now();
    this.file.readRows(id, 1, this.row);
    this.stats.readMs += performance.now() - t0;
    for (const p of this.planes) this.queue.writeBuffer(p.buffer, s * p.bytes, this.row, p.offset, p.bytes);
    this.idOf[s] = id;
    this.slotOf[id] = s;
    this.#mapWrite(id, s);
    this.stats.misses++;
    if (this.missLog.length < 4096) this.missLog.push(id);
  }

  // Makes every id resident and returns its slot. Rows one call uses are never evicted by the same
  // call, so a call may name at most `slots` distinct ids.
  lookup(ids, out = new Uint32Array(ids.length)) {
    const call = ++this.clock;
    this.stats.lookups++;
    this.stats.ids += ids.length;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      let s = this.slotOf[id];
      if (s < 0) {
        s = this.head;
        if (this.stamp[s] === call) throw new Error(`RowCache: one lookup needs more than ${this.slots} rows`);
        this.#install(id, s);
      }
      this.stamp[s] = call;
      this.#touch(s);
      out[i] = s;
    }
    return out;
  }

  has(id) { return this.slotOf[id] >= 0; }

  // Loads rows [row0, row0 + count) into the least recently used slots in large reads (for a warm
  // set at load), then uploads the whole id->slot map once. Returns the milliseconds spent.
  warm(row0, count, batch = 4096) {
    const t0 = performance.now();
    count = Math.min(count, this.slots);
    const rb = this.file.rowBytes;
    const buf = new Uint8Array(batch * rb);
    const planeBufs = this.planes.map((p) => new Uint8Array(batch * p.bytes));
    for (let r = row0; r < row0 + count; r += batch) {
      const n = Math.min(batch, row0 + count - r);
      this.file.readRows(r, n, buf);
      // Fresh slots come from the LRU head in order; collect them and write contiguous runs.
      const slots = new Int32Array(n);
      for (let i = 0; i < n; i++) {
        const id = r + i;
        let s = this.slotOf[id];
        if (s < 0) {
          s = this.head;
          const old = this.idOf[s];
          if (old >= 0) this.slotOf[old] = -1;
          this.idOf[s] = id;
          this.slotOf[id] = s;
        }
        this.#touch(s);
        slots[i] = s;
      }
      for (let pi = 0; pi < this.planes.length; pi++) {
        const p = this.planes[pi], dst = planeBufs[pi];
        for (let i = 0; i < n; i++) dst.set(buf.subarray(i * rb + p.offset, i * rb + p.offset + p.bytes), i * p.bytes);
        let i = 0;
        while (i < n) {
          let j = i + 1;
          while (j < n && slots[j] === slots[j - 1] + 1) j++;
          this.queue.writeBuffer(p.buffer, slots[i] * p.bytes, dst, i * p.bytes, (j - i) * p.bytes);
          i = j;
        }
      }
    }
    // slotOf's bytes are the GPU map: -1 as an Int32 is 0xFFFFFFFF as a u32.
    if (this.mapBuffer) this.queue.writeBuffer(this.mapBuffer, 0, this.slotOf);
    return performance.now() - t0;
  }
}

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
export function createGemmaPle({ key = 'gemma-4-e2b', slots = 32768, warm = GEMMA4_WARM, gpuMap = true, split = 0.6, source = null, onStatus = () => {} } = {}) {
  return {
    async attach({ bits, scale, vocab, hidden, groups, codeBits, device, alloc }) {
      const wordsPerRow = (hidden * codeBits) / 32;
      const bitsBytes = wordsPerRow * 4, scaleBytes = groups * 4, rowBytes = bitsBytes + scaleBytes;
      if (bits.byteLength !== vocab * bitsBytes || scale.byteLength !== vocab * scaleBytes) {
        throw new Error(`PLE: unexpected sizes bits=${bits.byteLength} scale=${scale.byteLength} for vocab ${vocab}`);
      }
      let file;
      try {
        file = await RowFile.open({ key, name: 'ple.bin', rowBytes, rows: vocab });
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
