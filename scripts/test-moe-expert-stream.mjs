// Unit test for moe-expert-stream.js with a fake GPU queue and a fake OPFS reader:
// residency, LRU eviction order, pins (a prefetch never evicts a slot the current layer holds),
// late hits on in-flight loads, and the bytes that land in each pool part — once through the
// mapped staging ring (the default upload path) and once through queue.writeBuffer.
//   node scripts/test-moe-expert-stream.mjs
import assert from 'node:assert/strict';
import { ExpertStreamer } from '../moe-expert-stream.js';

const REC = 16, E = 8, L = 4;
const writes = [];
const device = {
  queue: {
    writeBuffer: (buffer, offset, data, dataOffset, size) => writes.push({ buffer, offset, bytes: new Uint8Array(data, dataOffset, size).slice() }),
    submit: (cmds) => { for (const list of cmds) for (const c of list) writes.push(c()); },
  },
  // Staging-ring fakes: a mapped buffer is plain memory; mapAsync resolves after a tick.
  createBuffer: ({ size }) => { const data = new Uint8Array(size); return { size, data, getMappedRange: () => data.buffer, unmap() {}, mapAsync: () => new Promise((r) => setTimeout(r, 1)) }; },
  createCommandEncoder: () => {
    const cmds = [];
    return {
      copyBufferToBuffer: (src, so, dst, doff, n) => { const bytes = src.data.slice(so, so + n); cmds.push(() => ({ buffer: dst, offset: doff, bytes })); },
      finish: () => cmds,
    };
  },
};
let reads = 0;
const reader = {
  // Record (layer, expert) is filled with the byte value layer*E + expert.
  read: (offset, length, into) => new Promise((res) => setTimeout(() => {
    reads++;
    const buf = into && into.byteLength >= length ? into : new ArrayBuffer(length);
    new Uint8Array(buf, 0, length).fill(offset / REC);
    res({ buf, got: length, ms: 0.1 });
  }, 2)),
};
const parts = [{ buffer: 'A', srcOffset: 0, bytes: 10 }, { buffer: 'B', srcOffset: 10, bytes: 6 }];
let uploadRing = 0;
const mk = (slots) => new ExpertStreamer({ device, reader, recordBytes: REC, recordOffset: (l, e) => (l * E + e) * REC, parts, slots, numLayers: L, numExperts: E, uploadRing });

for (uploadRing of [0, 2]) {
await new Promise((r) => setTimeout(r, 50));   // loads left in flight by the previous pass land first
writes.length = 0;

{ // misses then hits; uploads land at slot × part.bytes with the record's bytes
  const xs = mk(4);
  const s1 = await xs.ensure(0, [1, 2]);
  assert.equal(xs.stats.misses, 2);
  assert.equal(writes.length, 4);
  const w = writes.find((x) => x.buffer === 'B' && x.offset === s1[0] * 6);
  assert.ok(w && w.bytes.every((b) => b === 1), 'part B of expert 1 holds its record bytes');
  xs.release(s1);
  const s2 = await xs.ensure(0, [2, 1]);
  assert.deepEqual([...s2], [s1[1], s1[0]]);
  assert.equal(xs.stats.hits, 2);
  xs.release(s2);
}

{ // LRU: the least recently used unpinned expert is evicted first
  const xs = mk(3);
  xs.release(await xs.ensure(0, [0]));
  xs.release(await xs.ensure(0, [1]));
  xs.release(await xs.ensure(0, [2]));
  xs.release(await xs.ensure(0, [0]));        // 0 becomes most recent; LRU order 1, 2, 0
  xs.release(await xs.ensure(1, [5]));        // evicts expert 1
  assert.ok(!xs.lru.has(xs.key(0, 1)) && xs.lru.has(xs.key(0, 0)) && xs.lru.has(xs.key(0, 2)));
  assert.equal(xs.stats.evictions, 1);
}

{ // pins: while layer 0's slots are held, a prefetch may only use the rest of the pool
  const xs = mk(3);
  const held = await xs.ensure(0, [0, 1]);
  const started = xs.prefetch(1, [3, 4, 5]);   // one free slot → one load, then nothing evictable
  assert.equal(started, 1);
  await xs.drain();
  assert.ok(xs.lru.has(xs.key(0, 0)) && xs.lru.has(xs.key(0, 1)), 'held experts survive the prefetch');
  xs.release(held);
  const s = await xs.ensure(1, [3]);          // the prefetched one is a hit
  assert.equal(xs.stats.prefetchUsed, 1);
  assert.equal(xs.stats.hitsByLayer[1], 1);
  xs.release(s);
}

{ // late hit: demand for an expert whose prefetch is still in flight waits for that load
  const xs = mk(4);
  reads = 0;
  xs.prefetch(2, [6]);
  const s = await xs.ensure(2, [6]);
  assert.equal(reads, 1, 'no second read for an in-flight expert');
  assert.equal(xs.stats.lateHits, 1);
  assert.equal(xs.pinCount[s[0]], 1, 'the late demand holds a pin');
  xs.release(s);
  assert.equal(xs.pinCount[s[0]], 0);
}

{ // exhausted pool: demanding more experts than slots fails loudly
  const xs = mk(2);
  await assert.rejects(async () => xs.ensure(0, [0, 1, 2]), /pool exhausted/);
}
}
console.log('moe-expert-stream: ok (writeBuffer and staging ring)');
