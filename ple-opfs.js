// ple-opfs.js — rows of a large lookup table served from OPFS into a small GPU-resident cache.
//
// Rung 1 of LocalMind's SSD-streaming ladder: Gemma 4 E2B's per-layer embedding (PLE) table
// (262,144 tokens x 35 layers x 256 values; 4-bit codes + one f32 scale per layer = 4,620 bytes a
// token, ~1.2 GB) stays on disk. The engine keeps only the rows its current tokens need on the
// GPU and gathers from those with its own, unchanged kernel. The two classes below know nothing
// about Gemma, so the same row path can carry other tables or MoE experts later.
//
//   RowFile   fixed-size rows in one OPFS file plus manifest.json; synchronous reads through a
//             FileSystemSyncAccessHandle, so it must live in a dedicated worker (LocalMind runs
//             every engine in one).
//   RowCache  `slots` rows on the GPU, split into planes (byte ranges of a row that live in
//             separate GPU buffers), an O(1) LRU, and a CPU id->slot mirror. lookup(ids) makes
//             every id resident and returns its slot, writing missing rows with queue.writeBuffer.
//
// createGemmaPle(opts) is the object the patched gemma-4-e2b.js receives as `load(..., { ple })`.

const ROOT_DIR = 'localmind-ssd';
const FORMAT = 'localmind-rows/1';

async function openDir(key) {
  let dir = await navigator.storage.getDirectory();
  for (const part of [ROOT_DIR, ...key.split('/')]) dir = await dir.getDirectoryHandle(part, { create: true });
  return dir;
}

async function readJson(dir, name) {
  try { return JSON.parse(await (await (await dir.getFileHandle(name)).getFile()).text()); } catch { return null; }
}

async function writeJson(dir, name, value) {
  const h = await (await dir.getFileHandle(name, { create: true })).createSyncAccessHandle();
  try {
    const bytes = new TextEncoder().encode(JSON.stringify(value, null, 1));
    h.truncate(0);
    h.write(bytes, { at: 0 });
    h.flush();
  } finally { h.close(); }
}

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

export class RowFile {
  #dir;
  #read = null;

  constructor(dir, { name, rowBytes, rows }) {
    this.#dir = dir;
    this.name = name;
    this.rowBytes = rowBytes;
    this.rows = rows;
    this.manifest = null;
  }

  // key: a directory under localmind-ssd/ (for example 'gemma-4-e2b').
  static async open({ key, name = 'rows.bin', rowBytes, rows }) {
    const dir = await openDir(key);
    const f = new RowFile(dir, { name, rowBytes, rows });
    f.manifest = await readJson(dir, 'manifest.json');
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
    await this.#dir.removeEntry('manifest.json').catch(() => {});
    this.manifest = null;
    const total = this.rows * this.rowBytes;
    const h = await (await this.#dir.getFileHandle(this.name, { create: true })).createSyncAccessHandle();
    const t0 = performance.now();
    try {
      h.truncate(total);
      const buf = new Uint8Array(batchRows * this.rowBytes);
      for (let row0 = 0; row0 < this.rows; row0 += batchRows) {
        const n = Math.min(batchRows, this.rows - row0);
        const view = buf.subarray(0, n * this.rowBytes);
        fill(row0, n, view);
        const wrote = h.write(view, { at: row0 * this.rowBytes });
        if (wrote !== view.length) throw new Error(`RowFile ${this.name}: wrote ${wrote} of ${view.length} bytes at row ${row0}`);
      }
      h.flush();
    } finally { h.close(); }
    const writeMs = performance.now() - t0;
    this.manifest = { format: FORMAT, name: this.name, rowBytes: this.rowBytes, rows: this.rows, bytes: total,
      fingerprint: fp, complete: true, writtenAt: new Date().toISOString(), writeMs: Math.round(writeMs), ...extra };
    await writeJson(this.#dir, 'manifest.json', this.manifest);
    return writeMs;
  }

  async openRead() {
    if (this.#read) return;
    const fh = await this.#dir.getFileHandle(this.name);
    let h;
    try { h = await fh.createSyncAccessHandle({ mode: 'read-only' }); } catch { h = await fh.createSyncAccessHandle(); }
    if (h.getSize() !== this.rows * this.rowBytes) {
      h.close();
      throw new Error(`RowFile ${this.name}: size ${h.getSize()} != ${this.rows * this.rowBytes}`);
    }
    this.#read = h;
  }

  // Reads rows [row, row + count) into dst at byte offset `at`. Synchronous.
  readRows(row, count, dst, at = 0) {
    const len = count * this.rowBytes;
    const got = this.#read.read(dst.subarray(at, at + len), { at: row * this.rowBytes });
    if (got !== len) throw new Error(`RowFile ${this.name}: read ${got} of ${len} bytes at row ${row}`);
  }

  close() {
    if (this.#read) { try { this.#read.close(); } catch {} this.#read = null; }
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
    this.stats = { lookups: 0, ids: 0, misses: 0, readMs: 0 };
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
  // set at load). Returns the milliseconds spent.
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
          if (old >= 0) { this.slotOf[old] = -1; this.#mapWrite(old, 0xffffffff); }
          this.idOf[s] = id;
          this.slotOf[id] = s;
          this.#mapWrite(id, s);
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
    return performance.now() - t0;
  }
}

// The object gemma-4-e2b.js receives as `load(modelId, { ple })`. The engine calls attach() from
// its weight loader with the PLE tensors' raw bytes; attach() writes the OPFS file when it is
// missing or stale, opens it for reading, allocates the GPU slots through the engine and returns
// the table the engine's graphs gather from. It returns null when OPFS cannot be used, and the
// engine then keeps the table resident as before.
export function createGemmaPle({ key = 'gemma-4-e2b', slots = 512, warmRows = 0, gpuMap = false, onStatus = () => {} } = {}) {
  return {
    async attach({ bits, scale, vocab, hidden, groups, codeBits, device, alloc }) {
      const wordsPerRow = (hidden * codeBits) / 32;
      const bitsBytes = wordsPerRow * 4, scaleBytes = groups * 4, rowBytes = bitsBytes + scaleBytes;
      if (bits.byteLength !== vocab * bitsBytes || scale.byteLength !== vocab * scaleBytes) {
        throw new Error(`PLE: unexpected sizes bits=${bits.byteLength} scale=${scale.byteLength} for vocab ${vocab}`);
      }
      let file;
      try {
        if (typeof FileSystemSyncAccessHandle === 'undefined') throw new Error('needs a dedicated worker (FileSystemSyncAccessHandle)');
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
          }, { extra: { layout: 'per token: packed codes (u32 words, LSB first) then f32 group scales', vocab, hidden, groups, codeBits } });
        }
        await file.openRead();
        const n = Math.max(slots, warmRows);
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
        const warmMs = warmRows > 0 ? cache.warm(0, warmRows) : 0;
        onStatus({ phase: 'ready', wroteMs, warmMs, slots: n });
        return {
          mode: 'opfs', slots: n, bitsT, scaleT, mapT, cache, wroteMs, warmMs,
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
