#!/usr/bin/env python3
"""Offline tests for releases.py (update feed v1, put.gd-desktop #293) and update-kvs.py.

Run: python3 -m unittest discover -s tools
"""
import datetime as dt
import importlib.util
import pathlib
import sys
import unittest

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import releases  # noqa: E402

spec = importlib.util.spec_from_file_location("update_kvs", HERE / "update-kvs.py")
update_kvs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(update_kvs)

NOW = dt.datetime(2026, 10, 20, 18, 32, 24, tzinfo=dt.timezone.utc)
DL = "https://github.com/patrick-hudson/put.gd-desktop/releases/download"
PACKAGES = ["ubuntu24.04-x86_64.deb", "ubuntu26.04-x86_64.deb", "debian13-x86_64.deb", "fedora44-x86_64.rpm", "x86_64.AppImage"]


def release(tag, published, prerelease=True, draft=False, extra=(), sums=True):
    version = tag[1:]
    names = [f"putgd-{version}-{p}" for p in PACKAGES] + [f"putgd-{version}-source.tar.gz", "release-builds.json", *extra]
    if sums:
        names.append("SHA256SUMS")
    return {
        "tag_name": tag,
        "name": f"put.gd {version}",
        "draft": draft,
        "prerelease": prerelease,
        "published_at": published,
        "html_url": f"https://github.com/patrick-hudson/put.gd-desktop/releases/tag/{tag}",
        "assets": [{"name": n, "size": 1000 + i, "browser_download_url": f"{DL}/{tag}/{n}"} for i, n in enumerate(names)],
    }


def sums_for(rel):
    return "".join(f"{i:064x}  {a['name']}\n" for i, a in enumerate(rel["assets"]) if a["name"] != "SHA256SUMS")


TODAY = [
    release("v0.1.1-rc.1", "2026-10-18T03:26:23Z", draft=True),
    release("v0.1.1-dev.309.20261018030128+gcb26dc713228", "2026-10-18T03:31:49Z"),
    release("v0.1.1-nightly.428", "2026-10-19T06:44:04Z"),
    release("v0.1.1-nightly.588", "2026-10-20T05:55:50Z"),
]


def text_from(listing):
    by_url = {a["browser_download_url"]: sums_for(r) for r in listing for a in r["assets"] if a["name"] == "SHA256SUMS"}
    return lambda url: by_url[url]


class FeedTest(unittest.TestCase):
    def build(self, listing, get_text=None):
        data, feeds = releases.build(listing, get_text or text_from(listing), NOW)
        for doc in feeds.values():
            releases.check_feed(doc)
        return data, feeds

    def test_stable_is_null_without_a_stable_release(self):
        _, feeds = self.build(TODAY)
        self.assertEqual(feeds["stable"], {"schema": 1, "channel": "stable", "generatedAt": "2026-10-20T18:32:24Z", "release": None})

    def test_nightly_follows_the_contract(self):
        _, feeds = self.build(TODAY)
        rel = feeds["nightly"]["release"]
        self.assertEqual(rel["tag"], "v0.1.1-nightly.588")
        self.assertEqual(rel["version"], "0.1.1-nightly.588")
        self.assertEqual(rel["publishedAt"], "2026-10-20T05:55:50Z")
        self.assertEqual(rel["notesUrl"], "https://github.com/patrick-hudson/put.gd-desktop/releases/tag/v0.1.1-nightly.588")
        self.assertEqual(list(rel["assets"]), ["ubuntu24.04", "ubuntu26.04", "debian13", "fedora44", "appimage"])
        appimage = rel["assets"]["appimage"]
        self.assertEqual(appimage, {
            "name": "putgd-0.1.1-nightly.588-x86_64.AppImage",
            "url": f"{DL}/v0.1.1-nightly.588/putgd-0.1.1-nightly.588-x86_64.AppImage",
            "size": 1004,
            "sha256": f"{4:064x}",
        })
        for asset in rel["assets"].values():
            self.assertEqual(set(asset), {"name", "url", "size", "sha256"})

    def test_newest_stable_is_picked_and_drafts_ignored(self):
        listing = TODAY + [release("v0.1.1", "2026-10-21T00:00:00Z", prerelease=False), release("v0.1.2", "2026-10-22T00:00:00Z", prerelease=False, draft=True)]
        _, feeds = self.build(listing)
        self.assertEqual(feeds["stable"]["release"]["version"], "0.1.1")
        self.assertEqual(feeds["nightly"]["release"]["version"], "0.1.1-nightly.588")

    def test_unreadable_sums_omit_sha256(self):
        def fail(url):
            raise OSError("HTTP Error 502")
        _, feeds = self.build(TODAY, fail)
        for asset in feeds["nightly"]["release"]["assets"].values():
            self.assertEqual(set(asset), {"name", "url", "size"})

    def test_missing_sums_asset_omits_sha256(self):
        listing = [release("v0.1.1-nightly.600", "2026-10-21T05:00:00Z", sums=False)]
        _, feeds = self.build(listing, lambda url: self.fail("nothing to fetch"))
        self.assertNotIn("sha256", feeds["nightly"]["release"]["assets"]["debian13"])

    def test_zsync_only_when_the_release_ships_one(self):
        _, feeds = self.build(TODAY)
        self.assertNotIn("zsync", feeds["nightly"]["release"]["assets"]["appimage"])
        listing = TODAY + [release("v0.1.1-nightly.700", "2026-10-22T05:00:00Z", extra=["putgd-0.1.1-nightly.700-x86_64.AppImage.zsync"])]
        data, feeds = self.build(listing)
        assets = feeds["nightly"]["release"]["assets"]
        self.assertEqual(assets["appimage"]["zsync"], "https://app.put.gd/dl/nightly/appimage.zsync")
        self.assertEqual(assets["appimage"]["name"], "putgd-0.1.1-nightly.700-x86_64.AppImage")
        self.assertNotIn("zsync", assets["debian13"])

    def test_check_feed_rejects_contract_breaks(self):
        _, feeds = self.build(TODAY)
        bad = {**feeds["nightly"], "schema": 2}
        self.assertRaises(ValueError, releases.check_feed, bad)
        rel = feeds["nightly"]["release"]
        bad = {**feeds["nightly"], "release": {**rel, "assets": {**rel["assets"], "debian13": {**rel["assets"]["debian13"], "zsync": "x"}}}}
        self.assertRaises(ValueError, releases.check_feed, bad)


class PermalinkTest(unittest.TestCase):
    def test_zsync_permalink_is_not_a_redirect(self):
        # The signer serves dl/<channel>/appimage.zsync from the pkg bucket (#293 phase 3).
        listing = TODAY + [release("v0.1.1-nightly.700", "2026-10-22T05:00:00Z", extra=["putgd-0.1.1-nightly.700-x86_64.AppImage.zsync"])]
        data, _ = releases.build(listing, text_from(listing), NOW)
        keys = update_kvs.wanted(data)
        self.assertNotIn("nightly/appimage.zsync", keys)
        self.assertFalse(any(k.startswith("stable/") for k in keys))
        self.assertEqual(keys["nightly/appimage"], f"{DL}/v0.1.1-nightly.700/putgd-0.1.1-nightly.700-x86_64.AppImage")

if __name__ == "__main__":
    unittest.main()
