#!/usr/bin/env python3
"""
LocalMind guide screenshot capture.

Drives the live app via Playwright and STAGES each feature's DOM directly —
headless chromium can't run WebGPU / download multi-GB models, so (like Bahi's
demo/capture.py loads sample .khata data) we inject representative content:
seed the RAG IndexedDB, toggle the mode chips/panels, and inject sample
chat/compare/research bubbles. The bubbles use the app's real CSS classes, so
the screenshots look exactly like the live app.

    pip3 install playwright
    python3 -m playwright install chromium
    # serve LocalMind first:  python3 -m http.server 8081 --directory .
    python3 demo/capture.py

Outputs: guide/img/NN-slug.jpg  +  guide/CAPTURE-LOG.md
"""

import time
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright, ConsoleMessage

ROOT     = Path(__file__).resolve().parent.parent
IMG_DIR  = ROOT / "guide" / "img"
LOG_PATH = ROOT / "guide" / "CAPTURE-LOG.md"
BASE_URL = "http://localhost:8081/"
VIEWPORT = {"width": 1280, "height": 860}

# --- Make the shell look model-ready (no model actually loads headless) -------
STAGE_READY = r"""
() => {
  const g = id => document.getElementById(id);
  if (g('chatInput')) { g('chatInput').disabled = false; g('chatInput').placeholder = 'Type a message…'; }
  if (g('statusBadge')) g('statusBadge').className = 'status-badge ready';
  if (g('statusText'))  g('statusText').textContent = 'Ternary Bonsai 1.7B';
  if (g('statusSpinner')) g('statusSpinner').style.display = 'none';
  if (g('welcomeMsg'))  g('welcomeMsg').style.display = 'none';
  if (g('inputAffordances')) g('inputAffordances').classList.add('visible');
}
"""

# --- Seed the RAG store so Memory / Skills views are populated ----------------
SEED_IDB = r"""
async () => {
  const db = await new Promise((res, rej) => {
    const r = indexedDB.open('localmind_rag', 2);
    r.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains('chunks')) { const s = d.createObjectStore('chunks', { keyPath: 'id' }); s.createIndex('category', 'category', { unique: false }); s.createIndex('source', 'source', { unique: false }); }
      if (!d.objectStoreNames.contains('profile')) d.createObjectStore('profile', { keyPath: 'key' });
      if (!d.objectStoreNames.contains('conversations')) { const c = d.createObjectStore('conversations', { keyPath: 'id' }); c.createIndex('updated', 'updated', { unique: false }); }
    };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  const now = Date.now();
  const mk = (text, cat, src) => ({ id: now + '-' + Math.random().toString(36).slice(2, 8), text, embedding: Array.from({length: 384}, () => (Math.random() - 0.5) * 0.1), category: cat, source: src, timestamp: now });
  const chunks = [
    mk('Cite every claim with its source number in square brackets, e.g. [1], [2].', 'skill', 'cite sources'),
    mk('Summarise meeting notes as 3 action items, each with an owner and a due date.', 'skill', 'summarise meetings'),
    mk('Answer in at most three sentences unless the user asks for more detail.', 'skill', 'be concise'),
    mk('The water cycle moves water through evaporation, condensation, and precipitation.', 'document', 'science-notes.pdf'),
    mk('LocalMind runs models in the browser via WebGPU; nothing leaves the device.', 'document', 'localmind-readme.md'),
    mk('User prefers metric units and concise, source-backed answers.', 'fact', 'user'),
    mk('Project deadline for the Q3 report is the 15th.', 'fact', 'user'),
  ];
  await new Promise((res, rej) => { const tx = db.transaction('chunks', 'readwrite'); for (const c of chunks) tx.objectStore('chunks').put(c); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
  db.close();
}
"""

# --- Per-view staging (runs AFTER STAGE_READY, on a freshly reloaded page) ----
CHAT_JS = r"""
() => {
  const area = document.getElementById('chatArea');
  area.insertAdjacentHTML('beforeend',
    '<div class="msg user"><div class="msg-bubble"><span>Explain WebGPU in one sentence.</span></div></div>' +
    '<div class="msg assistant"><div class="msg-bubble"><div><span class="msg-source-badge on-device">On-device</span></div>WebGPU is a modern browser API that lets web pages run GPU compute and graphics directly — it is what lets LocalMind run language models inside your tab, with nothing sent to a server.</div></div>');
}
"""

COMPARE_JS = r"""
() => {
  document.getElementById('chipCompare').click();
  const cbs = [...document.querySelectorAll('#compareModelList input.compare-cb')];
  if (cbs[0]) { cbs[0].checked = true; cbs[0].dispatchEvent(new Event('change')); }
  if (cbs[3]) { cbs[3].checked = true; cbs[3].dispatchEvent(new Event('change')); }
  const card = (label, text, accent) =>
    '<div style="border:1px solid ' + (accent ? 'var(--indigo-500)' : 'var(--gray-200)') +
    ';border-radius:8px;padding:8px 10px;margin-bottom:8px;background:' + (accent ? 'var(--indigo-100)' : 'var(--white)') + '">' +
    '<div style="font-weight:600;color:' + (accent ? 'var(--indigo-600)' : 'var(--gray-700)') + ';margin-bottom:4px">' + label + '</div><div>' + text + '</div></div>';
  const html = '<div style="font-size:0.85rem">' +
    card('Ternary Bonsai 1.7B', 'WebGPU is a browser API for running GPU workloads, including local AI models.', false) +
    card('Qwen3 4B', 'WebGPU exposes the GPU to web apps for high-performance compute and graphics — the basis for in-browser LLMs.', false) +
    card('⚖️ Judge · Qwen3 4B', 'Both are accurate. <strong>Winner:</strong> Qwen3 4B — it adds the why (in-browser LLMs) without losing concision.', true) +
    '</div>';
  document.getElementById('chatArea').insertAdjacentHTML('beforeend',
    '<div class="msg user"><div class="msg-bubble"><span>What is WebGPU?</span></div></div>' +
    '<div class="msg assistant"><div class="msg-bubble">' + html + '</div></div>');
}
"""

RESEARCH_JS = r"""
() => {
  document.getElementById('chipResearch') && document.getElementById('chipResearch').classList.add('active');
  const report = '<div><span class="msg-source-badge web-enriched">Web-enriched · 4 sources</span></div>' +
    '<h3>How do solid-state batteries work?</h3>' +
    '<p>Solid-state batteries replace the liquid electrolyte of lithium-ion cells with a solid one, improving energy density and safety [1][2]. They are less prone to thermal runaway because there is no flammable liquid [3].</p>' +
    '<h2>Key takeaways</h2><ul><li>Higher energy density than Li-ion [1].</li><li>Improved safety — no flammable electrolyte [3].</li><li>Still scaling toward mass production [4].</li></ul>' +
    '<div class="source-links"><a href="#">Nature Energy — solid electrolytes</a><a href="#">DOE — battery basics</a><a href="#">IEEE Spectrum</a><a href="#">Reuters — production</a></div>';
  document.getElementById('chatArea').insertAdjacentHTML('beforeend',
    '<div class="msg user"><div class="msg-bubble"><span>How do solid-state batteries work?</span></div></div>' +
    '<div class="msg assistant"><div class="msg-bubble">' + report + '</div></div>');
}
"""

CHIPS_JS = r"""
() => { document.getElementById('chipCompare').click();
  const cbs=[...document.querySelectorAll('#compareModelList input.compare-cb')];
  if(cbs[0]){cbs[0].checked=true;cbs[0].dispatchEvent(new Event('change'));}
  if(cbs[3]){cbs[3].checked=true;cbs[3].dispatchEvent(new Event('change'));} }
"""

MEMORY_JS = "() => { document.getElementById('memoryBtn').click(); }"
SKILLS_JS = r"""
() => { document.getElementById('memoryBtn').click();
  setTimeout(() => { const p=[...document.querySelectorAll('.memory-cat-pill')].find(x=>/skill/i.test(x.textContent)); if(p) p.click(); }, 250); }
"""
SETTINGS_JS = "() => { document.getElementById('settingsBtn').click(); }"
HELP_JS = "() => { document.getElementById('helpBtn').click(); }"

# (num, slug, view_js, wait_ms, run_stage_ready)
VIEWS = [
    ("01", "overview",   CHAT_JS,     500, True),
    ("02", "mode-chips", CHIPS_JS,    500, True),
    ("03", "chat",       CHAT_JS,     500, True),
    ("04", "compare",    COMPARE_JS,  600, True),
    ("05", "research",   RESEARCH_JS, 500, True),
    ("06", "skills",     SKILLS_JS,   700, True),
    ("07", "memory",     MEMORY_JS,   500, True),
    ("08", "settings",   SETTINGS_JS, 400, True),
    ("09", "help",       HELP_JS,     400, True),
]

CHECK_JS = "() => ({ ok: document.body.innerText.trim().length > 40, len: document.body.innerText.trim().length })"


def run():
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    rows = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context(viewport=VIEWPORT, device_scale_factor=2)
        page = context.new_page()
        # Block model-weight downloads — we stage the DOM, not load models.
        page.route("**huggingface.co/**", lambda r: r.abort())
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)

        page.goto(BASE_URL, wait_until="domcontentloaded")
        page.wait_for_timeout(800)
        page.evaluate(SEED_IDB)

        for num, slug, view_js, wait_ms, stage in VIEWS:
            errors.clear()
            t0 = time.time()
            try:
                page.goto(BASE_URL, wait_until="domcontentloaded")
                page.wait_for_timeout(1200)
                if stage:
                    page.evaluate(STAGE_READY)
                page.evaluate(view_js)
                page.wait_for_timeout(wait_ms)
                status = page.evaluate(CHECK_JS)
                path = IMG_DIR / f"{num}-{slug}.jpg"
                page.screenshot(path=str(path), type="jpeg", quality=82, full_page=False)
                ms = int((time.time() - t0) * 1000)
                state = "ok" if status["ok"] else "EMPTY"
                size = path.stat().st_size if path.exists() else 0
                rows.append((num, slug, state, ms, size, list(errors)))
                print(f"  [{state:5}] {num}-{slug}  {ms}ms  {size//1024}KB" + (f"  ERR:{len(errors)}" if errors else ""), flush=True)
            except Exception as e:
                rows.append((num, slug, "FAIL", int((time.time()-t0)*1000), 0, [str(e)]))
                print(f"  [FAIL ] {num}-{slug}  {e}", flush=True)
        browser.close()

    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ok = sum(1 for r in rows if r[2] == "ok")
    lines = [f"# LocalMind guide capture — {ts}", "",
             f"**{ok}/{len(rows)} ok** · viewport {VIEWPORT['width']}x{VIEWPORT['height']} @2x", "",
             "| # | Slug | Status | ms | Size | Console errors |", "|---|---|---|---|---|---|"]
    for num, slug, state, ms, size, errs in rows:
        et = "; ".join(e[:60] for e in errs[:2]) if errs else "—"
        lines.append(f"| {num} | {slug} | {state} | {ms} | {size//1024}KB | {et} |")
    LOG_PATH.write_text("\n".join(lines) + "\n")
    print(f"\n{ok}/{len(rows)} ok · log: {LOG_PATH}")


if __name__ == "__main__":
    run()
