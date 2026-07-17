// src/webgpu/webgpu_init.js
// WebGPU initialization utility for LocalMind offline inference.
// Adds memory budgeting, low‑VRAM fallback and robust error handling.

import { estimateUsableGpuMemory, shouldUseLowVramMode, createSafeBuffer } from './memory_manager.js';

/**
 * Global state indicating whether the current environment can reliably run GPU workloads.
 * If `lowVram` is true the app should load a smaller model or fall back to CPU.
 */
export const gpuState = {
  device: null,
  lowVram: false,
  usableBytes: 0,
};

/**
 * Initialise WebGPU and populate `gpuState`.
 * Throws if WebGPU is unavailable; otherwise returns a GPUDevice.
 */
export async function initWebGPU(requiredBytes = 0) {
  if (!('gpu' in navigator)) {
    throw new Error('WebGPU not supported on this device');
  }
  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('Failed to get GPU adapter');
    const device = await adapter.requestDevice();
    const usable = await estimateUsableGpuMemory(device);
    const lowVram = await shouldUseLowVramMode(device, requiredBytes);
    gpuState.device = device;
    gpuState.lowVram = lowVram;
    gpuState.usableBytes = usable;
    if (lowVram) {
      console.warn('Low‑VRAM mode enabled – consider using a smaller model');
    }
    return device;
  } catch (e) {
    console.error('WebGPU init error:', e);
    // Propagate so caller can fallback to CPU.
    throw e;
  }
}

/**
 * Compile a WGSL shader and create a compute pipeline.
 * @param {GPUDevice} device
 * @param {string} wgslCode - WGSL shader source.
 * @returns {GPUComputePipeline}
 */
export function createComputePipeline(device, wgslCode) {
  const module = device.createShaderModule({ code: wgslCode });
  return device.createComputePipeline({ compute: { module, entryPoint: 'main' } });
}

/**
 * Execute a compute pass using safely‑created buffers.
 * @param {GPUDevice} device
 * @param {GPUComputePipeline} pipeline
 * @param {Array<{size:number, usage:number}>} bufferSpecs – specifications of buffers to allocate.
 */
export async function runComputePass(device, pipeline, bufferSpecs) {
  // Allocate buffers respecting the usable memory budget.
  const bindGroupBuffers = [];
  for (const spec of bufferSpecs) {
    const buf = await createSafeBuffer(device, spec.size, spec.usage);
    bindGroupBuffers.push(buf);
  }

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: bindGroupBuffers.map((buffer, i) => ({ binding: i, resource: { buffer } })),
  });

  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(1);
  passEncoder.end();
  device.queue.submit([commandEncoder.finish()]);
}
