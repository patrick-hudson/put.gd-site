#!/usr/bin/env python3
"""Build the user guide (guide/) with Zensical into public/userguide/, inside the site's chrome.

The header and footer come from public/index.html, the same way the changelog shares them:
the User guide link is marked current, and the search box and the mobile menu toggle are added.
They are written as template partials, Zensical builds flat .html pages, and every link in the
output is then made root-absolute, so the same bytes serve at /userguide/<page>.html and at the
bare /userguide key (the S3 origin has no directory index). Install tools/requirements-guide.txt.

    tools/userguide.py                                   # build public/userguide/
    tools/userguide.py --releases path/to/releases.json  # with the release details in the footer
"""
import argparse
import json
import pathlib
import re
import shutil
import subprocess
import sys
from urllib.parse import urljoin, urlsplit

import render

ROOT = pathlib.Path(__file__).resolve().parent.parent
GUIDE = ROOT / "guide"
PUBLIC = ROOT / "public"
BASE = "/userguide/"
HEADER = re.compile(r'<header class="top">.*?</header>', re.S)
FOOTER = re.compile(r'<footer class="foot">.*?</footer>', re.S)
GUIDE_LINK = '<a href="/userguide">User guide</a>'
DRAWER = ('\n    <label class="guide-drawer md-icon" for="__drawer" aria-label="Menu">'
          '{% include ".icons/material/menu.svg" %}</label>')
SEARCH = ('\n    <label class="guide-search md-icon" for="__search" aria-label="Search">'
          '{% include ".icons/material/magnify.svg" %}</label>\n    {% include "partials/search.html" %}')
URL_ATTR = re.compile(r'\b(href|src|srcset|data-md-component-src)="([^"]*)"')
JS_BASE = re.compile(r'"base":\s*"([^"]*)"')
JS_SEARCH = re.compile(r'"search":\s*"([^"]*)"')
STAGE = GUIDE / ".site"  # Zensical insists on building inside its project folder


def chrome(home: str, channel: str | None, values: dict[str, str]) -> tuple[str, str]:
    """The homepage header and footer, adapted for the guide. Values are render.values()."""
    header = HEADER.search(home)[0]
    if GUIDE_LINK not in header:
        raise ValueError("public/index.html has no User guide link in its primary navigation")
    header = header.replace('<header class="top">', '<header class="top" data-md-component="header">', 1)
    header = header.replace('href="#install"', 'href="https://app.put.gd/#install"')
    header = header.replace(GUIDE_LINK, '<a href="/userguide" aria-current="page">User guide</a>')
    header = header.replace('<div class="wrap top-row">', '<div class="wrap top-row">' + DRAWER, 1)
    header = header.replace("</nav>", "</nav>" + SEARCH, 1)
    footer = render.render(FOOTER.search(home)[0], channel, values)
    return header, footer


def _absolute(url: str, page: str) -> str:
    url = url.strip()
    if not url or url.startswith(("#", "/", "data:", "mailto:", "javascript:")) or urlsplit(url).scheme:
        return url
    return urljoin(page, url)


def absolute(html: str, page: str) -> str:
    """Rewrite every relative URL in an output page to a root-absolute one, for page at `page`
    (a root-absolute path such as /userguide/capture.html)."""
    def attr(m: re.Match) -> str:
        name, value = m[1], m[2]
        if name == "srcset":
            value = ", ".join(" ".join([_absolute(p.strip().split(" ")[0], page)] + p.strip().split(" ")[1:])
                              for p in value.split(","))
        else:
            value = _absolute(value, page)
        return f'{name}="{value}"'
    html = URL_ATTR.sub(attr, html)
    # Zensical's scripts fetch search.json and build result links from this base; it must end in /.
    html = JS_BASE.sub(lambda m: '"base":"' + urljoin(page, m[1].rstrip("/") + "/") + '"', html)
    # ...and start the search worker from this URL. Left page-relative, it 404s at the bare
    # /userguide key and the search dialog reports that search is unavailable.
    html = JS_SEARCH.sub(lambda m: '"search":"' + _absolute(m[1], page) + '"', html)
    return html


def build(out: pathlib.Path, releases: dict | None, shots: dict | None, strict: bool = True) -> list[pathlib.Path]:
    """Build the guide into `out`. Returns the pages written."""
    channel, values = render.values(releases or {}, shots)
    header, footer = chrome((PUBLIC / "index.html").read_text(), channel, values)
    partials = GUIDE / "overrides/partials"
    partials.mkdir(parents=True, exist_ok=True)
    (partials / "site-header.html").write_text(header + "\n")
    (partials / "site-footer.html").write_text(footer + "\n")

    shutil.rmtree(STAGE, ignore_errors=True)
    cmd = [sys.executable, "-m", "zensical", "build", "-f", str(GUIDE / "zensical.toml")] + (["--strict"] if strict else [])
    subprocess.run(cmd, check=True, cwd=GUIDE)
    if out.exists():
        shutil.rmtree(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(STAGE, out)

    (out / "404.html").unlink(missing_ok=True)  # the site has its own
    pages = sorted(out.rglob("*.html"))
    for path in pages:
        page = BASE + path.relative_to(out).as_posix()
        path.write_text(absolute(path.read_text(), page))
    return pages


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--releases", default=str(PUBLIC / "_site/releases.json"))
    ap.add_argument("--shots", default=str(PUBLIC / "_site/shots/shots.json"))
    ap.add_argument("--out", default=str(PUBLIC / "userguide"))
    ap.add_argument("--no-strict", action="store_true", help="let Zensical warnings pass")
    args = ap.parse_args()
    releases_path, shots_path = pathlib.Path(args.releases), pathlib.Path(args.shots)
    releases = json.loads(releases_path.read_text()) if releases_path.exists() else None
    shots = json.loads(shots_path.read_text()) if shots_path.exists() else None
    pages = build(pathlib.Path(args.out), releases, shots, strict=not args.no_strict)
    print(f"built {len(pages)} guide pages into {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
