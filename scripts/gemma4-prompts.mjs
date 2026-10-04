// The greedy-match gate prompts for Gemma 4 engines (rung 2c: Gemma 4 26B-A4B from disk). Same eight
// names as qwen3-moe-prompts.mjs; raw text with Gemma 4's turn markup and <bos> written out, so llama.cpp
// and the engine see the same token ids. Thinking off unless the prompt name says otherwise.
const chat = (user, { system = null, think = false } = {}) =>
  '<bos>' + (system ? `<|turn>system\n${system}<turn|>\n` : '') +
  `<|turn>user\n${user}<turn|>\n<|turn>model\n` + (think ? '' : '<|channel>thought\n<channel|>');

export const PROMPTS = [
  { name: 'capital', text: '<bos>The capital of France is' },
  { name: 'arith-chat', text: chat('What is 17 multiplied by 23? Answer with the number only.') },
  { name: 'code', text: '<bos>def fibonacci(n):\n    """Return the n-th Fibonacci number."""\n' },
  { name: 'haiku-chat', text: chat('Write a haiku about the sea.') },
  { name: 'science', text: '<bos>Photosynthesis is the process by which' },
  { name: 'french', text: '<bos>Le chat est assis sur' },
  { name: 'system-chat', text: chat('Name three primary colors.', { system: 'You are a terse assistant.' }) },
  { name: 'think-chat', text: chat('Is 91 a prime number?', { think: true }) },
];
