"""Offline tests for the page renderer and the colour token generator."""
import importlib.util
import pathlib
import unittest

HERE = pathlib.Path(__file__).resolve().parent


def load(name):
    spec = importlib.util.spec_from_file_location(name, HERE / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


render = load("render")
tokens = load("tokens")

ASSET = {"name": "putgd-26.1029.2229-nightly-x86_64.AppImage", "size": 118_618_616}
NIGHTLY = {"tag": "v26.1029.2229-nightly", "published_at": "2026-10-29T09:12:41Z",
           "html_url": "https://github.com/x/y/releases/tag/v26.1029.2229-nightly", "assets": {".AppImage": ASSET}}
STABLE = {"tag": "v26.1101.3", "published_at": "2026-11-01T10:00:00Z",
          "html_url": "https://github.com/x/y/releases/tag/v26.1101.3", "assets": {".AppImage": ASSET}}
PAGE = ('<p><!--r:status-->Nightly builds<!--/r:status--></p>'
        '<p><!--r:file:.AppImage-->putgd.AppImage<!--/r:file:.AppImage--></p>'
        '<a href="https://app.put.gd/dl/nightly/appimage">Download</a>'
        '<p><!--r:unknown-->kept<!--/r:unknown--></p>')


class Render(unittest.TestCase):
    def test_nightly_only(self):
        channel, vals = render.values({"stable": None, "nightly": NIGHTLY}, None)
        self.assertEqual(channel, "nightly")
        self.assertEqual(vals["status"], "Nightly · Updated 29 Oct")
        self.assertIn("Nightly builds only for now.", vals["channel"])
        self.assertEqual(vals["size:.AppImage"], "118.6 MB · x86_64")
        self.assertEqual(vals["version"], "put.gd 26.1029.2229 nightly")

    def test_first_stable_takes_over(self):
        channel, vals = render.values({"stable": STABLE, "nightly": NIGHTLY}, None)
        self.assertEqual(channel, "stable")
        self.assertEqual(vals["status"], "Stable 26.1101.3 · Updated 1 Nov")
        out = render.render(PAGE, channel, vals)
        self.assertIn("https://app.put.gd/dl/stable/appimage", out)
        self.assertNotIn("/dl/nightly/", out)

    def test_no_release_keeps_defaults(self):
        channel, vals = render.values({"stable": None, "nightly": None}, None)
        self.assertIsNone(channel)
        self.assertEqual(render.render(PAGE, channel, vals), PAGE)

    def test_render_is_idempotent_and_keeps_markers(self):
        channel, vals = render.values({"stable": None, "nightly": NIGHTLY}, None)
        once = render.render(PAGE, channel, vals)
        self.assertEqual(render.render(once, channel, vals), once)
        self.assertIn("<!--r:unknown-->kept<!--/r:unknown-->", once)
        self.assertIn(ASSET["name"], once)

    def test_values_are_escaped(self):
        rel = dict(NIGHTLY, assets={".AppImage": {"name": "<b>.AppImage", "size": 1}})
        _, vals = render.values({"nightly": rel}, None)
        self.assertEqual(vals["file:.AppImage"], "&lt;b&gt;.AppImage")

    def test_credits(self):
        shots = {"shots": {"history": {"version": "26.1029.2229-nightly", "desktop": "Fedora 44, GNOME 50"}},
                 "media": [{"title": "Sintel (trailer)", "credit": "© Blender Foundation", "license": "CC BY 3.0",
                            "licenseUrl": "https://creativecommons.org/licenses/by/3.0/",
                            "source": "https://commons.wikimedia.org/wiki/File:Sintel_trailer-1080p.ogv"},
                           {"title": "Earthrise", "credit": "NASA", "license": "Public domain"}]}
        text = render.credits(shots)
        self.assertIn("put.gd 26.1029.2229 on Fedora 44, GNOME 50", text)
        self.assertIn('Sintel</a> © Blender Foundation, <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>', text)
        self.assertIn("NASA photos</a> (public domain)", text)

    def test_sized_writes_widths_and_dimensions(self):
        shots = {"shots": {"edit": {"sizes": {"dark-desktop": {"1x": [620, 465], "2x": [1240, 930]},
                                              "light-desktop": {"1x": [620, 465], "2x": [1240, 930]}}}}}
        page = ('<source data-shot="edit" srcset="/_site/shots/edit-light.avif, /_site/shots/edit-light@2x.avif">'
                '<img src="/_site/shots/edit-dark.webp" data-shot="edit" srcset="/_site/shots/edit-dark.webp 1x, '
                '/_site/shots/edit-dark@2x.webp 2x" width="1" height="1">')
        out = render.sized(page, shots)
        self.assertIn('srcset="/_site/shots/edit-light.avif 620w, /_site/shots/edit-light@2x.avif 1240w"', out)
        self.assertIn('/_site/shots/edit-dark@2x.webp 1240w"', out)
        self.assertIn('width="1240" height="930"', out)
        self.assertEqual(render.sized(out, shots), out)

    def test_stamp_covers_srcset_css_and_fonts_once(self):
        text = ('<img srcset="/_site/shots/a.avif 1x, /_site/shots/a@2x.avif 2x">'
                'src: url("/_site/fonts/A.woff2")')
        out = render.stamp(text, "abc")
        self.assertIn("/_site/shots/a.avif?v=abc 1x", out)
        self.assertIn("/_site/shots/a@2x.avif?v=abc 2x", out)
        self.assertIn('/_site/fonts/A.woff2?v=abc"', out)
        self.assertEqual(render.stamp(out, "abc"), out)

    def test_references_read_srcset_and_css(self):
        html = '<source srcset="/_site/a.avif 1x, /_site/b.avif?v=1 2x"><img src="/_site/c.webp"><a href="#x">'
        self.assertEqual(render.references(html, css=False), ["/_site/a.avif", "/_site/b.avif", "/_site/c.webp"])
        self.assertEqual(render.references('url("/_site/f.woff2")', css=True), ["/_site/f.woff2"])

    def test_committed_page_has_every_marker_the_renderer_fills(self):
        page = (HERE.parent / "public/index.html").read_text()
        _, vals = render.values({"nightly": dict(NIGHTLY, assets={k: ASSET for k in
                                 ["ubuntu24.04", "ubuntu26.04", "debian13", "fedora44", ".AppImage"]})},
                                {"shots": [], "media": []})
        marked = {m[0] for m in render.MARK.findall(page)}
        self.assertEqual(set(vals) - marked, set())


HEADER = """struct Palette {
 QColor well,bg;
 // a comment, with commas
 QColor border,text;
};"""
SOURCE = """
const Palette dark{
 QColor("#121212"),QColor("#191919"),QColor(255,255,255,18),QColor("#F0F0EC"),
};
const Palette light{
 QColor("#EDEDEA"),QColor("#FFFFFF"),QColor(0,0,0,20),QColor("#292926"),
};"""


class Tokens(unittest.TestCase):
    def test_fields_in_order_without_comments(self):
        self.assertEqual(tokens.fields(HEADER), ["well", "bg", "border", "text"])

    def test_translucent_colours_composite_on_bg(self):
        values = tokens.tokens(HEADER, SOURCE)
        self.assertEqual(values["dark"]["border"], "#292929")
        self.assertEqual(values["light"]["border"], "#ebebeb")
        self.assertEqual(values["dark"]["text"], "#f0f0ec")

    def test_field_count_mismatch_fails(self):
        with self.assertRaises(ValueError):
            tokens.tokens(HEADER.replace("QColor border,text;", "QColor border,text,extra;"), SOURCE)

    def test_css_names_and_no_source_comments(self):
        css = tokens.css(tokens.tokens(HEADER, SOURCE), "v1")
        self.assertIn("--well: #121212;", css)
        self.assertIn("Theme.cpp@v1", css)
        self.assertNotIn("a comment", css)


if __name__ == "__main__":
    unittest.main()
