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

from releases import REPO, channel, fetch_releases, pick
import render

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
CALVER = re.compile(r"v\d{2}\.\d{3,4}\.\d+")
NIGHTLY = re.compile(r"v\d{2}\.\d{3,4}\.\d+-nightly")
NIGHTLY_LIMIT = 5
RELEASES_URL = f"https://github.com/{REPO}/releases"
MARKDOWN = MarkdownIt("js-default").enable(["table", "strikethrough"])
BOILERPLATE = re.compile(
    r"^(?:Downloads:|Full comparison:|This is the first release of its kind|"
    r"AppImage (?:bundles|dynamically)|DEB/RPM use distro Qt|"
    r"(?:Unchanged )?Proton (?:dependency|corresponding) source|Debug symbols|The debug tar|"
    r"Individual DEBs|Automated coverage:|Built(?:, tested)? and packaged by|"
    r"Channel/source and automated producer evidence:)", re.I,
)


def changes(body):
    """Read the explicit changes section, falling back to old boilerplate boundaries.

    Markdown block positions keep headings and paragraphs inside fenced code or
    nested lists from accidentally cutting off genuine release changes.
    """
    if not body:
        return "No release notes were provided."
    lines = body.splitlines(keepends=True)
    tokens = MARKDOWN.parse(body)
    start = 0
    headings = [(t, tokens[i + 1].content) for i, t in enumerate(tokens)
                if t.type == "heading_open" and t.tag == "h2" and t.level == 0]
    explicit = next((t for t, title in headings if title.replace("’", "'").lower() == "what's changed"), None)
    legacy = next((t for t, title in headings if re.match(r"Changes (?:since|in)\b", title)), None)
    if explicit or legacy:
        start = (explicit or legacy).map[1]
    elif re.match(r"^(?:Nightly|Stable) .*(?:from commit|release of commit)", lines[0]):
        start = next((i for i, line in enumerate(lines) if not line.strip()), len(lines))
    text = "".join(lines[start:])
    tokens = MARKDOWN.parse(text)
    for i, token in enumerate(tokens):
        if token.level != 0:
            continue
        if token.type == "heading_open" and token.tag == "h2" and tokens[i + 1].content.lower() == "downloads and sources":
            return "".join(text.splitlines(keepends=True)[:token.map[0]]).strip()
        if explicit is None and token.type == "paragraph_open" and BOILERPLATE.match(tokens[i + 1].content):
            return "".join(text.splitlines(keepends=True)[:token.map[0]]).strip()
    return text.strip()


def notes(body):
    """Disable raw HTML, then sanitize to a small prose-only HTML allowlist.

    Images become their alt text; release notes cannot embed remote resources,
    scripts, styles, event handlers, arbitrary IDs, or executable URL schemes.
    """
    tokens = MARKDOWN.parse(changes(body) or "No changes were listed.")
    for token in tokens:
        if token.type in {"heading_open", "heading_close"}:
            # The page owns h1/h2; release-note headings start at h3.
            token.tag = f"h{max(int(token.tag[1:]), 3)}"
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
    return f'''<article class="pkg changelog-release" id="{tag}" aria-labelledby="title-{tag}">
  <h2 id="title-{tag}"><a href="/changelog#{tag}" aria-label="Permalink to {tag}">{tag[1:]}</a></h2>
  <p class="status">{date(release)} · Stable{' · Latest' if latest else ''}</p>
  <div class="changelog-notes">{notes(release.get('body'))}</div>
  <p class="get"><a class="btn btn-primary" href="{release_url(release)}">Downloads, checksums and sources →</a></p>
</article>'''


def nightly_entry(release):
    tag = release["tag_name"]
    return f'''<li id="{tag}"><a class="file" href="{release_url(release)}">{tag[1:]}</a>
    <span class="meta">{date(release)}</span><a class="permalink" href="/changelog#{tag}" aria-label="Permalink to {tag}">#</a></li>'''


def build(listing):
    stable, nightly = select(listing)
    entries = "\n".join(stable_entry(r, i == 0) for i, r in enumerate(stable))
    if not stable:
        entries = '''<div class="pkg"><h2>Stable releases</h2>
<p class="install-line">The first stable release is on its way. Its release notes will appear here when it is published.</p></div>'''
    nightlies = ('<div class="pkg"><ul class="changelog-nightlies">' + "\n".join(map(nightly_entry, nightly)) + "</ul></div>"
                 if nightly else '<p class="install-line">No nightly builds are published yet.</p>')
    # Share the homepage chrome itself, so future navigation/footer edits carry over.
    home = (PUBLIC / "index.html").read_text()
    header = re.search(r'<header class="top">.*?</header>', home, re.S)[0]
    header = header.replace('href="#install"', 'href="https://app.put.gd/#install"')
    footer = re.search(r'<footer class="foot">.*?</footer>', home, re.S)[0]
    stable_release, nightly_release = pick(listing)
    shots = json.loads((PUBLIC / "_site/shots/shots.json").read_text())
    name, values = render.values({"stable": channel(stable_release), "nightly": channel(nightly_release)}, shots)
    footer = render.render(footer, name, values)
    template = Template((ROOT / "tools/changelog.html").read_text())
    return template.substitute(header=header, footer=footer, stable=entries, nightly=nightlies)


def standalone(page):
    """Inline only our trusted local stylesheet, fonts and logo for file:// review."""
    def font(match):
        data = base64.b64encode((PUBLIC / match[1].lstrip("/")).read_bytes()).decode("ascii")
        return f'url("data:font/woff2;base64,{data}")'

    for name in ("tokens.css", "site.css"):
        css = (PUBLIC / "_site" / name).read_text()
        css = re.sub(r'url\("(/_site/fonts/[^"?]+)(?:\?[^" ]*)?"\)', font, css)
        page = page.replace(f'<link rel="stylesheet" href="/_site/{name}">', f"<style>{css}</style>")
    logo = base64.b64encode((PUBLIC / "_site/logo.svg").read_bytes()).decode("ascii")
    page = page.replace('/_site/logo.svg', f"data:image/svg+xml;base64,{logo}")
    return page.replace('href="/changelog#', 'href="#').replace('href="/"', 'href="https://app.put.gd/"')


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
