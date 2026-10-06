// roll-in.mjs — LocalMind ships as one file. This copies every module in src/ into index.html as an inert
// <script type="text/plain" data-module="<file>"> block between two markers at the end of the page; the page's
// moduleUrl() turns a block into a blob URL when a worker first needs it.
//   node scripts/roll-in.mjs           rewrite index.html from src/
//   node scripts/roll-in.mjs --check   exit 1 if index.html is not what src/ would produce
// Edit the module in src/, never the copy in index.html: the next roll-in overwrites it.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const root = new URL('../', import.meta.url);
const START = '<!-- rolled-in modules: generated from src/ by scripts/roll-in.mjs. Edit src/, then run `node scripts/roll-in.mjs`. -->';
const END = '<!-- /rolled-in modules -->';

export async function readModules() {
  const files = (await readdir(new URL('src/', root))).filter((f) => f.endsWith('.js')).sort();
  return Promise.all(files.map(async (file) => ({ file, code: await readFile(new URL(`src/${file}`, root), 'utf8') })));
}

// Raw text inside <script> ends at the first `</script`, and `<!--` can switch the parser into its escaped
// states; a CR or NUL would not survive the parser byte for byte. None of these may appear in a module.
export function unsafeFor(code) {
  if (/<\/script/i.test(code)) return '</script';
  if (code.includes('<!--')) return '<!--';
  if (code.includes('\r')) return 'a carriage return';
  if (code.includes('\0')) return 'a NUL byte';
  return null;
}

export function rollIn(html, modules) {
  for (const { file, code } of modules) {
    const bad = unsafeFor(code);
    if (bad) throw new Error(`src/${file} contains ${bad}, which cannot sit inside a <script> block`);
  }
  const section = [START, ...modules.map(({ file, code }) => `<script type="text/plain" data-module="${file}">${code}</script>`), END].join('\n');
  const a = html.indexOf(START);
  const b = html.indexOf(END);
  if (a >= 0 && b > a) return html.slice(0, a) + section + html.slice(b + END.length);
  if (a >= 0 || b >= 0) throw new Error('index.html has one rolled-in marker without the other');
  const body = html.lastIndexOf('</body>');
  if (body < 0) throw new Error('index.html has no </body>');
  return `${html.slice(0, body)}${section}\n${html.slice(body)}`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = new URL('index.html', root);
  const html = await readFile(path, 'utf8');
  const modules = await readModules();
  const next = rollIn(html, modules);
  if (process.argv.includes('--check')) {
    if (next !== html) { console.error('index.html is out of date with src/; run `node scripts/roll-in.mjs`'); process.exit(1); }
    console.log(`index.html carries all ${modules.length} src/ modules unchanged`);
  } else if (next === html) {
    console.log(`index.html already carries all ${modules.length} src/ modules`);
  } else {
    await writeFile(path, next);
    console.log(`rolled ${modules.length} modules from src/ into index.html (${(Buffer.byteLength(next) / 1e6).toFixed(2)} MB)`);
  }
}
