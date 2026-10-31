#!/usr/bin/env python3
"""Fills the page's release details from releases.json, checks its local references and,
at deploy time, stamps asset URLs with the commit.

The page marks each generated value as <!--r:KEY-->default<!--/r:KEY-->; the defaults
read correctly on their own, so the committed page works before rendering too. Download
links use absolute /dl/stable/ permalinks, which fall back to nightly until stable exists.

    tools/render.py                    # render public/index.html in place, then check
    tools/render.py --stamp abc123     # also add ?v=abc123 to /_site/ asset URLs
    tools/render.py --check-only       # only check that referenced files exist
"""
import argparse
import datetime as dt
import html
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
PAGES = ["index.html", "404.html"]
STYLES = ["_site/site.css"]
MARK = re.compile(r"<!--r:([^>]+?)-->(.*?)<!--/r:\1-->", re.S)
ASSET = re.compile(r"(/_site/[A-Za-z0-9_./@-]+\.(?:css|js|svg|webp|avif|png|woff2))(?![?\w])")
REF_ATTR = re.compile(r'\b(?:src|href|srcset)="([^"]*)"')
CSS_URL = re.compile(r'url\("?([^")]+)"?\)')


def version(tag: str) -> str:
    return re.sub(r"^v|-nightly(\.\d+)?$", "", tag)


def day(iso: str) -> str:
    d = dt.datetime.fromisoformat(iso.replace("Z", "+00:00"))
    return f"{d.day} {d:%b}"


def megabytes(size: int) -> str:
    return f"{size / 1_000_000:.1f} MB"


def values(releases: dict, shots: dict | None) -> tuple[str | None, dict[str, str]]:
    """Return (channel, marker values). Values are HTML."""
    name = "stable" if releases.get("stable") else "nightly" if releases.get("nightly") else None
    out: dict[str, str] = {}
    if name:
        rel = releases[name]
        ver = html.escape(version(rel["tag"]))
        url = html.escape(rel["html_url"])
        if name == "stable":
            out["status"] = f"Stable {ver} · Updated {day(rel['published_at'])}"
            out["channel"] = (f'Stable <a href="{url}">{ver}</a>. Nightlies are on the '
                              '<a href="https://github.com/patrick-hudson/put.gd-desktop/releases">releases page</a>.')
            out["version"] = f"put.gd {ver}"
        else:
            out["status"] = f"Nightly {ver} · Updated {day(rel['published_at'])}"
            out["channel"] = f'Nightly builds only for now. This is <a href="{url}">{ver}</a>.'
            out["version"] = f"put.gd {ver} nightly"
        for key, asset in rel["assets"].items():
            out[f"file:{key}"] = html.escape(asset["name"])
            out[f"size:{key}"] = f"{megabytes(asset['size'])} · x86_64"
    if shots:
        out["credits"] = credits(shots)
    return name, out


def credits(shots: dict) -> str:
    parts = []
    first = next(iter((shots.get("shots") or {}).values()), {})
    if first.get("version") and first.get("desktop"):
        ver = html.escape(version(first["version"]))
        parts.append(f"Screenshots: put.gd {ver} on {html.escape(first['desktop'])}.")
    free, other = [], []
    for m in shots.get("media", []):
        if m["license"].lower() == "public domain":
            free.append(m)
            continue
        title = html.escape(re.sub(r"\s*\([^)]*\)$", "", m["title"]))
        if m.get("source"):
            title = f'<a href="{html.escape(m["source"])}">{title}</a>'
        lic = html.escape(m["license"])
        if m.get("licenseUrl"):
            lic = f'<a href="{html.escape(m["licenseUrl"])}">{lic}</a>'
        other.append(f"{title} {html.escape(m['credit'])}, {lic}")
    if free:
        nasa = all(m["credit"].startswith("NASA") for m in free)
        other.append('<a href="https://images.nasa.gov/">NASA photos</a> (public domain)' if nasa
                     else "public-domain photos")
    if other:
        parts.append("Demo media: " + "; ".join(other) + ".")
    return " ".join(parts) or "Screenshots are of the released app."


SHOT_FILE = re.compile(r"(/_site/shots/([a-z]+)-(dark|light)(-mobile)?(@2x)?\.(?:avif|webp))(?:\s+\d+[wx])?")
SHOT_TAG = re.compile(r'<(img|source)\b[^>]*\bdata-shot="([a-z]+)(?:-(mobile))?"[^>]*>')


def sized(page: str, shots: dict) -> str:
    """Write each screenshot's pixel width into srcset and its size into width/height."""
    table = shots.get("shots") or {}

    def size(name, theme, mobile, scale):
        variant = table.get(name, {}).get("sizes", {}).get(f"{theme}-{'mobile' if mobile else 'desktop'}")
        return variant and variant["2x" if scale else "1x"]

    def srcset_entry(m):
        wh = size(m[2], m[3], m[4], m[5])
        return f"{m[1]} {wh[0]}w" if wh else m[0]

    def tag(m):
        text = m[0]
        text = re.sub(r'srcset="([^"]*)"', lambda a: 'srcset="' + SHOT_FILE.sub(srcset_entry, a[1]) + '"', text)
        wh = size(m[2], "dark", m[3], True)
        if wh:
            for attr, value in (("width", wh[0]), ("height", wh[1])):
                text = re.sub(rf'\b{attr}="\d+"', f'{attr}="{value}"', text) if f' {attr}="' in text \
                    else text.replace(f'data-shot="', f'{attr}="{value}" data-shot="', 1)
        return text

    return SHOT_TAG.sub(tag, page)


def render(page: str, channel: str | None, vals: dict[str, str]) -> str:
    page = MARK.sub(lambda m: f"<!--r:{m[1]}-->{vals.get(m[1], m[2])}<!--/r:{m[1]}-->", page)
    if channel:
        page = re.sub(r"(https://app\.put\.gd/dl/)(?:stable|nightly)/", r"\g<1>stable/", page)
    return page


def stamp(text: str, sha: str) -> str:
    return ASSET.sub(rf"\1?v={sha}", text)


def references(text: str, css: bool) -> list[str]:
    refs = []
    if css:
        refs += CSS_URL.findall(text)
    else:
        for value in REF_ATTR.findall(text):
            refs += [part.strip().split(" ")[0] for part in value.split(",")]
    return [r.split("?")[0] for r in refs if r.startswith("/_site/")]


def missing() -> list[str]:
    out = []
    for name in PAGES + STYLES:
        text = (PUBLIC / name).read_text()
        for ref in references(text, name.endswith(".css")):
            if not (PUBLIC / ref.lstrip("/")).exists():
                out.append(f"{name}: {ref}")
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--releases", default=str(PUBLIC / "_site/releases.json"))
    ap.add_argument("--shots", default=str(PUBLIC / "_site/shots/shots.json"))
    ap.add_argument("--stamp", metavar="SHA", help="add ?v=SHA to /_site/ asset URLs")
    ap.add_argument("--check-only", action="store_true")
    args = ap.parse_args()

    if not args.check_only:
        releases = json.loads(pathlib.Path(args.releases).read_text())
        shots_path = pathlib.Path(args.shots)
        shots = json.loads(shots_path.read_text()) if shots_path.exists() else None
        channel, vals = values(releases, shots)
        index = PUBLIC / "index.html"
        page = render(index.read_text(), channel, vals)
        index.write_text(sized(page, shots) if shots else page)
        print(f"rendered index.html for {channel or 'no release'}")

    problems = missing()
    if problems:
        print("missing files:\n  " + "\n  ".join(problems), file=sys.stderr)
        return 1
    print("every /_site/ reference exists")

    if args.stamp:
        for name in PAGES + STYLES:
            path = PUBLIC / name
            path.write_text(stamp(path.read_text(), args.stamp))
        print(f"stamped asset URLs with ?v={args.stamp}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
