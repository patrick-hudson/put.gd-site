#!/usr/bin/env python3
"""Rewrite every lab picture in the user guide from public/_site/shots/shots.json.

  python3 tools/guide_pictures.py            # rewrite guide/docs/*.md and guide/README.md
  python3 tools/guide_pictures.py --check    # exit 1 if a block is out of date

A picture is a `<picture class="shot">` block whose `<img>` names the shot
(`/_site/shots/NAME-dark.webp`) and carries the alt text. Everything else in the block
(the sources, widths and heights) comes from the manifest, so after a capture run that
changed a shot's size, run this once. To add a picture to a page, write just

    <picture class="shot"><img src="/_site/shots/NAME-dark.webp" alt="What it shows."></picture>

and run this to fill it in."""
import html
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "public/_site/shots/shots.json"
PAGES = [ROOT / "guide/README.md", *sorted((ROOT / "guide/docs").glob("*.md"))]
BLOCK = re.compile(r'<picture class="shot">.*?</picture>', re.S)
IMAGE = re.compile(r'<img\b[^>]*\bsrc="/_site/shots/([a-z0-9-]+?)-dark\.webp"[^>]*>')
ALT = re.compile(r'\balt="([^"]*)"')
COLUMN = 720  # the guide's text column, in CSS pixels


def sizes(manifest: dict) -> dict:
    """Each shot's 1x size. Dark and light are captured as identical pairs."""
    return {name: tuple(shot["sizes"]["dark-desktop"]["1x"]) for name, shot in manifest["shots"].items()}


def block(name: str, alt: str, size: tuple) -> str:
    width, height = size
    slot = f"(max-width: 760px) calc(100vw - 32px), {min(width, COLUMN)}px"

    def srcset(theme: str, kind: str) -> str:
        return f"/_site/shots/{name}-{theme}.{kind} {width}w, /_site/shots/{name}-{theme}@2x.{kind} {2 * width}w"

    light = '<source media="(prefers-color-scheme: light)"'
    return "\n".join([
        '<picture class="shot">',
        f'  {light} type="image/avif" sizes="{slot}" srcset="{srcset("light", "avif")}">',
        f'  <source type="image/avif" sizes="{slot}" srcset="{srcset("dark", "avif")}">',
        f'  {light} type="image/webp" sizes="{slot}" srcset="{srcset("light", "webp")}">',
        f'  <img src="/_site/shots/{name}-dark.webp" sizes="{slot}" srcset="{srcset("dark", "webp")}" '
        f'width="{width}" height="{height}" loading="lazy" alt="{alt}">',
        "</picture>",
    ])


def rewrite(text: str, known: dict, where: str) -> str:
    def one(match: re.Match) -> str:
        image = IMAGE.search(match.group(0))
        if not image:
            raise ValueError(f"{where}: a picture block names no /_site/shots/NAME-dark.webp image")
        name, alt = image.group(1), ALT.search(image.group(0))
        if name not in known:
            raise ValueError(f"{where}: no shot named {name!r} in {MANIFEST.relative_to(ROOT)}")
        if not alt or not alt.group(1).strip():
            raise ValueError(f"{where}: the {name} picture has no alt text")
        return block(name, html.escape(html.unescape(alt.group(1)), quote=True), known[name])

    return BLOCK.sub(one, text)


def main(argv: list) -> int:
    known = sizes(json.loads(MANIFEST.read_text()))
    stale = []
    for path in PAGES:
        text = path.read_text()
        fresh = rewrite(text, known, str(path.relative_to(ROOT)))
        if fresh != text:
            stale.append(path.relative_to(ROOT))
            if "--check" not in argv:
                path.write_text(fresh)
    if "--check" in argv and stale:
        print("pictures out of date (run tools/guide_pictures.py): " + ", ".join(map(str, stale)))
        return 1
    for path in stale:
        print(f"rewrote the pictures in {path}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
