#!/usr/bin/env python3
"""Offline tests for releases.py (update feed v1, put.gd-desktop #293) and update-kvs.py.

Run: python3 -m unittest discover -s tools
"""
import datetime as dt
import importlib.util
import json
import pathlib
import sys
import tempfile
import unittest
from unittest.mock import patch

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
    release("v26.1019.428-nightly", "2026-10-19T06:44:04Z"),
    release("v26.1020.588-nightly", "2026-10-20T05:55:50Z"),
]


def text_from(listing):
    by_url = {a["browser_download_url"]: sums_for(r) for r in listing for a in r["assets"] if a["name"] == "SHA256SUMS"}
    return lambda url: by_url[url]


class FeedTest(unittest.TestCase):
    def test_published_listing_is_unchanged_when_only_run_time_changes(self):
        first, _ = releases.build(TODAY, text_from(TODAY), NOW)
        later, _ = releases.build(TODAY, text_from(TODAY), NOW + dt.timedelta(days=1))
        self.assertEqual(first, later)
        self.assertEqual(first['generated_at'], '2026-10-20T05:55:50Z')

    def test_source_only_releases_never_become_download_channels(self):
        listing = TODAY + [release("proton-sources-0.22.2", "2026-10-31T17:30:48Z", prerelease=False),
                           release("sources-v26.1031.3384-nightly-files", "2026-10-31T06:43:34Z")]
        data, _ = self.build(listing)
        self.assertIsNone(data["stable"])
        self.assertEqual(data["nightly"]["tag"], "v26.1020.588-nightly")

    def test_listing_paginates_to_older_stable_releases(self):
        urls = []
        old = release("v26.1020.600", "2026-10-20T06:00:00Z", prerelease=False)

        def fetch_page(url):
            urls.append(url)
            return [TODAY[-1]] * 100 if len(urls) == 1 else [old]

        listing = releases.fetch_releases(fetch_page)
        self.assertEqual(len(listing), 101)
        self.assertTrue(urls[0].endswith("per_page=100&page=1"))
        self.assertTrue(urls[1].endswith("per_page=100&page=2"))
        self.assertEqual(releases.pick(listing)[0], old)

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
        self.assertEqual(rel["tag"], "v26.1020.588-nightly")
        self.assertEqual(rel["version"], "26.1020.588-nightly")
        self.assertEqual(rel["publishedAt"], "2026-10-20T05:55:50Z")
        self.assertEqual(rel["notesUrl"], "https://github.com/patrick-hudson/put.gd-desktop/releases/tag/v26.1020.588-nightly")
        self.assertEqual(list(rel["assets"]), ["ubuntu24.04", "ubuntu26.04", "debian13", "fedora44", "appimage"])
        appimage = rel["assets"]["appimage"]
        self.assertEqual(appimage, {
            "name": "putgd-26.1020.588-nightly-x86_64.AppImage",
            "url": f"{DL}/v26.1020.588-nightly/putgd-26.1020.588-nightly-x86_64.AppImage",
            "size": 1004,
            "sha256": f"{4:064x}",
        })
        for asset in rel["assets"].values():
            self.assertEqual(set(asset), {"name", "url", "size", "sha256"})

    def test_newest_stable_is_picked_and_drafts_ignored(self):
        listing = TODAY + [release("v26.1021.600", "2026-10-21T00:00:00Z", prerelease=False), release("v26.1022.610", "2026-10-22T00:00:00Z", prerelease=False, draft=True)]
        _, feeds = self.build(listing)
        self.assertEqual(feeds["stable"]["release"]["version"], "26.1021.600")
        self.assertEqual(feeds["nightly"]["release"]["version"], "26.1020.588-nightly")

    def test_newer_calendar_versions_are_selected(self):
        # put.gd-desktop #373: nightlies are tagged vYY.MDD.N-nightly, stable releases vYY.MDD.N.
        listing = TODAY + [release("v26.1022.942-nightly", "2026-10-22T05:30:00Z")]
        _, feeds = self.build(listing)
        rel = feeds["nightly"]["release"]
        self.assertEqual((rel["tag"], rel["version"]), ("v26.1022.942-nightly", "26.1022.942-nightly"))
        self.assertEqual(rel["assets"]["appimage"]["name"], "putgd-26.1022.942-nightly-x86_64.AppImage")
        self.assertIsNone(feeds["stable"]["release"])
        listing += [release("v26.1101.960", "2026-11-02T00:00:00Z", prerelease=False)]
        _, feeds = self.build(listing)
        self.assertEqual(feeds["stable"]["release"]["version"], "26.1101.960")
        self.assertEqual(feeds["nightly"]["release"]["version"], "26.1022.942-nightly")

    def test_unreadable_sums_omit_sha256(self):
        def fail(url):
            raise OSError("HTTP Error 502")
        _, feeds = self.build(TODAY, fail)
        for asset in feeds["nightly"]["release"]["assets"].values():
            self.assertEqual(set(asset), {"name", "url", "size"})

    def test_missing_sums_asset_omits_sha256(self):
        listing = [release("v26.1021.600-nightly", "2026-10-21T05:00:00Z", sums=False)]
        _, feeds = self.build(listing, lambda url: self.fail("nothing to fetch"))
        self.assertNotIn("sha256", feeds["nightly"]["release"]["assets"]["debian13"])

    def test_zsync_only_when_the_release_ships_one(self):
        _, feeds = self.build(TODAY)
        self.assertNotIn("zsync", feeds["nightly"]["release"]["assets"]["appimage"])
        listing = TODAY + [release("v26.1022.700-nightly", "2026-10-22T05:00:00Z", extra=["putgd-26.1022.700-nightly-x86_64.AppImage.zsync"])]
        data, feeds = self.build(listing)
        assets = feeds["nightly"]["release"]["assets"]
        self.assertEqual(assets["appimage"]["zsync"], "https://app.put.gd/dl/nightly/appimage.zsync")
        self.assertEqual(assets["appimage"]["name"], "putgd-26.1022.700-nightly-x86_64.AppImage")
        self.assertNotIn("zsync", assets["debian13"])

    def test_check_feed_rejects_contract_breaks(self):
        _, feeds = self.build(TODAY)
        bad = {**feeds["nightly"], "schema": 2}
        self.assertRaises(ValueError, releases.check_feed, bad)
        rel = feeds["nightly"]["release"]
        bad = {**feeds["nightly"], "release": {**rel, "assets": {**rel["assets"], "debian13": {**rel["assets"]["debian13"], "zsync": "x"}}}}
        self.assertRaises(ValueError, releases.check_feed, bad)


class PermalinkTest(unittest.TestCase):
    def test_source_releases_never_steal_channels_and_stable_links_require_stable(self):
        listing = TODAY + [release("proton-sources-0.22.2-crypto2.0.1-bun1.4.4", "2026-10-31T17:30:48Z", prerelease=False),
                           release("sources-v26.1031.3384-nightly-files", "2026-10-31T06:43:34Z", prerelease=False),
                           release("other-nightly", "2026-10-31T18:00:00Z"),
                           release("v0.1.1", "2026-10-31T18:00:00Z", prerelease=False)]
        data, feeds = releases.build(listing, text_from(listing), NOW)
        self.assertIsNone(data["stable"])
        self.assertIsNone(feeds["stable"]["release"])
        self.assertEqual(data["nightly"]["tag"], "v26.1020.588-nightly")
        keys = update_kvs.wanted(data)
        self.assertFalse(any(key.startswith("stable/") for key in keys))
        self.assertEqual(len(keys), 7)
        for package in (*update_kvs.PACKAGES, "release", "checksums"):
            self.assertIn(f"nightly/{package}", keys)

        listing.append(release("v26.1031.3400", "2026-10-31T19:00:00Z", prerelease=False))
        data, _ = releases.build(listing, text_from(listing), NOW)
        keys = update_kvs.wanted(data)
        self.assertIn("/v26.1031.3400/", keys["stable/appimage"])
        self.assertIn("/v26.1020.588-nightly/", keys["nightly/appimage"])

    def test_no_releases_leaves_no_download_targets(self):
        self.assertEqual(update_kvs.wanted({"stable": None, "nightly": None}), {})

    def test_sync_deletes_preexisting_stable_aliases_without_a_stable_release(self):
        data, _ = releases.build(TODAY, text_from(TODAY), NOW)
        target = update_kvs.wanted(data)
        current = {**target, **{key.replace("nightly/", "stable/"): url for key, url in target.items()}}
        with tempfile.TemporaryDirectory() as directory:
            path = pathlib.Path(directory) / "releases.json"
            path.write_text(json.dumps(data))
            with patch.object(sys, "argv", ["update-kvs.py", "--kvs-arn", "fixture", "--releases", str(path)]), \
                 patch.object(update_kvs, "cli", side_effect=[
                     {"Items": [{"Key": key, "Value": url} for key, url in current.items()]},
                     {"ETag": "fixture-etag"}, {},
                 ]) as cli:
                self.assertEqual(update_kvs.main(), 0)
        command = cli.call_args.args
        deleted = json.loads(command[command.index("--deletes") + 1])
        self.assertEqual({item["Key"] for item in deleted}, {key for key in current if key.startswith("stable/")})
        self.assertNotIn("--puts", command)

    def test_zsync_permalink_is_not_a_redirect(self):
        # The signer serves dl/<channel>/appimage.zsync from the pkg bucket (#293 phase 3).
        listing = TODAY + [release("v26.1022.700-nightly", "2026-10-22T05:00:00Z", extra=["putgd-26.1022.700-nightly-x86_64.AppImage.zsync"])]
        data, _ = releases.build(listing, text_from(listing), NOW)
        keys = update_kvs.wanted(data)
        self.assertNotIn("nightly/appimage.zsync", keys)
        self.assertNotIn("stable/appimage.zsync", keys)
        self.assertEqual(keys["nightly/appimage"], f"{DL}/v26.1022.700-nightly/putgd-26.1022.700-nightly-x86_64.AppImage")

if __name__ == "__main__":
    unittest.main()
