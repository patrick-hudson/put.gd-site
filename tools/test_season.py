"""Runs the season tests in Node under several time zones, and checks the site's seasonal wiring."""
import importlib.util
import os
import pathlib
import re
import subprocess
import unittest
import xml.etree.ElementTree as ET

HERE = pathlib.Path(__file__).resolve().parent
PUBLIC = HERE.parent / "public"
BOWL = "M2 13H6V18Q6 19 7 19H17Q18 19 18 18V13H22V18Q22 23 17 23H7Q2 23 2 18Z"
ZONES = ["UTC", "America/New_York", "America/Los_Angeles", "America/Havana", "Asia/Kolkata",
         "Pacific/Apia", "Pacific/Kiritimati"]
ARTWORK = ["logo-november", "logo-december", "favicon-november", "favicon-december", "art-november", "art-december"]

spec = importlib.util.spec_from_file_location("render", HERE / "render.py")
render = importlib.util.module_from_spec(spec)
spec.loader.exec_module(render)


class Season(unittest.TestCase):
    def test_behaviour_in_every_zone(self):
        for zone in ZONES:
            with self.subTest(zone=zone):
                run = subprocess.run(["node", "--test", str(HERE / "season.test.js")], capture_output=True, text=True,
                                     env={**os.environ, "TZ": zone})
                self.assertEqual(run.returncode, 0, run.stdout + run.stderr)

    def test_every_page_loads_it_after_the_styles_and_before_the_body(self):
        for name in [PUBLIC / page for page in render.PAGES] + [HERE / "changelog.html"]:
            with self.subTest(page=name.name):
                text = name.read_text()
                script = text.index('<script src="/_site/season.js"></script>')
                self.assertLess(text.index('href="/_site/site.css"'), script)
                self.assertLess(script, text.index("<body"))

    def test_artwork_is_referenced_only_through_the_stamped_stylesheet(self):
        css = (PUBLIC / "_site/site.css").read_text()
        refs = render.references(css, css=True)
        for name in ARTWORK:
            if name.startswith(("logo", "favicon", "art")):
                self.assertIn(f"/_site/{name}.svg", refs)
        for ref in refs:
            self.assertTrue((PUBLIC / ref.lstrip("/")).exists(), ref)
        self.assertNotIn("/_site/", (PUBLIC / "_site/season.js").read_text())
        self.assertIn('url("/_site/logo-november.svg?v=abc")', render.stamp(css, "abc"))
        self.assertEqual(render.missing(), [])

    def test_artwork_keeps_the_exact_bowl_and_parses(self):
        for name in ARTWORK:
            with self.subTest(artwork=name):
                text = (PUBLIC / f"_site/{name}.svg").read_text()
                ET.fromstring(text)
                self.assertIn(BOWL, text)
                self.assertNotRegex(text, r'(?:href|src)="|url\("?http')

    def test_no_hard_coded_year_or_outbound_request(self):
        source = (PUBLIC / "_site/season.js").read_text()
        self.assertNotRegex(source, r"\b20\d\d\b")
        self.assertNotRegex(source, r"https?:|fetch\(|XMLHttpRequest|sendBeacon")

    def test_seasonal_css_leaves_tokens_alone_until_a_season_is_set(self):
        css = (PUBLIC / "_site/site.css").read_text()
        section = css[css.index("/* Seasons:"):]
        for block in re.findall(r"^(?!\s)([^{}@\n/][^{}\n]*)\{[^}]*--(?:accent|link|selected)\b", section, re.M):
            self.assertIn("data-season", block)


if __name__ == "__main__":
    unittest.main()
