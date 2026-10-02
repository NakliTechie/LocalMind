// Dev static server with HTTP Range support (python's http.server has none).
// Serves the repo root, plus /models/ mapped to MODELS_DIR (default ~/Models), so an
// engine can range-read a local GGUF the same way it reads Hugging Face.
//   node scripts/serve-range.mjs [port]   → http://127.0.0.1:<port>/
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { join, normalize, extname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MODELS = process.env.MODELS_DIR || join(homedir(), 'Models');
const PORT = Number(process.argv[2] || 8137);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.wasm': 'application/wasm' };

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.startsWith('/models/')
    ? join(MODELS, normalize(path.slice('/models/'.length)))
    : join(ROOT, normalize(path === '/' ? '/index.html' : path));
  let st;
  try { st = statSync(file); if (!st.isFile()) throw 0; } catch { res.writeHead(404).end(); return; }
  const headers = {
    'Content-Type': TYPES[extname(file)] || 'application/octet-stream',
    'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*', 'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
  };
  const m = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '');
  if (m) {
    const start = Number(m[1]), end = m[2] ? Math.min(Number(m[2]), st.size - 1) : st.size - 1;
    if (start > end) { res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }).end(); return; }
    res.writeHead(206, { ...headers, 'Content-Length': end - start + 1, 'Content-Range': `bytes ${start}-${end}/${st.size}` });
    if (req.method === 'HEAD') return res.end();
    createReadStream(file, { start, end, highWaterMark: 4 << 20 }).pipe(res);
  } else {
    res.writeHead(200, { ...headers, 'Content-Length': st.size });
    if (req.method === 'HEAD') return res.end();
    createReadStream(file, { highWaterMark: 4 << 20 }).pipe(res);
  }
}).listen(PORT, '127.0.0.1', () => console.log(`serving ${ROOT} (+ /models/ → ${MODELS}) on http://127.0.0.1:${PORT}/`));
