#!/usr/bin/env python3
"""Capture the put.gd site screenshots on a physical lab desktop, end to end.

  python3 tools/shots/capture.py [--host f44] [--release latest-nightly|TAG]
  python3 tools/shots/capture.py --from-frames RUN_DIR      # re-crop and re-encode only
  python3 tools/shots/capture.py --cleanup-only              # restore the host after a crash

See tools/shots/README.md."""
import argparse
import datetime
import hashlib
import json
import os
import shlex
import socket
import stat
import subprocess
import sys
import threading
import time
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
SITE = HERE.parent.parent
sys.path.insert(0, str(HERE))

import config  # noqa: E402
import imaging  # noqa: E402
import manifest  # noqa: E402
import wall  # noqa: E402
from host import Host, HostError  # noqa: E402
from story import Story, StoryError, new_reference  # noqa: E402

GITHUB_REPO = 'patrick-hudson/put.gd-desktop'
CREDENTIALS = Path('~/.config/putgd-site/demo-uploader.json').expanduser()
DEMO = {'id': 'demo', 'label': 'demo.put.gd', 'bucket': 'putgd-demo', 'region': 'us-east-2',
        'publicUrlBase': 'https://demo.put.gd', 'aclMode': 'omit'}
STATE = '~/.local/state/site-shots/state.json'  # on the host: what this pipeline changed, for --cleanup-only
EXTENSION = 'putgd@put.gd'
FORBIDDEN = ('mutter', 'gnome-shell', 'kwin', 'plasma', 'xorg', 'mesa', 'pipewire', 'xdg-desktop-portal')


def log(message):
    print(f'[{datetime.datetime.now():%H:%M:%S}] {message}', flush=True)


class Stop(RuntimeError):
    """A condition a human has to resolve; printed without a traceback."""


# -- workstation-side preparation ------------------------------------------------
def preflight(name, cfg, wall_url, rfb_module):
    """Refuse to run unless the host's tile on the display wall connects and its VNC answers."""
    log(f'Watch it live: display wall {wall_url} , tile "{cfg["wallTile"]}" '
        f'(VNC 127.0.0.1:{cfg["vncPort"]} via {cfg["vncService"]}). The tile stays view-only; '
        'input goes over this script\'s own VNC connection.')
    try:
        tile = wall.find_tile(wall_url, cfg['address'])
        info = wall.tile_handshake(wall_url, tile['id'])
    except wall.WallError as error:
        raise Stop(f'{name}: {error}') from error
    log(f'wall tile "{tile["name"]}": VNC connected ({info["name"]}, {info["size"][0]}x{info["size"][1]})')
    try:
        client = rfb_module.RFB(cfg['vncPort'])
    except (OSError, RuntimeError) as error:
        raise Stop(f'{name}: VNC 127.0.0.1:{cfg["vncPort"]} is not reachable ({error}). '
                   f'Check `systemctl --user status {cfg["vncService"]}` on the workstation.') from error
    if [client.width, client.height] != info['size']:
        client.close()
        raise Stop('the wall tile and the VNC port show different screens')
    return client


def resolve_release(tag):
    if tag != 'latest-nightly':
        return tag
    out = subprocess.run(['gh', 'release', 'list', '-R', GITHUB_REPO, '-L', '30', '--json', 'tagName,publishedAt'],
                         capture_output=True, text=True, check=True).stdout
    tags = [r for r in json.loads(out) if r['tagName'].startswith('v') and r['tagName'].endswith('-nightly')]
    if not tags:
        raise Stop('no nightly release found')
    return max(tags, key=lambda r: r['publishedAt'])['tagName']


def fetch_package(tag, asset_suffix, cache):
    folder = cache / 'releases' / tag
    folder.mkdir(parents=True, exist_ok=True)
    names = json.loads(subprocess.run(['gh', 'release', 'view', tag, '-R', GITHUB_REPO, '--json', 'assets'],
                                      capture_output=True, text=True, check=True).stdout)['assets']
    asset = next((a['name'] for a in names if a['name'].endswith(asset_suffix)), None)
    if not asset:
        raise Stop(f'release {tag} has no *{asset_suffix}')
    for name in (asset, 'SHA256SUMS'):
        if not (folder / name).exists():
            subprocess.run(['gh', 'release', 'download', tag, '-R', GITHUB_REPO, '-p', name, '-D', str(folder), '--clobber'],
                           check=True)
    sums = dict(reversed(line.split(maxsplit=1)) for line in (folder / 'SHA256SUMS').read_text().splitlines() if line.strip())
    expected = sums.get(asset) or sums.get('*' + asset)
    actual = hashlib.sha256((folder / asset).read_bytes()).hexdigest()
    if expected != actual:
        (folder / asset).unlink()
        raise Stop(f'{asset} does not match the release SHA256SUMS; deleted, rerun to download again')
    return folder / asset


def fetch_media(media, cache):
    folder = cache / 'media'
    folder.mkdir(parents=True, exist_ok=True)
    paths = {}
    for asset in media['assets']:
        path = folder / asset['sha256']
        if not path.exists():
            log(f'downloading {asset["id"]} from {asset["url"]}')
            request = urllib.request.Request(asset['url'], headers={'User-Agent': 'put.gd-site-shots/1 (https://put.gd)'})
            partial = path.with_suffix('.part')
            with urllib.request.urlopen(request, timeout=120) as reply, open(partial, 'wb') as out:
                while chunk := reply.read(1 << 20):
                    out.write(chunk)
            partial.rename(path)
        if hashlib.sha256(path.read_bytes()).hexdigest() != asset['sha256']:
            path.unlink()
            raise Stop(f'{asset["id"]}: {asset["url"]} no longer matches its pinned sha256 (deleted the download). '
                       'Pick a new pinned file in tools/shots/media.json.')
        paths[asset['id']] = path
    return paths


def read_credentials():
    """The demo uploader key, read once and only passed to the host's keychain on stdin."""
    info = CREDENTIALS.lstat()
    if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) != 0o600:
        raise Stop(f'{CREDENTIALS} must be a regular file you own with mode 0600')
    value = json.loads(CREDENTIALS.read_text())
    if not value.get('access_key_id') or not value.get('secret_access_key'):
        raise Stop(f'{CREDENTIALS} needs access_key_id and secret_access_key')
    return json.dumps({'accessKey': value['access_key_id'], 'secretKey': value['secret_access_key'], 'sessionToken': ''})


# -- the desktop lock ------------------------------------------------------------
class Lock:
    def __init__(self, repo, lock_name, session, owner, pins):
        self.tool = [sys.executable, str(repo / 'tools/lab/desktop_lock.py')]
        self.host, self.session, self.owner, self.pins = lock_name, session, owner, pins
        self.stop = threading.Event()
        self.thread = None

    def call(self, *args, check=True):
        result = subprocess.run(self.tool + list(args) + ['--pins', str(self.pins)], capture_output=True, text=True, timeout=120)
        if check and result.returncode != 0:
            raise Stop(f'desktop_lock.py {args[0]} {self.host} failed:\n{result.stdout}{result.stderr}')
        return result

    def acquire(self):
        status = json.loads(self.call('status', self.host, '--json').stdout)[0]
        held = status.get('lock') or {}
        if status.get('state') != 'free' and held.get('session') == self.session:
            log(f'{self.host}: this pipeline already holds the desktop lock; extending it')
            self.call('extend', self.host, '--session', self.session, '--minutes', '45')
        else:
            result = self.call('acquire', self.host, '--owner', self.owner, '--session', self.session, '--minutes', '45',
                               '--purpose', 'put.gd site screenshots (put.gd-site tools/shots/capture.py)', check=False)
            if result.returncode != 0:
                raise Stop(f'{self.host} desktop is not free; not touching it.\n{result.stdout}{result.stderr}')
            if result.stdout.strip():
                log(result.stdout.strip())
        self.thread = threading.Thread(target=self._beat, daemon=True)
        self.thread.start()

    def _beat(self):
        while not self.stop.wait(480):
            self.call('extend', self.host, '--session', self.session, '--minutes', '45', check=False)

    def release(self):
        self.stop.set()
        first = self.call('release', self.host, '--session', self.session, check=False)
        result = self.call('release', self.host, '--session', self.session, '--verified-clean', check=False)
        if result.returncode != 0:
            raise Stop(f'{self.host}: the lock was kept because the cleanup check found something:\n'
                       f'{first.stdout}{result.stdout}{result.stderr}')
        log(f'{self.host}: desktop lock released')


# -- host preparation and restore ------------------------------------------------
def load_state(host):
    out = host.run(f'cat {STATE} 2>/dev/null || true')
    return json.loads(out) if out.strip() else {}


def save_state(host, state):
    host.run(f'mkdir -p "$(dirname {STATE})" && cat > {STATE}.tmp && mv {STATE}.tmp {STATE}', input=json.dumps(state))


def installed_version(host, package):
    out = host.run(f'rpm -q --qf "%{{VERSION}}-%{{RELEASE}}" {package} 2>/dev/null || true')
    return out.strip() if out.strip() and 'not installed' not in out else None


def install_package(host, state, rpm):
    name = host.cfg['package']['name']
    target = host.run(f'rpm -qp --qf "%{{VERSION}}-%{{RELEASE}}" {shlex.quote(rpm)}').strip()
    current = installed_version(host, name)
    if current == target:
        log(f'{name} {target} is already installed')
        return
    if current and not state.get('installedPackage'):
        raise Stop(f'{host.name} already has {name} {current}, which this pipeline did not install. '
                   'Not replacing someone else\'s install; remove it or run elsewhere.')
    preview = host.run(f'sudo -n dnf install --assumeno {shlex.quote(rpm)} 2>&1 || true', timeout=300)
    touched = [w for w in FORBIDDEN if f'\n {w}' in preview.lower() or f' {w}-' in preview.lower()]
    if touched:
        raise Stop(f'installing {name} would change desktop packages ({", ".join(touched)}); refusing.\n{preview[-1500:]}')
    log(f'installing {name} {target} on {host.name}')
    if current:
        host.run(f'sudo -n dnf -y -q remove {name}', timeout=300)
    host.run(f'sudo -n dnf -y -q install {shlex.quote(rpm)}', timeout=600)
    state['installedPackage'] = name
    save_state(host, state)


def wait_for(predicate, timeout, what, interval=1.0):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            if predicate():
                return
        except (HostError, OSError, RuntimeError, ValueError):
            pass
        time.sleep(interval)
    raise Stop(f'timed out waiting for {what}')


def relogin(host, why):
    """Log the GNOME session out and let GDM's autologin start a fresh one (how the lab
    loads a newly installed Shell extension). Refuses while the user has apps open."""
    apps = host.agent('foreign-apps')['apps']
    if apps:
        listing = '\n'.join(f'  {scope}: {", ".join(names)}' for scope, names in apps.items())
        raise Stop(f'{host.name} needs a fresh GNOME login ({why}), but these apps are open in its session:\n{listing}\n'
                   'Close them yourself (nothing here closes your windows), then rerun.')
    log(f'{host.name}: logging the desktop session out and back in ({why}); the wall tile reconnects in ~30 s')
    old = host.run('pgrep -u "$(id -u)" -x gnome-shell || true').split()
    host.agent('logout', check=False)
    wait_for(lambda: not set(old) & set(host.run('pgrep -u "$(id -u)" -x gnome-shell || true').split()), 60, 'the old session to end')
    host.run('sudo -n systemctl restart gdm', timeout=60)
    wait_for(lambda: bool(set(host.run('pgrep -u "$(id -u)" -x gnome-shell || true').split()) - set(old)), 90,
             'the new GNOME session')
    wait_for(lambda: host.run('systemctl --user is-active putgd-gnome-vnc.service || true').strip() == 'active', 90,
             'the session VNC server')
    time.sleep(8)


def extension_ready(host):
    info = host.agent('ext-info', EXTENSION, check=False).get('info', {})
    return info.get('State') in ('ACTIVE', 'ENABLED') and info.get('Path', '').startswith('/usr/share/')


def prepare_run(host, media_paths, story_cfg):
    host.run_dir = host.run('mktemp -d /tmp/site-shots-XXXXXX').strip()
    host.run(f'chmod 700 {host.run_dir} && mkdir -m 700 {host.run_dir}/media {host.run_dir}/pids {host.run_dir}/logs')
    for module in ('agent.py', 'imaging.py'):
        host.put(HERE / module, f'{host.run_dir}/{module}')
    remote = {}
    for asset_id, path in media_paths.items():
        suffix = '.ogv' if asset_id == 'sintel' else '.jpg'
        target = f'{host.run_dir}/media/{asset_id}{suffix}'
        host.put(path, target)
        remote[asset_id] = target
    return remote


def demo_profile(template, reference):
    base = {}
    for profile in template.get('profiles', []):
        if profile.get('provider') == 's3':
            base = dict(profile.get('settings', {}))
            break
    base.update({'bucket': DEMO['bucket'], 'region': DEMO['region'], 'endpoint': f'https://s3.{DEMO["region"]}.amazonaws.com',
                 'objectPrefix': '', 'storageClass': 'STANDARD', 'aclMode': DEMO['aclMode'],
                 'publicUrlBase': DEMO['publicUrlBase'], 'addressing': 'auto'})
    for key, value in (('connectTimeoutMs', 10000), ('requestTimeoutMs', 120000), ('lowSpeedBytesPerSecond', 1024),
                       ('lowSpeedTimeSeconds', 60)):
        base.setdefault(key, value)
    return {'id': DEMO['id'], 'label': DEMO['label'], 'provider': 's3', 'settings': base,
            'credentials': {'mode': 'keychain', 'reference': reference}}


def start_resident(host):
    host.agent('spawn', 'putgd', 'app', '--', '/usr/bin/putgd', '--background')
    wait_for(lambda: host.cli('diagnostics', check=False).get('result', {}).get('journalReady'), 40, 'put.gd to start')


def configure_app(host, reference):
    start_resident(host)
    template = host.cli('settings.developmentTemplate', check=False).get('result', {})
    template = template.get('document', template)
    current = host.cli('settings.get')['result']
    archive = f'{host.run_dir}/app/archive'
    host.run(f'mkdir -p -m 700 {archive}')
    patch = {'profiles': [demo_profile(template, reference)],
             'captureDefaults': {'destination': 'upload', 'profileId': DEMO['id'], 'publicationMode': 'default'},
             'actions': {action: {'destination': 'default', 'profileId': None}
                         for action in ('region', 'window', 'desktop', 'clipboard', 'edit', 'record')},
             'archive': {'keepUploads': True, 'root': archive, 'folders': {'images': None, 'videos': None, 'text': None, 'other': None}},
             'preferences': {'notifications': False, 'launchAtLogin': False, 'appearance': {'theme': 'dark'},
                             'updates': {'check': False}}}
    reply = host.cli('settings.patch', {'patch': patch, 'expectedRevision': current['metadata']['observedRevision']}, check=False)
    if not reply.get('ok'):
        raise Stop(f'put.gd refused the demo settings: {json.dumps(reply.get("error"))[:600]}')
    # A config with a revision no longer opens Settings at start; restart so no window is up.
    host.cli('ui.quit', check=False)
    wait_for(lambda: not host.agent('alive', 'putgd')['alive'], 30, 'put.gd to quit')
    host.agent('kill', 'putgd', check=False)
    start_resident(host)
    time.sleep(5)  # the startup keychain read runs about 3 s after start
    for attempt in range(3):
        target = host.cli('diagnostics.uploadTarget', {'profileId': DEMO['id']}, check=False, timeout=200)
        result = target.get('result') or {}
        if target.get('ok') and result.get('available'):
            break
        log(f'Test connection failed (attempt {attempt + 1}): {json.dumps(result.get("details") or target.get("error"))[:240]}')
        time.sleep(5)
    else:
        raise Stop(f'put.gd cannot upload to {DEMO["label"]}: {json.dumps(result or target.get("error"))[:600]}')
    log(f'destination {DEMO["label"]} passed put.gd\'s Test connection')


def identity(host):
    version = json.loads(host.run('/usr/bin/putgd --version-json'))
    shell = host.run('gnome-shell --version').strip().replace('GNOME Shell ', '')
    os_name = host.run('. /etc/os-release && echo "$NAME $VERSION_ID"').strip()
    if version.get('dirty') is not False:
        raise Stop('the installed build is not a clean release build')
    return {'commit': version['gitCommit'], 'version': version['version'],
            'desktop': f'GNOME {shell} (Wayland), {os_name}', 'raw': version}


def ensure_agent(host):
    """An agent on the host: the run directory's, else a fresh private one."""
    if host.run_dir and host.run(f'test -f {host.run_dir}/agent.py && echo y || true').strip() == 'y':
        return None
    host.run_dir = host.run('mktemp -d /tmp/site-shots-XXXXXX').strip()
    host.put(HERE / 'agent.py', f'{host.run_dir}/agent.py')
    return host.run_dir


def restore(host, state, final_relogin, keep_package=False):
    """Undo everything recorded in the host state file. Safe to run more than once."""
    problems = []
    host.run_dir = host.run_dir or state.get('runDir')
    temporary = ensure_agent(host)
    if host.run(f'test -f {host.run_dir}/pids/putgd.json && echo y || true').strip() == 'y':
        host.cli('ui.quit', check=False, timeout=30)
        time.sleep(2)
    host.agent('killall', check=False)
    if state.get('keyringReference'):
        if host.agent('keyring-delete', state['keyringReference'], check=False).get('ok'):
            state.pop('keyringReference')
        else:
            problems.append('could not delete the keychain entry ' + state['keyringReference'])
    for key, value in list(state.get('gsettings', {}).items()):
        schema, name = key.split(' ')
        if host.agent('gsettings', 'set', schema, name, value, check=False).get('ok'):
            state['gsettings'].pop(key)
        else:
            problems.append(f'could not restore {key}')
    for folder in {state.get('runDir'), temporary} - {None}:
        host.run(f'rm -rf -- {shlex.quote(folder)}')
    state.pop('runDir', None)
    host.run_dir = None
    removed = False
    if state.get('installedPackage') and not keep_package:
        log(f'removing {state["installedPackage"]} from {host.name}')
        host.run(f'sudo -n dnf -y -q remove {state["installedPackage"]}', timeout=600)
        state.pop('installedPackage')
        removed = True
    save_state(host, state)
    if removed and final_relogin:
        temporary = ensure_agent(host)
        try:
            relogin(host, 'unload the removed Shell extension')
        except Stop as error:
            problems.append(str(error))
        host.run(f'rm -rf -- {shlex.quote(temporary)}')
        host.run_dir = None
    if not any(state.values()):
        host.run(f'rm -f {STATE}')
    return problems


# -- crop, encode, manifest ------------------------------------------------------
def crop_all(shots_cfg, run_dir, out_dir):
    run = json.loads((run_dir / 'run.json').read_text())
    screen = run['screen']
    from PIL import Image
    jobs = []
    for shot in shots_cfg['shots']:
        anchors = dict(run['anchors'][shot['step']], screen=[0, 0, screen[0], screen[1]])
        for theme in shot['themes']:
            frame = Image.open(run_dir / 'frames' / run['frames'][shot['step']][theme]).convert('RGB')
            for variant in manifest.variants(shot):
                spec = shot[variant]
                rect = imaging.resolve_crop(spec, anchors, screen)
                if 'pad' in spec and spec['pad'] and spec['anchor'] == 'window':
                    color = imaging.parse_color(shots_cfg['themes'][theme]['backdrop'])
                    share = imaging.strip_fraction(frame, rect, anchors['window'], color)
                    if share < 0.97:
                        raise Stop(f'{shot["name"]}-{theme}: the strip around the window is only {share:.1%} backdrop')
                if rect[2] % 2 or rect[3] % 2:
                    rect = [rect[0], rect[1], rect[2] - rect[2] % 2, rect[3] - rect[3] % 2]
                path = out_dir / f'{shot["name"]}-{theme}-{variant}.png'
                imaging.clean_copy(imaging.crop(frame, rect)).save(path)
                jobs.append({'src': path.name, 'shot': shot['name'], 'theme': theme, 'variant': variant, 'rect': rect})
    return run, jobs


def encode_on_host(host, shots_cfg, crops_dir, jobs):
    remote = host.run('mktemp -d /tmp/site-shots-enc-XXXXXX').strip()
    try:
        host.put(HERE / 'imaging.py', f'{remote}/imaging.py')
        host.run(f'mkdir {remote}/in {remote}/out')
        tar = subprocess.run(['tar', '-C', str(crops_dir), '-cf', '-'] + [j['src'] for j in jobs], capture_output=True, check=True).stdout
        host.run(f'tar -C {remote}/in -xf -', input=tar)
        job = {'items': [dict(j, src=f'{remote}/in/{j["src"]}') for j in jobs], 'out': f'{remote}/out',
               'scales': shots_cfg['encode']['scales'], 'avif': shots_cfg['encode']['avif'],
               'webp': shots_cfg['encode']['webp'], 'budgets': shots_cfg.get('budgets', {})}
        host.run(f'cat > {remote}/job.json', input=json.dumps(job))
        files = json.loads(host.run(f'python3 -I {remote}/imaging.py encode {remote}/job.json', timeout=1800))
        out = subprocess.run(['ssh'] + host.ssh_args() + [host.target, f'tar -C {remote}/out -cf - .'], capture_output=True,
                             check=True).stdout
        return files, out
    finally:
        host.run(f'rm -rf -- {shlex.quote(remote)}', check=False)


def publish(shots_cfg, media, run, files, tarball):
    out_dir = SITE / shots_cfg['output']
    out_dir.mkdir(parents=True, exist_ok=True)
    expected = set(manifest.expected_files(shots_cfg))
    for old in out_dir.iterdir():
        if old.is_file() and old.name not in expected and old.name != 'shots.json':
            old.unlink()
    subprocess.run(['tar', '-C', str(out_dir), '-xf', '-'], input=tarball, check=True)
    data = manifest.build(shots_cfg, media, run['identity'], files)
    (out_dir / 'shots.json').write_text(manifest.dumps(data))
    total = 0
    for name in sorted(expected):
        size = files[name]
        total += size['bytes']
        log(f'  {name:34} {size["width"]:>5}x{size["height"]:<5} {size["bytes"]:>8} B')
    log(f'wrote {len(expected)} images ({total} bytes) and shots.json to {out_dir.relative_to(SITE)}')


# -- main ------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--host', default='f44', help='physical lab desktop from tools/shots/hosts.json')
    parser.add_argument('--release', default='latest-nightly', help='latest-nightly or a release tag')
    parser.add_argument('--putgd-repo', type=Path, default=Path(os.environ.get('PUTGD_REPO', '~/work/put.gd')).expanduser())
    parser.add_argument('--cache', type=Path, default=Path('~/.cache/putgd-site-shots').expanduser())
    parser.add_argument('--wall', default='http://127.0.0.1:8765/', help='the display wall')
    parser.add_argument('--from-frames', type=Path, metavar='RUN_DIR', help='only crop/encode an earlier run')
    parser.add_argument('--cleanup-only', action='store_true', help='restore the host from its state file and exit')
    parser.add_argument('--keep-host', action='store_true', help='debugging: leave put.gd installed and keep the lock')
    parser.add_argument('--steps', help='debugging: comma-separated story steps to run (no outputs are written)')
    parser.add_argument('--lock-session', default=f'site-shots-{socket.gethostname()}')
    parser.add_argument('--owner', default=os.environ.get('USER', 'site-shots'))
    args = parser.parse_args()

    try:
        shots_cfg, media, hosts = config.load_all()
    except config.ConfigError as error:
        raise SystemExit(str(error))
    if args.host not in hosts:
        raise SystemExit(f'--host must be one of {sorted(hosts)} (tools/shots/hosts.json)')
    cfg = hosts[args.host]
    sys.path.insert(0, str(args.putgd_repo / 'tools' / 'lab'))
    import rfb as rfb_module
    rfb_module.KEYSYMS.update(home=0xff50, end=0xff57)
    host = Host(args.host, cfg, args.putgd_repo)
    try:
        if args.from_frames:
            crops = args.from_frames / 'crops'
            crops.mkdir(exist_ok=True)
            run, jobs = crop_all(shots_cfg, args.from_frames, crops)
            files, tarball = encode_on_host(host, shots_cfg, crops, jobs)
            publish(shots_cfg, media, run, files, tarball)
            return
        run_dir = args.cache / 'runs' / datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
        lock = Lock(args.putgd_repo, cfg['lockName'], args.lock_session, args.owner, host.known_hosts.parent.parent)
        if args.cleanup_only:
            lock.acquire()
            state = load_state(host)
            problems = restore(host, state, True)
            if problems:
                raise Stop('could not restore: ' + '; '.join(problems))
            lock.release()
            return
        client = preflight(args.host, cfg, args.wall, rfb_module)
        tag = resolve_release(args.release)
        log(f'release {tag}')
        package = fetch_package(tag, cfg['package']['asset'], args.cache)
        media_paths = fetch_media(media, args.cache)
        secret = read_credentials()
        (run_dir / 'frames').mkdir(parents=True)
        lock.acquire()
        state, problems = {}, []
        try:
            state = load_state(host)
            if any(state.values()):
                log('restoring what an earlier interrupted run left behind')
                restore(host, state, final_relogin=False, keep_package=True)
                state = {k: v for k, v in state.items() if k == 'installedPackage'}
            remote_media = prepare_run(host, media_paths, shots_cfg)
            state['runDir'] = host.run_dir
            save_state(host, state)
            rpm = f'{host.run_dir}/{package.name}'
            host.put(package, rpm)
            install_package(host, state, rpm)
            if not extension_ready(host):
                relogin(host, 'load the put.gd Shell extension from the package')
                if not extension_ready(host):
                    raise Stop(f'the put.gd Shell extension is not active after a fresh login: '
                               f'{host.agent("ext-info", EXTENSION, check=False)}')
                client.close()
                wait_for(lambda: bool(wall.tile_handshake(args.wall, wall.find_tile(args.wall, cfg['address'])['id'])), 60,
                         'the wall tile to reconnect')
                client = rfb_module.RFB(cfg['vncPort'])
            ident = identity(host)
            log(f'put.gd {ident["version"]} ({ident["commit"][:12]}) on {ident["desktop"]}')
            state['gsettings'] = {}
            for schema, key in (('org.gnome.desktop.interface', 'color-scheme'), ('org.gnome.desktop.notifications', 'show-banners'),
                                *(('org.gnome.desktop.background', k) for k in cfg['wallpaper'])):
                state['gsettings'][f'{schema} {key}'] = host.agent('gsettings', 'get', schema, key)['value']
            save_state(host, state)
            host.agent('gsettings', 'set', 'org.gnome.desktop.notifications', 'show-banners', 'false')  # Do Not Disturb
            reference = new_reference()
            state['keyringReference'] = reference
            save_state(host, state)
            host.agent('keyring-put', reference, input=secret)
            del secret
            host.agent('spawn', 'backdrop', 'viewer', '--', 'python3', '-I', f'{host.run_dir}/agent.py', host.run_dir,
                       'backdrop', shots_cfg['themes']['dark']['backdrop'].lstrip('#'))
            if not host.agent('wait-line', 'backdrop', 'covered', 20)['ok']:
                raise Stop('the backdrop window did not go full screen')
            client.pointer(client.width - 4, client.height - 4)
            time.sleep(1.5)
            first = imaging.from_bgrx(*client.frame())
            if imaging.color_fraction(first, imaging.parse_color(shots_cfg['themes']['dark']['backdrop'])) < 0.98:
                client.key('esc')  # a fresh session starts in the overview
                time.sleep(2)
                first = imaging.from_bgrx(*client.frame())
                if imaging.color_fraction(first, imaging.parse_color(shots_cfg['themes']['dark']['backdrop'])) < 0.98:
                    raise Stop('the backdrop does not cover the screen; not capturing anything')
            log('backdrop covers the screen')
            configure_app(host, reference)
            story = Story(host, client, shots_cfg, remote_media, run_dir / 'frames', log)
            try:
                story.run(set(args.steps.split(',')) if args.steps else None)
            finally:
                story.leave_workspace()
            run = {'screen': story.screen, 'anchors': story.anchors, 'frames': story.frames, 'release': tag,
                   'host': args.host, 'identity': {k: ident[k] for k in ('commit', 'desktop', 'version')}}
            (run_dir / 'run.json').write_text(json.dumps(run, indent=1))
            log(f'frames saved in {run_dir}')
        finally:
            if args.keep_host:
                log('--keep-host: leaving put.gd installed, the run directory and the lock in place')
                host.cli('ui.quit', check=False, timeout=30)
                host.agent('killall', check=False)
                host.agent('keyring-delete', state.get('keyringReference', 'none'), check=False)
                state.pop('keyringReference', None)
                for key, value in list(state.get('gsettings', {}).items()):
                    schema, name = key.split(' ')
                    host.agent('gsettings', 'set', schema, name, value, check=False)
                state['gsettings'] = {}
                save_state(host, state)
            else:
                problems = restore(host, state, final_relogin=True)
                if problems:
                    log('RESTORE PROBLEMS: ' + '; '.join(problems))
                else:
                    lock.release()
        if args.steps:
            return
        crops = run_dir / 'crops'
        crops.mkdir()
        run, jobs = crop_all(shots_cfg, run_dir, crops)
        files, tarball = encode_on_host(host, shots_cfg, crops, jobs)
        publish(shots_cfg, media, run, files, tarball)
    except (Stop, StoryError, HostError) as error:
        raise SystemExit(f'\nSTOPPED: {error}')
    finally:
        host.close()


if __name__ == '__main__':
    main()
