// `com.xenova.Lut2SmallMGemm` — the M<=8 ternary GEMM from this spike as an engine op package (manifest + jinja
// assets), registered into the engine's op override map by patch-internals.mjs section (e).
//
//   Y[m, dstColStart + n] = sum_k A[m, k] * W[n, k]      m < M (1..8), n < outFeatures, k < inFeatures
//
// W is the engine's lut2_128 (lutId 9) layout at block offset `blockOffset` (see kernel.wgsl.js for the layout
// facts). A is the Hadamard-rotated f32 activation, as LlamaPrefillMatmul receives it. Precision tiers
// (RESULTS.md section 7): "f16" (f16 tile + f16 block partials, default), "f32" (f16 tile, f32 math — same error
// as the engine's prefill route), "exact" (f32 tile + f32 math). `kSplits` splits K across workgroups (must divide
// inFeatures/256); > 1 adds an ordered f32 reduce pass over a scratch of partials.
const TN = 64, RN = 4, KS = 8, WG = (TN / RN) * KS;

function mainTemplate() {
  const L = [];
  L.push(`enable f16;
enable subgroups;
{{ env.wgsl.resourceDeclarations }}

const M: u32 = {{ M }}u;
const KS: u32 = ${KS}u;
const CHV: u32 = 64u;
const TN: u32 = ${TN}u;
const RN: u32 = ${RN}u;
const WG: u32 = ${WG}u;
const CHUNKS_PER_SPLIT: u32 = {{ chunksPerSplit }}u;
const BPR: u32 = {{ blocksPerRow }}u;
const KV: u32 = {{ kVec4 }}u;
const N: u32 = {{ outFeatures }}u;
const OUT_STRIDE: u32 = {{ outStride }}u;
const DST_COL: u32 = {{ dstColStart }}u;
var<workgroup> As: array<vec4<{{ tileScalar }}>, {{ tileElems }}>;

fn trits(word: u32, sh: u32) -> vec4<{{ mathScalar }}> {
  let codes = (vec4<u32>(word >> sh) >> vec4<u32>(0u, 2u, 4u, 6u)) & vec4<u32>(3u);
  return vec4<{{ mathScalar }}>(bitcast<vec4<f32>>(codes | vec4<u32>(0x4b000000u)) - vec4<f32>(8388609.0));
}

@compute @workgroup_size(${WG})
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let lid = lid3.x;
  let kg = lid & (KS - 1u);
  let rg = lid / KS;
  let row0 = wid.x * TN + rg * RN;
  let c0 = wid.y * CHUNKS_PER_SPLIT;
  let c1 = c0 + CHUNKS_PER_SPLIT;
  let wordBase = params.block_offset * 2u;
  let scaleBase = params.block_offset / 8u;
{% for r in range(${RN}) %}{% for m in range(M) %}
  var acc{{ r }}_{{ m }} = 0.0;
{%- endfor %}{% endfor %}
  for (var c = c0; c < c1; c = c + 1u) {
    let kc0v = c * CHV;
    for (var i = lid; i < M * CHV; i = i + WG) {
      let m = i / CHV;
      let v = i - m * CHV;
      As[m * CHV + (v & 7u) * KS + (v >> 3u)] = vec4<{{ tileScalar }}>(a[m * KV + kc0v + v]);
    }
    workgroupBarrier();
    let kb = c * KS + kg;
{% for r in range(${RN}) %}
    let blk{{ r }} = (row0 + {{ r }}u) * BPR + kb;
    let wa{{ r }} = bits[wordBase + blk{{ r }} * 2u];
    let wb{{ r }} = bits[wordBase + blk{{ r }} * 2u + 1u];
    let sc{{ r }} = unpack2x16float(scales[scaleBase + (blk{{ r }} >> 3u)])[(blk{{ r }} >> 2u) & 1u];
{%- endfor %}
{% for r in range(${RN}) %}{% for m in range(M) %}
    var p{{ r }}_{{ m }} = {{ zeroLit }};
{%- endfor %}{% endfor %}`);
  for (let g = 0; g < 8; ++g) {
    L.push(`    {
{% for m in range(M) %}
      let a{{ m }} = vec4<{{ mathScalar }}>(As[{{ m }}u * CHV + ${g * KS}u + kg]);
{%- endfor %}
{% for r in range(${RN}) %}
      let w{{ r }} = trits(w${g < 4 ? 'a' : 'b'}{{ r }}, ${(g & 3) * 8}u);
{% for m in range(M) %}
      p{{ r }}_{{ m }} = p{{ r }}_{{ m }} + dot(w{{ r }}, a{{ m }});
{%- endfor %}
{%- endfor %}
    }`);
  }
  L.push(`{% for r in range(${RN}) %}{% for m in range(M) %}
    acc{{ r }}_{{ m }} = acc{{ r }}_{{ m }} + sc{{ r }} * f32(p{{ r }}_{{ m }});
{%- endfor %}{% endfor %}
    workgroupBarrier();
  }
{% for r in range(${RN}) %}{% for m in range(M) %}
  {
    var v = acc{{ r }}_{{ m }};
    v = v + subgroupShuffleXor(v, 1u);
    v = v + subgroupShuffleXor(v, 2u);
    v = v + subgroupShuffleXor(v, 4u);
    if (kg == 0u) {
{% if splitK %}
      partials[(wid.y * M + {{ m }}u) * N + row0 + {{ r }}u] = v;
{% else %}
      y[{{ m }}u * OUT_STRIDE + DST_COL + row0 + {{ r }}u] = v;
{% endif %}
    }
  }
{%- endfor %}{% endfor %}
}
`);
  return L.join('\n');
}

const reduceTemplate = `{{ env.wgsl.resourceDeclarations }}

const M: u32 = {{ M }}u;
const N: u32 = {{ outFeatures }}u;
const OUT_STRIDE: u32 = {{ outStride }}u;
const DST_COL: u32 = {{ dstColStart }}u;
const K_SPLITS: u32 = {{ kSplitsEff }}u;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let flat = gid.x + gid.y * {{ DISPATCH_FOLD_WIDTH }}u * 256u;
  if (flat >= M * N) {
    return;
  }
  let m = flat / N;
  let n = flat % N;
  var acc = 0.0;
  for (var z = 0u; z < K_SPLITS; z = z + 1u) {
    acc = acc + partials[(z * M + m) * N + n];
  }
  y[m * OUT_STRIDE + DST_COL + n] = acc;
}
`;

const contract = [
  'ranks.aT == 2', 'ranks.bitsT == 1', 'ranks.scalesT == 1', 'ranks.yT == 2',
  'tensorDtypes.aT == "float32"', 'tensorDtypes.yT == "float32"', 'tensorDtypes.bitsT == "uint32"', 'tensorDtypes.scalesT == "uint32"',
  'args.lut == 9', 'args.M >= 1', 'args.M <= 8',
  'args.inFeatures > 0', 'args.inFeatures % 256 == 0', 'args.outFeatures > 0', 'args.outFeatures % 64 == 0', 'args.blockOffset % 8 == 0',
  'args.dstColStart + args.outFeatures <= args.outStride',
  'numel(shapes.aT) >= args.M * args.inFeatures', 'numel(shapes.yT) >= args.M * args.outStride',
  'numel(shapes.bitsT) >= (args.blockOffset + args.outFeatures * (args.inFeatures / 32)) * 2',
  'numel(shapes.scalesT) >= (args.blockOffset + args.outFeatures * (args.inFeatures / 32)) / 8',
  '(args.inFeatures / 256) % kSplitsEff == 0',
  'ceil(args.outFeatures / 64) <= device.limits.maxComputeWorkgroupsPerDimension', 'kSplitsEff <= device.limits.maxComputeWorkgroupsPerDimension',
  '128 <= device.limits.maxComputeInvocationsPerWorkgroup',
];

export const SMALLM_OP_ID = 'com.xenova.Lut2SmallMGemm';
export function smallMOpPackage() {
  const derive = {
    M: 'args.M',
    outFeatures: 'args.outFeatures',
    outStride: 'args.outStride',
    dstColStart: 'args.dstColStart if args.dstColStart else 0',
    blocksPerRow: 'args.inFeatures / 32',
    kVec4: 'args.inFeatures / 4',
    kSplitsEff: 'args.kSplits if args.kSplits else 1',
    chunksPerSplit: '(args.inFeatures / 256) / kSplitsEff',
    tileElems: 'args.M * 64',
    precisionEff: 'args.precision if args.precision else "f16"',
    mathScalar: '"f32" if (precisionEff == "f32" or precisionEff == "exact") else "f16"',
    tileScalar: '"f32" if precisionEff == "exact" else "f16"',
    zeroLit: '"0.0" if (precisionEff == "f32" or precisionEff == "exact") else "0.0h"',
  };
  const manifest = {
    domain: 'com.xenova',
    name: 'Lut2SmallMGemm',
    description: 'Small-M (1..8 rows) GEMM against lut2_128 (lutId 9) ternary weights: each packed weight word is read once and dotted against every activation row held in workgroup memory; f32 accumulation across 128-element scale groups. `Y[m, dstColStart + n] = sum_k A[m, k] * W[blockOffset + n*(inFeatures/32) ...][k]`.',
    sinceVersion: 1,
    inputs: {
      aT: { description: 'Activation rows `[M, inFeatures]` (float32, Hadamard-rotated where the pack expects it).', onnx: 'A', dtype: 'A', rank: 2 },
      bitsT: { description: 'lut2_128 packed weight words (2 per 32-element block).', onnx: 'Bits', dtype: 'uint32', rank: 1 },
      scalesT: { description: 'lut2_128 metadata: f16 group scales packed two per u32.', onnx: 'Scales', dtype: 'uint32', rank: 1 },
    },
    outputs: {
      yT: { description: 'Caller-provided output rows `[M, outStride]`; columns `[dstColStart, dstColStart + outFeatures)` are written.', onnx: 'Y', dtype: 'Y', rank: 2, shape: ['args.M', 'args.outStride'] },
    },
    args: {
      M: { kind: 'u32', description: 'Activation row count (1..8).', required: true },
      inFeatures: { kind: 'u32', description: 'K (multiple of 256).', required: true },
      outFeatures: { kind: 'u32', description: 'N (multiple of 64).', required: true },
      blockOffset: { kind: 'u32', description: 'First 32-element block of the weight in the pack (multiple of 8).', required: true },
      outStride: { kind: 'u32', description: 'Row stride of Y in elements.', required: true },
      dstColStart: { kind: 'u32', description: 'First output column written; defaults to 0.', required: false },
      lut: { kind: 'u32', description: 'Codebook id; only 9 (lut2_128 native f16 group scales) is supported.', required: true },
      precision: { kind: 'string', description: 'f16 (default): f16 tile + f16 block partials; f32: f16 tile + f32 math; exact: f32 tile + f32 math.', required: false, oneOf: ['f16', 'f32', 'exact'] },
      kSplits: { kind: 'u32', description: 'K splits across workgroups (must divide inFeatures/256); defaults to 1.', required: false },
    },
    typeConstraints: { A: ['float32'], Y: ['float32'] },
    derive,
    bindings: {
      a: { arg: 'aT', buffer: 'read-only-storage', elementType: 'vec4<f32>' },
      bits: { arg: 'bitsT', buffer: 'read-only-storage', elementType: 'u32' },
      scales: { arg: 'scalesT', buffer: 'read-only-storage', elementType: 'u32' },
      y: { arg: 'yT', buffer: 'storage', elementType: 'f32' },
      params: { buffer: 'uniform', struct: [{ name: 'block_offset', type: 'u32', value: 'args.blockOffset' }] },
    },
    variants: [
      {
        id: 'single',
        priority: 10,
        when: [...contract, 'kSplitsEff == 1'],
        requires: { features: ['shader-f16', 'subgroups'] },
        derive: { splitK: false },
        passes: [{
          id: 'main', name: 'Lut2SmallMGemm', shader: 'lut2-smallm.wgsl.jinja',
          bindings: ['a', 'bits', 'scales', 'y', 'params'],
          dispatch: { x: 'ceil(args.outFeatures / 64)', y: '1' },
        }],
      },
      {
        id: 'splitk',
        priority: 10,
        when: [...contract, 'kSplitsEff > 1'],
        requires: { features: ['shader-f16', 'subgroups'] },
        derive: { splitK: true },
        passes: [{
          id: 'main', name: 'Lut2SmallMGemmSplitK', shader: 'lut2-smallm.wgsl.jinja',
          bindings: ['a', 'bits', 'scales', { scratch: 'smallMPartials', name: 'partials', elementType: 'f32', buffer: 'storage' }, 'params'],
          dispatch: { x: 'ceil(args.outFeatures / 64)', y: 'kSplitsEff' },
        }, {
          id: 'reduce', name: 'Lut2SmallMGemmReduce', shader: 'lut2-smallm-reduce.wgsl.jinja',
          bindings: [{ scratch: 'smallMPartials', name: 'partials', elementType: 'f32', buffer: 'read-only-storage' }, 'y'],
          dispatch: { threads: 'args.M * args.outFeatures', workgroupSize: 256 },
        }],
        intermediates: [{ id: 'smallMPartials', dtype: 'float32', shape: '[kSplitsEff * args.M * args.outFeatures]' }],
      },
    ],
  };
  const assets = [['lut2-smallm.wgsl.jinja', mainTemplate()], ['lut2-smallm-reduce.wgsl.jinja', reduceTemplate]];
  return { manifest, assets };
}

// K-split choice used by the graph route: the smallest divisor of inFeatures/256 that yields >= 256 workgroups, else the largest.
export function pickKSplits(inFeatures, outFeatures) {
  const tiles = Math.ceil(outFeatures / 64), chunks = inFeatures / 256; let ks = 1;
  for (const d of [1, 2, 4, 5, 8, 10, 16, 20]) { if (chunks % d === 0) { ks = d; if (tiles * d >= 256) break; } }
  return ks;
}
