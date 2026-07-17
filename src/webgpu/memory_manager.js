// src/webgpu/memory_manager.js
// Helper utilities for managing GPU memory budgets and graceful fallback.

/**
 * Estimate the usable GPU memory based on adapter limits and a safety factor.
 * Returns the number of bytes we consider safe to allocate.
 */
export async function estimateUsableGpuMemory(device) {
  // The WebGPU spec does not expose total VRAM, but we can use limits as a proxy.
  // maxStorageBufferBindingSize is typically the max size of a single buffer.
  const maxBuffer = device.limits.maxStorageBufferBindingSize || 0;
  // Use a conservative factor (e.g., 0.6) to avoid exhausting VRAM.
  const safeFactor = 0.6;
  return Math.floor(maxBuffer * safeFactor);
}

/**
 * Decide whether to enable low‑VRAM mode based on a threshold.
 * @param {GPUDevice} device
 * @param {number} requiredBytes – bytes needed for the model.
 * @param {number} [threshold=0.8] – fraction of usable memory that triggers low‑VRAM.
 * @returns {boolean} true if low‑VRAM mode should be active.
 */
export async function shouldUseLowVramMode(device, requiredBytes, threshold = 0.8) {
  const usable = await estimateUsableGpuMemory(device);
  return requiredBytes > usable * threshold;
}

/**
 * Helper to create a GPU buffer that respects the usable memory budget.
 * If the requested size exceeds the safe budget, the function throws.
 */
export async function createSafeBuffer(device, size, usage) {
  const usable = await estimateUsableGpuMemory(device);
  if (size > usable) {
    throw new Error(`Requested buffer (${size} bytes) exceeds safe GPU budget (${usable} bytes).`);
  }
  return device.createBuffer({ size, usage, mappedAtCreation: false });
}
