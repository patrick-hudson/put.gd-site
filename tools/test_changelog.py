"""Changelog selection, Markdown security and offline draft regression tests."""
import unittest
import os
from html.parser import HTMLParser
from unittest.mock import patch

import changelog
from test_releases import release


def stable(tag="v26.1031.3384", published="2026-10-31T06:43:58Z", body="## Fixed\n\n- **Capture** works."):
    return dict(release(tag, published, prerelease=False), body=body)


class Elements(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.elements = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))


class Changelog(unittest.TestCase):
    def test_selection_excludes_sources_drafts_and_other_prereleases(self):
        listing = [stable(), stable("sources-v26.1031.3384-files"), stable("proton-sources-0.22.2"),
                   stable("v26.1031.3385-rc.1"), dict(stable("v26.1031.3386"), draft=True),
                   dict(stable("v26.1031.3387"), prerelease=True)]
        for n in range(10):
            listing.append(release(f"v26.1031.{n}-nightly", f"2026-10-31T0{n}:00:00Z"))
        releases, nightly = changelog.select(listing)
        self.assertEqual([r["tag_name"] for r in releases], ["v26.1031.3384"])
        self.assertEqual([r["tag_name"] for r in nightly], [f"v26.1031.{n}-nightly" for n in range(9, 4, -1)])

    def test_stable_changes_and_version_specific_release_links(self):
        listing = [stable("v26.1030.3203", "2026-10-30T19:45:03Z"), stable(),
                   release("v26.1031.3384-nightly", "2026-10-31T06:43:58Z")]
        page = changelog.build(listing)
        self.assertLess(page.index('id="v26.1031.3384"'), page.index('id="v26.1030.3203"'))
        self.assertLess(page.index('id="v26.1030.3203"'), page.index('id="nightly-builds"'))
        self.assertIn('<h3>Fixed</h3>', page)
        self.assertIn('<strong>Capture</strong>', page)
        self.assertIn('href="/changelog#v26.1031.3384"', page)
        for tag in ('v26.1030.3203', 'v26.1031.3384'):
            self.assertIn(f'href="{changelog.RELEASES_URL}/tag/{tag}">Downloads, checksums and sources →', page)
        self.assertIn('<time datetime="2026-10-31">31 Oct 2026</time>', page)

    def test_empty_stable_and_nightly_notes(self):
        r = dict(release("v26.1031.3384-nightly", "2026-10-31T06:43:58Z"), body="## What's changed\n\n- Better capture.\n\n## Downloads and sources\n\nDebug symbols boilerplate")
        page = changelog.build([r])
        self.assertIn("The first stable release is on its way.", page)
        self.assertIn("Better capture.", page)
        self.assertNotIn("Debug symbols boilerplate", page)
        self.assertIn('href="https://app.put.gd/dl/nightly/appimage"', page)
        self.assertIn('id="v26.1031.3384-nightly"', page)
        self.assertIn(f'href="{r["html_url"]}"', page)
        self.assertIn("No nightly builds are published yet.", changelog.build([]))

    def test_five_nightly_cards_render_newest_first_after_stable(self):
        listing = [dict(release(f"v26.1031.{n}-nightly", f"2026-10-31T0{n}:00:00Z"),
                        body=f"## What's changed\n\n- **Nightly change {n}**.\n\n## Downloads and sources\n\nDownloads: packages")
                   for n in range(7)]
        listing.append(stable())
        page = changelog.build(listing)
        self.assertIn('href="https://app.put.gd/dl/stable/appimage"', page)
        cards = [attrs for tag, attrs in Elements(page).elements if tag == 'article']
        self.assertEqual([card['id'] for card in cards], ['v26.1031.3384'] + [f'v26.1031.{n}-nightly' for n in range(6, 1, -1)])
        for n in range(2, 7):
            self.assertIn(f'<strong>Nightly change {n}</strong>', page)
        self.assertNotIn('Nightly change 0', page)
        self.assertNotIn('Nightly change 1', page)
        self.assertNotIn('Downloads: packages', page)
        self.assertEqual(page.count('Downloads, checksums and sources →'), 6)

    def test_markdown_prose_features(self):
        rendered = changelog.notes("# News\n\nA [link](https://example.com) and `code`.\n\n"
                                   "> Quote\n\n1. One\n2. Two\n\n```sh\necho safe\n```\n\n"
                                   "| A | B |\n| - | - |\n| 1 | 2 |\n\n~~Removed~~")
        tags = {tag for tag, _ in Elements(rendered).elements}
        self.assertTrue({"h3", "a", "code", "blockquote", "ol", "li", "pre", "table", "s"} <= tags)
        self.assertIn('href="https://example.com"', rendered)

    def test_hostile_markdown_has_no_active_content(self):
        body = '''<script>alert(1)</script><img src=x onerror=alert(2)>
<svg onload=alert(3)><a href="javascript:alert(4)">bad</a></svg>
<iframe src="https://example.com"></iframe><style>body{display:none}</style>

[a](javascript:alert%281%29) [b](data:text/html,boom) [c](vbscript:boom)
[d](java&#x73;cript:boom) [e](file:///etc/passwd)
![secret](https://example.com/tracker.png)
[relative](/patrick-hudson/put.gd-desktop/issues/1)

```html
<script>alert(5)</script>
```
'''
        rendered = changelog.notes(body)
        for tag, attrs in Elements(rendered).elements:
            self.assertNotIn(tag, {"script", "style", "svg", "img", "iframe", "object", "form", "input"})
            self.assertFalse(any(k.startswith("on") or k in {"style", "id", "src"} for k in attrs))
            if "href" in attrs:
                self.assertTrue(attrs["href"].startswith(("https://", "http://", "mailto:")))
        self.assertIn("&lt;script&gt;", rendered)
        self.assertIn("secret", rendered)
        self.assertNotIn("tracker.png", rendered)
        self.assertIn('href="https://github.com/patrick-hudson/put.gd-desktop/issues/1"', rendered)

    def test_missing_notes_and_deterministic_output(self):
        self.assertIn("No release notes were provided.", changelog.build([stable(body=None)]))
        self.assertEqual(changelog.build([stable()]), changelog.build([stable()]))

    def test_historical_titles_respect_existing_site_wording_guard(self):
        with patch.dict(os.environ, {"CODENAME": "internal-theme-name"}):
            page = changelog.build([dict(release("v26.1031.3384-nightly", "2026-10-31T06:43:58Z"),
                                        body="## What's changed\n\n- Retire INTERNAL-THEME-NAME names.")])
        self.assertIn('Retire app theme names.', page)
        self.assertNotIn('INTERNAL-THEME-NAME', page)

    def test_explicit_split_only_renders_changes(self):
        body = ("Nightly 26.1031.3384 from commit abcdef.\n\n## What's changed\n\n"
                "### Fixes\n\n- Better capture.\n\n## Downloads and sources\n\n"
                "Full comparison: https://example.com/compare\n\nDownloads: packages\n\n"
                "AppImage bundles Qt.\n\nDebug symbols are retained.")
        page = changelog.build([stable(body=body)])
        self.assertIn('Better capture.', page)
        for text in ('from commit', 'Full comparison:', 'Downloads: packages', 'AppImage bundles Qt', 'Debug symbols'):
            self.assertNotIn(text, page)
        self.assertEqual(page.count('Downloads, checksums and sources →'), 1)

    def test_legacy_notes_drop_commit_compare_and_known_boilerplate(self):
        prefixes = ('Full comparison:', 'Downloads:', 'AppImage bundles dynamically linked Qt',
                    'DEB/RPM use distro Qt', 'Unchanged Proton dependency sources',
                    'Proton corresponding source', 'Debug symbols', 'The debug tar.zst',
                    'Individual DEBs', 'Automated coverage:', 'Built and packaged by')
        for prefix in prefixes:
            with self.subTest(prefix=prefix):
                body = ('Nightly 26.1031.3384 from commit abcdef.\n\n'
                        '## Changes since v26.1031.3343-nightly\n\n### Fixed\n\n- Better capture.\n\n'
                        + prefix + ' boilerplate\n\nMore boilerplate.')
                self.assertEqual(changelog.changes(body), '### Fixed\n\n- Better capture.')
        self.assertEqual(changelog.changes('- Changed capture.\n\nDownloads: packages'), '- Changed capture.')

    def test_markdown_fences_and_nested_prose_are_not_boundaries(self):
        body = ("## What's changed\n\nDownloads: the chooser is now faster.\n\n```md\n## Downloads and sources\nDownloads: example\n```\n\n"
                "- Downloads: improved the chooser.\n\nMore changes.\n\n## Downloads and sources\n\nboilerplate")
        extracted = changelog.changes(body)
        self.assertIn('Downloads: example', extracted)
        self.assertIn('Downloads: the chooser is now faster.', extracted)
        self.assertIn('More changes.', extracted)
        self.assertNotIn('boilerplate', extracted)

    def test_uses_homepage_chrome_and_shared_styles(self):
        page = changelog.build([])
        self.assertIn('<link rel="stylesheet" href="/_site/tokens.css">', page)
        self.assertIn('<link rel="stylesheet" href="/_site/site.css">', page)
        self.assertNotIn('changelog.css', page)
        self.assertIn('<footer class="foot">', page)
        self.assertIn('<nav aria-label="Footer">', page)
        self.assertIn('User guide', page)

    def test_standalone_has_no_external_asset_dependencies(self):
        page = changelog.standalone(changelog.build([stable()]))
        for tag, attrs in Elements(page).elements:
            self.assertNotEqual(tag, "script")
            if tag == "img":
                self.assertTrue(attrs["src"].startswith("data:"))
            if tag == "link":
                self.assertNotEqual(attrs.get("rel"), "stylesheet")
        self.assertNotIn('/_site/', page)
        self.assertIn("data:font/woff2;base64,", page)

if __name__ == "__main__":
    unittest.main()
