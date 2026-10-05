#!/usr/bin/env python3
"""
LocalMind guide screenshot capture — the real app, real models.

Drives LocalMind in Google Chrome (headless, WebGPU on) and captures every screen the
guide shows. Nothing is staged: answers, the council verdict, the image and the diffusion
fog are produced by the models on this machine. Only the data a fresh browser lacks is
seeded: six sample chats and a few memories and skills (no real people or organisations).

    pip3 install playwright          # uses your installed Google Chrome, no browser download
    python3 demo/capture.py          # serves the repo itself on 127.0.0.1:$LM_GUIDE_PORT

The first run downloads ~7 GB of models into a dedicated Chrome profile ($LM_GUIDE_PROFILE,
default ~/.cache/localmind-guide-profile); later runs load them from that cache. Needs a
GPU with WebGPU (Apple Silicon or a recent discrete GPU).

Outputs: guide/img/NN-slug.jpg  +  guide/CAPTURE-LOG.md
"""

import functools, http.server, json, os, threading, time
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
IMG_DIR = ROOT / "guide" / "img"
LOG_PATH = ROOT / "guide" / "CAPTURE-LOG.md"
PORT = int(os.environ.get("LM_GUIDE_PORT", "8817"))
PROFILE = Path(os.environ.get("LM_GUIDE_PROFILE", Path.home() / ".cache" / "localmind-guide-profile"))
URL = f"http://127.0.0.1:{PORT}/"
CHROME_ARGS = ["--headless=new", "--enable-unsafe-webgpu", "--enable-features=WebGPU"]
CHAT = ("gemma4-e2b", "Gemma 4 E2B")          # picker key, status label
COUNCIL = ("lfm2-1.2b", "gemma4-e2b")

SAMPLE_CHATS = [
    ("Plan a 3-day trip to Kerala in the monsoon",
     "Day 1: Kochi, the old fort area and an evening boat ride. Day 2: drive to Munnar for tea estates in the mist. Day 3: Alleppey backwaters on a houseboat. Pack a light rain jacket; monsoon showers come and go."),
    ("What can I cook with spinach, paneer and rice?",
     "Palak paneer with jeera rice is the classic. For something quicker, try a spinach-paneer pulao: sauté onion, cumin and garlic, add rice, chopped spinach and cubed paneer, then cook with water until fluffy."),
    ("Explain how a heat pump works, simply",
     "A heat pump moves heat instead of making it. In winter it pulls warmth from outside air and pumps it indoors; in summer it runs the other way and works as an air conditioner."),
    ("Draft a polite note about a leaking kitchen tap",
     "Hi, the kitchen tap has been dripping steadily since Monday. Could someone take a look this week? I'm home most evenings after 6. Thanks for your help."),
    ("Ideas for a 7-year-old's science fair project",
     "1. Which paper towel soaks up the most water? 2. Growing beans in light vs dark. 3. A lemon battery that lights an LED. 4. Do heavier cars roll farther down a ramp?"),
    ("Summarise my notes on keeping a sourdough starter",
     "Feed it equal weights of flour and water once a day at room temperature, or once a week in the fridge. Bubbles and a doubled size within 6 hours mean it's ready to bake with."),
]
SAMPLE_MEMORY = [
    ("Cite every claim with its source number in square brackets, e.g. [1], [2].", "skill", "cite sources"),
    ("Answer in at most three sentences unless asked for more detail.", "skill", "be concise"),
    ("When asked for a recipe, list ingredients first, then numbered steps.", "skill", "recipe format"),
    ("Prefers metric units.", "preference", "chat"),
    ("Prefers answers without emoji.", "preference", "chat"),
    ("Is planning a trip to Kerala during the monsoon.", "fact", "chat"),
    ("Keeps a sourdough starter in the fridge and feeds it weekly.", "fact", "chat"),
    ("Heat pumps move heat rather than generate it; efficiency is measured as COP.", "document", "home-energy-notes.pdf"),
    ("A COP of 3 means three units of heat delivered for every unit of electricity used.", "document", "home-energy-notes.pdf"),
]


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    handler = functools.partial(Quiet, directory=str(ROOT))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


class Run:
    def __init__(self, p):
        self.p, self.rows, self.errors = p, [], []

    def launch(self, phone=False):
        kw = dict(channel="chrome", headless=True, args=CHROME_ARGS)
        if phone:
            kw.update(viewport={"width": 390, "height": 844}, device_scale_factor=3, is_mobile=True, has_touch=True,
                      user_agent="Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36")
        else:
            kw.update(viewport={"width": 1280, "height": 860}, device_scale_factor=2)
        self.ctx = self.p.chromium.launch_persistent_context(str(PROFILE), **kw)
        self.page = self.ctx.pages[0] if self.ctx.pages else self.ctx.new_page()
        self.page.on("console", lambda m: m.type == "error" and self.errors.append(m.text[:90]))
        self.page.on("pageerror", lambda e: self.errors.append(str(e)[:90]))
        self.page.set_default_timeout(60_000)
        return self.page

    def close(self):
        self.ctx.close()

    # --- app state -----------------------------------------------------------------------
    def status(self):
        return self.page.evaluate("() => ({ badge: document.getElementById('statusBadge')?.className || '',"
                                  " text: (document.getElementById('statusText')?.textContent || '').trim() })")

    def wait_ready(self, label=None, timeout=1800):
        t0, last = time.time(), None
        while time.time() - t0 < timeout:
            st = self.status()
            if st != last:
                print(f"    {round(time.time() - t0):>4}s {st['text']}"); last = st
            if "ready" in st["badge"] and (label is None or st["text"] == label):
                return
            time.sleep(1)
        raise TimeoutError(f"model not ready: {last}")

    def boot(self):
        self.page.goto(URL)
        self.page.evaluate("document.fonts.ready")
        self.wait_ready()
        if self.status()["text"] != CHAT[1]:
            self.page.click("#modelPickerBtn")
            self.page.click(f'.mp-opt[data-value="{CHAT[0]}"]')
            self.wait_ready(CHAT[1])

    def idle(self, timeout=900):
        self.page.wait_for_function("!document.getElementById('sendBtn').classList.contains('stop')", timeout=timeout * 1000)

    def nav(self, label):
        self.page.locator("#appNav button, #appNav summary", has_text=label).first.click()
        self.page.wait_for_timeout(400)

    def theme(self, value):
        self.page.evaluate("v => { const s = document.getElementById('themeSelect'); s.value = v;"
                           " s.dispatchEvent(new Event('change', { bubbles: true })); }", value)
        self.page.wait_for_timeout(300)

    def shot(self, n, slug, clip=None):
        self.page.mouse.move(2, 2)
        self.page.wait_for_timeout(400)
        path = IMG_DIR / f"{n:02d}-{slug}.jpg"
        t0 = time.time()
        self.page.screenshot(path=str(path), type="jpeg", quality=82, clip=clip)
        self.rows.append((n, slug, "ok", int((time.time() - t0) * 1000), path.stat().st_size // 1024,
                          self.errors[-1] if self.errors else ""))
        self.errors.clear()
        print(f"  {path.name}  {path.stat().st_size // 1024} KB")


def seed(page):
    page.evaluate("""async ([chats, mem]) => {
      const db = await new Promise((res, rej) => { const r = indexedDB.open('localmind_rag'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
      const tx = db.transaction(['conversations', 'chunks'], 'readwrite');
      const now = Date.now(), day = 864e5;
      tx.objectStore('conversations').clear(); tx.objectStore('chunks').clear();
      chats.forEach(([q, a], i) => { const t = now - (i < 2 ? 3600e3 * (i + 1) : day * (i - 1));
        tx.objectStore('conversations').put({ id: 'sample-' + i, title: q, modelKey: 'lfm2-1.2b', messageCount: 2, created: t, updated: t,
          messages: [{ role: 'user', content: q }, { role: 'assistant', content: a }] }); });
      mem.forEach(([text, category, source], i) => tx.objectStore('chunks').put({ id: 'sample-mem-' + i, text, category, source,
        embedding: Array.from({ length: 384 }, (_, k) => Math.sin(i * 7 + k) * 0.05), timestamp: now - i * 3600e3 }));
      await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
    }""", [SAMPLE_CHATS, SAMPLE_MEMORY])


def main():
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    PROFILE.mkdir(parents=True, exist_ok=True)
    srv = serve()
    started = datetime.now()
    with sync_playwright() as p:
        r = Run(p)
        page = r.launch()
        page.goto(URL)
        page.evaluate("() => { try { localStorage.removeItem('lm_theme'); } catch {} }")
        seed(page)
        r.boot()

        print("01 welcome"); r.shot(1, "overview")
        page.click("#modelPickerBtn"); page.wait_for_timeout(500)
        print("02 picker"); r.shot(2, "picker"); page.keyboard.press("Escape")
        page.locator(".welcome-prompts .try-prompt").nth(3).click()
        page.click("#sendBtn"); r.idle(); page.wait_for_timeout(1200)
        print("03 chat"); r.shot(3, "chat")
        page.click(".nav-more > summary"); page.wait_for_timeout(300)
        print("04 sidebar"); r.shot(4, "sidebar", clip={"x": 0, "y": 0, "width": 640, "height": 860})
        page.click(".nav-more > summary")
        page.keyboard.press("Meta+k"); page.wait_for_selector("#cmdk[open]")
        page.keyboard.type("set", delay=60)
        print("05 palette"); r.shot(5, "palette"); page.keyboard.press("Escape")

        # Research with no search provider: the chip opens the setting it needs.
        page.click("#chipResearch"); page.wait_for_timeout(700)
        print("07 research"); r.shot(7, "research")

        r.boot(); r.nav("Library")
        page.click('[data-lib-tab="memory"]'); page.wait_for_timeout(500)
        page.locator("#memoryCatPills .memory-cat-pill", has_text="skill").first.click(); page.wait_for_timeout(400)
        print("08 skills"); r.shot(8, "skills")
        page.locator("#memoryCatPills .memory-cat-pill", has_text="all").first.click(); page.wait_for_timeout(400)
        print("09 memory"); r.shot(9, "memory")
        page.click('[data-lib-tab="chats"]'); page.click("#librarySearch"); page.keyboard.type("monsoon", delay=50)
        page.wait_for_timeout(500)
        print("10 library"); r.shot(10, "library")

        r.boot()
        page.locator(".sidebar-foot button", has_text="Settings").first.click(); page.wait_for_timeout(400)
        page.click('#settingsTabs [data-tab="data"]'); page.wait_for_timeout(400)
        print("11 settings"); r.shot(11, "settings")

        # A reload reopens the last chat (the translation), which the dark and phone shots reuse.
        r.boot(); page.wait_for_timeout(600)
        r.theme("dark")
        print("14 dark"); r.shot(14, "dark")
        r.theme("system")
        r.close()

        page = r.launch(phone=True)
        r.boot(); page.wait_for_timeout(600)
        print("15 phone"); r.shot(15, "phone")
        r.close()
        page = r.launch()

        # Compare: two cached models answer, the last one loaded judges.
        r.boot(); r.nav("New chat"); r.nav("More"); r.nav("Compare")
        for key in COUNCIL:
            page.check(f'#compareModelList input.compare-cb[value="{key}"]')
        page.fill("#chatInput", "In two sentences: why is the sky blue?")
        page.click("#sendBtn")
        page.wait_for_function("document.getElementById('chatArea').innerText.includes('Judge \u00b7')", timeout=1_800_000)
        r.idle(); page.wait_for_timeout(1500)
        page.evaluate("() => { const c = document.getElementById('chatArea'); c.scrollTop = c.scrollHeight; }")
        print("06 compare"); r.shot(6, "compare")

        # Image: a real generation, fixed seed.
        r.boot(); r.nav("New chat"); r.nav("Image")
        page.select_option("#imageSize", "768x512"); page.fill("#imageSeed", "11")
        page.fill("#chatInput", "A paper lantern floating over a misty mountain lake at dusk, soft watercolor")
        page.click("#sendBtn")
        page.wait_for_function("() => { const i = document.getElementById('imagePreviewImg'); return i && !i.hidden && i.complete && i.naturalWidth > 0; }", timeout=2_400_000)
        r.idle()
        print("12 image"); r.shot(12, "image")

        # Diffuse: catch the answer mid-denoise.
        r.boot(); r.nav("New chat"); r.nav("More"); r.nav("Diffuse")
        page.fill("#chatInput", "Describe a quiet morning in a mountain village.")
        page.click("#sendBtn")
        page.wait_for_function("() => { const m = (document.getElementById('diffuseProgressText')?.textContent || '').match(/block (\\d+)\\/(\\d+)/); return m && +m[1] / +m[2] >= 0.5; }", timeout=2_400_000, polling=100)
        print("13 diffuse"); r.shot(13, "diffuse")
        r.idle()
        r.close()

    srv.shutdown()
    lines = [f"# LocalMind guide capture — {started:%Y-%m-%d %H:%M:%S}", "",
             f"**{len(r.rows)}/15 ok** · real app, real models (Chrome headless + WebGPU) · desktop 1280x860 @2x, phone 390x844 @3x", "",
             "| # | Slug | Status | ms | Size | Last console error |", "|---|---|---|---|---|---|"]
    lines += [f"| {n:02d} | {s} | {st} | {ms} | {kb}KB | {err.replace('|', '/')} |" for n, s, st, ms, kb, err in r.rows]
    LOG_PATH.write_text("\n".join(lines) + "\n")
    print(f"wrote {LOG_PATH}")


if __name__ == "__main__":
    main()
