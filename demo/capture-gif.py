#!/usr/bin/env python3
"""
Animated "fog-lifting" GIF of LocalMind's 🌫️ Diffuse mode.

Drives the live app with Playwright and renders the masked-diffusion reveal using
the app's REAL CSS (.fog / .tok-mask / .tok-fresh) — STAGED, so no WebGPU is
needed and the timing is fully controlled (headless chromium can't run WebGPU).
Screenshots each reveal step; Pillow composes them into one animated GIF.

  python3 -m http.server 8011 --directory .      # serve LocalMind first
  PYTHONPATH="$HOME/Library/Python/3.9/lib/python/site-packages" \
    python3 demo/capture-gif.py

Output: guide/img/fog-reveal.gif
"""
import io, math, random
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT     = Path(__file__).resolve().parent.parent
IMG_DIR  = ROOT / "guide" / "img"
URL      = "http://localhost:8011/"
VIEWPORT = {"width": 1160, "height": 700}
OUT_W    = 840                      # final GIF width (downscaled)

PROMPT = "Write a haiku about the ocean at dawn."
# This GIF demos the *reveal mechanism*, not model quality — a clean target.
ANSWER = "Grey water at rest,\nthe sun climbs over the swell —\nlight learns the cold tide."

random.seed(7)

STAGE_READY = r"""
() => {
  const g = id => document.getElementById(id);
  if (g('chatInput')) { g('chatInput').disabled = false; g('chatInput').placeholder = 'Ask — watch the answer denoise…'; }
  if (g('statusBadge')) g('statusBadge').className = 'status-badge ready';
  if (g('statusText'))  g('statusText').textContent = 'Qwen3 0.6B · diffusion';
  if (g('statusSpinner')) g('statusSpinner').style.display = 'none';
  if (g('welcomeMsg'))  g('welcomeMsg').style.display = 'none';
  if (g('inputAffordances')) g('inputAffordances').classList.add('visible');
  // Open the Diffuse panel (force-enable in case the WebGPU feature-gate disabled the chip headless).
  const c = g('chipDiffuse'); if (c) { c.disabled = false; c.click(); }
}
"""

SEED_BUBBLE = r"""
(prompt) => {
  const area = document.getElementById('chatArea');
  area.innerHTML =
    '<div class="msg user"><div class="msg-bubble"><span>' + prompt + '</span></div></div>' +
    '<div class="msg assistant"><div class="msg-bubble"><div class="fog" id="__fog"></div></div></div>';
}
"""

SET_FOG    = "(html) => { const el = document.getElementById('__fog'); if (el) el.innerHTML = html; }"
SET_STATUS = "(t) => { const el = document.getElementById('diffuseProgressText'); if (el) el.textContent = t; }"


def fog_tokens(answer):
    """token slots: words + explicit newline markers, mirroring the canvas."""
    toks = []
    for li, line in enumerate(answer.split("\n")):
        if li > 0:
            toks.append(("\n", True))
        for w in line.split(" "):
            toks.append((w, False))
    return toks


def build_html(toks, revealed, fresh):
    out = []
    for i, (t, nl) in enumerate(toks):
        if nl:
            out.append("<br>")
        elif i in revealed:
            cls = ' class="tok-fresh"' if i in fresh else ''
            out.append('<span%s>%s </span>' % (cls, t))
        else:
            blocks = "▒" * max(2, min(len(t), 6))
            out.append('<span class="tok-mask">%s </span>' % blocks)
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
    random.shuffle(order)                       # non-linear reveal order

    NFRAMES = 24                                # ~1 token/frame for a smooth reveal
    per = math.ceil(len(order) / NFRAMES)
    frames, durations = [], []

    with sync_playwright() as pw:
        b = pw.chromium.launch(headless=True)
        ctx = b.new_context(viewport=VIEWPORT, device_scale_factor=1)
        page = ctx.new_page()
        page.route("**huggingface.co/**", lambda r: r.abort())
        page.goto(URL, wait_until="domcontentloaded")
        page.wait_for_timeout(1000)
        page.evaluate(STAGE_READY)
        page.wait_for_timeout(300)
        page.evaluate(SEED_BUBBLE, PROMPT)

        revealed = set()
        # opening frame — all fog
        page.evaluate(SET_FOG, build_html(toks, revealed, set()))
        page.evaluate(SET_STATUS, "Denoising — block 1/3 · forward 0")
        page.wait_for_timeout(60)
        frames.append(shot(page)); durations.append(550)

        nblocks = 3
        for k in range(0, len(order), per):
            fresh = set(order[k:k + per])
            revealed |= fresh
            blk = min(nblocks, 1 + (len(revealed) * nblocks) // max(1, len(order)))
            page.evaluate(SET_FOG, build_html(toks, revealed, fresh))
            page.evaluate(SET_STATUS, "Denoising — block %d/%d · forward %d" % (blk, nblocks, len(revealed)))
            page.wait_for_timeout(40)
            frames.append(shot(page)); durations.append(150)

        # settle frame — no fresh highlight, then the perf line
        page.evaluate(SET_FOG, build_html(toks, revealed, set()))
        page.evaluate(SET_STATUS, "Done — 8.4 tok/s. Ask again.")
        page.wait_for_timeout(60)
        frames.append(shot(page)); durations.append(1900)
        b.close()

    out = IMG_DIR / "fog-reveal.gif"
    frames[0].save(out, save_all=True, append_images=frames[1:],
                   duration=durations, loop=0, optimize=True, disposal=2)
    print("wrote %s  %d frames  %dx%d  %dKB"
          % (out, len(frames), frames[0].size[0], frames[0].size[1], out.stat().st_size // 1024))


if __name__ == "__main__":
    run()
