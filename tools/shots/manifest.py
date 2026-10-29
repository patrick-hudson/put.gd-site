"""The public manifest, public/_site/shots/shots.json (pure)."""
import json

from imaging import output_name

SCALES = ('1x', '2x')
FORMATS = ('avif', 'webp')


def variants(shot):
    return [v for v in ('desktop', 'mobile') if v in shot]


def expected_files(shots_cfg):
    """Every file the configured shots produce, in a stable order."""
    names = []
    for shot in shots_cfg['shots']:
        for theme in shot['themes']:
            for variant in variants(shot):
                for scale in SCALES:
                    for fmt in FORMATS:
                        names.append(output_name(shot['name'], theme, variant, scale, fmt))
    return names


def attribution(media):
    """The credit line list for every demo asset, as the site shows it."""
    return [{'title': a['title'], 'credit': a['credit'], 'license': a['license'],
             'licenseUrl': a['licenseUrl'], 'source': a['page']} for a in media['assets']]


def build(shots_cfg, media, identity, files):
    """identity: {"commit", "desktop", "version"} of the build that drew the shots.
    files: {file name: {"width", "height", "bytes"}} for every expected file."""
    missing = [n for n in expected_files(shots_cfg) if n not in files]
    if missing:
        raise ValueError('missing encoded files: ' + ', '.join(missing))
    for key in ('commit', 'desktop', 'version'):
        if not identity.get(key):
            raise ValueError(f'identity has no {key}')
    shots = {}
    for shot in shots_cfg['shots']:
        sizes = {}
        for theme in shot['themes']:
            for variant in variants(shot):
                key = f'{theme}-{variant}'
                sizes[key] = {scale: [files[output_name(shot['name'], theme, variant, scale, 'avif')]['width'],
                                      files[output_name(shot['name'], theme, variant, scale, 'avif')]['height']]
                              for scale in SCALES}
        shots[shot['name']] = {'commit': identity['commit'], 'desktop': identity['desktop'],
                               'version': identity['version'], 'sizes': sizes}
    return {'shots': shots, 'media': attribution(media)}


def dumps(manifest):
    return json.dumps(manifest, indent=2, ensure_ascii=False) + '\n'
