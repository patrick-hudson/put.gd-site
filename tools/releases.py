#!/usr/bin/env python3
"""Write public/_site/releases.json and the update feeds from the put.gd-desktop releases on GitHub.

Two channels:
  stable   the newest published vYY.MDD.N non-prerelease
  nightly  the newest published vYY.MDD.N-nightly prerelease

releases.json lists each channel's package assets by the key the page uses in data-match
(ubuntu24.04, ubuntu26.04, debian13, fedora44, .AppImage) with the direct download URL and
size, so the page never has to ask the GitHub API itself. It is internal to the site.

The update feeds (public/update/v1/<channel>.json) are the versioned contract the app reads,
defined in put.gd-desktop issue #293 ("Update feed (contract v1)"). "release" is null while a
channel has none; "sha256" comes from the release's SHA256SUMS and is omitted when that can't be
read; the AppImage carries "zsync" only once the release ships an .AppImage.zsync.

Usage: tools/releases.py [--out public/_site/releases.json] [--feed-dir public/update/v1]
Reads GITHUB_TOKEN or GH_TOKEN when set, which lifts the anonymous rate limit.
"""
import argparse
import datetime as dt
import json
import os
import re
import sys
import urllib.request

REPO = "patrick-hudson/put.gd-desktop"
KEYS = ["ubuntu24.04", "ubuntu26.04", "debian13", "fedora44", ".AppImage"]
PACKAGE = re.compile(r"\.(deb|rpm|AppImage)$")
STABLE = re.compile(r"v[0-9]{2}\.[0-9]{3,4}\.[0-9]+")
NIGHTLY = re.compile(r"v[0-9]{2}\.[0-9]{3,4}\.[0-9]+-nightly")
CHANNELS = ("stable", "nightly")
FEED_SCHEMA = 1
# Feed asset key for each releases.json key.
FEED_KEYS = {"ubuntu24.04": "ubuntu24.04", "ubuntu26.04": "ubuntu26.04", "debian13": "debian13", "fedora44": "fedora44", ".AppImage": "appimage"}
ZSYNC_PERMALINK = "https://app.put.gd/dl/{channel}/appimage.zsync"
SHA256_LINE = re.compile(r"^([0-9a-fA-F]{64}) [ *](.+)$")


def fetch(url):
    req = urllib.request.Request(url, headers={"Accept": "application/vnd.github+json", "User-Agent": "put.gd-site"})
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def fetch_text(url):
    # Release downloads redirect to a signed storage URL; send no token along.
    req = urllib.request.Request(url, headers={"User-Agent": "put.gd-site"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8")


def fetch_releases(get=fetch):
    """Read the complete listing, including stable releases beyond the first page."""
    listing = []
    page = 1
    while True:
        batch = get(f"https://api.github.com/repos/{REPO}/releases?per_page=100&page={page}")
        listing.extend(batch)
        if len(batch) < 100:
            return listing
        page += 1


def pick(releases):
    """Return (stable, nightly) from a GitHub releases listing."""
    releases = sorted((r for r in releases if not r.get("draft")), key=lambda r: r["published_at"], reverse=True)
    stable = next((r for r in releases if not r["prerelease"] and STABLE.fullmatch(r["tag_name"])), None)
    nightly = next((r for r in releases if r["prerelease"] and NIGHTLY.fullmatch(r["tag_name"])), None)
    return stable, nightly


def asset_url(release, predicate):
    return next((a["browser_download_url"] for a in release.get("assets", []) if predicate(a["name"])), None)


def channel(release):
    if release is None:
        return None
    assets = {}
    for asset in release.get("assets", []):
        name = asset["name"]
        if not PACKAGE.search(name):
            continue
        for key in KEYS:
            if key in name and key not in assets:
                assets[key] = {"name": name, "url": asset["browser_download_url"], "size": asset["size"]}
    return {
        "tag": release["tag_name"],
        "name": release.get("name") or release["tag_name"],
        "published_at": release["published_at"],
        "html_url": release["html_url"],
        "checksums": asset_url(release, lambda n: n == "SHA256SUMS"),
        "zsync": asset_url(release, lambda n: n.endswith(".AppImage.zsync")),
        "assets": assets,
    }


def parse_sums(text):
    """Map file name -> lowercase sha256 from SHA256SUMS text (sha256sum text or binary mode)."""
    sums = {}
    for line in text.splitlines():
        m = SHA256_LINE.match(line.strip())
        if m:
            sums[m.group(2)] = m.group(1).lower()
    return sums


def read_sums(ch, get_text):
    if not ch or not ch.get("checksums"):
        return {}
    try:
        return parse_sums(get_text(ch["checksums"]))
    except Exception as err:  # the feed still ships, without sha256
        print(f"warning: cannot read {ch['checksums']}: {err}", file=sys.stderr)
        return {}


def feed(name, ch, sums, generated_at):
    """The update feed v1 document for one channel (put.gd-desktop #293)."""
    release = None
    if ch:
        assets = {}
        for key, feed_key in FEED_KEYS.items():
            asset = ch["assets"].get(key)
            if not asset:
                continue
            entry = {"name": asset["name"], "url": asset["url"], "size": asset["size"]}
            if asset["name"] in sums:
                entry["sha256"] = sums[asset["name"]]
            if feed_key == "appimage" and ch.get("zsync"):
                entry["zsync"] = ZSYNC_PERMALINK.format(channel=name)
            assets[feed_key] = entry
        release = {
            "tag": ch["tag"],
            "version": ch["tag"].removeprefix("v"),
            "publishedAt": ch["published_at"],
            "notesUrl": ch["html_url"],
            "assets": assets,
        }
    return {"schema": FEED_SCHEMA, "channel": name, "generatedAt": generated_at, "release": release}


def check_feed(doc):
    """Raise ValueError unless doc follows feed contract v1, so a broken feed never deploys."""
    def need(ok, what):
        if not ok:
            raise ValueError(f"{doc.get('channel')} feed: {what}")

    need(set(doc) == {"schema", "channel", "generatedAt", "release"}, f"top-level keys {sorted(doc)}")
    need(doc["schema"] == FEED_SCHEMA, "schema is not 1")
    need(doc["channel"] in CHANNELS, "unknown channel")
    need(re.fullmatch(r"\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ", doc["generatedAt"]), "generatedAt is not UTC ISO 8601")
    rel = doc["release"]
    if rel is None:
        return
    need(set(rel) == {"tag", "version", "publishedAt", "notesUrl", "assets"}, f"release keys {sorted(rel)}")
    need(rel["version"] == rel["tag"].removeprefix("v"), "version is not the tag without its v")
    need(rel["notesUrl"].startswith("https://"), "notesUrl is not https")
    need(set(rel["assets"]) <= set(FEED_KEYS.values()), f"asset keys {sorted(rel['assets'])}")
    for key, asset in rel["assets"].items():
        allowed = {"name", "url", "size", "sha256"} | ({"zsync"} if key == "appimage" else set())
        need({"name", "url", "size"} <= set(asset) <= allowed, f"{key} keys {sorted(asset)}")
        need(isinstance(asset["size"], int) and asset["size"] > 0, f"{key} size")
        need(asset["url"].startswith("https://"), f"{key} url is not https")
        need("sha256" not in asset or re.fullmatch(r"[0-9a-f]{64}", asset["sha256"]), f"{key} sha256")
        need("zsync" not in asset or asset["zsync"] == ZSYNC_PERMALINK.format(channel=doc["channel"]), f"{key} zsync")


def build(releases, get_text, now):
    """Return (releases.json data, {channel: feed}) for a GitHub releases listing."""
    stable, nightly = pick(releases)
    data = {
        # This file is published; wall-clock churn would invalidate an unchanged site.
        "generated_at": max((r["published_at"] for r in (stable, nightly) if r), default=None),
        "repo": REPO,
        "stable": channel(stable),
        "nightly": channel(nightly),
    }
    generated_at = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    feeds = {name: feed(name, data[name], read_sums(data[name], get_text), generated_at) for name in CHANNELS}
    return data, feeds


def write_json(path, data):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w") as fh:
        json.dump(data, fh, indent=2)
        fh.write("\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--out", default="public/_site/releases.json")
    parser.add_argument("--feed-dir", default="public/update/v1")
    parser.add_argument("--listing-out", help="also write the complete API listing for the changelog build")
    args = parser.parse_args()

    releases = fetch_releases()
    if args.listing_out:
        write_json(args.listing_out, releases)
    data, feeds = build(releases, fetch_text, dt.datetime.now(dt.timezone.utc))
    for doc in feeds.values():
        check_feed(doc)
    write_json(args.out, data)
    for name, doc in feeds.items():
        write_json(os.path.join(args.feed_dir, f"{name}.json"), doc)
    for name in CHANNELS:
        ch, rel = data[name], feeds[name]["release"]
        hashed = sum("sha256" in a for a in rel["assets"].values()) if rel else 0
        print(f"{name}: {ch['tag'] + ' with ' + str(len(ch['assets'])) + ' packages, ' + str(hashed) + ' with sha256' if ch else 'none'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
