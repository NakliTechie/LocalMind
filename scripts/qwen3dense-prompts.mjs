// The greedy-match gate prompts for plain dense Qwen3 (Qwen3Dense in qwen35_dense.js; first user Qwen3-4B Q8_0).
// Same eight names as qwen3-moe-prompts.mjs, with a coding turn; raw text with Qwen3's chat template written out
// (thinking off: the generation prompt closes an empty think block), so llama.cpp and the engine see the same ids.
const chat = (user, { system = '' } = {}) =>
  `${system ? `<|im_start|>system\n${system}<|im_end|>\n` : ''}<|im_start|>user\n${user}<|im_end|>\n<|im_start|>assistant\n<think>\n\n</think>\n\n`;

export const PROMPTS = [
  { name: 'capital', text: 'The capital of France is' },
  { name: 'arith-chat', text: chat('What is 17 multiplied by 23? Answer with the number only.') },
  { name: 'code', text: 'def fibonacci(n):\n    """Return the n-th Fibonacci number."""\n' },
  { name: 'haiku-chat', text: chat('Write a haiku about the sea.') },
  { name: 'science', text: 'Photosynthesis is the process by which' },
  { name: 'code-chat', text: chat('Write a Python function that merges overlapping intervals.', { system: 'You are a coding assistant. Be concise.' }) },
  { name: 'system-chat', text: chat('Name three primary colors.', { system: 'You are a terse assistant.' }) },
  { name: 'numbers', text: 'In 1969, 3 astronauts flew 384400 km to the Moon; 12 people walked on it by 1972.' },
];
