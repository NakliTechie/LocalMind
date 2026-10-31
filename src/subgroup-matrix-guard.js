/* subgroup-matrix-guard.js — keeps the f16 subgroup-matrix prefill kernels off devices that cannot compile them.

   The Ternary Bonsai 2, Gemma 4 E2B, LFM2.5 and IQ-quant prefill kernels multiply f16 subgroup matrices into an f32
   result. Apple GPUs report only f16-f16 and f32-f32 subgroup-matrix configurations; Dawn compiled the mixed pair
   anyway until Chrome 156, which rejects it ("Mixed precision subgroup matrix multiply is not supported by the
   device"), so those engines failed to load. Importing this module wraps navigator.gpu.requestAdapter once: the first
   request compiles one tiny mixed kernel on a separate adapter (an adapter gives out one device), and if that fails,
   every adapter handed out hides 'chromium-experimental-subgroup-matrix'. Each engine then takes the non-matrix prefill
   path it already has. Only those four engines use subgroup matrices, so no other engine changes.
   Imported for its side effect by ternary_bonsai_2_27b.js, gemma-4-e2b.js, lfm2_5.js and qwen3_moe_ssd.js (which
   creates the device for qwen35_dense.js and iq_quants.js). Installs at most once per realm. */

const SGM = 'chromium-experimental-subgroup-matrix';
const MIXED = 'enable f16; enable chromium_experimental_subgroup_matrix; '
  + '@group(0) @binding(0) var<storage, read_write> o: array<f32>; @group(0) @binding(1) var<storage, read> x: array<f16>; '
  + '@compute @workgroup_size(32) fn main() { let a = subgroupMatrixLoad<subgroup_matrix_left<f16, 8, 8>>(&x, 0, false, 8); '
  + 'let b = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&x, 0, false, 8); var c = subgroup_matrix_result<f32, 8, 8>(); '
  + 'c = subgroupMatrixMultiplyAccumulate(a, b, c); subgroupMatrixStore(&o, 0, c, false, 8); }';

const gpu = typeof navigator !== 'undefined' ? navigator.gpu : undefined;
if (gpu && typeof gpu.requestAdapter === 'function' && !gpu.__mixedSubgroupMatrixGuard) {
  gpu.__mixedSubgroupMatrixGuard = true;
  const realRequest = gpu.requestAdapter.bind(gpu);
  let mixedOk = null;
  const probe = async (opts) => {
    let dev = null;
    try {
      const a = await realRequest(opts);
      if (!a || !a.features.has('shader-f16') || !a.features.has('subgroups')) return false;
      dev = await a.requestDevice({ requiredFeatures: ['shader-f16', 'subgroups', SGM] });
      await dev.createComputePipelineAsync({ layout: 'auto', compute: { module: dev.createShaderModule({ code: MIXED }), entryPoint: 'main' } });
      return true;
    } catch { return false; } finally { if (dev) dev.destroy(); }
  };
  gpu.requestAdapter = async (opts) => {
    const adapter = await realRequest(opts);
    if (!adapter || !adapter.features.has(SGM)) return adapter;
    if (mixedOk === null) mixedOk = probe(opts);
    if (await mixedOk) return adapter;
    const features = new Set([...adapter.features].filter((f) => f !== SGM));
    return new Proxy(adapter, { get(t, p) { if (p === 'features') return features; const v = Reflect.get(t, p, t); return typeof v === 'function' ? v.bind(t) : v; } });
  };
}
