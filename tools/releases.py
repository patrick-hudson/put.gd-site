#!/usr/bin/env python3
"""Write public/_site/releases.json from the put.gd-desktop releases on GitHub.

Two channels:
  stable   the newest published release that is not a prerelease (GitHub's "Latest")
  nightly  the newest published prerelease whose tag contains "-nightly."

Each channel lists the package assets by the key the page uses in data-match
(ubuntu24.04, ubuntu26.04, debian13, fedora44, .AppImage) with the direct download
URL and size, so the page never has to ask the GitHub API itself.

Usage: tools/releases.py [--out public/_site/releases.json]
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


def fetch(url):
    req = urllib.request.Request(url, headers={"Accept": "application/vnd.github+json", "User-Agent": "put.gd-site"})
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


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
        "checksums": next((a["browser_download_url"] for a in release.get("assets", []) if a["name"] == "SHA256SUMS"), None),
        "assets": assets,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--out", default="public/_site/releases.json")
    args = parser.parse_args()

    releases = [r for r in fetch(f"https://api.github.com/repos/{REPO}/releases?per_page=40") if not r.get("draft")]
    releases.sort(key=lambda r: r["published_at"], reverse=True)
    stable = next((r for r in releases if not r["prerelease"]), None)
    nightly = next((r for r in releases if r["prerelease"] and "-nightly." in r["tag_name"]), None)

    data = {
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "repo": REPO,
        "stable": channel(stable),
        "nightly": channel(nightly),
    }
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w") as fh:
        json.dump(data, fh, indent=2)
        fh.write("\n")
    for name in ("stable", "nightly"):
        ch = data[name]
        print(f"{name}: {ch['tag'] + ' with ' + str(len(ch['assets'])) + ' packages' if ch else 'none'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
