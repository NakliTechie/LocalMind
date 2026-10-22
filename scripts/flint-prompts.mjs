// The greedy-match gate prompts for the flint engine (rung 2g: Recursive Flint from disk). Same eight names as
// qwen3-moe-prompts.mjs, with a coding turn in place of the memory one; raw text with the chat template's tokens
// written out (flintChatPrompt in flint_moe_ssd.js: no BOS, <|system|>…<|user|>…<|assistant|>), so llama.cpp and the
// engine see the same token ids.
const chat = (user, { system = '' } = {}) => `${system ? `<|system|>${system}` : ''}<|user|>${user}<|assistant|>`;

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
