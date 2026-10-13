// The greedy-match gate prompts for the LFM2-MoE engine (rung 2d: LFM2.5-24B-A2B from disk). Same eight names as
// qwen3-moe-prompts.mjs; raw text with LFM2's ChatML turns and <|startoftext|> written out, so llama.cpp and the
// engine see the same token ids. The model is reasoning-only: chat turns open with <think> as its template does.
const chat = (user, { system = null } = {}) =>
  '<|startoftext|>' + (system ? `<|im_start|>system\n${system}<|im_end|>\n` : '') +
  `<|im_start|>user\n${user}<|im_end|>\n<|im_start|>assistant\n<think>`;

export const PROMPTS = [
  { name: 'capital', text: '<|startoftext|>The capital of France is' },
  { name: 'arith-chat', text: chat('What is 17 multiplied by 23? Answer with the number only.') },
  { name: 'code', text: '<|startoftext|>def fibonacci(n):\n    """Return the n-th Fibonacci number."""\n' },
  { name: 'haiku-chat', text: chat('Write a haiku about the sea.') },
  { name: 'science', text: '<|startoftext|>Photosynthesis is the process by which' },
  { name: 'french', text: '<|startoftext|>Le chat est assis sur' },
  { name: 'system-chat', text: chat('Name three primary colors.', { system: 'You are a terse assistant.' }) },
  { name: 'numbers', text: '<|startoftext|>In 1969, 3 astronauts flew 384400 km to the Moon; 12 people walked on it by 1972.' },
];
