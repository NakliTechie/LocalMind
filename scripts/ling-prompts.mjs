// The greedy-match gate prompts for the ling engine (rung 2h: Ling 3.0 Flash from disk). Same eight names as
// flint-prompts.mjs; raw text with the chat template written out (lingChatPrompt in ling_moe_ssd.js: no BOS,
// '<role>SYSTEM</role>…detailed thinking off<|role_end|><role>HUMAN</role>…<|role_end|><role>ASSISTANT</role>\n<think></think>'),
// so llama.cpp and the engine see the same token ids. Thinking off keeps the 32-token continuations on the answer.
const chat = (user, { system = '' } = {}) =>
  `<role>SYSTEM</role>${system ? system + '\n' : ''}detailed thinking off<|role_end|><role>HUMAN</role>${user}<|role_end|><role>ASSISTANT</role>\n<think></think>`;

export const PROMPTS = [
  { name: 'capital', text: 'The capital of France is' },
  { name: 'arith-chat', text: chat('What is 17 multiplied by 23? Answer with the number only.') },
  { name: 'code', text: 'def fibonacci(n):\n    """Return the n-th Fibonacci number."""\n' },
  { name: 'haiku-chat', text: chat('Write a haiku about the sea.') },
  { name: 'science', text: 'Photosynthesis is the process by which' },
  { name: 'code-chat', text: chat('Write a Python function that merges overlapping intervals.', { system: 'You are a coding assistant. Be concise.' }) },
  { name: 'system-chat', text: chat('Name three primary colors.', { system: 'You are a terse assistant.' }) },
  { name: 'numbers', text: 'In 1969, 3 astronauts flew 384400 km to the Moon; 12 people walked on it by 1972.\n\n' },
];
