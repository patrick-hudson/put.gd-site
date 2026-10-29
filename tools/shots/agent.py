#!/usr/bin/env python3
"""Capture-host side of tools/shots/capture.py. Copied into a private run
directory on the host and run as `python3 -I RUN/agent.py RUN COMMAND ...`
over pinned SSH. Every process it starts is recorded under RUN/pids so the
workstation can stop exactly those PIDs.

Environments:
  session  the logged-in desktop session (Wayland socket, session bus)
  viewer   session + private XDG config/data/cache/state, in-memory GSettings
           (image viewer, video player and the backdrop leave no state behind)
  app      session + private XDG dirs and runtime dir for put.gd itself

Commands: spawn NAME ENV [--activate] -- ARGV..., kill NAME, killall, alive NAME, send NAME LINE,
wait-line NAME TEXT SECONDS, cli METHOD [JSON], gsettings get|set ..., ext-info,
logout, foreign-apps, keyring-put REF (JSON on stdin), keyring-delete REF,
keyring-status, backdrop COLOR (the backdrop process itself)."""
import base64
import json
import os
import re
import signal
import subprocess
import sys
import time
from pathlib import Path

RUN = Path(sys.argv[1]).resolve()
UID = os.getuid()
RUNTIME = f'/run/user/{UID}'
SESSION_KEYS = ('WAYLAND_DISPLAY', 'DISPLAY', 'XAUTHORITY', 'DBUS_SESSION_BUS_ADDRESS', 'XDG_CURRENT_DESKTOP',
                'XDG_SESSION_TYPE', 'XDG_SESSION_DESKTOP', 'DESKTOP_SESSION', 'XDG_MENU_PREFIX', 'XDG_DATA_DIRS',
                'LANG', 'GDMSESSION')
KEYCHAIN_SERVICE = 'putgd'  # QtKeychain service name used by the app's CredentialStore


def fail(message, code=2):
    print(json.dumps({'ok': False, 'error': message}))
    raise SystemExit(code)


def session_env():
    out = subprocess.run(['systemctl', '--user', 'show-environment'], capture_output=True, text=True, timeout=20)
    found = dict(line.split('=', 1) for line in out.stdout.splitlines() if '=' in line)
    env = {k: os.environ[k] for k in ('HOME', 'USER', 'LOGNAME', 'PATH', 'SHELL') if k in os.environ}
    env.update({k: found[k] for k in SESSION_KEYS if k in found})
    env.setdefault('DBUS_SESSION_BUS_ADDRESS', f'unix:path={RUNTIME}/bus')
    env['XDG_RUNTIME_DIR'] = RUNTIME
    if 'WAYLAND_DISPLAY' in env and not env['WAYLAND_DISPLAY'].startswith('/'):
        env['WAYLAND_DISPLAY'] = f"{RUNTIME}/{env['WAYLAND_DISPLAY']}"
    return env


def private_dirs(root):
    dirs = {}
    for key, name in (('XDG_CONFIG_HOME', 'config'), ('XDG_DATA_HOME', 'data'), ('XDG_CACHE_HOME', 'cache'),
                      ('XDG_STATE_HOME', 'state')):
        path = root / name
        path.mkdir(mode=0o700, parents=True, exist_ok=True)
        dirs[key] = str(path)
    return dirs


def environment(kind):
    env = session_env()
    if kind == 'viewer':
        env.update(private_dirs(RUN / 'viewer'), GSETTINGS_BACKEND='memory')
    elif kind == 'app':
        env.update(private_dirs(RUN / 'app'))
        runtime = RUN / 'app' / 'rt'
        runtime.mkdir(mode=0o700, parents=True, exist_ok=True)
        if len(str(runtime / 'putgd' / 'session.sock').encode()) > 107:
            fail('run directory path is too long for the put.gd socket')
        env.update(XDG_RUNTIME_DIR=str(runtime), PIPEWIRE_RUNTIME_DIR=RUNTIME, QT_QPA_PLATFORM='wayland')
    elif kind != 'session':
        fail(f'unknown environment {kind}')
    return env


def start_time(pid):
    try:
        return Path(f'/proc/{pid}/stat').read_text().rsplit(')', 1)[1].split()[19]
    except OSError:
        return None


def record(name):
    return RUN / 'pids' / f'{name}.json'


def spawn(name, kind, argv, activate=False):
    (RUN / 'pids').mkdir(exist_ok=True)
    (RUN / 'logs').mkdir(exist_ok=True)
    if record(name).exists() and alive(name):
        fail(f'{name} is already running')
    log = open(RUN / 'logs' / f'{name}.log', 'ab')
    env = environment(kind)
    if activate:
        # An xdg-activation token from the focused backdrop, so the compositor raises the new window.
        token_file = RUN / 'activation-token'
        token = token_file.read_text().strip() if token_file.exists() else ''
        token_file.unlink(missing_ok=True)
        if not token:
            fail('no activation token from the backdrop')
        env.update(XDG_ACTIVATION_TOKEN=token, DESKTOP_STARTUP_ID=token)
    process = subprocess.Popen(argv, env=env, stdin=subprocess.DEVNULL, stdout=log, stderr=subprocess.STDOUT,
                               cwd=str(RUN), start_new_session=True)
    record(name).write_text(json.dumps({'pid': process.pid, 'start': start_time(process.pid), 'argv': argv}))
    print(json.dumps({'ok': True, 'pid': process.pid}))


def alive(name):
    try:
        info = json.loads(record(name).read_text())
    except (OSError, ValueError):
        return False
    return start_time(info['pid']) == info['start'] and info['start'] is not None


def descendants(pid):
    found, frontier = [], [pid]
    while frontier:
        nxt = []
        for parent in frontier:
            for task in Path(f'/proc/{parent}/task').glob('*'):
                try:
                    nxt += [int(c) for c in (task / 'children').read_text().split()]
                except OSError:
                    pass
        found += nxt
        frontier = nxt
    return found


def kill(name, timeout=10.0):
    try:
        info = json.loads(record(name).read_text())
    except (OSError, ValueError):
        return 'unknown'
    pid, state = info['pid'], 'gone'
    if start_time(pid) == info['start'] and info['start'] is not None:
        # Children that left the process group (sandboxed image loaders, a private bus) go too.
        family = [(child, start_time(child)) for child in descendants(pid)]
        state = 'stopped'
        for sig, wait in ((signal.SIGTERM, timeout), (signal.SIGKILL, 5.0)):
            try:
                os.killpg(pid, sig)
            except ProcessLookupError:
                break
            deadline = time.monotonic() + wait
            while time.monotonic() < deadline and start_time(pid) == info['start']:
                time.sleep(0.1)
            if start_time(pid) != info['start']:
                break
            state = 'killed'
        for child, started in family:
            if started and start_time(child) == started:
                try:
                    os.kill(child, signal.SIGKILL)
                except ProcessLookupError:
                    pass
    record(name).unlink(missing_ok=True)
    return state


def send(name, line):
    fd = os.open(RUN / f'{name}.fifo', os.O_WRONLY | os.O_NONBLOCK)
    try:
        os.write(fd, (line.strip() + '\n').encode())
    finally:
        os.close(fd)


def wait_line(name, text, seconds):
    deadline = time.monotonic() + seconds
    path = RUN / 'logs' / f'{name}.log'
    while time.monotonic() < deadline:
        if path.exists() and text in path.read_text(errors='replace'):
            return True
        time.sleep(0.2)
    return False


def backdrop(color):
    """A full-screen, cursorless window in one solid colour. Commands arrive on
    RUN/backdrop.fifo: `color RRGGBB`, `clip PATH` (own the clipboard with that
    file, as a file manager's Copy does), `token` (write an xdg-activation token for
    the next launch to RUN/activation-token) and `quit`."""
    # Shared-memory buffers: a lone full-screen GL surface can be scanned out directly,
    # and then GNOME's screencast (which feeds the lab VNC) stops getting new frames.
    os.environ['GSK_RENDERER'] = 'cairo'
    import gi
    gi.require_version('Gtk', '4.0')
    gi.require_version('Gdk', '4.0')
    from gi.repository import Gdk, Gio, GLib, Gtk

    Gtk.init()
    css = Gtk.CssProvider()
    Gtk.StyleContext.add_provider_for_display(Gdk.Display.get_default(), css, Gtk.STYLE_PROVIDER_PRIORITY_USER + 10)

    def paint(value):
        if not re.fullmatch(r'[0-9A-Fa-f]{6}', value):
            return
        css.load_from_string(f'window.site-shots-backdrop {{ background: #{value}; }}')
        print(f'color {value.lower()}', flush=True)

    loop = GLib.MainLoop()
    window = Gtk.Window(title='Backdrop')
    window.add_css_class('site-shots-backdrop')
    window.set_decorated(False)
    window.set_cursor(Gdk.Cursor.new_from_name('none', None))
    window.connect('close-request', lambda *_: (loop.quit(), True)[1])
    paint(color)

    def fullscreened(*_):
        if window.is_fullscreen():
            GLib.timeout_add(800, lambda: (print('covered', flush=True), False)[1])

    window.connect('notify::fullscreened', fullscreened)
    window.fullscreen()
    window.present()

    fifo = RUN / 'backdrop.fifo'
    if not fifo.exists():
        os.mkfifo(fifo, 0o600)
    fd = os.open(fifo, os.O_RDWR | os.O_NONBLOCK)
    pending = [b'']

    def command(line):
        verb, _, rest = line.partition(' ')
        if verb == 'color':
            paint(rest.strip())
        elif verb == 'clip':
            uri = Gio.File.new_for_path(rest.strip()).get_uri()
            providers = [Gdk.ContentProvider.new_for_bytes('text/uri-list', GLib.Bytes.new((uri + '\r\n').encode())),
                         Gdk.ContentProvider.new_for_bytes('x-special/gnome-copied-files',
                                                           GLib.Bytes.new(('copy\n' + uri).encode()))]
            window.get_clipboard().set_content(Gdk.ContentProvider.new_union(providers))
            print('clipboard set', flush=True)
        elif verb == 'token':
            token = window.get_display().get_app_launch_context().get_startup_notify_id(None, []) or ''
            (RUN / 'activation-token').write_text(token)
            print(f'token {"ok" if token else "none"}', flush=True)
        elif verb == 'quit':
            loop.quit()

    def readable(*_):
        try:
            pending[0] += os.read(fd, 4096)
        except BlockingIOError:
            return True
        *lines, pending[0] = pending[0].split(b'\n')
        for line in lines:
            command(line.decode(errors='replace').strip())
        return True

    GLib.unix_fd_add_full(GLib.PRIORITY_DEFAULT, fd, GLib.IOCondition.IN, readable)
    GLib.unix_signal_add(GLib.PRIORITY_HIGH, signal.SIGTERM, lambda: (loop.quit(), False)[1])
    loop.run()
    window.destroy()


def cli(method, params):
    argv = ['/usr/bin/putgd-cli', method] + ([params] if params else [])
    result = subprocess.run(argv, env=environment('app'), capture_output=True, text=True, timeout=120)
    sys.stdout.write(result.stdout if result.stdout.strip() else json.dumps(
        {'ok': False, 'error': {'code': 'cli_failed', 'message': result.stderr.strip()[-400:], 'exit': result.returncode}}))
    return 0


def foreign_apps():
    """Apps the user started in the desktop session (GNOME puts each in an
    app-*.scope); session services, autostarted helpers and anything started
    over SSH are not listed."""
    found = {}
    for proc in Path('/proc').iterdir():
        if not proc.name.isdigit():
            continue
        try:
            if proc.stat().st_uid != UID:
                continue
            cgroup = (proc / 'cgroup').read_text()
            comm = (proc / 'comm').read_text().strip()
        except OSError:
            continue
        match = re.search(r'/app\.slice/(app-[^/\n]*\.scope)', cgroup)
        if not match:
            continue
        scope = match.group(1)
        if 'SettingsDaemon' in scope or 'autostart' in scope:
            continue
        found.setdefault(scope, set()).add(comm)
    return {scope: sorted(names) for scope, names in sorted(found.items())}


def secret_schema():
    import gi
    gi.require_version('Secret', '1')
    from gi.repository import Secret
    # QtKeychain's libsecret schema (libsecret.cpp): binary data is stored base64 with type=base64.
    schema = Secret.Schema.new('org.qt.keychain', Secret.SchemaFlags.DONT_MATCH_NAME,
                               {'user': Secret.SchemaAttributeType.STRING, 'server': Secret.SchemaAttributeType.STRING,
                                'type': Secret.SchemaAttributeType.STRING})
    return Secret, schema


def keyring_status():
    Secret, _ = secret_schema()
    service = Secret.Service.get_sync(Secret.ServiceFlags.NONE, None)
    collection = Secret.Collection.for_alias_sync(service, 'default', Secret.CollectionFlags.NONE, None)
    if collection is None:
        return {'default': None, 'locked': None}
    return {'default': collection.get_label(), 'locked': collection.get_locked()}


def unlock_without_prompt():
    """Unlock the default collection only if the keyring needs no prompt (a blank-password
    lab keyring opens this way after a fresh login). Never runs a prompt on the desktop."""
    import gi
    gi.require_version('Gio', '2.0')
    from gi.repository import Gio, GLib
    bus = Gio.bus_get_sync(Gio.BusType.SESSION, None)
    def call(path, interface, method, args, reply):
        return bus.call_sync('org.freedesktop.secrets', path, interface, method, args, GLib.VariantType(reply),
                             Gio.DBusCallFlags.NONE, 20000, None).unpack()
    path = call('/org/freedesktop/secrets', 'org.freedesktop.Secret.Service', 'ReadAlias', GLib.Variant('(s)', ('default',)), '(o)')[0]
    if path == '/':
        return False
    unlocked, prompt = call('/org/freedesktop/secrets', 'org.freedesktop.Secret.Service', 'Unlock',
                            GLib.Variant('(ao)', ([path],)), '(aoo)')
    return prompt == '/' and path in unlocked


def keyring_put(reference):
    if not re.fullmatch(r'putgd-lab-[0-9a-f-]{36}', reference):
        fail('reference must be putgd-lab-UUID')
    raw = sys.stdin.read(65537)
    try:
        value = json.loads(raw)
    except ValueError:
        fail('credential input is not JSON')
    if set(value) != {'accessKey', 'secretKey', 'sessionToken'} or not all(isinstance(v, str) for v in value.values()) \
            or not value['accessKey'] or not value['secretKey']:
        fail('credential input has the wrong shape')
    status = keyring_status()
    if status['locked'] and unlock_without_prompt():
        status = keyring_status()
    if status['locked'] is not False:
        fail('the default keyring is missing, or locked behind a password prompt; unlock it on the desktop (or set up the blank lab keyring, tools/lab/lab_keyring.py in the app repo) and rerun')
    Secret, schema = secret_schema()
    if Secret.password_lookup_sync(schema, {'user': reference, 'server': KEYCHAIN_SERVICE}, None) is not None:
        fail('a keychain entry with that reference already exists')
    data = base64.b64encode(json.dumps(value, separators=(',', ':')).encode()).decode()
    if not Secret.password_store_sync(schema, {'user': reference, 'server': KEYCHAIN_SERVICE, 'type': 'base64'},
                                      Secret.COLLECTION_DEFAULT, KEYCHAIN_SERVICE, data, None):
        fail('the keychain refused the entry')
    print(json.dumps({'ok': True, 'keyring': status['default']}))


def keyring_delete(reference):
    Secret, schema = secret_schema()
    removed = Secret.password_clear_sync(schema, {'user': reference, 'server': KEYCHAIN_SERVICE}, None)
    print(json.dumps({'ok': True, 'removed': bool(removed)}))


def main():
    command, args = sys.argv[2], sys.argv[3:]
    if command == 'spawn':
        name, kind, *rest = args
        activate = rest[:1] == ['--activate']
        sep, *argv = rest[1:] if activate else rest
        if sep != '--' or not argv:
            fail('usage: spawn NAME ENV [--activate] -- ARGV...')
        spawn(name, kind, argv, activate)
    elif command == 'kill':
        print(json.dumps({'ok': True, 'state': kill(args[0])}))
    elif command == 'killall':
        names = sorted(p.stem for p in (RUN / 'pids').glob('*.json')) if (RUN / 'pids').exists() else []
        # put.gd first (it may still be talking to the others), the backdrop last.
        order = sorted(names, key=lambda n: (n != 'putgd', n == 'backdrop', n))
        print(json.dumps({'ok': True, 'stopped': {n: kill(n) for n in order}}))
    elif command == 'alive':
        print(json.dumps({'ok': True, 'alive': alive(args[0])}))
    elif command == 'send':
        send(args[0], ' '.join(args[1:]))
        print(json.dumps({'ok': True}))
    elif command == 'wait-line':
        print(json.dumps({'ok': wait_line(args[0], args[1], float(args[2]))}))
    elif command == 'backdrop':
        backdrop(args[0])
    elif command == 'cli':
        raise SystemExit(cli(args[0], args[1] if len(args) > 1 else None))
    elif command == 'gsettings':
        result = subprocess.run(['gsettings'] + args, env=environment('session'), capture_output=True, text=True, timeout=20)
        print(json.dumps({'ok': result.returncode == 0, 'value': result.stdout.strip()}))
    elif command == 'ext-info':
        result = subprocess.run(['gnome-extensions', 'info', args[0]], env=environment('session'), capture_output=True,
                                text=True, timeout=20)
        info = dict(line.strip().split(': ', 1) for line in result.stdout.splitlines() if ': ' in line)
        print(json.dumps({'ok': result.returncode == 0, 'info': info}))
    elif command == 'logout':
        result = subprocess.run(['gnome-session-quit', '--logout', '--no-prompt'], env=environment('session'),
                                capture_output=True, text=True, timeout=30)
        print(json.dumps({'ok': result.returncode == 0}))
    elif command == 'foreign-apps':
        print(json.dumps({'ok': True, 'apps': foreign_apps()}))
    elif command == 'keyring-status':
        os.environ.update(environment('session'))
        print(json.dumps({'ok': True, **keyring_status()}))
    elif command == 'keyring-put':
        os.environ.update(environment('session'))
        keyring_put(args[0])
    elif command == 'keyring-delete':
        os.environ.update(environment('session'))
        keyring_delete(args[0])
    else:
        fail(f'unknown command {command}')


if __name__ == '__main__':
    main()
