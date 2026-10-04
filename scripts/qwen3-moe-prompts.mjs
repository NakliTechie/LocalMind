// The fixed prompt set for the qwen3_moe_ssd greedy-match gate (rung 2a). Raw text with the
// Qwen3 chat markup written out, so llama.cpp and the engine see the same token ids.
const chat = (user, { system = null, think = true } = {}) =>
  (system ? `<|im_start|>system\n${system}<|im_end|>\n` : '') +
  `<|im_start|>user\n${user}<|im_end|>\n<|im_start|>assistant\n` + (think ? '' : '<think>\n\n</think>\n\n');

export const PROMPTS = [
  { name: 'capital', text: 'The capital of France is' },
  { name: 'arith-chat', text: chat('What is 17 multiplied by 23? Answer with the number only.', { think: false }) },
  { name: 'code', text: 'def fibonacci(n):\n    """Return the n-th Fibonacci number."""\n' },
  { name: 'haiku-chat', text: chat('Write a haiku about the sea.', { think: false }) },
  { name: 'science', text: 'Photosynthesis is the process by which' },
  { name: 'french', text: 'Le chat est assis sur' },
  { name: 'system-chat', text: chat('Name three primary colors.', { system: 'You are a terse assistant.', think: false }) },
  { name: 'think-chat', text: chat('Is 91 a prime number?') },
];
