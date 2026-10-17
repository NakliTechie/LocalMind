// The greedy-match gate prompts for the hy_v3 engine (rung 2f: Hy-Memory-30B-A3B from disk). Same eight names as
// qwen3-moe-prompts.mjs; raw text with the chat template's tokens written out (hyChatPrompt in hy_v3_moe_ssd.js:
// thinking off, the template's default no_think), so llama.cpp and the engine see the same token ids.
const BOS = '<｜hy_begin▁of▁sentence｜>';
const chat = (user, { system = '' } = {}) =>
  `${BOS}${system}<｜reasoning_mode｜>reasoning_effort:no_think<｜hy_User｜>${user}<｜hy_Assistant｜><think></think>`;
const MEM = 'Extract explicit user facts and preferences from the conversation. Write each memory as a concise, self-contained statement. Do not infer or invent information. Return only a JSON object with a "memories" list of strings.';

export const PROMPTS = [
  { name: 'capital', text: `${BOS}The capital of France is` },
  { name: 'arith-chat', text: chat('What is 17 multiplied by 23? Answer with the number only.') },
  { name: 'code', text: `${BOS}def fibonacci(n):\n    """Return the n-th Fibonacci number."""\n` },
  { name: 'haiku-chat', text: chat('Write a haiku about the sea.') },
  { name: 'science', text: `${BOS}Photosynthesis is the process by which` },
  { name: 'memory-chat', text: chat("My name is Alex. I live in Seattle and work as a software engineer. I mainly use Python and prefer concise answers with code examples. I'm vegetarian, so please keep that in mind when suggesting meals.", { system: MEM }) },
  { name: 'system-chat', text: chat('Name three primary colors.', { system: 'You are a terse assistant.' }) },
  { name: 'numbers', text: `${BOS}In 1969, 3 astronauts flew 384400 km to the Moon; 12 people walked on it by 1972.` },
];
