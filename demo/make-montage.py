#!/usr/bin/env python3
"""Stitch six guide screenshots into one 2x3 "look at all this" montage for sharing.
Output: guide/img/montage.jpg  (run from repo root or anywhere; paths are resolved relative to this file)."""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "..", "guide", "img")

# Palette (matches guide/index.html)
BODY   = (246, 243, 236)   # --body  cream
PANEL  = (253, 251, 244)   # --panel
LINE   = (221, 214, 192)   # --line
INK    = (26, 20, 8)       # --ink
MUTED  = (122, 90, 40)     # --muted
ACCENT = (8, 24, 74)       # --act  indigo

# Panels: (file, caption) — narrative order: how you drive it -> council -> research -> skills -> memory -> settings
PANELS = [
    ("02-mode-chips.jpg", "Unified input · mode chips"),
    ("04-compare.jpg",    "Model council + judge"),
    ("05-research.jpg",   "Deep Research (cited)"),
    ("06-skills.jpg",     "Self-improving skills"),
    ("07-memory.jpg",     "On-device memory"),
    ("08-settings.jpg",   "Web search & folder sync"),
]

# Layout
COLS, ROWS = 3, 2
CELL_W = 760
CELL_H = round(CELL_W * 1720 / 2560)   # keep 3:2 -> 511
GUTTER = 26
MARGIN = 40
CAP_H  = 50            # caption strip under each image
HEAD_H = 168
RADIUS = 14

W = MARGIN * 2 + COLS * CELL_W + (COLS - 1) * GUTTER
H = MARGIN * 2 + HEAD_H + ROWS * (CELL_H + CAP_H) + (ROWS - 1) * GUTTER

def font(bold, size):
    paths = ([
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ] if bold else [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ])
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            continue
    return ImageFont.load_default()

def rounded(im, radius):
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.size[0] - 1, im.size[1] - 1], radius=radius, fill=255)
    out = im.convert("RGBA"); out.putalpha(mask)
    return out

canvas = Image.new("RGB", (W, H), BODY)
d = ImageDraw.Draw(canvas)

# ── Header ──────────────────────────────────────────────
f_title = font(True, 62)
f_sub   = font(False, 27)
f_pill  = font(True, 22)
f_cap   = font(True, 27)

d.text((MARGIN, MARGIN - 2), "LocalMind", font=f_title, fill=ACCENT)
d.text((MARGIN, MARGIN + 78),
       "Private, in-browser AI — model council · deep research · skills · memory · on-disk sync",
       font=f_sub, fill=MUTED)
# privacy pill (right-aligned)
pill = "No server · no API keys · nothing leaves your device"
pw = d.textlength(pill, font=f_pill)
px0, py0 = W - MARGIN - pw - 28, MARGIN + 6
d.rounded_rectangle([px0, py0, px0 + pw + 28, py0 + 40], radius=20, fill=(216, 220, 235))
d.text((px0 + 14, py0 + 9), pill, font=f_pill, fill=ACCENT)

# ── Grid ────────────────────────────────────────────────
top0 = MARGIN + HEAD_H
for i, (fn, cap) in enumerate(PANELS):
    r, c = divmod(i, COLS)
    x = MARGIN + c * (CELL_W + GUTTER)
    y = top0 + r * (CELL_H + CAP_H + GUTTER)
    shot = Image.open(os.path.join(IMG, fn)).convert("RGB").resize((CELL_W, CELL_H), Image.LANCZOS)
    canvas.paste(rounded(shot, RADIUS), (x, y), rounded(shot, RADIUS))
    d.rounded_rectangle([x, y, x + CELL_W - 1, y + CELL_H - 1], radius=RADIUS, outline=LINE, width=2)
    # caption centered under the panel
    cw = d.textlength(cap, font=f_cap)
    d.text((x + (CELL_W - cw) / 2, y + CELL_H + 12), cap, font=f_cap, fill=INK)

out = os.path.join(IMG, "montage.jpg")
canvas.save(out, "JPEG", quality=88, optimize=True)
print(f"wrote {out}  {W}x{H}  {os.path.getsize(out)//1024}KB")
