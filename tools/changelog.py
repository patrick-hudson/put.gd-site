#!/usr/bin/env python3
"""Build the static changelog from GitHub Releases (no browser-side API calls).

Install tools/requirements-changelog.txt, then run tools/changelog.py. In CI, pass
--releases the snapshot written by releases.py --listing-out so the page and KVS
use the same listing. --standalone writes a single-file, offline review draft.
Deploy public/changelog.html to the S3 key `changelog` as text/html: the existing
app.put.gd default behavior already serves that key without a routing change.
"""
import argparse
import base64
import datetime as dt
import json
import pathlib
import re
from string import Template
from urllib.parse import urljoin

from markdown_it import MarkdownIt
import nh3

from releases import REPO, fetch_releases

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
CALVER = re.compile(r"v\d{2}\.\d{3,4}\.\d+")
NIGHTLY = re.compile(r"v\d{2}\.\d{3,4}\.\d+-nightly")
NIGHTLY_LIMIT = 5
RELEASES_URL = f"https://github.com/{REPO}/releases"
MARKDOWN = MarkdownIt("js-default").enable(["table", "strikethrough"])


def notes(body):
    """Disable raw HTML, then sanitize to a small prose-only HTML allowlist.

    Images become their alt text; release notes cannot embed remote resources,
    scripts, styles, event handlers, arbitrary IDs, or executable URL schemes.
    """
    tokens = MARKDOWN.parse(body or "No release notes were provided.")
    for token in tokens:
        if token.type in {"heading_open", "heading_close"}:
            # The page owns h1/h2; release-note headings start at h3.
            token.tag = f"h{min(max(int(token.tag[1:]) + 1, 3), 6)}"
        for child in token.children or []:
            if child.type == "link_open":
                child.attrSet("href", urljoin(f"https://github.com/{REPO}/", child.attrGet("href")))
            if child.type == "image":
                child.type = "text"
                child.content = child.content or "Image"
    rendered = MARKDOWN.renderer.render(tokens, MARKDOWN.options, {})
    return nh3.clean(
        rendered,
        tags={"p", "a", "h3", "h4", "h5", "h6", "ul", "ol", "li", "strong",
              "em", "s", "blockquote", "pre", "code", "hr", "br", "table",
              "thead", "tbody", "tr", "th", "td"},
        attributes={"a": {"href", "title"}, "ol": {"start"}},
        url_schemes={"https", "http", "mailto"},
    )


def select(listing):
    published = sorted(
        (r for r in listing if not r.get("draft") and r.get("published_at")),
        key=lambda r: r["published_at"], reverse=True,
    )
    stable = [r for r in published if CALVER.fullmatch(r["tag_name"]) and not r["prerelease"]]
    nightly = [r for r in published if NIGHTLY.fullmatch(r["tag_name"]) and r["prerelease"]]
    return stable, nightly[:NIGHTLY_LIMIT]


def release_url(release):
    # Construct from the validated tag, rather than interpolating an API URL.
    return f"{RELEASES_URL}/tag/{release['tag_name']}"


def date(release):
    value = dt.datetime.fromisoformat(release["published_at"].replace("Z", "+00:00")).date()
    return f'<time datetime="{value.isoformat()}">{value.day} {value:%b %Y}</time>'


def stable_entry(release, latest):
    tag = release["tag_name"]
    download = "https://app.put.gd/dl/stable" if latest else release_url(release)
    label = "Download latest stable" if latest else f"Download {tag[1:]}"
    return f'''<article class="release" id="{tag}" aria-labelledby="title-{tag}">
  <header class="release-heading">
    <div><p class="eyebrow">Stable release{' · Latest' if latest else ''}</p>
    <h2 id="title-{tag}"><a href="/changelog#{tag}" aria-label="Permalink to {tag}">{tag[1:]} <span aria-hidden="true">↗</span></a></h2></div>
    {date(release)}
  </header>
  <div class="release-notes">{notes(release.get('body'))}</div>
  <p class="release-links"><a class="download" href="{download}">{label} ↗</a>
    <a href="{release_url(release)}">View on GitHub</a></p>
</article>'''


def nightly_entry(release):
    tag = release["tag_name"]
    return f'''<li id="{tag}"><a class="nightly-version" href="{release_url(release)}">{tag[1:]} <span aria-hidden="true">↗</span></a>
    {date(release)}<a class="permalink" href="/changelog#{tag}" aria-label="Permalink to {tag}">#</a></li>'''


def build(listing):
    stable, nightly = select(listing)
    entries = "\n".join(stable_entry(r, i == 0) for i, r in enumerate(stable))
    if not stable:
        entries = '''<div class="empty"><p class="eyebrow">Stable releases</p>
<h2>The first stable release is on its way.</h2>
<p>Its release notes will appear here when it is published. For now, explore the nightly builds below.</p></div>'''
    nightlies = ('<ul class="nightly-list">' + "\n".join(map(nightly_entry, nightly)) + "</ul>"
                 if nightly else '<p class="empty-nightly">No nightly builds are published yet.</p>')
    template = Template((ROOT / "tools/changelog.html").read_text())
    return template.substitute(stable=entries, nightly=nightlies)


def standalone(page):
    """Inline only our trusted local stylesheet, fonts and logo for file:// review."""
    css = (PUBLIC / "_site/changelog.css").read_text()

    def font(match):
        data = base64.b64encode((PUBLIC / match[1].lstrip("/")).read_bytes()).decode("ascii")
        return f'url("data:font/woff2;base64,{data}")'

    css = re.sub(r'url\("(/_site/fonts/[^"?]+)(?:\?[^" ]*)?"\)', font, css)
    page = page.replace('<link rel="stylesheet" href="/_site/changelog.css">', f"<style>{css}</style>")
    logo = base64.b64encode((PUBLIC / "_site/logo.svg").read_bytes()).decode("ascii")
    page = page.replace('/_site/logo.svg', f"data:image/svg+xml;base64,{logo}")
    return page.replace('href="/changelog#', 'href="#')


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--releases", type=pathlib.Path, help="GitHub API listing JSON; otherwise fetch all pages")
    parser.add_argument("--out", type=pathlib.Path, default=PUBLIC / "changelog.html")
    parser.add_argument("--standalone", type=pathlib.Path, help="also write a self-contained local draft")
    args = parser.parse_args()
    listing = json.loads(args.releases.read_text()) if args.releases else fetch_releases()
    page = build(listing)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(page)
    if args.standalone:
        args.standalone.parent.mkdir(parents=True, exist_ok=True)
        args.standalone.write_text(standalone(page))
    stable, nightly = select(listing)
    print(f"changelog: {len(stable)} stable releases, {len(nightly)} nightlies -> {args.out}")


if __name__ == "__main__":
    main()
