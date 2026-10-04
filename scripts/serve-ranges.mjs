// serve-ranges.mjs — serve one directory over HTTP with byte-range support and open CORS, so an
// engine harness on another local port can ingest a multi-GB GGUF at disk speed instead of from
// the Hugging Face CDN. `python3 -m http.server` ignores Range headers, which the ingest needs.
//
//   node scripts/serve-ranges.mjs ~/.cache/localmind-moe 8767
//   then load({ url: 'http://127.0.0.1:8767/<file>.gguf' }) in scripts/qwen3-moe-harness.html
//
// Binds 127.0.0.1 only. GET and HEAD; a single `bytes=a-b` range per request.
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { resolve, join, sep } from 'node:path';

const root = resolve(process.argv[2] || '.');
const port = Number(process.argv[3] || 8767);

createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Range');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
  const path = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
  let st;
  try { st = statSync(path); } catch { res.writeHead(404); res.end(); return; }
  if (!st.isFile()) { res.writeHead(404); res.end(); return; }
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  let start = 0, end = st.size - 1, status = 200;
  if (m) {
    start = m[1] === '' ? Math.max(0, st.size - Number(m[2])) : Number(m[1]);
    end = m[1] !== '' && m[2] !== '' ? Math.min(Number(m[2]), st.size - 1) : st.size - 1;
    if (start > end || start >= st.size) { res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }); res.end(); return; }
    status = 206;
    res.setHeader('Content-Range', `bytes ${start}-${end}/${st.size}`);
  }
  res.writeHead(status, { 'Content-Length': end - start + 1, 'Accept-Ranges': 'bytes', 'Content-Type': 'application/octet-stream' });
  if (req.method === 'HEAD') { res.end(); return; }
  createReadStream(path, { start, end }).pipe(res);
}).listen(port, '127.0.0.1', () => console.error(`serving ${root} on http://127.0.0.1:${port}/ (byte ranges, CORS *)`));
