// Revalidation prompts for the Qwen MoE engines (2026-10-05): the same 16 tasks as gemma4-prompts-revalidate.mjs in
// Qwen3 chat markup, written after development finished. Thinking off unless the name says otherwise.
const chat = (turns, { system = null, think = false } = {}) =>
  (system ? `<|im_start|>system\n${system}<|im_end|>\n` : '') +
  turns.map(([role, text]) => `<|im_start|>${role}\n${text}<|im_end|>\n`).join('') +
  '<|im_start|>assistant\n' + (think ? '<think>\n' : '<think>\n\n</think>\n\n');
const user = (text, opts) => chat([['user', text]], opts);

export const PROMPTS = [
  { name: 'explain-tcp', text: user('Explain the difference between TCP and UDP to a new programmer.') },
  { name: 'json-extract', text: user('Extract the name, city and age from this sentence as JSON: "Priya, 34, moved from Pune to Lisbon last year."') },
  { name: 'translate-hi', text: user('Translate into Hindi: "The library opens at nine and closes at six."') },
  { name: 'translate-ja', text: user('Translate into Japanese: "Please bring an umbrella tomorrow."') },
  { name: 'word-problem', text: user('A train leaves at 14:10 and arrives at 17:45. How long is the journey? Show the steps briefly.') },
  { name: 'sql', text: user('Write a SQL query that returns the five customers with the highest total order value from tables customers(id, name) and orders(id, customer_id, amount).') },
  { name: 'rust-code', text: '// Rust: return the indices of the two numbers that add up to target.\nfn two_sum(nums: &[i32], target: i32) -> Option<(usize, usize)> {\n' },
  { name: 'story', text: 'The lighthouse keeper found the letter wedged between two stones, and the handwriting was his own.' },
  { name: 'list-rivers', text: user('List five major rivers of Africa, one per line, with the country where each reaches the sea.') },
  { name: 'system-pirate', text: user('What is the boiling point of water at sea level?', { system: 'Answer like a cheerful pirate, in two sentences.' }) },
  { name: 'multi-turn', text: chat([['user', 'My cat is called Miso.'], ['assistant', 'Miso is a lovely name for a cat.'], ['user', 'What did I say my cat is called, and what is miso made from?']]) },
  { name: 'think-logic', text: user('If all bloops are razzies and all razzies are lazzies, are all bloops lazzies? Answer yes or no with one reason.', { think: true }) },
  { name: 'regex', text: user('Give a regular expression that matches a UK postcode like "SW1A 1AA", and explain its parts in one line each.') },
  { name: 'unicode', text: user('What do these emoji usually mean in a text message: 🙏 🔥 💀 ?') },
  { name: 'raw-facts', text: 'The three states of matter that most people learn about in school are' },
  { name: 'haiku-autumn', text: user('Write a haiku about autumn leaves in a city.') },
];
