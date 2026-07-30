import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);

export function extractImageWorkerSource(html) {
  const match = html.match(
    /<script type="text\/worker" id="bonsaiEngineSrc">([\s\S]*?)<\/script>/,
  );
  if (!match) throw new Error('LocalMind #bonsaiEngineSrc worker was not found');

  let source = match[1];
  const protocolMarker =
    'let __pipe = null, __busy = false;\n' +
    'function reply(msg, transfer) { self.postMessage(msg, transfer || []); }';
  const protocolReplacement =
    "const LOCALMIND_IMAGE_PROTOCOL = 'localmind.image.v1';\n" +
    'let __pipe = null, __busy = false, __requestId = null;\n' +
    'function reply(msg, transfer) {\n' +
    '  self.postMessage(Object.assign({ protocol: LOCALMIND_IMAGE_PROTOCOL, id: __requestId }, msg || {}), transfer || []);\n' +
    '}';
  if (!source.includes(protocolMarker)) {
    throw new Error('LocalMind Bonsai protocol marker has changed');
  }
  source = source.replace(protocolMarker, protocolReplacement);

  const messageMarker =
    'self.onmessage = async (ev) => {\n' +
    '  const m = ev.data || {};\n' +
    '  try {';
  const messageReplacement =
    'self.onmessage = async (ev) => {\n' +
    '  const m = ev.data || {};\n' +
    '  __requestId = m.id != null ? m.id : null;\n' +
    '  try {';
  if (!source.includes(messageMarker)) {
    throw new Error('LocalMind Bonsai message marker has changed');
  }
  source = source.replace(messageMarker, messageReplacement);

  return (
    '/* Generated from LocalMind index.html #bonsaiEngineSrc. ' +
    'Run node scripts/extract-image-worker.mjs after changing the inline engine. */\n' +
    source.trimStart()
  );
}

export async function writeImageWorker() {
  const html = await readFile(new URL('index.html', root), 'utf8');
  const source = extractImageWorkerSource(html);
  await writeFile(new URL('image-inference-worker.js', root), source);
  return source;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const source = await writeImageWorker();
  console.log(`Wrote image-inference-worker.js (${source.length} bytes)`);
}
