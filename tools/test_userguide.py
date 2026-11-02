"""The user guide build: the shared chrome, root-absolute links, and (when Zensical is installed)
a real build whose pages, pictures and links all resolve."""
import importlib.util
import os
import pathlib
import re
import tempfile
import tomllib
import unittest

import userguide as guide

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOCS = ROOT / "guide/docs"
HAS_ZENSICAL = importlib.util.find_spec("zensical") is not None

HOME = '''<header class="top">
  <div class="wrap top-row">
    <a class="brand" href="/">put.gd</a>
    <nav aria-label="Primary">
      <a href="#install">Install</a>
      <a href="https://app.put.gd/changelog">Changelog</a>
      <a href="/userguide">User guide</a>
    </nav>
  </div>
</header>
<main></main>
<footer class="foot"><p><!--r:version-->put.gd<!--/r:version--></p></footer>'''


def nav_pages(nav) -> list[str]:
    out = []
    for item in nav:
        for value in item.values():
            out += nav_pages(value) if isinstance(value, list) else [value]
    return out


class Chrome(unittest.TestCase):
    def test_header_marks_the_guide_current_and_adds_search_and_menu(self):
        header, footer = guide.chrome(HOME, "nightly", {"version": "put.gd 1.2 nightly"})
        self.assertIn('<a href="/userguide" aria-current="page">User guide</a>', header)
        self.assertIn('href="https://app.put.gd/#install"', header)
        self.assertIn('for="__search"', header)
        self.assertIn('{% include "partials/search.html" %}', header)
        self.assertIn('for="__drawer"', header)
        self.assertIn('data-md-component="header"', header)
        self.assertIn("put.gd 1.2 nightly", footer)

    def test_homepage_without_the_link_is_refused(self):
        with self.assertRaises(ValueError):
            guide.chrome(HOME.replace(guide.GUIDE_LINK, ""), None, {})


class Links(unittest.TestCase):
    def test_relative_urls_become_root_absolute(self):
        html = ('<a href="capture.html">x</a> <a href="./edit.html#tools">y</a> <a href="#top">z</a> '
                '<link href="assets/a.css"> <script src="./assets/b.js"></script> '
                '<img src="img/a.webp" srcset="img/a.webp 1x, ./img/a@2x.webp 2x"> '
                '<a href="https://app.put.gd/">home</a> <img src="/_site/logo.svg"> '
                '<script>{"base":".","features":[],"search":"./assets/javascripts/workers/search.1.min.js"}</script>')
        out = guide.absolute(html, "/userguide/capture.html")
        self.assertIn('href="/userguide/capture.html"', out)
        self.assertIn('href="/userguide/edit.html#tools"', out)
        self.assertIn('href="#top"', out)
        self.assertIn('href="/userguide/assets/a.css"', out)
        self.assertIn('src="/userguide/assets/b.js"', out)
        self.assertIn('srcset="/userguide/img/a.webp 1x, /userguide/img/a@2x.webp 2x"', out)
        self.assertIn('href="https://app.put.gd/"', out)
        self.assertIn('src="/_site/logo.svg"', out)
        self.assertIn('"base":"/userguide/"', out)
        self.assertIn('"search":"/userguide/assets/javascripts/workers/search.1.min.js"', out)

    def test_base_from_a_nested_page(self):
        self.assertIn('"base":"/userguide/"', guide.absolute('{"base":".."}', "/userguide/sub/page.html"))


class Source(unittest.TestCase):
    """Checks on the Markdown that need no build."""

    def setUp(self):
        self.config = tomllib.loads((ROOT / "guide/zensical.toml").read_text())
        self.pages = nav_pages(self.config["project"]["nav"])

    def test_every_nav_page_exists_and_every_page_is_in_the_nav(self):
        for page in self.pages:
            self.assertTrue((DOCS / page).is_file(), f"nav page missing: {page}")
        for path in DOCS.glob("*.md"):
            self.assertIn(path.name, self.pages, f"page not in nav: {path.name}")

    def test_links_and_pictures_resolve(self):
        link = re.compile(r"\]\(([^)\s]+)\)")
        attr = re.compile(r'(?:src|srcset)="([^"]+)"')
        for path in DOCS.glob("*.md"):
            text = path.read_text()
            for target in link.findall(text):
                target = target.split("#")[0]
                if not target or "://" in target or target.startswith("/"):
                    continue
                self.assertTrue((DOCS / target).is_file(), f"{path.name}: broken link {target}")
            for value in attr.findall(text):
                for part in value.split(","):
                    url = part.strip().split(" ")[0]
                    if url.startswith("/_site/"):
                        self.assertTrue((ROOT / "public" / url.lstrip("/")).is_file(), f"{path.name}: missing {url}")
                    elif not url.startswith(("http", "/")):
                        self.assertTrue((DOCS / url).is_file(), f"{path.name}: missing {url}")

    def test_each_page_has_one_title_and_a_picture(self):
        for page in self.pages:
            text = (DOCS / page).read_text()
            self.assertEqual(len(re.findall(r"^# ", text, re.M)), 1, f"{page}: needs exactly one # title")
            self.assertTrue(re.search(r'<picture class="shot"|!\[[^\]]*\]\(img/', text), f"{page}: has no picture")

    def test_codename_absent(self):
        word = os.environ.get("PUTGD_FORBIDDEN_WORD") or "".join(["gra", "ph", "ite"])
        for path in list(DOCS.rglob("*")) + list((ROOT / "guide").glob("*")):
            if path.is_file() and path.suffix in (".md", ".toml", ".css", ".html"):
                self.assertNotIn(word, path.read_text().lower(), f"{path}: names the codename")


@unittest.skipUnless(HAS_ZENSICAL, "zensical is not installed")
class Build(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.out = pathlib.Path(cls.tmp.name) / "userguide"
        shots = ROOT / "public/_site/shots/shots.json"
        import json
        cls.pages = guide.build(cls.out, None, json.loads(shots.read_text()) if shots.exists() else None)

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def test_pages_are_flat_and_share_the_chrome(self):
        names = {p.relative_to(self.out).as_posix() for p in self.pages}
        self.assertIn("index.html", names)
        self.assertIn("capture.html", names)
        self.assertNotIn("404.html", names)
        html = (self.out / "capture.html").read_text()
        self.assertIn('<header class="top" data-md-component="header">', html)
        self.assertIn('<footer class="foot">', html)
        self.assertIn('href="/_site/tokens.css"', html)
        self.assertNotIn("fonts.googleapis.com", html)
        self.assertIn('"base":"/userguide/"', html)
        self.assertIn('"search":"/userguide/assets/javascripts/workers/search.', html)
        self.assertTrue((self.out / "search.json").is_file())

    def test_no_relative_urls_remain(self):
        for path in self.pages:
            for name, value in guide.URL_ATTR.findall(path.read_text()):
                for part in value.split(","):
                    url = part.strip().split(" ")[0]
                    self.assertTrue(url == "" or url.startswith(("/", "#", "http", "data:", "mailto:")),
                                    f"{path.name}: relative {name} {url}")

    def test_every_referenced_guide_file_exists(self):
        for path in self.pages:
            for _, value in guide.URL_ATTR.findall(path.read_text()):
                for part in value.split(","):
                    url = part.strip().split(" ")[0].split("#")[0].split("?")[0]
                    if url.startswith("/userguide/"):
                        self.assertTrue((self.out / url[len("/userguide/"):]).is_file(), f"{path.name}: missing {url}")


if __name__ == "__main__":
    unittest.main()
