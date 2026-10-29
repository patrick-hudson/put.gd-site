"""Load and validate shots.json, media.json and hosts.json (pure; no I/O beyond reading them)."""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
NAME = re.compile(r'[a-z][a-z0-9-]{0,40}\Z')
SHA256 = re.compile(r'[0-9a-f]{64}\Z')
COLOR = re.compile(r'#[0-9A-Fa-f]{6}\Z')
STEP_KINDS = {
    # kind: (required params, anchors the step records for its shot, whether it can hold a shot)
    'region-capture': ({'media', 'selection'}, {'viewer', 'selection'}),
    'edit': ({'media', 'redact'}, {'window'}),
    'record': ({'media', 'clip', 'area', 'seconds', 'trim', 'playhead'}, {'window'}),
    'file-upload': ({'media', 'filename'}, set()),
    'history': ({'window'}, {'window'}),
    'destinations': (set(), {'window'}),
    # The whole physical screen (top bar, wallpaper, the History window) on an empty workspace.
    'desktop': ({'window'}, {'screen', 'window'}),
}
VARIANTS = ('desktop', 'mobile')


class ConfigError(ValueError):
    pass


def load_json(path):
    with open(path) as stream:
        return json.load(stream)


def _fraction_box(value, where, errors):
    if not (isinstance(value, list) and len(value) == 4 and all(isinstance(v, (int, float)) for v in value)):
        errors.append(f'{where}: expected [fx, fy, fw, fh] fractions')
        return
    fx, fy, fw, fh = value
    if not (0 <= fx and 0 <= fy and fw > 0 and fh > 0 and fx + fw <= 1 and fy + fh <= 1):
        errors.append(f'{where}: fractions must lie inside [0, 1]')


def _pair(value, where, errors, integers=True):
    kind = int if integers else (int, float)
    if not (isinstance(value, list) and len(value) == 2 and all(isinstance(v, kind) and not isinstance(v, bool) for v in value)):
        errors.append(f'{where}: expected a pair of {"integers" if integers else "numbers"}')
        return False
    return True


def crop_size(spec):
    """The crop's pixel size when the spec fixes it (rect or size), else None (pad)."""
    if 'rect' in spec:
        return spec['rect'][2], spec['rect'][3]
    if 'size' in spec:
        return tuple(spec['size'])
    return None


def validate_crop(spec, where, anchors, tile, errors):
    if not isinstance(spec, dict):
        errors.append(f'{where}: expected an object')
        return
    allowed = {'anchor', 'pad', 'rect', 'center', 'size', 'clamp'}
    if set(spec) - allowed:
        errors.append(f'{where}: unknown keys {sorted(set(spec) - allowed)}')
    if spec.get('anchor') not in anchors:
        errors.append(f'{where}: anchor must be one of {sorted(anchors)}')
    if spec.get('clamp') is not None and spec['clamp'] not in anchors:
        errors.append(f'{where}: clamp must be one of {sorted(anchors)}')
    modes = [m for m in ('pad', 'rect', 'center') if m in spec]
    if len(modes) != 1:
        errors.append(f'{where}: give exactly one of pad, rect or center+size')
        return
    if 'pad' in spec and not (isinstance(spec['pad'], int) and 0 <= spec['pad'] <= 200):
        errors.append(f'{where}: pad must be an integer 0-200')
    if 'rect' in spec:
        r = spec['rect']
        if not (isinstance(r, list) and len(r) == 4 and all(isinstance(v, int) for v in r) and r[2] > 0 and r[3] > 0):
            errors.append(f'{where}: rect must be [x, y, w, h] integers with a positive size')
    if 'center' in spec:
        if 'size' not in spec:
            errors.append(f'{where}: center needs size')
        elif _pair(spec['size'], f'{where}.size', errors) and min(spec['size']) <= 0:
            errors.append(f'{where}: size must be positive')
        if _pair(spec['center'], f'{where}.center', errors, integers=False) and not all(0 <= v <= 1 for v in spec['center']):
            errors.append(f'{where}: center fractions must lie in [0, 1]')
    elif 'size' in spec:
        errors.append(f'{where}: size is only used with center')
    size = None
    if isinstance(spec.get('rect'), list) and len(spec['rect']) == 4:
        size = tuple(spec['rect'][2:])
    elif 'center' in spec and isinstance(spec.get('size'), list) and len(spec['size']) == 2:
        size = tuple(spec['size'])
    if tile:
        if size is None:
            errors.append(f'{where}: a tile crop needs a fixed 4:3 size (rect or center+size)')
        elif isinstance(size[0], int) and isinstance(size[1], int) and size[0] * 3 != size[1] * 4:
            errors.append(f'{where}: tile crop {size[0]}x{size[1]} is not 4:3')
    if size is not None and all(isinstance(v, int) for v in size) and (size[0] % 2 or size[1] % 2):
        errors.append(f'{where}: crop sides must be even so the 1x image is exactly half')


def validate_shots(cfg, media_ids=None):
    """Return a list of human-readable problems (empty when valid)."""
    errors = []
    if cfg.get('version') != 1:
        errors.append('version must be 1')
    themes = cfg.get('themes', {})
    if set(themes) != {'dark', 'light'}:
        errors.append('themes must define exactly dark and light')
    for name, theme in themes.items():
        if not COLOR.match(str(theme.get('backdrop', ''))):
            errors.append(f'themes.{name}.backdrop must be #rrggbb')
        if theme.get('desktopScheme') not in ('prefer-dark', 'default', 'prefer-light'):
            errors.append(f'themes.{name}.desktopScheme must be a GNOME color-scheme value')
    encode = cfg.get('encode', {})
    if encode.get('scales') != {'2x': 1.0, '1x': 0.5}:
        errors.append('encode.scales must be {"2x": 1.0, "1x": 0.5} (the host renders at scale 1)')
    if not isinstance(encode.get('avif', {}).get('crf'), int) or not 0 <= encode['avif']['crf'] <= 63:
        errors.append('encode.avif.crf must be an integer 0-63')
    if not isinstance(encode.get('webp', {}).get('quality'), int) or not 1 <= encode['webp']['quality'] <= 100:
        errors.append('encode.webp.quality must be an integer 1-100')
    steps = {}
    for index, step in enumerate(cfg.get('story', [])):
        where = f'story[{index}]'
        sid, kind = step.get('id'), step.get('kind')
        if not isinstance(sid, str) or not NAME.match(sid):
            errors.append(f'{where}: id must match {NAME.pattern}')
            continue
        if sid in steps:
            errors.append(f'{where}: duplicate id {sid}')
        if kind not in STEP_KINDS:
            errors.append(f'{where}: kind must be one of {sorted(STEP_KINDS)}')
            continue
        steps[sid] = step
        required, _ = STEP_KINDS[kind]
        missing = required - set(step)
        if missing:
            errors.append(f'{where}: missing {sorted(missing)}')
            continue
        if 'media' in step and media_ids is not None and step['media'] not in media_ids:
            errors.append(f'{where}: media {step["media"]!r} is not in media.json')
        for key in ('selection', 'redact', 'area'):
            if key in step:
                _fraction_box(step[key], f'{where}.{key}', errors)
        if 'window' in step and _pair(step['window'], f'{where}.window', errors) and min(step['window']) < 400:
            errors.append(f'{where}: window size is too small')
        if kind == 'record':
            if not (isinstance(step['seconds'], (int, float)) and 2 <= step['seconds'] <= 30):
                errors.append(f'{where}: seconds must be 2-30')
            trim, playhead = step['trim'], step['playhead']
            if not (_pair(trim, f'{where}.trim', errors, integers=False) and 0 <= trim[0] < trim[1] <= step['seconds']):
                errors.append(f'{where}: trim must be [start, end] seconds inside the recording')
            elif not (isinstance(playhead, (int, float)) and trim[0] <= playhead <= trim[1]):
                errors.append(f'{where}: playhead must lie inside the trim')
            clip = step['clip']
            if not (isinstance(clip, dict) and isinstance(clip.get('start'), (int, float)) and isinstance(clip.get('seconds'), (int, float))
                    and clip['seconds'] >= step['seconds'] + 4):
                errors.append(f'{where}: clip needs start and seconds (at least the recording plus 4 s)')
        if kind == 'file-upload' and not re.fullmatch(r'[a-z0-9][a-z0-9.-]{0,60}\.(jpg|png)', str(step['filename'])):
            errors.append(f'{where}: filename must be a plain lowercase .jpg or .png name')
    names = set()
    for index, shot in enumerate(cfg.get('shots', [])):
        where = f'shots[{index}]'
        name = shot.get('name')
        if not isinstance(name, str) or not NAME.match(name):
            errors.append(f'{where}: name must match {NAME.pattern}')
            continue
        if name in names:
            errors.append(f'{where}: duplicate name {name}')
        names.add(name)
        step = steps.get(shot.get('step'))
        if step is None:
            errors.append(f'{where}: step {shot.get("step")!r} is not in the story')
            continue
        anchors = STEP_KINDS[step['kind']][1] | {'screen'}
        if not STEP_KINDS[step['kind']][1]:
            errors.append(f'{where}: step {step["id"]} ({step["kind"]}) records no frame to crop')
            continue
        if shot.get('themes') != ['dark', 'light']:
            errors.append(f'{where}: themes must be ["dark", "light"] (identical pairs)')
        if 'desktop' not in shot:
            errors.append(f'{where}: missing the desktop crop')
        for variant in VARIANTS:
            if variant in shot:
                validate_crop(shot[variant], f'{where}.{variant}', anchors, bool(shot.get('tile')), errors)
        if shot.get('aspect') == '16:9':
            size = crop_size(shot.get('desktop', {})) if isinstance(shot.get('desktop'), dict) else None
            if size is not None and size[0] * 9 != size[1] * 16:
                errors.append(f'{where}: desktop crop {size[0]}x{size[1]} is not 16:9')
        if not isinstance(shot.get('tile'), bool):
            errors.append(f'{where}: tile must be true or false')
    pace = cfg.get('pace', {})
    for key in ('step', 'hold'):
        if not (isinstance(pace.get(key), (int, float)) and 1.0 <= pace[key] <= 10):
            errors.append(f'pace.{key} must be 1-10 seconds (the run is watched live on the wall)')
    for key in cfg.get('budgets', {}):
        if not re.fullmatch(r'[a-z0-9-]+(@2x)?\.(avif|webp)', key):
            errors.append(f'budgets: {key!r} is not an output file name')
    return errors


def validate_media(media):
    errors = []
    ids = set()
    for index, item in enumerate(media.get('assets', [])):
        where = f'assets[{index}]'
        required = {'id', 'kind', 'title', 'url', 'sha256', 'bytes', 'license', 'licenseUrl', 'credit', 'page'}
        missing = required - set(item)
        if missing:
            errors.append(f'{where}: missing {sorted(missing)}')
            continue
        if not NAME.match(item['id']) or item['id'] in ids:
            errors.append(f'{where}: id must be unique and match {NAME.pattern}')
        ids.add(item['id'])
        if item['kind'] not in ('image', 'video'):
            errors.append(f'{where}: kind must be image or video')
        if not SHA256.match(item['sha256']):
            errors.append(f'{where}: sha256 must be 64 lowercase hex digits')
        for key in ('url', 'page', 'licenseUrl'):
            if not str(item[key]).startswith('https://'):
                errors.append(f'{where}: {key} must be an https URL')
        if not (isinstance(item['bytes'], int) and 0 < item['bytes'] <= 200_000_000):
            errors.append(f'{where}: bytes must be a positive size under 200 MB')
    return errors


def validate_hosts(hosts):
    errors = []
    for name, host in hosts.items():
        required = {'address', 'user', 'vncPort', 'lockName', 'desktop', 'package', 'viewer', 'player', 'knownHosts',
                    'identity', 'physical', 'wallpaper'}
        missing = required - set(host)
        if missing:
            errors.append(f'{name}: missing {sorted(missing)}')
        if host.get('physical') is not True:
            errors.append(f'{name}: only physical lab desktops reached over their loopback VNC may capture')
        if not isinstance(host.get('vncPort'), int) or not 1024 <= host['vncPort'] <= 65535:
            errors.append(f'{name}: vncPort must be the workstation loopback port of its VNC tunnel')
        if host.get('desktop') != 'gnome':
            errors.append(f'{name}: only GNOME hosts are implemented (the story uses the put.gd Shell extension)')
    return errors


def load_all(shots_path=HERE / 'shots.json', media_path=HERE / 'media.json', hosts_path=HERE / 'hosts.json'):
    shots, media, hosts = load_json(shots_path), load_json(media_path), load_json(hosts_path)
    errors = validate_media(media)
    errors += validate_shots(shots, {a['id'] for a in media.get('assets', [])})
    errors += validate_hosts(hosts)
    if errors:
        raise ConfigError('invalid shot configuration:\n  ' + '\n  '.join(errors))
    return shots, media, hosts
