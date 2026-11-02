#!/usr/bin/env python3
"""Review the seasonal theme in a real browser: ordinary, November and December, dark and light,
desktop and mobile, plus the behaviour unit tests can't see (layout, clicks, midnight, back/forward).

    uv run --with playwright python tools/season_review.py --out /tmp/season-review

Serves public/ on localhost, where season.js honours ?season=november|december|ordinary. Uses the
system Chrome. Not part of the unit tests: it needs a browser and writes screenshots.
"""
import argparse
import functools
import http.server
import json
import pathlib
import threading

from playwright.sync_api import sync_playwright

PUBLIC = pathlib.Path(__file__).resolve().parent.parent / "public"
SEASONS = ["ordinary", "november", "december"]
GREETING = "put.gd - Happy Holidays!"
SIZES = {"desktop": (1280, 900), "tablet": (900, 800), "mobile": (390, 844), "small": (320, 640)}
PAGES = {"home": "/", "changelog": "/changelog.html", "404": "/404.html"}
# Every link and button's box, and whether a click at its centre would reach it.
PROBE = """() => {
  const out = [];
  document.querySelectorAll('a[href], button, label').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || el.classList.contains('season-control') || el.closest('.visually-hidden')) return;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const hit = cy >= 0 && cy < innerHeight ? document.elementFromPoint(cx, cy) : el;
    out.push({name: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40),
              x: Math.round(r.left), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height),
              reachable: !hit || el === hit || el.contains(hit) || hit.contains(el)});
  });
  return out;
}"""
STATE = """() => ({
  season: document.documentElement.getAttribute('data-season'),
  motion: document.documentElement.getAttribute('data-season-motion'),
  logo: document.querySelector('.brand img').getAttribute('src'),
  favicon: document.querySelector('link[rel=icon]').getAttribute('href'),
  decorations: document.querySelectorAll('.season-scene, .season-art, .season-snow, .season-control').length,
  flakes: document.querySelectorAll('.season-flake').length,
  running: document.getAnimations().filter((a) => a.playState === 'running').length,
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  crowded: (() => {
    const box = (el) => el && el.getBoundingClientRect();
    const hits = (a, b) => a && b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    const control = box(document.querySelector('.season-control'));
    const art = document.querySelector('.season-art');
    const artBox = art && getComputedStyle(art).display !== 'none' ? box(art) : null;
    const text = [...document.querySelectorAll('.top a, h1, .lede, .hero .actions, .install-command, .status')].map(box);
    const range = document.createRange();
    const heading = document.querySelector('.hero h1');
    if (heading) { range.selectNodeContents(heading); text.push(...range.getClientRects()); }
    const blocks = text.filter((b, i) => b && !(i < text.length && b.width > innerWidth * .6));
    return [hits(control, artBox), ...blocks.map((b) => hits(control, b) || hits(artBox, b))].filter(Boolean).length;
  })(),
  brand: document.querySelector('.brand').getAttribute('aria-label'),
  title: document.querySelector('.brand').getAttribute('title'),
  described: document.querySelector('.brand').getAttribute('aria-describedby'),
  greetings: document.querySelectorAll('.season-greeting').length,
  alt: document.querySelector('.brand img').getAttribute('alt'),
  hiddenOk: [...document.querySelectorAll('.season-scene, .season-art, .season-snow')].every((el) => el.getAttribute('aria-hidden') === 'true' && getComputedStyle(el).pointerEvents === 'none'),
})"""


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve():
    handler = functools.partial(Quiet, directory=str(PUBLIC))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, f"http://127.0.0.1:{server.server_port}"


def expect(results, name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print(f"{'ok  ' if ok else 'FAIL'} {name}{' -- ' + str(detail) if detail and not ok else ''}")


def capture(browser, base, out, results):
    baseline = {}
    for page_name, path in PAGES.items():
        for scheme in ("dark", "light"):
            for size, (w, h) in SIZES.items():
                for season in SEASONS:
                    context = browser.new_context(viewport={"width": w, "height": h}, color_scheme=scheme, device_scale_factor=1)
                    page = context.new_page()
                    errors = []
                    page.on("pageerror", lambda e: errors.append(str(e)))
                    page.goto(f"{base}{path}?season={season}", wait_until="networkidle")
                    page.evaluate("document.fonts.ready")
                    state = page.evaluate(STATE)
                    probe = page.evaluate(PROBE)
                    tag = f"{page_name} {season} {scheme} {size}"
                    if season == "ordinary":
                        baseline[(page_name, scheme, size)] = probe
                    expect(results, f"{tag}: no horizontal overflow", state["overflow"] <= 0, state["overflow"])
                    expect(results, f"{tag}: no script errors", not errors, errors)
                    # Same names, same boxes as the ordinary page: no layout shift, nothing hidden.
                    expect(results, f"{tag}: links unmoved", probe == baseline[(page_name, scheme, size)])
                    expect(results, f"{tag}: controls reachable", all(p["reachable"] for p in probe), [p for p in probe if not p["reachable"]])
                    expect(results, f"{tag}: decorations inert", state["hiddenOk"])
                    expect(results, f"{tag}: artwork and pause button clear of content", state["crowded"] == 0, state["crowded"])
                    if page_name == "home" or size == "mobile":
                        page.screenshot(path=out / f"{page_name}-{season}-{scheme}-{size}.png")
                    if page_name == "home" and size in ("desktop", "mobile"):
                        page.screenshot(path=out / f"{page_name}-{season}-{scheme}-{size}-full.png", full_page=True)
                    context.close()


def midnight(browser, base, results):
    """Runs a page through each boundary on a faked clock, in a time zone of its own; the page's timers do the switching."""
    for label, start, before, after in [
        ("Oct 31 to Nov 1", "2031-10-31T23:59:50-04:00", None, "november"),
        ("Nov 30 to Dec 1", "2031-11-30T23:59:50-05:00", "november", "december"),
        ("Dec 31 to Jan 1", "2031-12-31T23:59:50-05:00", "december", None),
    ]:
        context = browser.new_context(viewport={"width": 1280, "height": 900}, timezone_id="America/New_York")
        page = context.new_page()
        page.clock.install(time=start)
        page.goto(f"{base}/", wait_until="load")
        first = page.evaluate(STATE)
        page.clock.run_for(15_000)
        second = page.evaluate(STATE)
        expect(results, f"{label}: starts {before}", first["season"] == before, first)
        expect(results, f"{label}: switches to {after}", second["season"] == after, second)
        expect(results, f"{label}: branding follows", ("logo.svg" in second["logo"]) == (after is None) and (after or "logo") in second["logo"], second["logo"])
        expect(results, f"{label}: favicon follows", ("logo.svg" in second["favicon"]) == (after is None) and (after or "logo") in second["favicon"], second["favicon"])
        expect(results, f"{label}: greeting follows", second["title"] == (GREETING if after else None) and second["greetings"] == (1 if after else 0) and (second["described"] is not None) == bool(after), second)
        expect(results, f"{label}: link name stable", second["brand"] == "put.gd home", second["brand"])
        if after is None:
            expect(results, f"{label}: decorations removed", second["decorations"] == 0 and second["motion"] is None and second["flakes"] == 0 and second["running"] == 0, second)
        if after == "december":
            expect(results, f"{label}: snow bounded", 0 < second["flakes"] <= 20, second["flakes"])
        context.close()


def behaviour(browser, base, results, out=None):
    # A production hostname ignores the review parameter. (Mapped to localhost by the browser.)
    context = browser.new_context()
    page = context.new_page()
    page.clock.install(time="2031-07-04T12:00:00Z")
    page.route("https://app.put.gd/**", lambda route: route.fulfill(status=200, content_type="text/html", body=(PUBLIC / "index.html").read_text()) if route.request.resource_type == "document" else route.fulfill(status=200, body=(PUBLIC / route.request.url.split("app.put.gd/")[1].split("?")[0]).read_bytes(), content_type="text/css" if ".css" in route.request.url else "text/javascript" if ".js" in route.request.url else None))
    page.goto("https://app.put.gd/?season=december", wait_until="load")
    expect(results, "review parameter ignored off localhost", page.evaluate(STATE)["season"] is None)
    context.close()

    # Without JavaScript: ordinary branding, working links, no decoration.
    context = browser.new_context(java_script_enabled=False)
    page = context.new_page()
    page.clock.install(time="2031-12-25T12:00:00Z")
    page.goto(f"{base}/?season=december", wait_until="load")
    expect(results, "no JS: ordinary", page.get_attribute("html", "data-season") is None and page.get_attribute(".brand img", "src") == "/_site/logo.svg")
    expect(results, "no JS: download link kept", page.locator(".hero .btn-primary").get_attribute("href").startswith("https://app.put.gd/dl/"))
    context.close()

    # Script blocked: same.
    context = browser.new_context()
    page = context.new_page()
    page.route("**/season.js*", lambda route: route.abort())
    page.goto(f"{base}/?season=december", wait_until="load")
    expect(results, "script failure: ordinary", page.get_attribute("html", "data-season") is None)
    context.close()

    # The greeting on keyboard focus, clear of the headline and the pause button, at the narrowest size.
    for season, (w, h) in (("november", (1280, 900)), ("december", (1280, 900)), ("december", (320, 640))):
        context = browser.new_context(viewport={"width": w, "height": h})
        page = context.new_page()
        page.goto(f"{base}/?season={season}", wait_until="load")
        tip = page.locator(".season-greeting")
        expect(results, f"greeting {season} {w}: hidden until focus", tip.is_hidden())
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        focused = page.evaluate("document.activeElement.className")
        expect(results, f"greeting {season} {w}: shown on keyboard focus", focused == "brand" and tip.is_visible() and tip.text_content() == GREETING, focused)
        box, heading = tip.bounding_box(), page.locator(".hero h1").bounding_box()
        expect(results, f"greeting {season} {w}: clear of the headline", box["y"] + box["height"] <= heading["y"], box)
        control = page.locator(".season-control")
        if control.count():
            other = control.bounding_box()
            expect(results, f"greeting {season} {w}: clear of the pause button", box["x"] + box["width"] <= other["x"], (box, other))
        expect(results, f"greeting {season} {w}: no overflow", page.evaluate(STATE)["overflow"] <= 0)
        if out:
            page.screenshot(path=out / f"greeting-focus-{season}-{w}.png", clip={"x": 0, "y": 0, "width": w, "height": 160})
        context.close()

    # Reduced motion: flakes stay as a static fallback, nothing animates, no pause button.
    context = browser.new_context(reduced_motion="reduce", viewport={"width": 1280, "height": 900})
    page = context.new_page()
    page.goto(f"{base}/?season=december", wait_until="load")
    state = page.evaluate(STATE)
    expect(results, "reduced motion: static decoration", state["running"] == 0 and state["flakes"] > 0 and state["motion"] == "off", state)
    expect(results, "reduced motion: no pause button", page.locator(".season-control").is_hidden())
    context.close()

    # Pause control: stops every animation, by keyboard, and is remembered.
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    page = context.new_page()
    page.goto(f"{base}/?season=december", wait_until="load")
    expect(results, "pause: animating at first", page.evaluate(STATE)["running"] > 0)
    control = page.get_by_role("button", name="Pause decorations")
    control.focus()
    page.keyboard.press("Enter")
    expect(results, "pause: stopped", page.evaluate(STATE)["running"] == 0)
    expect(results, "pause: button offers play", page.get_by_role("button", name="Resume decorations").is_visible())
    page.reload(wait_until="load")
    expect(results, "pause: remembered", page.evaluate(STATE)["motion"] == "off")
    page.get_by_role("button", name="Resume decorations").click()
    expect(results, "pause: resumes", page.evaluate(STATE)["running"] > 0)
    # Hidden tab: paused while hidden, resumed on return.
    page.evaluate("""() => { Object.defineProperty(document, 'hidden', {configurable: true, get: () => true});
                     document.dispatchEvent(new Event('visibilitychange')); }""")
    expect(results, "hidden: animation paused", page.evaluate(STATE)["running"] == 0)
    page.evaluate("""() => { Object.defineProperty(document, 'hidden', {configurable: true, get: () => false});
                     document.dispatchEvent(new Event('visibilitychange')); }""")
    expect(results, "hidden: animation resumes", page.evaluate(STATE)["running"] > 0)
    context.close()

    # Suspended tab: the clock jumps past a boundary with no timer firing, then focus or pageshow catches it.
    for event, target in (("focus", "window"), ("pageshow", "window"), ("visibilitychange", "document")):
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()
        page.clock.install(time="2031-11-15T12:00:00Z")
        page.goto(f"{base}/", wait_until="load")
        before = page.evaluate(STATE)["season"]
        page.clock.pause_at("2031-12-15T12:00:00Z")
        page.evaluate(f"{target}.dispatchEvent(new Event('{event}'))")
        expect(results, f"resume via {event}: catches up", before == "november" and page.evaluate(STATE)["season"] == "december")
        context.close()

    # Real back/forward cache round trip, where the browser keeps the page.
    context = browser.new_context()
    page = context.new_page()
    page.goto(f"{base}/changelog.html", wait_until="load")
    page.evaluate("window.__marker = 1")
    page.goto(f"{base}/404.html", wait_until="load")
    page.go_back(wait_until="load")
    state = page.evaluate("[typeof window.__marker, document.documentElement.getAttribute('data-season')]")
    print(f"note back/forward: page {'restored from cache' if state[0] == 'number' else 'reloaded'}, season {state[1]}")
    context.close()


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--out", required=True, type=pathlib.Path)
    args = ap.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    server, base = serve()
    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome")
        capture(browser, base, args.out, results)
        midnight(browser, base, results)
        behaviour(browser, base, results, args.out)
        browser.close()
    server.shutdown()
    failed = [r for r in results if not r[1]]
    (args.out / "results.json").write_text(json.dumps(results, indent=1))
    print(f"{len(results) - len(failed)} of {len(results)} checks passed; screenshots in {args.out}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
