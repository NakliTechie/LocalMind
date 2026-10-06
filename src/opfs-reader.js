/* opfs-reader.js — read model weights from the Origin Private File System (OPFS) fast.
 *
 * Only OPFS has the fast path: FileSystemSyncAccessHandle, which exists only in dedicated
 * workers. Measured 2026-10-02 on an M4 Pro, Chrome 153: 1.51 GB/s per worker for 1.3 MB
 * random reads, 4.3–5.9 GB/s with 4 read-only workers; File.slice().arrayBuffer() reached
 * only 0.39 GB/s. (~/Code/knowledge/notes/browser-tab-can-stream-weights-from-ssd.md)
 *
 * Shared by the SSD-streaming engines (Qwen3-MoE experts, Gemma 4 PLE rows). No engine
 * dependencies. Works from a page or from inside an engine worker: the reader and writer
 * workers are spawned from inlined Blob URLs, so there is no extra file to vendor.
 *
 *   const pool = await OpfsReaderPool.open('localmind-ssd/<model>/experts.bin', { workers: 4 });
 *   const { buf } = await pool.read(offset, length, recycled);      // one contiguous range
 *   const { buf } = await pool.readv([{ offset, length }, …], into); // many small ranges, packed
 *   pool.close();
 *
 *   const w = await OpfsWriter.open('localmind-ssd/<model>/experts.bin', { truncate: true });
 *   await w.write(u8, at); await w.close();   // a read-write handle is exclusive: close it first
 *
 * Buffers move by transfer, never by copy; pass a previously returned buffer back in to
 * recycle it.
 *
 * Inside a dedicated worker, `{ inline: true }` (see canInline()) skips the worker hop: the
 * sync handle lives in the calling thread, and the pool gains readSync() for a per-token
 * critical path where a postMessage round trip would cost more than the read.
 */

// The file operations, shared by the worker and the inline (same-thread) mode. Kept
// self-contained: it is stringified into the worker's Blob source.
function makeOps() {
  let handle = null;
  const openFile = async (path, create) => {
    const parts = path.split('/').filter(Boolean);
    let dir = await navigator.storage.getDirectory();
    for (const p of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(p, { create });
    return dir.getFileHandle(parts[parts.length - 1], { create });
  };
  const readFull = (u8, at) => {
    let got = 0;
    while (got < u8.byteLength) {
      const n = handle.read(u8.subarray(got), { at: at + got });
      if (n <= 0) break;
      got += n;
    }
    return got;
  };
  // → [reply, transferList]
  const run = async (m) => {
    try {
      if (m.op === 'open') {
        const fh = await openFile(m.path, !!m.create);
        handle = await fh.createSyncAccessHandle(m.mode === 'readwrite' ? {} : { mode: 'read-only' });
        if (m.truncate) handle.truncate(0);
        return [{ id: m.id, size: handle.getSize() }, []];
      }
      if (m.op === 'read') {
        const t0 = performance.now();
        const got = readFull(new Uint8Array(m.buf, 0, m.length), m.at);
        return [{ id: m.id, buf: m.buf, got, ms: performance.now() - t0 }, [m.buf]];
      }
      if (m.op === 'readv') {
        const t0 = performance.now();
        let pos = 0, got = 0;
        for (let i = 0; i < m.ranges.length; i += 2) {
          const len = m.ranges[i + 1];
          got += readFull(new Uint8Array(m.buf, pos, len), m.ranges[i]);
          pos += len;
        }
        return [{ id: m.id, buf: m.buf, got, ms: performance.now() - t0 }, [m.buf]];
      }
      if (m.op === 'write') {
        const u8 = new Uint8Array(m.buf, 0, m.length);
        let put = 0;
        while (put < u8.byteLength) put += handle.write(u8.subarray(put), { at: m.at + put });
        return [{ id: m.id, buf: m.buf, put }, [m.buf]];
      }
      if (m.op === 'truncate') { handle.truncate(m.size); return [{ id: m.id, size: handle.getSize() }, []]; }
      if (m.op === 'flush') { handle.flush(); return [{ id: m.id, size: handle.getSize() }, []]; }
      if (m.op === 'close') {
        if (handle) { if (m.flush) handle.flush(); handle.close(); }
        handle = null;
        return [{ id: m.id, closed: true }, []];
      }
      return [{ id: m.id, error: `unknown op ${m.op}` }, []];
    } catch (err) {
      return [{ id: m.id, error: `${(err && err.name) || 'Error'}: ${(err && err.message) || err}`, buf: m.buf }, m.buf ? [m.buf] : []];
    }
  };
  run.sync = {
    read: (buf, length, at) => readFull(new Uint8Array(buf, 0, length), at),
    write: (u8, at) => { let put = 0; while (put < u8.byteLength) put += handle.write(u8.subarray(put), { at: at + put }); return put; },
  };
  return run;
}

let workerUrl = null;
const spawn = () => {
  if (!workerUrl) {
    const src = `const run = (${makeOps.toString()})();\nself.onmessage = async (e) => { const [r, t] = await run(e.data); self.postMessage(r, t); };`;
    workerUrl = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
  }
  return new Worker(workerUrl);
};

// Inline mode needs a sync access handle in this thread: only a dedicated worker has one.
export const canInline = () => typeof FileSystemSyncAccessHandle !== 'undefined'
  && typeof DedicatedWorkerGlobalScope !== 'undefined' && self instanceof DedicatedWorkerGlobalScope;

// Same interface as Channel, but the file operations run in this thread.
class InlineChannel {
  constructor() { this.run = makeOps(); this.inflight = 0; this.nextId = 1; }
  async call(msg) {
    this.inflight++;
    try {
      const [r] = await this.run({ ...msg, id: this.nextId++ });
      if (r.error) { const err = new Error(r.error); err.buf = r.buf; throw err; }
      return r;
    } finally { this.inflight--; }
  }
  terminate() {}
}

// One worker, request/response matched by id; requests run in arrival order.
class Channel {
  constructor() {
    this.worker = spawn();
    this.pending = new Map();
    this.nextId = 1;
    this.inflight = 0;
    this.worker.onmessage = (e) => {
      const m = e.data, p = this.pending.get(m.id);
      if (!p) return;
      this.pending.delete(m.id);
      this.inflight--;
      if (m.error) { const err = new Error(m.error); err.buf = m.buf; p.reject(err); } else p.resolve(m);
    };
    this.worker.onerror = (e) => {
      for (const p of this.pending.values()) p.reject(new Error(`OPFS worker failed: ${e.message || e}`));
      this.pending.clear();
    };
  }
  call(msg, transfer = []) {
    const id = this.nextId++;
    this.inflight++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ ...msg, id }, transfer);
    });
  }
  terminate() { this.worker.terminate(); }
}

const bufferFor = (into, length) => (into && into.byteLength >= length ? into : new ArrayBuffer(length));

export class OpfsReaderPool {
  // inline: true → no workers; reads run on this thread's own sync handle (dedicated
  // worker only, see canInline()), and readSync() is available for a critical path.
  static async open(path, { workers = 4, inline = false } = {}) {
    const pool = new OpfsReaderPool();
    pool.path = path;
    pool.inline = inline;
    pool.channels = [];
    if (inline) pool.channels.push(new InlineChannel());
    else for (let i = 0; i < workers; i++) pool.channels.push(new Channel());
    const sizes = await Promise.all(pool.channels.map((c) => c.call({ op: 'open', path })));
    pool.size = sizes[0].size;
    return pool;
  }
  pick() {
    let best = this.channels[0];
    for (const c of this.channels) if (c.inflight < best.inflight) best = c;
    return best;
  }
  // → { buf, got, ms }; `buf` is `into` when it was large enough, else a new ArrayBuffer.
  read(offset, length, into) {
    const buf = bufferFor(into, length);
    return this.pick().call({ op: 'read', at: offset, length, buf }, [buf]);
  }
  // Inline mode only: a synchronous read, no promise. → bytes read.
  readSync(offset, length, into) {
    if (!this.inline) throw new Error('readSync needs OpfsReaderPool.open(path, { inline: true })');
    return this.channels[0].run.sync.read(into, length, offset);
  }
  // ranges: [{ offset, length }]. The bytes land back-to-back in `buf`, in order.
  readv(ranges, into) {
    let total = 0;
    const flat = new Array(ranges.length * 2);
    ranges.forEach((r, i) => { flat[2 * i] = r.offset; flat[2 * i + 1] = r.length; total += r.length; });
    const buf = bufferFor(into, total);
    return this.pick().call({ op: 'readv', ranges: flat, buf }, [buf]);
  }
  async close() {
    await Promise.all(this.channels.map((c) => c.call({ op: 'close' }).catch(() => {})));
    for (const c of this.channels) c.terminate();
    this.channels = [];
  }
}

export class OpfsWriter {
  // inline: true → the read-write sync handle lives in this thread (dedicated worker only).
  static async open(path, { truncate = false, inline = false } = {}) {
    const w = new OpfsWriter();
    w.path = path;
    w.ch = inline ? new InlineChannel() : new Channel();
    w.size = (await w.ch.call({ op: 'open', path, create: true, mode: 'readwrite', truncate })).size;
    return w;
  }
  // Copies `u8` into a transferable buffer only when it is a view on part of a larger one.
  // Resolves with the (recycled) ArrayBuffer once the bytes are written.
  async write(u8, at) {
    let buf = u8.buffer, length = u8.byteLength;
    if (this.ch instanceof InlineChannel) { this.ch.run.sync.write(u8, at); return buf; }
    if (u8.byteOffset !== 0 || buf.byteLength !== length || (typeof SharedArrayBuffer !== 'undefined' && buf instanceof SharedArrayBuffer)) {
      buf = new ArrayBuffer(length);
      new Uint8Array(buf).set(u8);
    }
    const r = await this.ch.call({ op: 'write', at, length, buf }, [buf]);
    return r.buf;
  }
  // Like write(), but takes ownership of `buf` (no copy) — the caller gets it back when done.
  async writeOwned(buf, length, at) {
    const r = await this.ch.call({ op: 'write', at, length, buf }, [buf]);
    return r.buf;
  }
  async truncate(size) { return (await this.ch.call({ op: 'truncate', size })).size; }
  async flush() { return (await this.ch.call({ op: 'flush' })).size; }
  async close() { await this.ch.call({ op: 'close', flush: true }); this.ch.terminate(); }
}

export async function opfsDir(path, { create = false } = {}) {
  let dir = await navigator.storage.getDirectory();
  for (const p of path.split('/').filter(Boolean)) dir = await dir.getDirectoryHandle(p, { create });
  return dir;
}

export async function readOpfsText(path) {
  const parts = path.split('/').filter(Boolean);
  try {
    const dir = await opfsDir(parts.slice(0, -1).join('/'));
    const f = await (await dir.getFileHandle(parts[parts.length - 1])).getFile();
    return await f.text();
  } catch (_) { return null; }
}

export async function writeOpfsText(path, text) {
  const parts = path.split('/').filter(Boolean);
  const dir = await opfsDir(parts.slice(0, -1).join('/'), { create: true });
  const fh = await dir.getFileHandle(parts[parts.length - 1], { create: true });
  const w = await fh.createWritable();
  await w.write(text);
  await w.close();
}

export async function removeOpfs(path) {
  const parts = path.split('/').filter(Boolean);
  const dir = await opfsDir(parts.slice(0, -1).join('/'));
  await dir.removeEntry(parts[parts.length - 1], { recursive: true });
}
