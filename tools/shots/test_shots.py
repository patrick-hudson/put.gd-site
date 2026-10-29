"""Offline tests for the screenshot pipeline's pure parts:
python3 -m unittest discover -s tools"""
import copy
import json
import os
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from PIL import Image, ImageDraw  # noqa: E402

import config  # noqa: E402
import imaging  # noqa: E402
import manifest  # noqa: E402

SITE = HERE.parent.parent


def screen_with_window(backdrop, window_rect, window_color=(90, 90, 90), size=(400, 300)):
    image = Image.new('RGB', size, backdrop)
    x, y, w, h = window_rect
    ImageDraw.Draw(image).rectangle([x, y, x + w - 1, y + h - 1], fill=window_color)
    return image


class Locate(unittest.TestCase):
    def test_finds_window_and_ignores_pointer(self):
        image = screen_with_window(imaging.LOCATE_COLOR, [50, 40, 200, 120])
        ImageDraw.Draw(image).rectangle([380, 280, 391, 295], fill=(0, 0, 0))  # a pointer-sized speck
        self.assertEqual(imaging.foreground_box(image), [50, 40, 200, 120])

    def test_empty_backdrop(self):
        self.assertIsNone(imaging.foreground_box(Image.new('RGB', (100, 80), imaging.LOCATE_COLOR)))

    def test_stray_content_outside_window_is_measured(self):
        image = screen_with_window(imaging.LOCATE_COLOR, [50, 40, 200, 120])
        self.assertEqual(imaging.outside_fraction(image, [[50, 40, 200, 120]]), 0.0)
        ImageDraw.Draw(image).rectangle([300, 200, 349, 249], fill=(200, 200, 200))
        self.assertGreater(imaging.outside_fraction(image, [[50, 40, 200, 120]]), 0.02)

    def test_color_fraction_and_strip(self):
        dark = imaging.parse_color('#121212')
        image = screen_with_window(dark, [50, 40, 200, 120])
        self.assertAlmostEqual(imaging.color_fraction(image, dark), 1 - (200 * 120) / (400 * 300))
        self.assertEqual(imaging.strip_fraction(image, [26, 16, 248, 168], [50, 40, 200, 120], dark), 1.0)
        ImageDraw.Draw(image).rectangle([30, 20, 45, 30], fill=(255, 255, 255))
        self.assertLess(imaging.strip_fraction(image, [26, 16, 248, 168], [50, 40, 200, 120], dark), 1.0)


class Crops(unittest.TestCase):
    anchors = {'window': [100, 100, 1200, 760], 'viewer': [200, 100, 1400, 900],
               'selection': [700, 300, 500, 360], 'screen': [0, 0, 1920, 1080]}

    def test_pad(self):
        self.assertEqual(imaging.resolve_crop({'anchor': 'window', 'pad': 24}, self.anchors, [1920, 1080]),
                         [76, 76, 1248, 808])

    def test_relative_rect(self):
        self.assertEqual(imaging.resolve_crop({'anchor': 'window', 'rect': [10, 20, 300, 200]}, self.anchors, [1920, 1080]),
                         [110, 120, 300, 200])

    def test_center_is_clamped_inside(self):
        spec = {'anchor': 'selection', 'center': [0.5, 0.5], 'size': [960, 720], 'clamp': 'viewer'}
        x, y, w, h = imaging.resolve_crop(spec, self.anchors, [1920, 1080])
        self.assertEqual((w, h), (960, 720))
        self.assertTrue(imaging.inside([x, y, w, h], self.anchors['viewer']))
        spec = {'anchor': 'window', 'center': [0.0, 0.0], 'size': [400, 300]}
        self.assertEqual(imaging.resolve_crop(spec, self.anchors, [1920, 1080])[:2], [100, 100])

    def test_crop_larger_than_clamp_or_off_screen_is_refused(self):
        with self.assertRaises(ValueError):
            imaging.resolve_crop({'anchor': 'window', 'center': [0.5, 0.5], 'size': [1600, 1000]}, self.anchors, [1920, 1080])
        with self.assertRaises(ValueError):
            imaging.resolve_crop({'anchor': 'window', 'pad': 150}, self.anchors, [1920, 1080])
        with self.assertRaises(ValueError):
            imaging.resolve_crop({'anchor': 'missing', 'pad': 1}, self.anchors, [1920, 1080])

    def test_output_names(self):
        self.assertEqual(imaging.output_name('history', 'dark', 'desktop', '1x', 'avif'), 'history-dark.avif')
        self.assertEqual(imaging.output_name('history', 'light', 'mobile', '2x', 'webp'), 'history-light-mobile@2x.webp')

    def test_scaled_size_halves(self):
        self.assertEqual(imaging.scaled_size([1248, 808], 0.5), [624, 404])


class Config(unittest.TestCase):
    def setUp(self):
        self.shots, self.media, self.hosts = (config.load_json(HERE / n) for n in ('shots.json', 'media.json', 'hosts.json'))
        self.media_ids = {a['id'] for a in self.media['assets']}

    def test_repository_config_is_valid(self):
        self.assertEqual(config.validate_media(self.media), [])
        self.assertEqual(config.validate_shots(self.shots, self.media_ids), [])
        self.assertEqual(config.validate_hosts(self.hosts), [])

    def errors_after(self, change):
        cfg = copy.deepcopy(self.shots)
        change(cfg)
        return config.validate_shots(cfg, self.media_ids)

    def test_tiles_must_be_four_by_three(self):
        def change(cfg):
            next(s for s in cfg['shots'] if s['tile'])['desktop'] = {'anchor': 'window', 'rect': [0, 0, 800, 500]}
        self.assertTrue(any('not 4:3' in e for e in self.errors_after(change)))

    def test_unknown_step_media_and_duplicates(self):
        self.assertTrue(self.errors_after(lambda c: c['shots'][0].update(step='nope')))
        self.assertTrue(self.errors_after(lambda c: c['story'][0].update(media='nope')))
        self.assertTrue(self.errors_after(lambda c: c['shots'].append(copy.deepcopy(c['shots'][0]))))

    def test_pairs_and_pacing_are_required(self):
        self.assertTrue(self.errors_after(lambda c: c['shots'][0].update(themes=['dark'])))
        self.assertTrue(self.errors_after(lambda c: c['pace'].update(step=0.2)))
        self.assertTrue(self.errors_after(lambda c: c['shots'][0].pop('desktop')))

    def test_bad_crop_specs(self):
        self.assertTrue(self.errors_after(lambda c: c['shots'][0].update(desktop={'anchor': 'window', 'pad': 4, 'rect': [0, 0, 2, 2]})))
        self.assertTrue(self.errors_after(lambda c: c['shots'][0].update(desktop={'anchor': 'viewer', 'pad': 4})))
        self.assertTrue(self.errors_after(lambda c: c['shots'][0].update(mobile={'anchor': 'window', 'rect': [0, 0, 301, 200]})))

    def test_media_needs_pins_and_licenses(self):
        media = copy.deepcopy(self.media)
        media['assets'][0]['sha256'] = 'abc'
        del media['assets'][1]['license']
        media['assets'][2]['url'] = 'http://example.com/x.jpg'
        self.assertEqual(len(config.validate_media(media)), 3)

    def test_only_physical_hosts(self):
        hosts = copy.deepcopy(self.hosts)
        hosts['f44']['physical'] = False
        self.assertTrue(any('physical' in e for e in config.validate_hosts(hosts)))


class Manifest(unittest.TestCase):
    def setUp(self):
        self.shots = config.load_json(HERE / 'shots.json')
        self.media = config.load_json(HERE / 'media.json')
        self.identity = {'commit': 'a' * 40, 'desktop': 'GNOME 50 (Wayland), Fedora Linux 44', 'version': '26.1029.2229-nightly'}

    def files(self):
        return {name: {'width': 200 if '@2x' in name else 100, 'height': 150 if '@2x' in name else 75, 'bytes': 1000}
                for name in manifest.expected_files(self.shots)}

    def test_expected_files_cover_pairs_scales_and_formats(self):
        names = manifest.expected_files(self.shots)
        self.assertEqual(len(names), len(set(names)))
        self.assertIn('history-dark@2x.avif', names)
        self.assertIn('history-light-mobile.webp', names)
        self.assertIn('desktop-light@2x.webp', names)
        self.assertNotIn('desktop-dark-mobile.avif', names)

    def test_manifest_holds_only_provenance_sizes_and_credits(self):
        data = manifest.build(self.shots, self.media, self.identity, self.files())
        self.assertEqual(set(data), {'shots', 'media'})
        for entry in data['shots'].values():
            self.assertEqual(set(entry), {'commit', 'desktop', 'version', 'sizes'})
        self.assertEqual(data['shots']['history']['sizes']['dark-desktop'], {'1x': [100, 75], '2x': [200, 150]})
        self.assertEqual(len(data['media']), len(self.media['assets']))
        self.assertTrue(all(m['license'] and m['credit'] and m['source'].startswith('https://') for m in data['media']))
        json.loads(manifest.dumps(data))

    def test_missing_file_or_identity_fails(self):
        files = self.files()
        files.pop('history-dark.avif')
        with self.assertRaises(ValueError):
            manifest.build(self.shots, self.media, self.identity, files)
        with self.assertRaises(ValueError):
            manifest.build(self.shots, self.media, dict(self.identity, commit=''), self.files())


@unittest.skipUnless(imaging.Image.registered_extensions().get('.webp'), 'Pillow lacks WebP')
class Encode(unittest.TestCase):
    def test_webp_has_no_metadata_and_halves(self):
        folder = Path(tempfile.mkdtemp())
        try:
            source = Image.new('RGB', (64, 48), (18, 18, 18))
            source.save(folder / 'in.png', pnginfo=None, icc_profile=b'fake-icc', exif=b'Exif\x00\x00fake')
            out = folder / 'out'
            out.mkdir()
            job = {'items': [{'src': str(folder / 'in.png'), 'shot': 'unit', 'theme': 'dark', 'variant': 'desktop'}],
                   'out': str(out), 'scales': {'2x': 1.0, '1x': 0.5}, 'avif': {'crf': 30}, 'webp': {'quality': 80}}
            original = imaging.encode_avif
            imaging.encode_avif = lambda png, path, crf, speed: Image.open(png).save(path, 'PNG')  # no AVIF encoder here
            try:
                files = imaging.encode(job)
            finally:
                imaging.encode_avif = original
            self.assertEqual((files['unit-dark.webp']['width'], files['unit-dark.webp']['height']), (32, 24))
            self.assertEqual((files['unit-dark@2x.webp']['width'], files['unit-dark@2x.webp']['height']), (64, 48))
            data = (out / 'unit-dark@2x.webp').read_bytes()
            for chunk in (b'EXIF', b'ICCP', b'XMP '):
                self.assertNotIn(chunk, data)
        finally:
            shutil.rmtree(folder)


class Codename(unittest.TestCase):
    """The app's internal design codename must not appear in anything the pipeline
    writes. The word is read from PUTGD_FORBIDDEN_WORD, or built here from parts."""

    def test_codename_absent(self):
        word = os.environ.get('PUTGD_FORBIDDEN_WORD') or ''.join(['gra', 'ph', 'ite'])
        needles = {word.lower().encode(), word.upper().encode(), word.capitalize().encode()}
        hits = []
        for root in (HERE, SITE / 'public' / '_site' / 'shots'):
            if not root.exists():
                continue
            for path in root.rglob('*'):
                if not path.is_file() or '__pycache__' in path.parts:
                    continue
                if word.lower() in path.name.lower():
                    hits.append(f'{path} (name)')
                data = path.read_bytes()
                if any(n in data for n in needles):
                    hits.append(str(path))
        self.assertEqual(hits, [])


if __name__ == '__main__':
    unittest.main()
