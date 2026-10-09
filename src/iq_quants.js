/* iq_quants.js — llama.cpp's block quant formats as WGSL, read straight from the GGUF bytes.
 *
 * Covers the types an imatrix "IQ-mix" GGUF mixes (Underdog Saluki 27B uses all eleven): Q8_0, Q2_K, Q4_K,
 * IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS. A tensor stays in (nearly) its GGUF block layout
 * on the GPU, one array<u32>: blocks of 4k+2 bytes get two bytes of padding after their f16 scale (repackKernel),
 * so every field is word-aligned. `deq8(B, s, g)` returns weights 8g..8g+7 of 32-value chunk s of the block at
 * byte offset B, transcribed from ggml-quants.c's dequantize_row_* so the values are the ones llama.cpp computes.
 *
 * Kernels (generated per type, sharing one binding layout):
 *   mvKernel(t)    y[m] = Σ_k W[m][k]·x[k]                 bindings: x, wq, grid, y, P{M, N, rowBytes (GPU layout)}
 *   mmKernel(t)    y[t·M + m] = Σ_k x[t·N + k]·W[m][k]      + Q{T, …}; tiles of 64 rows × 64 tokens
 *   mmSgKernel(t)  the same on subgroup matrices (f16 in, f32 accumulate) where the adapter has them
 *   embedKernel(t) y[i] = W[token][i]                       bindings: wq, grid, y, Tok, P{N, rowBytes}
 *   embedBKernel(t) the same for T token ids               bindings: wq, grid, ids, y, P, Q
 * The codebooks (iq2 / iq3 / iq1 grids, kvalues_iq4nl) live in one storage buffer: gridData().
 */

export const QTYPES = {
  // id: GGML type id. block: bytes per block. qk: values per block.
  Q8_0: { id: 8, block: 34, qk: 32 },
  Q2_K: { id: 10, block: 84, qk: 256 },
  Q4_K: { id: 12, block: 144, qk: 256 },
  IQ2_XXS: { id: 16, block: 66, qk: 256 },
  IQ2_XS: { id: 17, block: 74, qk: 256 },
  IQ3_XXS: { id: 18, block: 98, qk: 256 },
  IQ1_S: { id: 19, block: 50, qk: 256 },
  IQ3_S: { id: 21, block: 110, qk: 256 },
  IQ2_S: { id: 22, block: 82, qk: 256 },
  IQ4_XS: { id: 23, block: 136, qk: 256 },
  IQ1_M: { id: 29, block: 56, qk: 256 },
};
export const QTYPE_BY_ID = Object.fromEntries(Object.entries(QTYPES).map(([name, t]) => [t.id, name]));
export const rowBytes = (type, cols) => (cols / QTYPES[type].qk) * QTYPES[type].block;

// BEGIN GENERATED GRIDS (node scripts/build-iq-grids.mjs)
const KVALUES_IQ4NL = [-127, -104, -83, -65, -49, -35, -22, -10, 1, 13, 25, 38, 53, 69, 89, 113];
const GRIDS = {
  iq2xxs: 'AAACAAUACAAKABEAFAAgACIAKAAqAEEARABQAFgAYQBkAIAAggCKAKIAAQEEARABFQFAAYQBmAEAAgICIgKCAgEEBAQQBCEEJARABEIESARgBIEEhASQBKQEAAUCBQgFIAVGBWkFgAWRBQkGEAZABoQGpAYACAUICAgUCCgIQQhECFAIUgiICAQJQAkCChQKARAEEBAQIRBAEGAQhBCQEJUQABEIESARUBFaEYARJBJFEgAUCBQgFCUUSRSAFBgVYhUAFhYWARgEGBAYQBiBGAAZBRmgGVEaACACIAogRCBhIIAggiApIUghACICIgEkBCQQJEAkViQAJUElZCWQJggoICiUKEQqAUAEQBBAGEAhQCRAQEBIQFZAYECBQIRAkEAAQSBBYUGAQYVBAUIQQkhCVkJoQgBECEQgRIBEmUQSRSRFAEYBSARIEEhASEVIAElYSWFJgklFSpBKAFAIUBFQGVAgUIBQiFAEUUJRpFGRUpBUklQKVQFWVFYAWBFYGVhkWEBZCFoEYBBgQGBoYABhVWEYYmBiAGQFZBBlEmWEZUJoAIACgAqAQYCCgASBGIFAgRGCAYQEhBCEFYRAhGCEAIVGhZSFCYZAhmCGAogEiRGKBJAQkCSQQJChkBaRgJFFkgCUIpRElFGVgZggmQKgUKCFoAmhAKIYpFCoBKk=',
  iq2xs: 'AAACAAUACAAKABEAFAAWABkAIAAiACUAKABBAEQARgBJAFAAUgBVAFgAYQBkAIAAggCFAIgAkQCUAJkAoAABAQQBBgEJARABEgEVARgBGgEhASQBQAFCAUUBSAFRAVQBYAFoAYEBhAGQAQACAgIFAggCEQIUAiACQQJEAlACVQKAAooCAQQEBAYECQQQBBIEFQQYBCEEJARABEIERQRIBFEEVARWBGAEgQSEBJAEAAUCBQUFCAURBRQFIAVBBUQFUAVhBYAFAQYEBhAGJgZABkIGhAYACAIIBQgICAoIEQgUCCAIJQhBCEQIUAhYCIAIoAiqCAEJBAkQCUAJgQmJCQAKIAooCpYKoAoBEAQQBhAJEBAQEhAVEBgQIRAkEEAQQhBFEEgQURBUEGAQahCBEIQQkBAAEQIRBREIERERFBEgEUERRBFQEYARlBGWEQESBBIGEhASQBJgEgAUAhQFFAgUERQUFCAUQRREFEkUUBRkFIAUARUEFRAVQBUAFhQWSRYBGAQYEBgSGEAYVBiGGAAZBRlmGVEaqRoAIAIgBSAIIAogESAUICAgQSBEIFAggCCgIAEhBCEQIUAhSCFlIQAiIiKAIqgiASQEJBAkKSRAJAAlQSVSJZklASYaJqYmACgIKAooIChVKIgooihoKZApCCogKoIqiCqKKgFABEAGQAlAEEASQBVAGEAhQCRAQEBCQEVASEBKQFFAVEBgQGVAgUCEQJBAAEECQQVBCEERQRRBIEFBQURBUEGAQYVBokEBQgRCEEISQilCQEIARAJEBUQIRBFEFEQZRCBEQURERFBEgESURAFFBEUQRSRFQEWaRQBGCkZERlBGAUgESBBIQEhFSFRIYkgASRFJRElQSWlJBEoAUAJQBVAIUBFQFFAgUChQQVBEUFBQgFABUQRREFEVUUBRQlEAUkRSqlIBVARUEFQhVEBUYFSBVKFUAFUIVYBViFUhVmhWoVYAWBRYQVhQWJlYGllAWUJZhVoBYARgEGBAYFRgYmCGYKlgAGEkYkpikmIAZBZkEGVAZUVlpGUBaGpoJWkGalRqYmoAgAKABYAIgBGAFIAggCqAQYBEgFCAgICCgKiAqoABgQSBBoEQgUCBUYFZgQCCIIKAgoKCoIKoggGEBIQQhBKEFYRAhGCEiYQAhUSFpYUYhmqGAIgIiCWIWoiAiIKIqIgGiSKKgIqIipaKqIoBkASQEJBAkFaQhJAAkSKRZJFWkomSAJQFlESUUJRYlCmVkJWSlUGWUZimmEmZFZpgmgCgAqAIoAqgIKAqoKCgUaFZoaahAKICogiiKqKAoqCiQKSVpGWmmKYKqCCoIqgoqKCoqKgEqYSphqkoqiqqkaqqqg==',
  iq2s: 'AAACAAUACAAKABEAFAAWABkAIAAiACUAKABBAEQARgBJAFAAUgBVAFgAYQBkAGYAaQCAAIIAhQCIAJEAlACgAKUAqgABAQQBBgEJARABEgEVARgBIQEkAUABQgFFAUgBUQFUAVYBWQFgAWUBaAGBAYQBkAGSAZUBoQGkAQACAgIFAggCEQIUAiACKgJBAkQCRgJJAlACVQKAAoUCigKUAqICAQQEBAYECQQQBBIEFQQYBCEEJAQmBCkEQARCBEUESARKBFEEVARWBFkEYARiBGUEgQSEBIYEiQSQBJUEmAShBKQEAAUCBQUFCAUKBREFFAUWBRkFIAUlBSgFQQVEBUYFSQVQBVIFVQVYBWEFZAWABYIFhQWIBZEFlAWgBQEGBAYGBgkGEAYVBkAGRQZIBlEGVAZgBoEGhAaQBgAIAggFCAgIEQgUCBYIGQggCCUIKghBCEQIRghJCFAIUghVCFgIYQhkCIAIhQiUCKoIAQkECRAJEgkVCRgJIQlACUUJSAlRCVQJYAmBCZAJAAoRChQKIgooCioKUAqZCgEQBBAGEAkQEBASEBUQGBAhECQQJhBAEEIQRRBIEFEQVBBWEFkQYBBiEGUQaBCBEIQQhhCQEJUQmBChEKQQABECEQURCBEKERERFBEWERkRIBEiESURKBFBEUQRRhFJEVARUhFVEVgRYRFkEYARghGFEYgRkRGUEQESBBIJEhASFRIhEiQSQBJFElESVBKBEoQSkBIAFAIUBRQIFBEUFBQWFBkUIBQlFCgUQRREFEYUSRRQFFIUVRRYFGEUZBSAFIIUhRSIFJEUlBSgFAEVBBUGFQkVEBUSFRUVGBUhFSQVQBVCFUUVSBVRFVQVYBWBFYQVkBUAFgUWCBYRFhQWIBZBFkQWUBaAFqoWARgEGAYYCRgQGBUYGBghGEAYQhhFGEgYURhUGGAYgRiEGAAZAhkFGQgZERkUGSAZQRlEGVAZaRmiGQQaEBpAGlYaACACIAUgCCARIBQgFiAZICAgJSAqIEEgRCBQIFIgVSBkIIAgiiCUIKogASEEIRAhEiEVISEhQCFCIUUhUSFUIWAhgSGEIZAhACIKIiIiKCIqIkQiUCKIIooiqCIBJAQkBiQJJBAkFSQYJCEkJCRAJEIkRSRIJFEkVCRgJIEkhCSQJAAlBSUIJRElFCUgJUElRCVQJWYlgCUBJgQmECZAJlkmACgFKBEoFChBKEQoUCiKKKooASkEKRAplSkKKiIqZCqIKooqAUAEQAZACUAQQBJAFUAYQBpAIUAkQCZAQEBCQEVASEBKQFFAVEBWQFlAYEBiQGVAgUCEQJBAlUCYQKFApEAAQQJBBUEIQRFBFEEWQRlBIEEiQSVBQUFEQUZBSUFQQVJBVUFYQWFBZEGAQYJBhUGIQZFBlEGgQQFCBEIQQhJCFUIYQiRCQEJFQkhCUUJUQmBCgUKEQgBEAkQFRAhECkQRRBREFkQZRCBEIkQlRChEQUREREZESURQRFJEVURYRGFEZESARIJEhUSIRJFElESgRAFFBEUGRQlFEEUSRRVFGEUhRSRFQEVCRUVFSEVRRVRFYEVqRYFFhEWQRQBGAkYFRghGEUYURiBGQUZERlBGgEalRgFIBEgJSBBIEkgVSBhIIUgkSEBIQkhFSEhIUUhUSGBIhEiQSABJAkkFSQhJEUkUSSBJQUlESVBJgEmWSQFKBEoQSkBKAFACUAVQCFARUBRQFlAZUCBQIlAlUChQQVBEUEZQSVBQUFJQVVBYUGFQZFCAUIJQhVCIUJFQlFABUQRRBlEJURBRElEVURhRIVEkUUBRQlFFUUhRUVFUUWBRgVGEUZBRAFIFUghSEVIUUiBSQVJEUlBSaVKAUgFUBFQGVAlUEFQSVBVUGFQhVCRUQFRCVEVUSFRRVFRUYFSBVIRUkFQAVQJVBVUIVRFVFFUgVUFVRFVQVYBVAVYEVhBWJlZAVgBYAlgFWAhYEVgUWCBYQVhEWFBYWliAWAFZBFkQWUBZAFoZWoVaqFoBYARgBmAQYBJgFWAYYCFgJGBAYEVgSGBRYFRgYGCEYJBgAGECYQVhCGERYRRhIGFBYURhUGGAYZlhBGIQYkBiVmKhYgBkBWQIZBFkFGQgZEFkRGRQZIBkAWUEZRBlQGVKZWhlkmUAZpRmAWgEaBBoZWiYaABpKmlCaqFqAIACgAWACIARgBSAGYAggCWAQYBEgFCAUoBVgFiAYYCAgIWAkYCUgAGBBIEJgRCBEoEVgRiBIYEkgUCBQoFFgUiBUYFUgYGBhIGQgamBAIIFggqCEYIUgkGCRIJQggGEBIQGhAmEEIQShBWEGIQhhECEQoRFhEiEUYRUhGCEgYSEhJCEAIUChQWFCIURhRSFIIVBhUSFUIWAhYqFAYYEhhCGKYZAhgCIBYgRiBSIQYhEiFCIoogBiQSJQIlliSKKWIpaioKKoooBkASQCZAQkBKQFZAYkCSQQJBCkEWQSJBRkFSQYJCBkISQkJAAkQWREZEUkUGRRJFQkVqRAZIEkhCSQJKmkgCUApQFlAiUEZQUlCCUQZRElFCUgJSWlAGVBJUQlUCVmJWhlQCWRpZklgGYBJgQmCaYQJipmACZSZlSmZCaAKAFoAqgFKAioCqgQaBEoFCgoqCqoEChZaECogqiIqIooiqigqKIooqiqKIBpASkEKRApImkpKQApRmlUaYKqCiooqhUqYapCKoKqiCqIqooqoiqqqo=',
  iq3xxs: 'AAACAAQACQALAA8AEAASABkAIgA7AD0AQQBDAEgASgBRAFUAWABaAGEAbAB4AIAAggCEAIkAkACSAJkAmwCfAKkArwC9AMEAxwDIAMoA1QD4AAsBHwEkAS8BOwE9AUEBRwFaAWoBnQG0AcgBzAHOAeMB8QEBAgMCCAIKAhECEwIYAhoCHAInAigCQAJCAkkCUAJSAoECgwKIAooCkQKYAroCwALCAtAC2QLmAvYCAQMFAygDUANUA2YDeQOFA9ID4AMABAIECQQLBBAEEgQWBBkEIgRBBEMERQRIBEoEUQRYBHMEdwR4BIAEggSJBI8EkASSBJ8EoAStBMEEyATMBPgE/AQdBSsFQwVXBWEFfAXBBcMFzgXlBQEGCAYKBhEGEwYoBjUGOgZABkIGUAZZBmQGZgaBBoMGiAaVBqoGugbJBtsGGAcnBzoHQAdGB1IHbQeMB54HswfbB/AHBAgPCB0IHwgrCC8IfAiQCJ8IoAiwCLYIxwjlCAQJKQk0CVUJYwl4CcUJyAnKCdgJCgohCjgKQApGClYKbQqMCpoKugrCCusKCAsTCxcLOgtCC1kLqAvUC+ILFAwkDCYMNAxRDHEMjwy0DNgM3gwkDUUNag2bDcMN0Q0DDgUOBw4IDhoOKg5WDmAOig6lDqoOwA7NDtsO8A4RDyEPQA9CD1QPmA8=',
  iq3s: 'AAABAAIABQAHAAgACQAKAAwADgAQABEAFQAbACAAIgAlACcAKQArADAAMgA5ADwAPwBAAEEAQgBEAEgASQBNAFAAUwBXAFkAXQBkAHEAdQB6AIAAgQCFAIcAiACLAI4AkQCVAJgAnACiAKUApwCpAKsAuAC7AMMAyQDNANAA0gDZANsA3gDkAOgA6gD3APkA/QAAAQsBDwERARQBGgEgASMBKQE4AUIBRAFQAVIBVgFbAWEBZQFnAXYBewGGAYkBiwGZAaoBuQHAAcIBxAHQAdIB1gHbAegB7AEAAgECAgIEAggCCQILAg0CDwIQAhICGQIcAh4CLAIuAjECOgJAAkECQwJGAkgCTAJRAlgCWwJhAmgCagJ4An4CgAKKAo0CjwKQApQCmgKgAqMCrQKwAroCwQLEAscCyALLAtEC1wLYAtwC4QLyAvgCAwMFAwoDDAMZAxsDIgMmAygDLANBA0gDSwNRA1gDWgNpA5ADlAOXA6QDpgPBA8MDyAPKA9ED3QPhA/ID+AMABAEEAwQFBAcECAQKBAwEDgQRBBMEFwQYBBoEIQQjBCUEKAQqBDcEOAQ7BD0EQARCBEgESwRPBFIEVQRZBFwEYgRpBIEEhASHBJEEkwSYBJ8EoQSrBK8EuQS8BMAEwgTFBMkE0gTUBNkE2wTiBOgE9gQBBQcFEAUTBRoFHQUhBToFPQVEBUkFUgVfBWAFawV4BYAFggWHBZEFrQWxBcUFyQXWBdgF4wXoBQIGCQYLBg0GDwYSBhkGGwYdBiIGJAYnBikGMwY5BkEGQwZFBkwGUQZTBmAGcAZ6Bn4GgAaKBpAGmgacBqgGwQbIBswG0QbTBtcG2AbhBuMG5wbtBvsGAwcJBw4HEgcZByoHMAc0B0EHSAdKB1UHWgdkB24HeweOB6EHwQfDB9AH0gfdBwAIBAgKCBAIFAgXCBoIIQgoCDgIQghHCEkISwhSCFgIXQhjCGkIbQiBCIMIiAiNCJEImwigCK8Isgi4CMQIyQjLCNAI0gjZCN0IAAkCCRQJHwkgCTkJRQlHCVEJcgmLCZwJsAnICc0J2AnjCekJAgoICgwKEgogCiQKJwoqCjYKPApBCkMKRQpKClEKWgp6CoAKiQqTCpgKngqrCsIKxwrICtcK5ArpCvUK+woBCwQLEAsaCyYLSgtWC2kLawuiC8ILxAvSCwkMCwwNDBkMGwwwDEAMUAxXDHQMigycDKIMrQyyDLgMwAzMDNEM4AwVDSMNMg1ADUMNXA1wDYUNoA3JDcsNAA4EDgcOEA4SDh4OIA4sDjIOQg5JDlQOYw5lDoEOhA6IDo4OkQ6YDqkOwg7aDt0O6w4BDwUPCw8QDygPUg9iD4IPmQ/ADw==',
  iq1s: 'AAACAAUACAAKABEAFQAgACIAKAAqAEUAUQBUAFYAZQCAAIIAiACKAJUAoACiAKgAqgAEAQUBEQEUARYBGQEaASUBQQFGAUkBUgFVAVoBYQFkAWYBaAGFAZEBlAGWAaUBAAICAggCCgIVAiACIgIoAioCRQJRAlkCZAJpAoACggKIAooCkQKVApkCoAKiAqgCqgIRBBQEFgQlBEEESQRVBFoEZARlBJEEmQSlBAEFBAUFBQYFFQUYBRoFKQVABUUFSgVQBVEFVAVVBVYFWQVgBWIFZQVoBWoFgQWRBZUFmAWaBaEFpAWlBaYFqQUUBhkGQQZEBlAGUgZVBlgGYAZhBmYGaQaFBpEGlAaZBgAIAggICAoIFQggCCIIKAgqCEUIUQhWCGUIgAiCCIgIigiVCKAIogioCKoIBQkRCRQJGQkkCSUJQQlQCVEJVQlhCWQJaQmRCZQJlgmZCaUJAAoCCggKCgoVCiAKIgooCioKRQpRClkKYQplCoAKggqFCogKigqVCqAKogqoCqoKEBAREBQQGRAkECUQQRBEEFAQVRBYEGEQZBBlEGkQkRCUEJYQoRClEAERBBEGEQkREBESERURGBEhESQRKRFFEUoRUBFREVIRVBFVEVYRWRFgEWURhBGSEZURoRGkERESFBIWEiUSQBJGEkkSUhJVElgSWhJkEmYShRKREpQSlhKlEgEUBhQJFBQUFRQYFBkUIRQmFEEURRRGFEgUShRRFFQUVRRWFFkUYhRlFGgUhBSJFJAUlBSVFJgUmRSaFKEUpBSlFKkUAhUFFQoVERUUFRUVFhUZFSAVIhUlFSgVKhVBFUQVRRVGFVEVUhVUFVUVVhVZFVoVYRVkFWUVZhVpFYAVghWEFYUViBWKFZAVkRWUFZUVlhWZFZoVoBWiFaUVARYEFgUWBhYVFhYWGBYaFiEWJhZAFkIWRBZFFkgWShZRFlUWVhZYFlkWYRZkFmUWaBZpFmoWhhaKFpIWlRakFqkWERgWGCUYQRhEGEYYSRhQGFUYWBhaGGAYYRhkGGYYaRiFGJEYlBilGBAZEhkVGRoZIRklGUIZRBlFGUgZURlUGVUZVhlZGVoZYBllGWoZiRmRGZIZlRmYGaEZphmpGQkaFhokGiYaRBpGGkkaUBpSGlUaWBphGmYaaRqFGpEalhqaGgAgAiAIIAogFSAgICIgJSAoICogRSBRIFkgYSBlIIAggiCIIIoglSCgIKIgpSCoIKogBSERIRQhGSElIUIhRCFJIVUhWCFaIWEhZCFlIWYhhSGQIZYhmSGlIQEiCCIKIhEiFSIgIiIiKCIqIkUiUSJWIlkiZSKBIogiiiKRIpUioCKiIqgiqiIFJBQkFiQZJCUkRCRFJEYkSSRSJFUkWCRaJGYkhSSRJJQkmSShJKUkCSUVJSElKSVAJUUlSCVRJVQlVSVZJWIlZSVoJYklkCWUJZUlmCWaJaElpCWmJaklBSYQJhImGSYlJkEmSSZVJmAmYSZpJoQmhiaQJpomACgCKAgoCigVKCAoIigoKCooRShRKFQoZSiAKIIoiCiKKKAooiioKKooCSkRKRQpGSklKUYpSSlSKVUpYSlkKWYpaSmFKZAplimZKaQppSkAKgIqCCoKKiAqIiooKioqRSpRKlYqWSplKoAqgiqIKooqlSqgKqIqqCqqKgVAEUAWQCVASUBSQFVAWEBaQGFAZEBmQJRAmUChQKZAAEEBQQRBBkEJQRJBFUEWQRhBGkEhQSZBKUFFQUhBSkFRQVRBVUFWQVlBWkFlQWhBakGBQYRBhkGQQZJBlUGgQaFBokEFQhFCFEIWQiVCQUJSQlVCWkJkQmlCiUKUQqVCAUQVRBlEKURFREhESkRRRFREVURWRGFEYkRlRGhEakSBRIZEiUSQRJJElUSgRKFEqUQBRQJFBUUKRRFFFEUVRRZFGUUgRSVFKkVBRURFRUVGRUlFUEVRRVRFVUVWRVhFWUVhRWRFZUVmRWlFgkWERYVFiEWRRZRFlUWWRZlFmkWlRahFqkUBRgVGCUYURhVGGEYaRiFGJEYpRkBGQkZFRkhGUEZRRlJGVUZWRllGYkZlRmhGgUaFRopGlEaVRqFGpEamRgVIEUgVSBpIJUhCSElIUEhVSFhIYUhkSGZIaUiFSJFIlEiWSJlIpUgBSQVJBkkKSRBJFEkVSRhJIUkkSSZJQElFSUpJUUlSSVRJVUlWSVlJYEliSWVJZklqSYZJiUmSSZVJlkmYSaFJpEmmSalJFkpESkZKSUpVSlhKWkpkSmlKlEqlSgFQBFAFUAZQCVASUBVQGlAhUCRQKVBAUEVQSFBRUFRQVVBWUFlQZVBoUIZQiVCVUJhQoFChUKZQqVAFUQhRCVEKURFRFFEVURZRGFEZUSBRJVEmUShRKlFBUURRRVFGUUlRUFFRUVJRVFFVUVZRWFFZUVpRYVFkUWVRZlFpUYJRhVGRUZRRlVGWUZlRoFGlUapRAVIGUhJSFVIaUiFSJFJCUkVSSlJRUlRSVVJWUllSYlJlUoVSkFKSUpVSmVKaUqRSBFQFVBFUFFQVVBZUGFQZVCFUJVQoVCpUQVREVEVURlRJVEpUUFRRVFRUVVRWVFhUWVRaVGFUYlRkVGVUZlRpVIBUiFSKVJFUlFSVVJZUmVShVKRUpVSqVAFVAlUEVQVVBlUJVRBVEVUSVRRVFVUWVRlVGlUhVSRVJVUmVSlVQFVBVUJVRFVFVUZVSFVJVVBVUVVSVVRVVVVWVVhVWVVaVWBVYVVkVWVVZlVoVWlValWBVYRVhVWJVYpVkFWRVZRVlVWWVZhVmVWhVaRVpVWmValVAFYBVgJWBFYGVghWCVYRVhRWFVYYVhlWIFYhViJWJFYlViZWKFYpVkFWRVZGVkhWSVZKVlBWUVZSVlRWVVZWVlhWWVZaVmFWZFZlVmlWglaFVoZWiFaJVopWkVaVVppWolalVqZWqFapVgRYBVgGWAlYEFgVWBhYIVgqWEVYSFhKWFFYVFhVWFZYWFhZWGBYYlhkWGVYgliJWJBYkliVWJhYoVipWAFZAlkFWQpZEVkUWRVZFlkZWSVZQVlEWUVZRllJWVBZUVlSWVRZVVlWWVhZWVlaWWFZZFllWWZZaVmBWYVZiVmRWZRZlVmWWZhZmVmlWQRaCFoVWhpaIFolWiZaKVpFWkhaSVpRWlVaVlpYWllaYlplWmhaalqBWopaklqVWpZamFqaWqFaBWAUYBZgGWAlYERgUGBVYFZgWGBaYGFgZGBmYGlggWCWYKVgAWEEYQZhCWESYRVhIWEiYSZhKWFFYUlhUWFVYVZhWWFlYWZhamGEYYphkmGVYaFhpmGpYRFiFmIZYkBiQWJGYlViVmJYYmBihWKRYpZipWIRZBJkFWQWZBpkIWQmZClkQGRCZEVkSGRKZFFkVGRVZFZkWWRaZGBkYmRlZIRkhWSJZJBkkmSUZJVklmSYZJpkoWSkZKlkBWUIZQplEWUVZRZlGWVEZUVlRmVJZVBlUWVUZVVlVmVZZWFlZGVlZWZlaWWGZYllimWRZZVllmWZZZplomWlZaZlqGUCZglmFWYgZiZmKGYpZkBmRWZIZkpmUWZUZlVmVmZYZlpmYGZlZmhmgGaCZoVmimaUZpZmmGaZZqBmpGamZqpmFmgZaCVoQWhSaFVoWmhhaGlohWiRaJhopmgBaQRpEGkVaSFpJGkmaSlpQGlBaUVpRmlIaVFpVGlVaVZpWWlgaWVpammCaYRpimmVaaFppGmlaalpEWoWahhqQWpEaklqUGpValhqWmpkamVqaWqGapRqmGqaaqZqAIACgAiACoAggCKAKIAqgEWAUIBRgFSAVoBZgGWAgICCgIiAioCVgKCAooCogKqABYERgRSBFoEZgSWBQYFEgUmBUIFSgVWBVoFYgVmBZIFmgWmBhYGJgZSBloGZgaWBAIICggiCCoIVgiCCIoIogiqCUYJUglmCZYKAgoKCiIKKgpWCoIKigqiCqoIUhBmEQYREhFGEVYRahGGEZIRphJSEmYQBhQmFEoUVhRqFJoUphUCFQYVFhUiFUYVUhVWFVoVZhVqFZYVmhWiFaoWBhYSFhoWJhZCFkoWVhZiFpoURhhaGGYYlhkGGRIZJhkqGUIZVhlmGWoZhhmaGaoaFhpGGmoakhgCIAogIiAqIFYggiCKIKIgqiEGIRYhRiFSIWYhliGmIgIiCiIiIioiViKCIooioiKqIBYkGiRGJFIkWiSWJQYlEiUaJSYlQiVKJVYlaiWGJZImFiZaJmYmliQCKAooIigqKFYogiiKKKIoqikWKUYpUilaKgIqCioiKioqViqCKooqoiqqKBZARkBaQGJAZkCWQQZBGkEmQVZBYkFqQaZBqkIWQkZCUkJaQmZClkAGRBJEGkQmREJEVkRiRGpEhkSSRJpEpkUCRRZFQkVGRVJFVkVaRWZFikWWRhJGGkZKRlZGYkaGRpJGmkamRBZIRkhSSGZIlkkSSRpJJklCSUpJVkliSZpJpkoWSlJKWkqmSAZQElAaUEJQVlBiUJpRAlEqUUZRUlFWUVpRYlFmUYJRhlGKUZZSElIaUkpSUlJWUmJShlKmUAJUFlQiVCpUQlRGVFJUVlRaVGZUhlSWVKZUqlUGVRJVFlUaVSZVQlVGVUpVUlVWVVpVYlVmVWpVhlWSVZZVmlWmVgZWFlYiVkZWSlZSVlZWWlZmVmpWglaKVpZWolaqVAZYElhCWFZYZliCWJpYplkWWSJZJllGWUpZVllaWWZZllmiWgpaElomWipaSlpSWlZaklqaWqZYFmBaYGZglmEGYRphQmFKYVZhWmFqYZJhlmIWYkZiWmJmYpZgEmQaZCZkQmRKZFZkYmRqZIJkhmSSZJplAmUKZRZlImUqZUZlUmVWZVplZmWKZZZlmmWqZgZmEmZCZkpmVmZqZoZmmmQWaFZolmkSaRppJmlCaVZpYmmGahZqRmpSalZqWmgCgAqAIoAqgFaAgoCKgKKAqoEWgUaBUoFagWaCAoIKgiKCKoJWgoKCioKigqqAFoQmhEaEUoRahGaEaoUahSaFRoVWhWKFaoWGhZKGFoZChkqGWoZmhAqIIogqiEKIZoiKiKKIqokWiUaJWolmiZaKAooKiiKKKopWioKKioqiiqqIZpCWkQaREpFCkVKRVpFikWqRhpGWkZqRopGmkhaQGpQmlEKUSpRWlGKUmpSmlQqVFpVGlVKVVpValWaVlpWqlgaWEpYWlhqWJpZKllaWYpQWmEaYWphqmIaYlpkSmRqZKplKmVaZWplimYKZipoamkKaVppammaahpqSmpqYAqAKoCKgKqCCoIqgoqCqoUahUqFaoWaiAqIKoiKiKqJWooKiiqKioqqgFqRSpGakhqSWpQalQqVWpWqlhqWapaamQqZapAKoCqgiqCqogqiKqKKoqqlGqVKpWqoCqgqqIqoqqlaqgqqKqqKqqqg==',
};
// END GENERATED GRIDS

// Offsets (in u32) of each codebook in gridData().
export const GRID_OFF = { iq2xxs: 0, iq2xs: 512, iq2s: 1536, iq3xxs: 3584, iq3s: 3840, iq1s: 4352, kv4: 8448 };
const GRID_WORDS = 8464;

const b64 = (s) => (typeof atob === 'function' ? Uint8Array.from(atob(s), (c) => c.charCodeAt(0)) : new Uint8Array(Buffer.from(s, 'base64')));
const codes = (s) => { const u8 = b64(s); return new Uint16Array(u8.buffer, u8.byteOffset, u8.byteLength / 2); };

// The full codebooks, unpacked: 8-byte grids as two u32 (bytes 0–3, 4–7), 4-byte grids as one u32,
// kvalues_iq4nl as i32.
export function gridData() {
  const out = new Uint32Array(GRID_WORDS);
  const put8 = (off, packed, set) => codes(packed).forEach((c, e) => {
    let lo = 0, hi = 0;
    for (let j = 0; j < 8; j++) { const b = set[(c >> (2 * j)) & 3]; if (j < 4) lo |= b << (8 * j); else hi |= b << (8 * (j - 4)); }
    out[off + 2 * e] = lo >>> 0; out[off + 2 * e + 1] = hi >>> 0;
  });
  const put4 = (off, packed, set) => codes(packed).forEach((c, e) => {
    let w = 0;
    for (let j = 0; j < 4; j++) w |= set[(c >> (3 * j)) & 7] << (8 * j);
    out[off + e] = w >>> 0;
  });
  const IQ2 = [0x08, 0x19, 0x2b], IQ1 = [0xff, 0x00, 0x01];
  put8(GRID_OFF.iq2xxs, GRIDS.iq2xxs, IQ2);
  put8(GRID_OFF.iq2xs, GRIDS.iq2xs, IQ2);
  put8(GRID_OFF.iq2s, GRIDS.iq2s, IQ2);
  put4(GRID_OFF.iq3xxs, GRIDS.iq3xxs, [0x04, 0x0c, 0x14, 0x1c, 0x24, 0x2c, 0x34, 0x3e]);
  put4(GRID_OFF.iq3s, GRIDS.iq3s, [0x01, 0x03, 0x05, 0x07, 0x09, 0x0b, 0x0d, 0x0f]);
  put8(GRID_OFF.iq1s, GRIDS.iq1s, IQ1);
  KVALUES_IQ4NL.forEach((v, i) => { out[GRID_OFF.kv4 + i] = v >>> 0; });
  return out;
}

// ── GPU block layout ─────────────────────────────────────────────────────────
// Seven types have a block of 4k+2 bytes that starts with its f16 scale d. On the GPU those blocks get two zero
// bytes after d (repackKernel, run once at upload), so every array inside every block starts on a 4-byte boundary
// and the dequant reads whole u32 words. The other four types keep the GGUF layout, which is aligned already.
export const PADDED = new Set(['Q8_0', 'IQ2_XXS', 'IQ2_XS', 'IQ2_S', 'IQ3_XXS', 'IQ3_S', 'IQ1_S']);
export const gpuBlock = (type) => QTYPES[type].block + (PADDED.has(type) ? 2 : 0);
export const gpuRowBytes = (type, cols) => (cols / QTYPES[type].qk) * gpuBlock(type);

// The same transform on the CPU, for tests: GGUF block bytes → GPU block bytes.
export function repackBlocks(type, u8) {
  if (!PADDED.has(type)) return u8;
  const b = QTYPES[type].block, n = u8.length / b, out = new Uint8Array(n * (b + 2));
  for (let i = 0; i < n; i++) { out.set(u8.subarray(i * b, i * b + 2), i * (b + 2)); out.set(u8.subarray(i * b + 2, (i + 1) * b), i * (b + 2) + 4); }
  return out;
}
// One thread per output word: words of nBlocks padded blocks from the GGUF bytes in src. Dispatch
// ceil(words / 256) (2-D folding allowed).
export function repackKernel(type) {
  if (!PADDED.has(type)) throw new Error(`${type} needs no repack`);
  const b = QTYPES[type].block, wpb = (b + 2) / 4;
  return `
struct P { words: u32 }
@group(0) @binding(0) var<storage, read> src: array<u32>;
@group(0) @binding(1) var<storage, read_write> dst: array<u32>;
@group(0) @binding(2) var<uniform> p: P;
fn h(o: u32) -> u32 { return (src[o >> 2u] >> ((o & 2u) << 3u)) & 0xffffu; }
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  let i = (wg.y * ng.x + wg.x) * 256u + l.x; if (i >= p.words) { return; }
  let blk = i / ${wpb}u; let w = i % ${wpb}u; let sb = blk * ${b}u;
  if (w == 0u) { dst[i] = h(sb); return; }
  let o = sb + 4u * w - 2u;
  dst[i] = h(o) | (h(o + 2u) << 16u);
}`;
}

// ── WGSL ──────────────────────────────────────────────────────────────────────
// B is the byte offset of a GPU block (4-aligned). w(o) reads the aligned word at o; h16/b8 pick a half or a byte.
const HELPERS = `
fn w(o: u32) -> u32 { return wq[o >> 2u]; }
fn b8(o: u32) -> u32 { return (wq[o >> 2u] >> ((o & 3u) << 3u)) & 0xffu; }
fn h16(o: u32) -> u32 { return (wq[o >> 2u] >> ((o & 2u) << 3u)) & 0xffffu; }
fn f16v(o: u32) -> f32 { return unpack2x16float(h16(o)).x; }
fn byt(x: u32, j: u32) -> u32 { return (x >> (j << 3u)) & 0xffu; }
fn ksign(i: u32) -> u32 { return i | ((countOneBits(i) & 1u) << 7u); }
fn sgn(signs: u32, j: u32) -> f32 { return select(1.0, -1.0, (signs & (1u << j)) != 0u); }
const KV4 = array<f32, 16>(${KVALUES_IQ4NL.map((v) => v.toFixed(1)).join(', ')});
`;

const O = GRID_OFF;
// deq8(B, s, g): weights 8g..8g+7 of chunk s (values 32s..32s+31 of the block). ggml-quants.c reference noted per type;
// offsets are the GPU layout's (PADDED types: GGUF offset + 2 after d).
const DEQ8 = {
  // dequantize_row_q8_0: y = qs[j]·d (one 32-value block per chunk, s = 0).
  Q8_0: `
  let d = f16v(B);
  let q0 = vec4<f32>(unpack4xI8(w(B + 4u + 8u * g))); let q1 = vec4<f32>(unpack4xI8(w(B + 8u + 8u * g)));
  v[0] = d * q0.x; v[1] = d * q0.y; v[2] = d * q0.z; v[3] = d * q0.w;
  v[4] = d * q1.x; v[5] = d * q1.y; v[6] = d * q1.z; v[7] = d * q1.w;`,
  // dequantize_row_q2_K: 256 values = 2 halves × 4 shifts × (16 + 16); each 16 has its own 4-bit scale and min.
  Q2_K: `
  let dm = w(B + 80u); let d = unpack2x16float(dm).x; let dmin = unpack2x16float(dm).y;
  let h = s >> 2u; let sh = 2u * (s & 3u);
  let sc = b8(B + 8u * h + 2u * (s & 3u) + (g >> 1u));
  let dl = d * f32(sc & 15u); let ml = dmin * f32(sc >> 4u);
  let qa = w(B + 16u + 32u * h + 8u * g); let qc = w(B + 20u + 32u * h + 8u * g);
  for (var j = 0u; j < 4u; j++) { v[j] = dl * f32((byt(qa, j) >> sh) & 3u) - ml; v[j + 4u] = dl * f32((byt(qc, j) >> sh) & 3u) - ml; }`,
  // dequantize_row_q4_K: 4 × 64 values, low nibbles then high nibbles of 32 bytes; 6-bit scale/min pairs.
  Q4_K: `
  let dm = w(B); let d = unpack2x16float(dm).x; let dmin = unpack2x16float(dm).y;
  var sc = 0u; var mn = 0u;
  if (s < 4u) { sc = b8(B + 4u + s) & 63u; mn = b8(B + 8u + s) & 63u; }
  else { sc = (b8(B + 8u + s) & 15u) | ((b8(B + s) >> 6u) << 4u); mn = (b8(B + 8u + s) >> 4u) | ((b8(B + 4u + s) >> 6u) << 4u); }
  let dl = d * f32(sc); let ml = dmin * f32(mn);
  let qb = B + 16u + 32u * (s >> 1u) + 8u * g; let hi = (s & 1u) * 4u;
  let qa = w(qb) >> hi; let qc = w(qb + 4u) >> hi;
  for (var j = 0u; j < 4u; j++) { v[j] = dl * f32(byt(qa, j) & 15u) - ml; v[j + 4u] = dl * f32(byt(qc, j) & 15u) - ml; }`,
  // dequantize_row_iq2_xxs: per chunk two u32: 4 grid indices, then 4×7 sign bits + a 4-bit scale.
  IQ2_XXS: `
  let d = f16v(B);
  let a0 = w(B + 4u + 8u * s); let a1 = w(B + 8u + 8u * s);
  let db = d * (0.5 + f32(a1 >> 28u)) * 0.25;
  let e = byt(a0, g); let signs = ksign((a1 >> (7u * g)) & 127u);
  let lo = grid[${O.iq2xxs}u + 2u * e]; let hi = grid[${O.iq2xxs}u + 2u * e + 1u];
  for (var j = 0u; j < 4u; j++) { v[j] = db * f32(byt(lo, j)) * sgn(signs, j); v[j + 4u] = db * f32(byt(hi, j)) * sgn(signs, j + 4u); }`,
  // dequantize_row_iq2_xs: u16 per 8 values (9-bit grid index, 7 sign bits); two 4-bit scales per chunk.
  IQ2_XS: `
  let d = f16v(B);
  let sc = b8(B + 68u + s);
  let db = d * (0.5 + f32(select(sc >> 4u, sc & 15u, g < 2u))) * 0.25;
  let q = h16(B + 4u + 2u * (4u * s + g));
  let e = q & 511u; let signs = ksign(q >> 9u);
  let lo = grid[${O.iq2xs}u + 2u * e]; let hi = grid[${O.iq2xs}u + 2u * e + 1u];
  for (var j = 0u; j < 4u; j++) { v[j] = db * f32(byt(lo, j)) * sgn(signs, j); v[j + 4u] = db * f32(byt(hi, j)) * sgn(signs, j + 4u); }`,
  // dequantize_row_iq2_s: 10-bit grid index (qs | 2 bits of qh), explicit sign bytes after the 32 index bytes.
  IQ2_S: `
  let d = f16v(B);
  let sc = b8(B + 76u + s);
  let db = d * (0.5 + f32(select(sc >> 4u, sc & 15u, g < 2u))) * 0.25;
  let e = b8(B + 4u + 4u * s + g) | ((b8(B + 68u + s) << (8u - 2u * g)) & 0x300u);
  let signs = b8(B + 36u + 4u * s + g);
  let lo = grid[${O.iq2s}u + 2u * e]; let hi = grid[${O.iq2s}u + 2u * e + 1u];
  for (var j = 0u; j < 4u; j++) { v[j] = db * f32(byt(lo, j)) * sgn(signs, j); v[j + 4u] = db * f32(byt(hi, j)) * sgn(signs, j + 4u); }`,
  // dequantize_row_iq3_xxs: two 4-value grid entries per 8 values; a u32 of 4×7 sign bits + a 4-bit scale per chunk.
  IQ3_XXS: `
  let d = f16v(B);
  let aux = w(B + 68u + 4u * s);
  let db = d * (0.5 + f32(aux >> 28u)) * 0.5;
  let signs = ksign((aux >> (7u * g)) & 127u);
  let ee = h16(B + 4u + 8u * s + 2u * g);
  let g1 = grid[${O.iq3xxs}u + (ee & 255u)]; let g2 = grid[${O.iq3xxs}u + (ee >> 8u)];
  for (var j = 0u; j < 4u; j++) { v[j] = db * f32(byt(g1, j)) * sgn(signs, j); v[j + 4u] = db * f32(byt(g2, j)) * sgn(signs, j + 4u); }`,
  // dequantize_row_iq3_s: 9-bit grid indices (qs | a bit of qh), sign bytes, a 4-bit scale per chunk (two per byte).
  IQ3_S: `
  let d = f16v(B);
  let sc = b8(B + 108u + (s >> 1u));
  let db = d * f32(1u + 2u * ((sc >> (4u * (s & 1u))) & 15u));
  let qh = b8(B + 68u + s);
  let ee = h16(B + 4u + 8u * s + 2u * g);
  let e1 = (ee & 255u) | ((qh << (8u - 2u * g)) & 256u);
  let e2 = (ee >> 8u) | ((qh << (7u - 2u * g)) & 256u);
  let signs = b8(B + 76u + 4u * s + g);
  let g1 = grid[${O.iq3s}u + e1]; let g2 = grid[${O.iq3s}u + e2];
  for (var j = 0u; j < 4u; j++) { v[j] = db * f32(byt(g1, j)) * sgn(signs, j); v[j + 4u] = db * f32(byt(g2, j)) * sgn(signs, j + 4u); }`,
  // dequantize_row_iq1_s: 11-bit grid index (qs | 3 bits of qh) of int8 {-1, 0, 1}; per-chunk 3-bit scale and ±delta.
  IQ1_S: `
  let d = f16v(B);
  let qh = h16(B + 36u + 2u * s);
  let dl = d * f32(2u * ((qh >> 12u) & 7u) + 1u);
  let delta = select(0.125, -0.125, (qh & 0x8000u) != 0u);
  let e = b8(B + 4u + 4u * s + g) | (((qh >> (3u * g)) & 7u) << 8u);
  let lo = vec4<f32>(unpack4xI8(grid[${O.iq1s}u + 2u * e])); let hi = vec4<f32>(unpack4xI8(grid[${O.iq1s}u + 2u * e + 1u]));
  v[0] = dl * (lo.x + delta); v[1] = dl * (lo.y + delta); v[2] = dl * (lo.z + delta); v[3] = dl * (lo.w + delta);
  v[4] = dl * (hi.x + delta); v[5] = dl * (hi.y + delta); v[6] = dl * (hi.z + delta); v[7] = dl * (hi.w + delta);`,
  // dequantize_row_iq1_m: the f16 scale is spread over the top nibbles of 4 u16 scale words; 3-bit scales per
  // 16 values; qh holds 3 index bits + a delta sign per 8 values.
  IQ1_M: `
  let s01 = w(B + 48u); let s23 = w(B + 52u);
  let d = unpack2x16float(((s01 & 0xffffu) >> 12u) | ((s01 >> 24u) & 0xf0u) | (((s23 & 0xffffu) >> 4u) & 0xf00u) | ((s23 >> 16u) & 0xf000u)).x;
  let scw = select(s23, s01, s < 4u) >> (16u * ((s >> 1u) & 1u));
  let dl = d * f32(2u * ((scw >> (6u * (s & 1u) + 3u * (g >> 1u))) & 7u) + 1u);
  let qh = b8(B + 32u + 2u * s + (g >> 1u));
  let odd = (g & 1u) == 1u;
  let e = b8(B + 4u * s + g) | select((qh << 8u) & 0x700u, (qh << 4u) & 0x700u, odd);
  let delta = select(0.125, -0.125, (qh & select(0x08u, 0x80u, odd)) != 0u);
  let lo = vec4<f32>(unpack4xI8(grid[${O.iq1s}u + 2u * e])); let hi = vec4<f32>(unpack4xI8(grid[${O.iq1s}u + 2u * e + 1u]));
  v[0] = dl * (lo.x + delta); v[1] = dl * (lo.y + delta); v[2] = dl * (lo.z + delta); v[3] = dl * (lo.w + delta);
  v[4] = dl * (hi.x + delta); v[5] = dl * (hi.y + delta); v[6] = dl * (hi.z + delta); v[7] = dl * (hi.w + delta);`,
  // dequantize_row_iq4_xs: 6-bit scale per chunk (4 low bits in scales_l, 2 high in scales_h); non-linear 4-bit values.
  IQ4_XS: `
  let dh = w(B); let d = unpack2x16float(dh).x;
  let ls = ((b8(B + 4u + (s >> 1u)) >> (4u * (s & 1u))) & 15u) | ((((dh >> 16u) >> (2u * s)) & 3u) << 4u);
  let dl = d * f32(i32(ls) - 32);
  let hi = (g >> 1u) * 4u; let qb = B + 8u + 16u * s + 8u * (g & 1u);
  let qa = w(qb) >> hi; let qc = w(qb + 4u) >> hi;
  for (var j = 0u; j < 4u; j++) { v[j] = dl * KV4[byt(qa, j) & 15u]; v[j + 4u] = dl * KV4[byt(qc, j) & 15u]; }`,
};

function deqFn(type) {
  const body = DEQ8[type];
  if (!body) throw new Error(`no deq8 for ${type}`);
  return `${HELPERS}
fn deq8(B: u32, s: u32, g: u32) -> array<f32, 8> {
  var v: array<f32, 8>;${body}
  return v;
}`;
}
const CPB = (type) => QTYPES[type].qk / 32;   // 32-value chunks per block

// Matrix × vector. A 64-thread workgroup computes MV_ROWS rows: thread t takes chunks t, t+64, …, loads that
// chunk's 32 activations into registers once and dots them with the chunk of every row, so x is read once per
// workgroup instead of once per row. Dispatch ceil(M / MV_ROWS) workgroups (dispatch() folds x > 65535 into y).
export const MV_ROWS = 16;
export function mvKernel(type) {
  return `
struct P { M: u32, N: u32, rowBytes: u32, pad: u32 }
@group(0) @binding(0) var<storage, read> x: array<vec4<f32>>;
@group(0) @binding(1) var<storage, read> wq: array<u32>;
@group(0) @binding(2) var<storage, read> grid: array<u32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
${deqFn(type)}
const R = ${MV_ROWS}u;
var<workgroup> red: array<f32, ${MV_ROWS * 64}>;
@compute @workgroup_size(64) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(num_workgroups) ng: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  _ = grid[0];
  let m0 = (wg.y * ng.x + wg.x) * R; let t = l.x; let nc = p.N / 32u;
  var acc: array<f32, ${MV_ROWS}>;
  for (var c = t; c < nc; c += 64u) {
    var xv: array<vec4<f32>, 8>;
    for (var i = 0u; i < 8u; i++) { xv[i] = x[c * 8u + i]; }
    let bo = (c / ${CPB(type)}u) * ${gpuBlock(type)}u; let s = c % ${CPB(type)}u;
    for (var r = 0u; r < R; r++) {
      let B = min(m0 + r, p.M - 1u) * p.rowBytes + bo;
      var a = 0.0;
      for (var g = 0u; g < 4u; g++) {
        let v = deq8(B, s, g);
        a += dot(vec4<f32>(v[0], v[1], v[2], v[3]), xv[2u * g]) + dot(vec4<f32>(v[4], v[5], v[6], v[7]), xv[2u * g + 1u]);
      }
      acc[r] += a;
    }
  }
  for (var r = 0u; r < R; r++) { red[r * 64u + t] = acc[r]; }
  workgroupBarrier();
  for (var st = 32u; st > 0u; st >>= 1u) {
    if (t < st) { for (var r = 0u; r < R; r++) { red[r * 64u + t] += red[r * 64u + t + st]; } }
    workgroupBarrier();
  }
  if (t < R && m0 + t < p.M) { y[m0 + t] = red[t * 64u]; }
}`;
}

// Token-major batch: y[t·M + m] = Σ_k x[t·N + k]·W[m][k]. A 256-thread workgroup computes a 64-row × 64-token tile.
// Per 32-wide k chunk every thread dequantizes 8 weights (64 rows × 4 groups) and loads 8 activations into shared
// memory (k-major f32 tiles, 16 KB in all), then accumulates a 4-row × 4-token block: each weight read from
// memory serves 64 tokens. Dispatch (ceil(M / MM_TILE), ceil(T / MM_TILE)).
export const MM_TILE = 64;
export function mmKernel(type) {
  return `
struct P { M: u32, N: u32, rowBytes: u32, pad: u32 }
struct Q { T: u32, pos0: u32, S: u32, pad: u32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> wq: array<u32>;
@group(0) @binding(2) var<storage, read> grid: array<u32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@group(0) @binding(5) var<uniform> qd: Q;
${deqFn(type)}
var<workgroup> ws: array<f32, 2048>;   // [k][row]: 32 × 64 (each thread writes whole f32s; no shared vec4 lanes)
var<workgroup> xs: array<f32, 2048>;   // [k][token]
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  _ = grid[0];
  let m0 = wg.x * 64u; let t0 = wg.y * 64u; let i = l.x;
  let lr = i >> 2u; let lg = i & 3u;           // loader: row / token lr, 8-value group lg
  let rr = (i >> 4u) * 4u; let tc = (i & 15u) * 4u;   // compute: rows rr..rr+3, tokens tc..tc+3
  let wrow = min(m0 + lr, p.M - 1u) * p.rowBytes;
  let xt = t0 + lr; let xok = xt < qd.T;
  let nc = p.N / 32u;
  var acc: array<vec4<f32>, 4>;
  for (var c = 0u; c < nc; c++) {
    let v = deq8(wrow + (c / ${CPB(type)}u) * ${gpuBlock(type)}u, c % ${CPB(type)}u, lg);
    let xb = min(xt, qd.T - 1u) * p.N + c * 32u + lg * 8u;
    for (var j = 0u; j < 8u; j++) {
      let k = lg * 8u + j;
      ws[k * 64u + lr] = v[j];
      xs[k * 64u + lr] = select(0.0, x[xb + j], xok);
    }
    workgroupBarrier();
    for (var k = 0u; k < 32u; k++) {
      let wb = k * 64u + rr; let xb4 = k * 64u + tc;
      let a = vec4<f32>(ws[wb], ws[wb + 1u], ws[wb + 2u], ws[wb + 3u]);
      let b = vec4<f32>(xs[xb4], xs[xb4 + 1u], xs[xb4 + 2u], xs[xb4 + 3u]);
      acc[0] += a.x * b; acc[1] += a.y * b; acc[2] += a.z * b; acc[3] += a.w * b;
    }
    workgroupBarrier();
  }
  for (var a = 0u; a < 4u; a++) {
    let m = m0 + rr + a; if (m >= p.M) { continue; }
    for (var b = 0u; b < 4u; b++) { let t = t0 + tc + b; if (t < qd.T) { y[t * p.M + m] = acc[a][b]; } }
  }
}`;
}

// The same GEMM on subgroup matrices (chromium-experimental-subgroup-matrix; Apple's 8×8 simdgroup units): weights and
// activations go through shared memory as f16, products accumulate in f32 — llama.cpp Metal's mul_mm recipe. A
// workgroup computes 64 rows × MM_SG_TOKENS tokens. The 256 threads are 8 subgroups of 32; subgroup s owns rows
// 16·(s/2)..+15 and tokens (MM_SG_TOKENS/2)·(s%2).. as 2 × (MM_SG_TOKENS/16) accumulators
// of 8 × 8. Results store straight into token-major y; 8-row blocks past M and 8-token blocks past T are skipped
// (rows T..ceil8(T)-1 of a stored block may receive values: callers size y for whole 8-token blocks and read only
// t < T). Needs M % 8 == 0 and subgroups of exactly 32. Dispatch (ceil(M / 64), ceil(T / MM_SG_TOKENS)).
export const MM_SG_TOKENS = 64;   // 128 measured slower on an M4 Pro (3.7 vs 2.8 s per 256-token chunk): register pressure
export function mmSgKernel(type) {
  const TB = MM_SG_TOKENS / 16;   // 8-token blocks per subgroup
  const R = (n) => Array.from({ length: n }, (_, i) => i);
  const acc = R(2).flatMap((a) => R(TB).map((b) => `c${a}_${b}`));
  return `enable f16;
enable subgroups;
enable chromium_experimental_subgroup_matrix;
diagnostic(off, chromium.subgroup_matrix_uniformity);
struct P { M: u32, N: u32, rowBytes: u32, pad: u32 }
struct Q { T: u32, pos0: u32, S: u32, pad: u32 }
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> wq: array<u32>;
@group(0) @binding(2) var<storage, read> grid: array<u32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@group(0) @binding(5) var<uniform> qd: Q;
${deqFn(type)}
var<workgroup> ws: array<f16, 2048>;                    // [row][k], 64 × 32
var<workgroup> xs: array<f16, ${MM_SG_TOKENS * 32}>;    // [token][k], ${MM_SG_TOKENS} × 32
@compute @workgroup_size(256) fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>) {
  _ = grid[0];
  let m0 = wg.x * 64u; let t0 = wg.y * ${MM_SG_TOKENS}u; let i = l.x;
  let lr = i >> 2u; let lg = i & 3u;
  let sg = i >> 5u; let rb = (sg >> 1u) * 16u; let tb = (sg & 1u) * ${MM_SG_TOKENS / 2}u;
  let wrow = min(m0 + lr, p.M - 1u) * p.rowBytes;
  let nc = p.N / 32u;
${acc.map((v) => `  var ${v}: subgroup_matrix_result<f32, 8, 8>;`).join('\n')}
  for (var c = 0u; c < nc; c++) {
    let v = deq8(wrow + (c / ${CPB(type)}u) * ${gpuBlock(type)}u, c % ${CPB(type)}u, lg);
    for (var j = 0u; j < 8u; j++) { ws[lr * 32u + lg * 8u + j] = f16(v[j]); }
    for (var e = i; e < ${MM_SG_TOKENS * 32}u; e += 256u) {
      let t = t0 + (e >> 5u);
      xs[e] = select(f16(0.0), f16(x[min(t, qd.T - 1u) * p.N + c * 32u + (e & 31u)]), t < qd.T);
    }
    workgroupBarrier();
    for (var k = 0u; k < 32u; k += 8u) {
      let a0 = subgroupMatrixLoad<subgroup_matrix_left<f16, 8, 8>, row_major>(&ws, rb * 32u + k, 32u);
      let a1 = subgroupMatrixLoad<subgroup_matrix_left<f16, 8, 8>, row_major>(&ws, (rb + 8u) * 32u + k, 32u);
${R(TB).map((b) => `      let b${b} = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>, col_major>(&xs, (tb + ${8 * b}u) * 32u + k, 32u);`).join('\n')}
${R(2).flatMap((a) => R(TB).map((b) => `      c${a}_${b} = subgroupMatrixMultiplyAccumulate(a${a}, b${b}, c${a}_${b});`)).join('\n')}
    }
    workgroupBarrier();
  }
  let tA = t0 + tb;
${R(2).map((a) => `  if (m0 + rb + ${8 * a}u < p.M) {
${R(TB).map((b) => `    if (tA + ${8 * b}u < qd.T) { subgroupMatrixStore<col_major>(&y, (tA + ${8 * b}u) * p.M + m0 + rb + ${8 * a}u, c${a}_${b}, p.M); }`).join('\n')}
  }`).join('\n')}
}`;
}

// One token's embedding row: thread i dequantizes values 8i..8i+7. Dispatch ceil(N/8/256).
export function embedKernel(type) {
  return `
struct Tok { token: u32, pos: u32, seqLen: u32, pad: u32 }
struct P { N: u32, rowBytes: u32 }
@group(0) @binding(0) var<storage, read> wq: array<u32>;
@group(0) @binding(1) var<storage, read> grid: array<u32>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@group(0) @binding(3) var<uniform> tok: Tok;
@group(0) @binding(4) var<uniform> p: P;
${deqFn(type)}
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) gi: vec3<u32>) {
  _ = grid[0];
  let i = gi.x; if (i * 8u >= p.N) { return; }
  let c = i >> 2u; let g = i & 3u;
  let v = deq8(tok.token * p.rowBytes + (c / ${CPB(type)}u) * ${gpuBlock(type)}u, c % ${CPB(type)}u, g);
  for (var j = 0u; j < 8u; j++) { y[i * 8u + j] = v[j]; }
}`;
}

// T tokens' embedding rows into token-major y. Dispatch (ceil(N/8/256), T).
export function embedBKernel(type) {
  return `
struct P { N: u32, rowBytes: u32 }
struct Q { T: u32, pos0: u32, S: u32, pad: u32 }
@group(0) @binding(0) var<storage, read> wq: array<u32>;
@group(0) @binding(1) var<storage, read> grid: array<u32>;
@group(0) @binding(2) var<storage, read> ids: array<u32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@group(0) @binding(4) var<uniform> p: P;
@group(0) @binding(5) var<uniform> qd: Q;
${deqFn(type)}
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) gi: vec3<u32>) {
  _ = grid[0];
  let i = gi.x; let t = gi.y; if (i * 8u >= p.N || t >= qd.T) { return; }
  let c = i >> 2u; let g = i & 3u;
  let v = deq8(ids[t] * p.rowBytes + (c / ${CPB(type)}u) * ${gpuBlock(type)}u, c % ${CPB(type)}u, g);
  for (var j = 0u; j < 8u; j++) { y[t * p.N + i * 8u + j] = v[j]; }
}`;
}
