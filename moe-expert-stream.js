/* moe-expert-stream.js — keep a mixture-of-experts model's routed experts on SSD (OPFS) and
 * page them into a fixed GPU slot pool on demand. Model-agnostic: an engine describes one
 * expert record (its byte layout in the OPFS file and which GPU pool buffer each part goes
 * to); this module owns the slot LRU, the reads, the uploads, the pins and the counters.
 *
 *   const xs = new ExpertStreamer({ device, reader, recordBytes, recordOffset, parts, slots,
 *                                   numLayers, numExperts });
 *   const slots = await xs.ensure(layer, expertIds);   // resident + pinned, in id order
 *   …write `slots` into the kernel's slot table, encode, queue.submit()…
 *   xs.release(slots);                                  // after the submit
 *   xs.prefetch(layer + 1, predictedIds);               // optional, never blocks
 *
 * `parts`: [{ buffer: GPUBuffer, srcOffset, bytes }]. Slot s of a part lives at s × bytes in
 * that part's buffer, so a kernel finds expert row r of slot s at s × rowsPerExpert + r.
 *
 * Safety of reuse: queue.writeBuffer is ordered after every earlier queue.submit, so a slot
 * may be overwritten as soon as the work that reads it has been submitted, even if the GPU
 * has not run it yet. Until then the slot is pinned and never chosen for eviction.
 */

export class ExpertStreamer {
  constructor({ device, reader, recordBytes, recordOffset, parts, slots, numLayers, numExperts, maxStaging = 32 }) {
    Object.assign(this, { device, reader, recordBytes, recordOffset, parts, slots, numLayers, numExperts, maxStaging });
    this.slotKey = new Int32Array(slots).fill(-1);
    this.pinCount = new Int32Array(slots);
    this.free = [];
    for (let s = slots - 1; s >= 0; s--) this.free.push(s);
    this.lru = new Map();        // key → slot, least recently used first
    this.inflight = new Map();   // key → { p: Promise<slot>, pins }
    this.staging = [];
    this.resetStats();
  }

  resetStats() {
    const L = this.numLayers;
    this.stats = {
      hits: 0, misses: 0, lateHits: 0, prefetchIssued: 0, prefetchUsed: 0, evictions: 0,
      bytesRead: 0, readMs: 0, uploadMs: 0, waitMs: 0,
      hitsByLayer: new Uint32Array(L), missesByLayer: new Uint32Array(L),
    };
    this.prefetched = new Set();  // keys loaded by prefetch() and not yet demanded
  }

  key(layer, expert) { return layer * this.numExperts + expert; }
  resident() { return this.lru.size; }

  pin(s) { this.pinCount[s]++; }
  release(slots) { for (const s of slots) if (this.pinCount[s] > 0) this.pinCount[s]--; }

  takeStaging() { return this.staging.pop() || new ArrayBuffer(this.recordBytes); }
  giveStaging(buf) { if (this.staging.length < this.maxStaging && buf.byteLength >= this.recordBytes) this.staging.push(buf); }

  allocSlot() {
    if (this.free.length) return this.free.pop();
    for (const [k, s] of this.lru) {
      if (this.pinCount[s] === 0) {
        this.lru.delete(k);
        this.prefetched.delete(k);
        this.slotKey[s] = -1;
        this.stats.evictions++;
        return s;
      }
    }
    throw new Error(`expert pool exhausted: all ${this.slots} slots pinned — raise the pool size`);
  }

  // Starts the read + upload of one expert into a newly allocated slot. The slot stays pinned
  // while the load is in flight; `entry.pins` demands registered meanwhile are converted into
  // pins in the same synchronous step that publishes the slot, so no eviction can slip
  // between "loaded" and "pinned by its user". Returns the in-flight entry { p, pins }.
  load(layer, expert, pins = 0) {
    const key = this.key(layer, expert);
    const s = this.allocSlot();
    this.pin(s);
    const entry = { pins, p: null };
    entry.p = (async () => {
      let ok = false;
      try {
        const r = await this.reader.read(this.recordOffset(layer, expert), this.recordBytes, this.takeStaging());
        if (r.got !== this.recordBytes) throw new Error(`short expert read L${layer} E${expert}: ${r.got} of ${this.recordBytes} bytes`);
        this.stats.readMs += r.ms;
        this.stats.bytesRead += r.got;
        const t0 = performance.now();
        for (const part of this.parts) {
          this.device.queue.writeBuffer(part.buffer, s * part.bytes, r.buf, part.srcOffset, part.bytes);
        }
        this.stats.uploadMs += performance.now() - t0;
        this.giveStaging(r.buf);
        this.slotKey[s] = key;
        this.lru.set(key, s);
        this.pinCount[s] += entry.pins;
        ok = true;
        return s;
      } catch (err) {
        if (err && err.buf) this.giveStaging(err.buf);
        throw err;
      } finally {
        this.inflight.delete(key);
        this.pinCount[s]--;
        if (!ok) { this.pinCount[s] = 0; this.free.push(s); }
      }
    })();
    this.inflight.set(key, entry);
    return entry;
  }

  // Makes every expert in `ids` resident for `layer` and pins its slot. Returns the slots in
  // the same order as `ids`. The caller must release() them after submitting the GPU work.
  async ensure(layer, ids) {
    const out = new Uint32Array(ids.length);
    const waits = [];
    const st = this.stats;
    for (let i = 0; i < ids.length; i++) {
      const key = this.key(layer, ids[i]);
      if (this.prefetched.delete(key)) st.prefetchUsed++;
      const s = this.lru.get(key);
      if (s !== undefined) {
        this.lru.delete(key); this.lru.set(key, s);  // most recently used
        this.pin(s);
        out[i] = s;
        st.hits++; st.hitsByLayer[layer]++;
        continue;
      }
      const flying = this.inflight.get(key);
      if (flying) {
        st.lateHits++; st.hitsByLayer[layer]++;
        flying.pins++;
        waits.push(flying.p.then((slot) => { out[i] = slot; }));
        continue;
      }
      st.misses++; st.missesByLayer[layer]++;
      waits.push(this.load(layer, ids[i], 1).p.then((slot) => { out[i] = slot; }));
    }
    if (waits.length) {
      const t0 = performance.now();
      await Promise.all(waits);
      st.waitMs += performance.now() - t0;
    }
    return out;
  }

  // Starts loads for experts that are neither resident nor in flight. Never awaits, never
  // evicts a pinned slot; skips silently when the pool has nothing evictable left.
  prefetch(layer, ids) {
    let started = 0;
    for (const e of ids) {
      const key = this.key(layer, e);
      if (this.lru.has(key) || this.inflight.has(key)) continue;
      try {
        this.load(layer, e).p.catch(() => {});
        this.prefetched.add(key);
        started++;
      } catch (_) { break; }
    }
    this.stats.prefetchIssued += started;
    return started;
  }

  // Waits for every in-flight load (used before teardown and between measured runs).
  async drain() { await Promise.allSettled([...this.inflight.values()].map((f) => f.p)); }

  clear() {
    this.lru.clear();
    this.inflight.clear();
    this.prefetched.clear();
    this.slotKey.fill(-1);
    this.pinCount.fill(0);
    this.free = [];
    for (let s = this.slots - 1; s >= 0; s--) this.free.push(s);
  }
}
