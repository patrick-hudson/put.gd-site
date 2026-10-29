#!/usr/bin/env python3
"""Writes public/_site/og.png, the 1200x630 link preview, from the dark desktop screenshot.
Run after tools/shots/capture.py. Needs Pillow (uv run --with pillow tools/og.py)."""
import pathlib
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = Image.open(ROOT / "public/_site/shots/desktop-dark@2x.webp").convert("RGB")
w, h = 1200, 630
scale = max(w / src.width, h / src.height)
img = src.resize((round(src.width * scale), round(src.height * scale)), Image.LANCZOS)
left, top = (img.width - w) // 2, (img.height - h) // 2
img.crop((left, top, left + w, top + h)).save(ROOT / "public/_site/og.png", optimize=True)
print("wrote public/_site/og.png")
