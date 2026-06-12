#!/usr/bin/env python3
"""
Animated "workbench tour" GIF of LocalMind — one tab, three on-device modes.

Beat 1: the mode-chip row (Search·Research·Compare·Batch │ Image·Diffuse).
Beat 2: 🎨 Image — a real on-device generation pops into the thread.
Beat 3: 🌫️ Diffuse — the answer denoises out of the ▒ fog, non-linearly.

Staged via Playwright using the app's REAL CSS (no WebGPU needed; timing is
controlled); composed into one animated GIF with Pillow. The image is a real
prior generation (guide/img/sample-gen.jpg); the fog uses .fog/.tok-mask/.tok-fresh.

  python3 -m http.server 8011 --directory .
  PYTHONPATH="$HOME/Library/Python/3.9/lib/python/site-packages" \
    python3 demo/capture-gif-tour.py

Output: guide/img/workbench-tour.gif
"""
import io, math, random
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT     = Path(__file__).resolve().parent.parent
IMG_DIR  = ROOT / "guide" / "img"
URL      = "http://localhost:8011/"
VIEWPORT = {"width": 1160, "height": 720}
OUT_W    = 840

IMG_PROMPT = "a red panda reading by a window, soft morning light, watercolor"
DIF_PROMPT = "Write a haiku about the ocean at dawn."
ANSWER     = "Grey water at rest,\nthe sun climbs over the swell —\nlight learns the cold tide."
SAMPLE     = "/guide/img/sample-gen.jpg"

random.seed(7)

STAGE_READY = r"""
() => {
  const g = id => document.getElementById(id);
  if (g('chatInput')) { g('chatInput').disabled = false; g('chatInput').placeholder = 'Type a message…'; }
  if (g('statusBadge')) g('statusBadge').className = 'status-badge ready';
  if (g('statusText'))  g('statusText').textContent = 'on-device';
  if (g('statusSpinner')) g('statusSpinner').style.display = 'none';
  if (g('inputAffordances')) g('inputAffordances').classList.add('visible');
  if (g('progressSection')) g('progressSection').style.display = 'none';
  if (g('samProgressSection')) g('samProgressSection').style.display = 'none';
}
"""

CLICK   = "(id) => { const c = document.getElementById(id); if (c) { c.disabled = false; c.click(); } }"
SET_FOG = "(html) => { const e = document.getElementById('__fog'); if (e) e.innerHTML = html; }"
SET_TXT = "(o) => { const e = document.getElementById(o.id); if (e) e.textContent = o.t; }"
SCROLL  = "(y) => { const a = document.getElementById('chatArea'); if (a) a.scrollTop = (y < 0 ? a.scrollHeight : y); }"

IMG_PLACEHOLDER = r"""
(p) => {
  document.getElementById('chatArea').innerHTML =
    '<div class="msg user"><div class="msg-bubble"><span>' + p + '</span></div></div>' +
    '<div class="msg assistant"><div class="msg-bubble"><span class="gen-image-meta">Denoising 4/4…</span></div></div>';
}
"""

IMG_DONE = r"""
(o) => {
  document.getElementById('chatArea').innerHTML =
    '<div class="msg user"><div class="msg-bubble"><span>' + o.p + '</span></div></div>' +
    '<div class="msg assistant"><div class="msg-bubble"><img class="gen-image" src="' + o.src + '" alt="">' +
    '<div class="gen-image-meta">512×512 · seed 481523903 · 12.0s</div></div></div>';
  const g = document.getElementById('imageGallery'); if (g) g.innerHTML = '<img src="' + o.src + '">';
  const m = document.getElementById('imageModelMeta'); if (m) m.textContent = '1 image this session';
}
"""

DIF_BUBBLE = r"""
(p) => {
  document.getElementById('chatArea').insertAdjacentHTML('beforeend',
    '<div class="msg user"><div class="msg-bubble"><span>' + p + '</span></div></div>' +
    '<div class="msg assistant"><div class="msg-bubble"><div class="fog" id="__fog"></div></div></div>');
}
"""


def fog_tokens(answer):
    toks = []
    for li, line in enumerate(answer.split("\n")):
        if li > 0:
            toks.append(("\n", True))
        for w in line.split(" "):
            toks.append((w, False))
    return toks


def build_fog(toks, revealed, fresh):
    out = []
    for i, (t, nl) in enumerate(toks):
        if nl:
            out.append("<br>")
        elif i in revealed:
            cls = ' class="tok-fresh"' if i in fresh else ''
            out.append('<span%s>%s </span>' % (cls, t))
        else:
            out.append('<span class="tok-mask">%s </span>' % ("▒" * max(2, min(len(t), 6))))
    return "".join(out)


def shot(page):
    im = Image.open(io.BytesIO(page.screenshot(type="png"))).convert("RGB")
    w, h = im.size
    im = im.resize((OUT_W, round(h * OUT_W / w)), Image.LANCZOS)
    return im.convert("P", palette=Image.ADAPTIVE, colors=128)


def run():
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    toks = fog_tokens(ANSWER)
    order = [i for i, (t, nl) in enumerate(toks) if not nl]
    random.shuffle(order)
    frames, durs = [], []

    def cap(ms):
        frames.append(shot(page)); durs.append(ms)

    with sync_playwright() as pw:
        b = pw.chromium.launch(headless=True)
        ctx = b.new_context(viewport=VIEWPORT, device_scale_factor=1)
        page = ctx.new_page()
        page.route("**huggingface.co/**", lambda r: r.abort())
        page.goto(URL, wait_until="domcontentloaded")
        page.wait_for_timeout(1000)
        page.evaluate(STAGE_READY)
        page.wait_for_timeout(150)

        # Beat 1 — the mode-chip row, empty thread.
        cap(950)

        # Beat 2 — Image mode pops a real generation into the thread.
        page.evaluate(CLICK, "chipImage")
        page.wait_for_timeout(120)
        page.evaluate(IMG_PLACEHOLDER, IMG_PROMPT)
        page.wait_for_timeout(60); cap(600)
        page.evaluate(IMG_DONE, {"p": IMG_PROMPT, "src": SAMPLE})
        page.wait_for_timeout(120)
        page.evaluate("() => { const i = document.querySelector('.gen-image'); if (i) i.scrollIntoView({block:'center'}); }")
        page.wait_for_timeout(80); cap(1500)

        # Beat 3 — Diffuse mode: the answer denoises out of the fog.
        page.evaluate(CLICK, "chipDiffuse")
        page.wait_for_timeout(120)
        page.evaluate(DIF_BUBBLE, DIF_PROMPT)
        page.evaluate(SCROLL, -1)
        revealed = set()
        page.evaluate(SET_FOG, build_fog(toks, revealed, set()))
        page.evaluate(SET_TXT, {"id": "diffuseProgressText", "t": "Denoising — block 1/3 · forward 0"})
        page.wait_for_timeout(60); cap(650)

        for k in range(0, len(order), 2):           # ~2 tokens / frame
            fresh = set(order[k:k + 2]); revealed |= fresh
            blk = min(3, 1 + (len(revealed) * 3) // max(1, len(order)))
            page.evaluate(SET_FOG, build_fog(toks, revealed, fresh))
            page.evaluate(SET_TXT, {"id": "diffuseProgressText", "t": "Denoising — block %d/3 · forward %d" % (blk, len(revealed))})
            page.wait_for_timeout(40); cap(160)

        page.evaluate(SET_FOG, build_fog(toks, revealed, set()))
        page.evaluate(SET_TXT, {"id": "diffuseProgressText", "t": "Done — 8.4 tok/s. Ask again."})
        page.wait_for_timeout(60); cap(2000)
        b.close()

    out = IMG_DIR / "workbench-tour.gif"
    frames[0].save(out, save_all=True, append_images=frames[1:],
                   duration=durs, loop=0, optimize=True, disposal=2)
    print("wrote %s  %d frames  %dx%d  %dKB"
          % (out, len(frames), frames[0].size[0], frames[0].size[1], out.stat().st_size // 1024))


if __name__ == "__main__":
    run()
