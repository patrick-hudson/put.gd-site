"""Pure image helpers for the screenshot pipeline: locating windows on the
backdrop, resolving crop specs, privacy checks, cropping and encoding.

Rectangles are [x, y, width, height] in screen pixels. The capture host runs
at scale 1, so a capture's native pixels are the @2x output and 1x is a
half-size downscale.

`python3 -I imaging.py encode JOB.json` runs the encoder on the capture host
(the workstation does no encoding); everything else is imported."""
import json
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageChops

LOCATE_COLOR = (255, 0, 255)  # the backdrop while a window is located


def parse_color(value):
    value = value.lstrip('#')
    if len(value) != 6:
        raise ValueError(f'not a #rrggbb colour: {value!r}')
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def from_bgrx(width, height, data):
    """An RFB framebuffer (32bpp little-endian B,G,R,X) as an RGB image."""
    return Image.frombuffer('RGB', (width, height), bytes(data), 'raw', 'BGRX', 0, 1)


def color_mask(image, color, tolerance=12):
    """Mode-L mask: 255 where a pixel is within `tolerance` of `color` on every channel."""
    flat = Image.new('RGB', image.size, color)
    diff = ImageChops.difference(image.convert('RGB'), flat)
    r, g, b = diff.split()
    worst = ImageChops.lighter(ImageChops.lighter(r, g), b)
    return worst.point(lambda v: 255 if v <= tolerance else 0)


def color_fraction(image, color, box=None, tolerance=12):
    """Share of pixels (inside `box` = [x, y, w, h], else all) matching `color`."""
    if box is not None:
        x, y, w, h = box
        image = image.crop((x, y, x + w, y + h))
    mask = color_mask(image, color, tolerance)
    histogram = mask.histogram()
    total = image.size[0] * image.size[1]
    return histogram[255] / total if total else 0.0


def _projection(mask, axis):
    """Count of set pixels per column (axis 0) or row (axis 1) of a mode-L 0/255 mask."""
    w, h = mask.size
    if axis == 0:
        reduced = mask.resize((w, 1), Image.Resampling.BOX)
        return [round(v * h / 255) for v in reduced.getdata()]
    reduced = mask.resize((1, h), Image.Resampling.BOX)
    return [round(v * w / 255) for v in reduced.getdata()]


def foreground_box(image, backdrop=LOCATE_COLOR, min_run=24, tolerance=12):
    """The box around everything that is not backdrop, ignoring columns and rows
    with fewer than `min_run` such pixels (a pointer or stray specks). None if empty."""
    mask = color_mask(image, backdrop, tolerance).point(lambda v: 0 if v else 255)
    cols = [x for x, n in enumerate(_projection(mask, 0)) if n >= min_run]
    rows = [y for y, n in enumerate(_projection(mask, 1)) if n >= min_run]
    if not cols or not rows:
        return None
    return [cols[0], rows[0], cols[-1] - cols[0] + 1, rows[-1] - rows[0] + 1]


def outside_fraction(image, keep, backdrop=LOCATE_COLOR, tolerance=12):
    """Share of the pixels outside the `keep` boxes that are NOT backdrop."""
    mask = color_mask(image, backdrop, tolerance).point(lambda v: 0 if v else 255)
    for x, y, w, h in keep:
        mask.paste(0, (x, y, x + w, y + h))
    total = image.size[0] * image.size[1] - sum(w * h for _, _, w, h in keep)
    return mask.histogram()[255] / total if total > 0 else 0.0


def inside(inner, outer):
    x, y, w, h = inner
    ox, oy, ow, oh = outer
    return x >= ox and y >= oy and x + w <= ox + ow and y + h <= oy + oh


def resolve_crop(spec, anchors, screen):
    """Resolve one crop spec against named anchor rects. Specs:
    {"anchor": A, "pad": N}                    A grown by N on every side
    {"anchor": A, "rect": [x, y, w, h]}        relative to A's top-left
    {"anchor": A, "center": [fx, fy], "size": [w, h], "clamp": C}
        a w x h box centred on a point given as fractions of A, moved (not
        shrunk) to lie inside anchor C (default A).
    Raises ValueError when the result leaves the screen or its clamp."""
    if spec['anchor'] not in anchors:
        raise ValueError(f"anchor {spec['anchor']!r} was not recorded")
    ax, ay, aw, ah = anchors[spec['anchor']]
    if 'pad' in spec:
        p = spec['pad']
        rect = [ax - p, ay - p, aw + 2 * p, ah + 2 * p]
        bounds = [0, 0, screen[0], screen[1]]
    elif 'rect' in spec:
        x, y, w, h = spec['rect']
        rect = [ax + x, ay + y, w, h]
        bounds = anchors[spec.get('clamp', spec['anchor'])]
    else:
        fx, fy = spec['center']
        w, h = spec['size']
        bounds = anchors[spec.get('clamp', spec['anchor'])]
        bx, by, bw, bh = bounds
        if w > bw or h > bh:
            raise ValueError(f'crop {w}x{h} does not fit its clamp {bw}x{bh}')
        x = round(ax + fx * aw - w / 2)
        y = round(ay + fy * ah - h / 2)
        rect = [min(max(x, bx), bx + bw - w), min(max(y, by), by + bh - h), w, h]
    if not inside(rect, [0, 0, screen[0], screen[1]]):
        raise ValueError(f'crop {rect} leaves the {screen[0]}x{screen[1]} screen')
    if not inside(rect, bounds):
        raise ValueError(f'crop {rect} leaves its clamp {bounds}')
    return rect


def strip_fraction(image, outer, inner, color, tolerance=10):
    """Share of the pixels in `outer` but not `inner` that match `color` (the backdrop strip)."""
    x, y, w, h = outer
    region = image.crop((x, y, x + w, y + h))
    mask = color_mask(region, color, tolerance)
    ix, iy, iw, ih = inner
    mask.paste(0, (ix - x, iy - y, ix - x + iw, iy - y + ih))
    total = w * h - iw * ih
    return mask.histogram()[255] / total if total > 0 else 1.0


def crop(image, rect):
    x, y, w, h = rect
    return image.crop((x, y, x + w, y + h))


def scaled_size(size, factor):
    return [max(1, round(size[0] * factor)), max(1, round(size[1] * factor))]


def clean_copy(image):
    """A metadata-free RGB copy (no ICC, EXIF, text or gamma chunks)."""
    out = Image.new('RGB', image.size)
    out.paste(image.convert('RGB'))
    return out


def output_name(shot, theme, variant, scale, fmt):
    """public/_site/shots file name: <shot>-<theme>[-mobile][@2x].<fmt>."""
    stem = f'{shot}-{theme}' + ('-mobile' if variant == 'mobile' else '')
    return stem + ('@2x' if scale == '2x' else '') + '.' + fmt


def encode_avif(png, path, crf, speed):
    """AVIF still via Pillow when it has AVIF, else ffmpeg's libaom (both write no EXIF/XMP)."""
    from PIL import features
    if features.check('avif'):
        Image.open(png).save(path, 'AVIF', quality=max(0, 100 - crf), speed=speed, subsampling='4:4:4')
        return
    if not shutil.which('ffmpeg'):
        raise RuntimeError('AVIF needs Pillow with AVIF support or ffmpeg with libaom on the capture host')
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', png,
                    '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:v', '+bitexact',
                    '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', str(crf), '-cpu-used', str(speed),
                    '-pix_fmt', 'yuv444p', '-color_primaries', 'bt709', '-color_trc', 'iec61966-2-1',
                    '-colorspace', 'bt709', '-color_range', 'pc', path], check=True)


def encode(job):
    """Encode each source PNG (the @2x pixels) at every scale and format.
    job: {"items": [{"src": PNG, "base": OUT_DIR/NAME-STEM, ...}], "out": DIR,
          "scales": {"2x": 1.0, "1x": 0.5}, "avif": {...}, "webp": {...}}
    Returns {file name: {"width", "height", "bytes"}}."""
    results = {}
    with tempfile.TemporaryDirectory(prefix='site-shots-enc-') as scratch:
        for item in job['items']:
            source = clean_copy(Image.open(item['src']))
            for scale, factor in job['scales'].items():
                size = scaled_size(source.size, factor)
                image = source if size == list(source.size) else source.resize(size, Image.Resampling.LANCZOS)
                png = os.path.join(scratch, 'frame.png')
                image.save(png, 'PNG', optimize=False)
                for fmt in ('avif', 'webp'):
                    name = output_name(item['shot'], item['theme'], item['variant'], scale, fmt)
                    path = os.path.join(job['out'], name)
                    params = job[fmt]
                    if fmt == 'webp':
                        image.save(path, 'WEBP', quality=params['quality'], method=params.get('method', 6))
                    else:
                        crf = params['crf']
                        budget = job.get('budgets', {}).get(name)
                        while True:
                            encode_avif(png, path, crf, params.get('speed', 4))
                            if not budget or os.path.getsize(path) <= budget or crf >= 50:
                                break
                            crf += 2
                    results[name] = {'width': size[0], 'height': size[1], 'bytes': os.path.getsize(path)}
    return results


if __name__ == '__main__':
    if sys.argv[1:2] == ['encode'] and len(sys.argv) == 3:
        with open(sys.argv[2]) as stream:
            print(json.dumps(encode(json.load(stream))))
    else:
        raise SystemExit('usage: imaging.py encode JOB.json')
