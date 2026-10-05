/* rows.js — rows of a large lookup table (an embedding-style table) served from OPFS into a small GPU-resident
 * cache. Extracted from LocalMind's ple-opfs.js (2026-10-05), where it serves Gemma 4 E2B/E4B's per-layer embedding
 * table from disk; the Gemma-specific helpers stay in LocalMind. `root` is a new option (LocalMind passes
 * 'localmind-ssd').
 *
 *   RowFile   fixed-size rows in one OPFS file plus manifest.json; synchronous reads through opfs-reader.js in
 *             inline mode, so it must live in a dedicated worker.
 *   RowCache  `slots` rows on the GPU, split into planes (byte ranges of a row that live in separate GPU buffers),
 *             an O(1) LRU, and a CPU id→slot mirror (optionally a GPU u32 map). lookup(ids) makes every id
 *             resident and returns its slot, writing missing rows with queue.writeBuffer.
 */

import { OpfsReaderPool, OpfsWriter, canInline, readOpfsText, writeOpfsText, removeOpfs } from './opfs-reader.js';

export const ROOT = 'diskformer';
const FORMAT = 'localmind-rows/1';   // unchanged from LocalMind, so a store it wrote stays valid

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

// Fixed-size rows in one OPFS file, <root>/<key>/<name>, with manifest.json beside it.
// The file I/O is opfs-reader.js in inline mode: the sync handle lives in this dedicated worker,
// so a row read is a plain synchronous call with no worker hop.
export class RowFile {
  #reader = null;

  constructor({ key, name, rowBytes, rows, root = ROOT }) {
    this.path = `${root}/${key}/${name}`;
    this.manifestPath = `${root}/${key}/manifest.json`;
    this.name = name;
    this.rowBytes = rowBytes;
    this.rows = rows;
    this.manifest = null;
  }

  static async open({ key, name = 'rows.bin', rowBytes, rows, root = ROOT }) {
    if (!canInline()) throw new Error('RowFile needs a dedicated worker (FileSystemSyncAccessHandle)');
    const f = new RowFile({ key, name, rowBytes, rows, root });
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
