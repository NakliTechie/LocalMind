// Long gate prompts for Gemma 4 engines: past the 1,024-token sliding window of 25 of 26B-A4B's 30 layers, so
// the windowed attention (decode and chunked prefill) is compared with llama.cpp. Raw text, <bos> written out.
const PARAS = [
  'Lighthouses were once tended by keepers who trimmed wicks, wound clockwork and logged every passing ship. The work was lonely and exact: a lamp that went dark for an hour could put a vessel on the rocks. Over the twentieth century, electric lamps, automatic changers and radio beacons replaced most of the keepers, and many towers became museums or private homes.',
  'Sourdough bread rises without packaged yeast. A starter of flour and water collects wild yeasts and lactic acid bacteria from the air and the grain; fed regularly, it becomes a stable culture. The bacteria give the bread its sour taste, and the long fermentation changes the texture of the crumb and the colour of the crust.',
  'The Silk Road was never a single road. It was a shifting web of caravan routes, river crossings and sea lanes linking China, Central Asia, Persia and the Mediterranean. Silk travelled west, but so did paper, gunpowder and printing, while glass, horses and new religions moved east. Most merchants covered only one stretch and traded goods onward.',
  'Honeybees communicate the direction and distance of food with a waggle dance. On the vertical comb, the angle of the dance relative to straight up matches the angle of the food source relative to the sun, and the length of the waggle run encodes the distance. Other foragers follow the dancer and then fly out to search.',
  'Glaciers move because ice under its own weight deforms like a very slow liquid, and because meltwater at the base lets the ice slide over bedrock. As they flow, glaciers carve valleys into a U shape, carry boulders far from their source and leave ridges of debris called moraines when they retreat.',
  'Early computers filled rooms and used vacuum tubes that burned out often. The transistor, invented in 1947, was smaller, cooler and more reliable, and integrated circuits later put thousands and then billions of transistors on a single chip. Each step cut the cost of computation and widened who could use it.',
];
const TEXT = [...PARAS, ...PARAS, ...PARAS].join('\n\n');
export const PROMPTS = [
  { name: 'long-chat', text: `<bos><|turn>user\n${TEXT}\n\nWhich two topics in the passage involve insects or animals, and what does each say about them? Answer briefly.<turn|>\n<|turn>model\n<|channel>thought\n<channel|>` },
  { name: 'long-raw', text: `<bos>${TEXT}\n\nTo summarise the passage above in one sentence:` },
];
