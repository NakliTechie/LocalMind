// gemma-4-e2b-ple.inc.js — module-scope helpers that scripts/build-gemma-4-e2b.mjs splices into
// gemma-4-e2b.js for the PLE-from-OPFS mode (load(id, { ple })). They touch the engine only
// through the arguments they receive. Kept as a separate, readable file so `node --check` and a
// reviewer see real source rather than a string inside the build script.

// Before a decode step is submitted: make its token's row resident. With a GPU slot map the step's
// own lookup kernel writes the slot; without one the CPU writes it.
function $pleStepIds(session, host, token) {
  const ple = session.model.weights.embedTokensPerLayer.ple;
  if (ple.mapT) {
    if (token !== null) ple.lookup([token]);
    return;
  }
  if (token === null) throw new Error('PLE from OPFS: a decode step needs its token id on the CPU');
  host.writeBuffer(session.pleIdsT.buffer, 0, ple.lookup([token]));
}

// One-thread kernel at the start of each decode step: slots[0] = slot_of[ids[0]], where ids[0]
// is the step's token (written by the previous step's argmax, or by the CPU). A token with no
// resident row maps to slot 0; that step is then replayed (see $plePipelined).
const $plePipelines = new WeakMap();
function $pleLookupStep(rt, idsT, mapT, slotsT) {
  const device = rt.host.device;
  let pipeline = $plePipelines.get(device);
  if (!pipeline) {
    const code = [
      '@group(0) @binding(0) var<storage, read> ids: array<u32>;',
      '@group(0) @binding(1) var<storage, read> slot_of: array<u32>;',
      '@group(0) @binding(2) var<storage, read_write> slots: array<u32>;',
      '@compute @workgroup_size(1) fn main() {',
      '  let s = slot_of[min(ids[0], arrayLength(&slot_of) - 1u)];',
      '  slots[0] = select(s, 0u, s == 0xffffffffu);',
      '}',
    ].join(String.fromCharCode(10));
    pipeline = device.createComputePipeline({
      label: 'PleSlotLookup',
      layout: 'auto',
      compute: { module: device.createShaderModule({ label: 'PleSlotLookup', code }), entryPoint: 'main' },
    });
    $plePipelines.set(device, pipeline);
  }
  const bindGroup = device.createBindGroup({
    label: 'PleSlotLookup',
    layout: pipeline.getBindGroupLayout(0),
    entries: [idsT, mapT, slotsT].map((t, binding) => ({ binding, resource: { buffer: t.buffer } })),
  });
  return { name: 'PleSlotLookup', pipeline, bindGroup, dispatchWorkgroups: [1, 1, 1] };
}

// Decode with the PLE table in OPFS. Upstream keeps four decode steps in flight because the GPU
// feeds each step's argmax straight into the next; here the CPU must check each token's row
// before that token's step may finish, and a full round trip per token costs ~16%. So each step
// is submitted in two parts. Part A (the first `ple.split` of the step's kernels, starting with the
// slot lookup) is submitted speculatively while the previous step is still running. When that
// step's token comes back, the CPU checks its row: resident, it submits part B; not resident,
// part A ran with a wrong row, so the CPU installs the row and submits A and B again at the same
// position. Part A must outlast the readback (~1 ms) for the GPU never to wait on a hit; a miss
// wastes one part A. Replays rewrite the same KV slots, so the output matches the resident
// engine token for token.
//   session: the decode graph; cache: the generation state (advance); ple: the table;
//   first: the token prefill produced; pos: its position; budget: tokens still to yield.
async function* $plePipelined(session, cache, ple, first, pos, budget, stop) {
  const rt = session.model.rt, steps = session.steps;
  const cut = Math.max(1, Math.min(steps.length - 1, Math.round(steps.length * (ple.split ?? 0.3))));
  const partA = steps.slice(0, cut), partB = steps.slice(cut);
  const head = (token, at) => { session.writeStepInputs(token, at); session.col.enqueue(partA); };
  const tail = () => { session.col.enqueue(partB); return rt.readTensor(session.idsT).then((t) => t[0]); };
  head(first, pos);
  let pending = tail(), planned = 1, yielded = 0;
  pos += 1;
  try {
    for (;;) {
      const speculate = planned < budget;
      if (speculate) head(null, pos);
      const token = await pending;
      pending = null;
      cache.advance(1);
      if (stop(token)) return;
      yield token;
      if (++yielded >= budget || !speculate) return;
      if (ple.cache.has(token)) ple.lookup([token]);
      else { ple.cache.stats.replays += 1; head(token, pos); }
      pending = tail();
      planned += 1;
      pos += 1;
    }
  } finally {
    if (pending) { try { await pending; } catch (_) {} }
  }
}
