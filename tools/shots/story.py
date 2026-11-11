"""The demo story, driven on a physical desktop's real session. put.gd is
driven through putgd-cli; drags, clicks and keys are real input sent over
the host's loopback VNC (at 200%, the lab's input agent); every frame is read back from that VNC stream.

Each step that feeds a shot records anchor rectangles (screen pixels) and one
frame per theme. Behind the windows is our own full-screen backdrop: it turns
magenta while a window is located (anything that is not magenta and not the
expected window fails the privacy check) and the theme's colour for the frame
that is kept."""
import json
import os
import time
import uuid

import imaging
from PIL import ImageStat

MAGENTA = 'FF00FF'
SETTINGS_RAIL = (100, 141, 38)  # first row's centre from the window's corner, then the row pitch
SCROLLBAR = (7, 150)  # a page's scrollbar handle: in from the window's right edge, down from its top
DESTINATION_ROW = (108, 154)  # the first destination's centre in the Destinations list
# Empty destination forms for the guide, as Settings creates them (the providers' own defaults).
PROVIDERS = {
    'proton-drive': ('Proton Drive', {'accountRootUid': '', 'folderUid': '', 'shareByDefault': True, 'linkExpirationDays': 0,
                                      'sharePasswordReference': None, 'requestTimeoutMs': 120000}),
    'backblaze-b2': ('Backblaze B2', {'apiUrl': 'https://api.backblazeb2.com', 'bucket': 'my-bucket', 'objectPrefix': '', 'linkMode': 'public',
                                      'linkValidityDays': 7, 'publicUrlBase': None, 'connectTimeoutMs': 10000,
                                      'requestTimeoutMs': 600000}),
    # A made-up server, filled in as an imported .sxcu would: the token is a secret row with no value.
    'custom-http': ('Custom uploader', {'accepts': ['image', 'text', 'file'], 'allowInsecureHttp': False, 'arguments': [],
                                        'body': 'multipart', 'connectTimeoutMs': 10000, 'data': '', 'dataSecret': False,
                                        'deletionUrl': '{json:deletion_url}', 'errorMessage': '{json:error}', 'fileFormName': 'file',
                                        'headers': [{'name': 'Authorization', 'secret': True}], 'parameters': [],
                                        'requestMethod': 'POST', 'requestTimeoutMs': 600000,
                                        'requestUrl': 'https://files.example.com/api/upload', 'responseUrl': '{json:url}',
                                        'secrets': [], 'thumbnailUrl': ''}),
}
# The keychain entry each provider's destination names (never written: these forms hold no values).
REFERENCES = {'custom-http': 'putgd/http/{pid}'}
DONE_STATES = {'completed', 'failed', 'partial', 'cancelled', 'interrupted'}


class StoryError(RuntimeError):
    pass


def annotation(spec, size):
    """An editor shape from shots.json, whose positions are fractions of the image."""
    width, height = size
    shape = dict(spec)
    for key in ('from', 'to', 'at'):
        if key in shape:
            shape[key] = [round(shape[key][0] * width), round(shape[key][1] * height)]
    if 'points' in shape:
        shape['points'] = [[round(x * width), round(y * height)] for x, y in shape['points']]
    if 'rect' in shape:
        fx, fy, fw, fh = shape['rect']
        shape['rect'] = [round(fx * width), round(fy * height), round(fw * width), round(fh * height)]
    return shape


def find_id(result, *keys):
    for key in keys + ('operationId', 'id'):
        if isinstance(result, dict) and isinstance(result.get(key), str):
            return result[key]
    raise StoryError(f'no id in reply {json.dumps(result)[:300]}')


class Story:
    def __init__(self, host, rfb, input, cfg, media, frames_dir, log):
        self.host, self.rfb, self.input, self.cfg, self.media = host, rfb, input, cfg, media
        self.frames_dir, self.log = frames_dir, log
        self.pace = cfg['pace']
        self.themes = cfg['themes']
        self.anchors, self.frames, self.uploads = {}, {}, []
        self.theme = None
        self.screen = [rfb.width, rfb.height]
        self.scale = 2 if host.cfg.get('hidpi') else 1  # frames and input are in device pixels
        self.workspace_moved = False

    # -- pacing, frames, input -------------------------------------------------
    def step_pause(self):
        time.sleep(self.pace['step'])

    def grab(self):
        width, height, data = self.rfb.frame()
        self.screen = [width, height]
        return imaging.from_bgrx(width, height, data)

    def backdrop(self, color):
        self.host.agent('send', 'backdrop', f'color {color}')
        time.sleep(0.8)

    def park(self, x=None, y=None):
        """Pointer onto the backdrop (where it is invisible) or a given point."""
        self.input.pointer(self.screen[0] - 4 if x is None else x, self.screen[1] - 4 if y is None else y)
        time.sleep(0.3)

    def locate(self, expect=None, tolerance=40, settle=8.0, floor=0.15):
        """The one window on the backdrop: [x, y, w, h]. Waits until the backdrop shows
        magenta (at least `floor` of the screen) and the window's box is stable."""
        self.backdrop(MAGENTA)
        deadline, last, box, frame = time.monotonic() + settle, None, None, None
        while time.monotonic() < deadline:
            frame = self.grab()
            if imaging.color_fraction(frame, imaging.LOCATE_COLOR) >= floor:
                box = imaging.foreground_box(frame)
                if box and box == last:
                    break
                last = box
            else:
                box = last = None
            time.sleep(0.6)
        else:
            box = None
        if not box:
            if frame is not None and len(frame.getcolors(4) or []) == 1:
                raise StoryError('the VNC picture shows one flat colour and never turned magenta: the screencast feeding '
                                 'the VNC server looks frozen (check the wall tile)')
            raise StoryError('no stable window on a visible backdrop (did the app open? is the backdrop covering the screen?)')
        stray = imaging.outside_fraction(frame, [box])
        if stray > 0.0005:
            raise StoryError(f'something besides the expected window is on screen ({stray:.4%} of the backdrop)')
        self.log(f'  located window {box}')
        if expect and (abs(box[2] - expect[0]) > tolerance or abs(box[3] - expect[1]) > tolerance):
            raise StoryError(f'window is {box[2]}x{box[3]}, expected about {expect[0]}x{expect[1]}')
        return box

    def keep(self, step, theme, frame=None):
        """Save the current screen as this step's frame for `theme`."""
        time.sleep(self.pace['hold'])
        frame = frame or self.grab()
        path = self.frames_dir / f'{step}-{theme}.png'
        frame.save(path)
        self.frames.setdefault(step, {})[theme] = path.name
        self.log(f'  kept {path.name}')
        return frame

    def drag(self, p0, p1, hold=False):
        pointer = self.input.pointer
        pointer(*p0)
        time.sleep(0.4)
        pointer(*p0, down=True)
        time.sleep(0.3)
        steps = 30
        for i in range(1, steps + 1):
            pointer(p0[0] + (p1[0] - p0[0]) * i / steps, p0[1] + (p1[1] - p0[1]) * i / steps)
            time.sleep(0.04)
        time.sleep(0.5)
        if not hold:
            pointer(*p1, down=False)

    def release(self, point):
        self.input.pointer(*point, down=False)

    # -- put.gd ------------------------------------------------------------------
    def cli(self, method, params=None, retry=()):
        for _ in range(40):
            reply = self.host.cli(method, params, check=False)
            if reply.get('ok'):
                return reply.get('result') or {}
            code = (reply.get('error') or {}).get('code')
            if code not in retry:
                raise StoryError(f'putgd-cli {method}: {json.dumps(reply.get("error"))[:400]}')
            time.sleep(0.5)
        raise StoryError(f'putgd-cli {method} kept answering {code}')

    def patch(self, patch):
        revision = self.cli('settings.get')['metadata']['observedRevision']
        return self.cli('settings.patch', {'patch': patch, 'expectedRevision': revision})

    def set_theme(self, theme, backdrop=True):
        """App theme, GNOME's style (shell selector pill, viewers, wallpaper) and the backdrop."""
        self.theme = theme
        self.patch({'preferences': {'appearance': {'theme': theme}}})
        self.host.agent('gsettings', 'set', 'org.gnome.desktop.interface', 'color-scheme', self.themes[theme]['desktopScheme'])
        if backdrop:
            self.backdrop(self.themes[theme]['backdrop'].lstrip('#'))
        time.sleep(1.5)

    def wait_operation(self, op, timeout=600, retries=8):
        """Wait for an operation to finish; a failed upload (a network blip) is retried with
        put.gd's own Retry, which reuses the stored artifact."""
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            result = self.cli('operation.inspect', {'id': op})
            state = result.get('state') or (result.get('operation') or {}).get('state')
            if state == 'completed':
                return result
            if state in ('failed', 'partial') and retries > 0:
                retries -= 1
                errors = {(i.get('error') or {}).get('code') for i in result.get('items', [])} - {None, ''}
                self.log(f'  upload {state} ({", ".join(sorted(errors)) or "no code"}); retrying, {retries} left')
                time.sleep(min(30.0, 5.0 * (8 - retries)))
                self.cli('operation.retry', {'id': op})
            elif state in DONE_STATES:
                raise StoryError(f'operation {op} ended {state}: {json.dumps(result)[:600]}')
            time.sleep(1.0)
        raise StoryError(f'operation {op} did not finish in {timeout} s')

    def idle(self, timeout=300):
        """Wait until no operation is active (uploads settle before the History frames)."""
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            recent = self.cli('operation.recent')
            items = recent.get('operations') or recent.get('items') or []
            if not any((o.get('state') not in DONE_STATES) for o in items):
                return
            time.sleep(1.0)
        raise StoryError('uploads did not settle')

    # -- helper apps -------------------------------------------------------------
    def focus_backdrop(self):
        """A real click on the backdrop gives it focus and a fresh input serial."""
        self.input.click(40 * self.scale, self.screen[1] - 40 * self.scale)
        time.sleep(0.6)

    def open_app(self, name, argv, expect_min=(400, 300), attempts=3):
        """Launch a viewer/player and locate its window. Starting video playback sometimes
        freezes the screencast that feeds the VNC (the picture stops changing until the
        player exits); then stop that player, wait for live frames and launch it again."""
        for attempt in range(1, attempts + 1):
            try:
                return self._open_app_once(name, argv, expect_min)
            except StoryError as error:
                if 'frozen' not in str(error) or attempt == attempts:
                    raise
                self.log(f'  {name}: the VNC picture froze while it started; relaunching ({attempt}/{attempts - 1})')
                self.close_app(name)
                deadline = time.monotonic() + 30
                while imaging.color_fraction(self.grab(), imaging.LOCATE_COLOR) < 0.9:
                    if time.monotonic() > deadline:
                        raise StoryError('the VNC picture stayed frozen after the player stopped (check the wall tile)')
                    time.sleep(1.0)

    def _open_app_once(self, name, argv, expect_min):
        self.focus_backdrop()
        log_mark = self.host.run(f'grep -c "^token" {self.host.run_dir}/logs/backdrop.log || true').strip()
        self.host.agent('send', 'backdrop', 'token')
        deadline = time.monotonic() + 10
        while self.host.run(f'grep -c "^token" {self.host.run_dir}/logs/backdrop.log || true').strip() == log_mark:
            if time.monotonic() > deadline:
                raise StoryError('the backdrop gave no activation token')
            time.sleep(0.3)
        self.host.agent('spawn', name, 'viewer', '--activate', '--', *argv)
        deadline = time.monotonic() + 25
        while True:
            time.sleep(2.0)
            if not self.host.agent('alive', name)['alive']:
                tail = self.host.run(f'tail -c 600 {self.host.run_dir}/logs/{name}.log 2>/dev/null || true')
                raise StoryError(f'{argv[0]} exited before showing a window: {tail.strip()}')
            try:
                box = self.locate(settle=6.0)
            except StoryError as error:
                self.log(f'  {name}: no window located yet')
                if 'frozen' in str(error) or time.monotonic() > deadline:
                    raise StoryError(f'{name}: {error}') from error
                continue
            if box[2] >= expect_min[0] * self.scale and box[3] >= expect_min[1] * self.scale:
                return box
            if time.monotonic() > deadline:
                raise StoryError(f'{name} window is only {box[2]}x{box[3]}')

    def close_app(self, name):
        self.host.agent('kill', name)
        time.sleep(1.0)

    @staticmethod
    def inner(box, fractions):
        x, y, w, h = box
        fx, fy, fw, fh = fractions
        return [round(x + fx * w), round(y + fy * h), round(fw * w), round(fh * h)]

    # -- steps -------------------------------------------------------------------
    def region_capture(self, step):
        viewer = self.open_app('viewer', self.host.cfg['viewer'] + [self.media[step['media']]])
        self.backdrop(self.themes[self.theme]['backdrop'].lstrip('#'))
        selection = self.inner(viewer, step['selection'])
        p0, p1 = (selection[0], selection[1]), (selection[0] + selection[2], selection[1] + selection[3])
        anchors = {'viewer': viewer, 'selection': selection}
        passes = ['dark', 'light'] if step.get('hold') else [None]
        for theme in passes:
            if theme:
                self.set_theme(theme)
            self.park()
            op = find_id(self.cli('action.invoke', {'action': 'region'}))
            time.sleep(3.0)  # the selector's hint pill fades after about 2 s
            last = theme == passes[-1]
            self.drag(p0, p1, hold=bool(theme))
            if theme:
                self.keep(step['id'], theme)
                if last:
                    self.release(p1)
                else:
                    self.input.key('esc')
                    time.sleep(0.3)
                    self.release(p1)
                    time.sleep(1.5)
            if last:
                self.uploads.append(op)
                self.wait_operation(op)
        self.park()
        self.close_app('viewer')
        if step.get('hold'):
            self.anchors[step['id']] = anchors
            self.set_theme('dark')

    def edit(self, step):
        op = find_id(self.cli('editor.open', {'source': 'file', 'path': self.media[step['media']]}))
        state = self.cli('editor.inspect', {'id': op}, retry=('editor_starting',))
        size = [state.get('width'), state.get('height')]
        if not all(size):
            raise StoryError(f'editor.inspect gave no image size: {json.dumps(state)[:300]}')
        fx, fy, fw, fh = step['redact']
        rect = [round(fx * size[0]), round(fy * size[1]), round(fw * size[0]), round(fh * size[1])]
        shapes = [{'kind': 'redact', 'rect': rect}] + [annotation(a, size) for a in step.get('annotate', [])]
        self.cli('editor.apply', {'id': op, 'commands': [{'op': 'add', 'shape': shape} for shape in shapes]},
                 retry=('editor_starting',))
        if step.get('tool'):
            self.cli('editor.view', {'id': op, 'action': 'tool', 'tool': step['tool']}, retry=('editor_starting',))
        self.step_pause()
        self.park()
        window = self.locate()
        self.anchors[step['id']] = {'window': window}
        for theme in ('dark', 'light'):
            self.set_theme(theme)
            self.park()
            self.keep(step['id'], theme)
        self.set_theme('dark')
        self.cli('editor.submit', {'id': op})
        self.uploads.append(op)
        self.wait_operation(op)

    def record(self, step):
        clip = f"{self.host.run_dir}/media/{step['id']}-clip.webm"
        start, seconds = step['clip']['start'], step['clip']['seconds']
        self.host.run(f"ffmpeg -hide_banner -loglevel error -y -ss {start} -t {seconds} -i "
                      f"{self.media[step['media']]} -an -vf scale={1920 if self.scale > 1 else 1280}:-2 -c:v libvpx-vp9 -deadline realtime -cpu-used 8 -b:v 8M "
                      f"-row-mt 1 {clip}", timeout=300)
        player = self.open_app('player', self.host.cfg['player'] + [clip])
        self.backdrop(self.themes[self.theme]['backdrop'].lstrip('#'))
        self.park()
        time.sleep(4.0)  # the player dims the video until its controls fade
        area = self.inner(player, step['area'])
        caps = self.cli('recording.capabilities')
        fmt = 'mp4'
        encoders = (caps.get('gstreamer') or {}).get('usableH264Encoders')
        if encoders == []:
            fmt = 'webm'
        rect = [round(v / self.scale) for v in area]  # put.gd takes desktop coordinates
        request = {'target': {'kind': 'region', 'rect': rect}, 'format': fmt}
        if step.get('microphone'):
            request['audio'] = {'system': False, 'microphone': True}
        rid = self.prepare_recording(request)
        if step.get('bar'):
            # The floating bar, ready to record, beside the area it will record. A bar follows the
            # theme it started with, so the dark one is cancelled and a light one prepared.
            self.anchors[step['bar']] = {'viewer': player, 'area': area}
            for theme in ('dark', 'light'):
                if theme == 'light':
                    self.cli('operation.cancel', {'id': rid})
                    time.sleep(2.0)
                    self.set_theme(theme)
                    rid = self.prepare_recording(request)
                time.sleep(2.0)
                self.park()
                self.keep(step['bar'], theme)
        self.cli('recording.start', {'id': rid})
        time.sleep(step['seconds'])
        self.cli('recording.stop', {'id': rid})
        self.close_app('player')
        time.sleep(2.0)
        us = 1_000_000
        for action in ({'action': 'seek', 'time': round(step['trim'][0] * us)}, {'action': 'setIn'},
                       {'action': 'seek', 'time': round(step['trim'][1] * us)}, {'action': 'setOut'}):
            self.cli('recording.review', {'id': rid, **action})
            time.sleep(0.6)
        self.step_pause()
        self.park()
        window = self.locate()
        # Recording start times drift, so no fixed moment is safe: the demo clip has fades and
        # dissolves. Show the frame with the most contrast.
        x, y, w, h = window
        video_box = (x + w // 4, y + h // 6, x + 3 * w // 4, y + h // 2)
        def contrast(playhead):
            self.cli('recording.review', {'id': rid, 'action': 'seek', 'time': round(playhead * us)})
            time.sleep(1.0)
            return max(ImageStat.Stat(self.grab().crop(video_box)).stddev)
        best = max(step['playheads'], key=contrast)
        self.cli('recording.review', {'id': rid, 'action': 'seek', 'time': round(best * us)})
        self.log(f'  showing the recording at {best} s')
        time.sleep(1.0)
        self.anchors[step['id']] = {'window': window}
        for theme in ('dark', 'light'):
            self.set_theme(theme)
            self.park()
            frame = self.keep(step['id'], theme)
            x, y, w, h = window
            video = frame.crop((x + w // 4, y + h // 6, x + 3 * w // 4, y + h // 2))
            if max(ImageStat.Stat(video).stddev) < 10:
                raise StoryError('the recorded clip looks blank in the review window')
        self.set_theme('dark')
        state = self.cli('recording.inspect', {'id': rid})
        revision = state.get('revision', (state.get('edit') or {}).get('revision'))
        op = find_id(self.cli('recording.upload', {'id': rid, 'revision': revision}), 'operationId')
        self.uploads.append(op)
        self.wait_operation(op, timeout=600)

    def prepare_recording(self, request, attempts=8):
        for attempt in range(attempts):
            try:
                rid = find_id(self.cli('recording.prepare', request))
                break
            except StoryError:
                if attempt == attempts - 1:
                    raise
                time.sleep(1.5)  # the cancelled session is still closing
        deadline = time.monotonic() + 30
        while self.cli('recording.inspect', {'id': rid}).get('state') != 'ready':
            if time.monotonic() > deadline:
                raise StoryError('recording never became ready')
            time.sleep(0.5)
        return rid

    def file_upload(self, step):
        path = f"{self.host.run_dir}/upload/{step['filename']}"
        self.host.run(f"mkdir -p -m 700 {self.host.run_dir}/upload && cp {self.media[step['media']]} {path}")
        self.focus_backdrop()  # keyboard focus, so it may own the clipboard
        self.host.agent('send', 'backdrop', f'clip {path}')
        time.sleep(1.0)
        op = find_id(self.cli('action.invoke', {'action': 'clipboard'}))
        self.uploads.append(op)
        self.wait_operation(op)
        self.park()

    def main_window(self, view, size):
        self.cli('ui.show', {'view': view})
        time.sleep(2.5)
        self.park()
        box = self.locate(settle=10.0)
        scale = self.scale
        size = [v * scale for v in size] if size else size
        if size and (abs(box[2] - size[0]) > 2 * scale or abs(box[3] - size[1]) > 2 * scale):
            # Resize by the bottom-right corner, then centre it below the top bar, by real drags.
            corner = (box[0] + box[2] - 3 * scale, box[1] + box[3] - 3 * scale)
            self.drag(corner, (box[0] + size[0] - 3 * scale, box[1] + size[1] - 3 * scale))
            time.sleep(1.0)
            self.park()
            box = self.locate(expect=size, tolerance=4 * scale)
            target = ((self.screen[0] - box[2]) // 2, 32 * scale + (self.screen[1] - 32 * scale - box[3]) // 2)
            grip = (box[0] + 240 * scale, box[1] + 26 * scale)
            self.drag(grip, (grip[0] + target[0] - box[0], grip[1] + target[1] - box[1]))
            time.sleep(1.0)
            self.park()
            box = self.locate(expect=size, tolerance=4 * scale)
        return box

    def history(self, step):
        self.idle()
        box = self.main_window('history', step['window'])
        listing = self.cli('history.list', {'limit': 10, 'offset': 0})
        items = listing.get('records') or []
        if len(items) < 5:
            raise StoryError(f'History holds {len(items)} items; the story should leave 5 or 6')
        view = step.get('view', 'list')
        if view != 'list':
            self.cli('ui.history', {'action': 'clearSelection'})
            self.cli('ui.history', {'action': 'setView', 'view': view})
        else:
            self.cli('ui.history', {'action': 'select', 'ids': [items[0]['id']]})
        time.sleep(2.0)
        self.anchors[step['id']] = {'window': box}
        for theme in ('dark', 'light'):
            self.set_theme(theme)
            self.park()
            self.keep(step['id'], theme)
        self.set_theme('dark')
        if view != 'list':
            self.cli('ui.history', {'action': 'setView', 'view': 'list'})
            self.cli('ui.history', {'action': 'select', 'ids': [items[0]['id']]})
            time.sleep(1.0)

    def destinations(self, step):
        self.page(step, 'destinations')

    def settings(self, step):
        self.page(step, step.get('view', 'settings'), step.get('row'), step.get('scroll'))

    def destination(self, step):
        """A provider's destination form as Add destination shows it: a profile with the
        provider's defaults and no account or bucket, moved to the top of the list and clicked."""
        provider = step['provider']
        label, defaults = PROVIDERS[provider]
        pid = f'shot-{provider}'
        profiles = [dict(p) for p in self.cli('settings.get')['document']['profiles']]
        order = [p['id'] for p in profiles]
        if pid not in order:
            profiles.append({'id': pid, 'label': label, 'provider': provider, 'settings': defaults,
                             'credentials': {'mode': 'keychain', 'reference': REFERENCES.get(provider, 'putgd/{pid}').format(pid=pid)}})
            self.patch({'profiles': profiles})
            order.append(pid)
        self.reorder([pid] + [i for i in order if i != pid])
        self.cli('ui.show', {'view': 'destinations'})
        time.sleep(2.0)
        self.park()
        window = self.locate()
        x, y = (v * self.scale for v in DESTINATION_ROW)
        self.input.click(window[0] + x, window[1] + y)
        time.sleep(1.5)
        self.park()
        self.anchors[step['id']] = {'window': window}
        for theme in ('dark', 'light'):
            self.set_theme(theme)
            self.park()
            self.keep(step['id'], theme)
        self.set_theme('dark')
        self.reorder([i for i in order if i != pid] + [pid])  # the demo destination leads again

    def reorder(self, order):
        revision = self.cli('settings.get')['metadata']['observedRevision']
        self.cli('settings.reorderProfiles', {'order': order, 'expectedRevision': revision})
        time.sleep(1.0)

    def page(self, step, view, row=None, scroll=None):
        """A page of the main window, as History left it. `row` picks a Settings category
        by a real click in its rail (the first row is what the page opens on). `scroll` then
        drags the page's scrollbar down by that many (logical) pixels."""
        self.cli('ui.show', {'view': view})
        time.sleep(2.0)
        self.park()
        window = self.locate()
        if row is not None:
            # Row 0 is General (a plain `if row` skipped it). Twice, since a click on the
            # selected row is harmless and one has been lost after another Settings step.
            x, y, pitch = (v * self.scale for v in SETTINGS_RAIL)
            for _ in range(2):
                self.input.click(window[0] + x, window[1] + y + row * pitch)
                time.sleep(1.0)
            self.park()
        if scroll:
            x, y = window[0] + window[2] - SCROLLBAR[0] * self.scale, window[1] + SCROLLBAR[1] * self.scale
            self.drag((x, y), (x, y + scroll * self.scale))
            time.sleep(1.0)
            self.park()
        self.anchors[step['id']] = {'window': window}
        for theme in ('dark', 'light'):
            self.set_theme(theme)
            self.park()
            self.keep(step['id'], theme)
        self.set_theme('dark')

    def desktop(self, step):
        """The whole screen: History on an empty workspace over the stock wallpaper.
        The backdrop and everything else stay on the current workspace."""
        self.cli('ui.show', {'view': 'history'})
        time.sleep(1.5)
        box = self.locate(expect=[v * self.scale for v in step['window']], tolerance=4 * self.scale)  # leaves the backdrop magenta
        self.input.click(box[0] + 240 * self.scale, box[1] + 26 * self.scale)  # focus the window by its header
        time.sleep(0.5)
        self.input.key('super', 'shift', 'end')  # move-to-workspace-last; the view follows
        self.workspace_moved = True
        time.sleep(2.5)
        if imaging.color_fraction(self.grab(), imaging.LOCATE_COLOR) > 0.0005:
            raise StoryError('the backdrop is still on screen; the window did not reach an empty workspace')
        self.wallpaper()
        self.park(self.screen[0] - 1, self.screen[1] - 1)  # the arrow's hotspot in the corner: the arrow is off screen
        for theme in ('dark', 'light'):
            self.set_theme(theme, backdrop=False)
            time.sleep(1.5)
            self.keep(step['id'], theme)
        self.anchors[step['id']] = {'window': box, 'screen': [0, 0, self.screen[0], self.screen[1]]}
        self.leave_workspace()
        self.set_theme('dark')  # also returns the backdrop on workspace 1 to its colour

    def file_manager(self, step):
        """The desktop's file manager showing the demo upload folder, with the right-click
        menu of its file open: Upload with put.gd is what the reader is shown. The file is
        selected from the keyboard and the menu opened with the Menu key, so no position
        inside the file manager's window is assumed."""
        folder = f'{self.host.run_dir}/upload'
        if self.host.run(f'ls {folder} 2>/dev/null | wc -l').strip() == '0':
            raise StoryError('the upload folder is empty; the file-upload step must run first')
        boxes = []
        for theme in ('dark', 'light'):
            self.set_theme(theme)
            window = self.open_app('files', self.host.cfg['files'] + [folder], expect_min=(600, 400))
            self.backdrop(self.themes[theme]['backdrop'].lstrip('#'))
            self.input.click(window[0] + window[2] // 2, window[1] + window[3] - 40 * self.scale)  # focus the file area
            time.sleep(0.6)
            self.input.key('right')  # selects the first (only) file
            time.sleep(0.6)
            self.park()
            before = self.grab()
            self.input.key('menu')
            time.sleep(1.2)
            frame = self.keep(step['id'], theme)
            menu = imaging.changed_box(before, frame, min_run=8 * self.scale)
            if not menu or menu[3] < 120 * self.scale:
                raise StoryError(f'no context menu opened in the file manager (changed area {menu})')
            boxes.append((window, menu))
            self.input.key('esc')
            time.sleep(0.5)
            self.close_app('files')
            time.sleep(1.0)
        window = boxes[-1][0]
        x0 = min(min(w[0], m[0]) for w, m in boxes)
        y0 = min(min(w[1], m[1]) for w, m in boxes)
        x1 = max(max(w[0] + w[2], m[0] + m[2]) for w, m in boxes)
        y1 = max(max(w[1] + w[3], m[1] + m[3]) for w, m in boxes)
        self.anchors[step['id']] = {'window': window, 'menu': boxes[-1][1], 'frame': [x0, y0, x1 - x0, y1 - y0]}
        self.set_theme('dark')

    def about(self, step):
        """The About window, on its own on the backdrop."""
        self.cli('ui.show', {'view': 'about'})
        time.sleep(2.5)
        self.park()
        window = self.locate(settle=10.0)
        self.anchors[step['id']] = {'window': window}
        for theme in ('dark', 'light'):
            self.set_theme(theme)
            self.park()
            self.keep(step['id'], theme)
        self.set_theme('dark')
        self.input.click(window[0] + window[2] // 2, window[1] + 20 * self.scale)  # focus it by its header
        time.sleep(0.4)
        self.input.key('esc')
        time.sleep(1.0)
        self.park()

    def wallpaper(self):
        for key, value in self.host.cfg['wallpaper'].items():
            self.host.agent('gsettings', 'set', 'org.gnome.desktop.background', key, value.strip("'"))

    def tray(self, step):
        """The tray menu, opened by a real click on put.gd's indicator in the top bar, over
        the stock wallpaper on the empty last workspace. The anchor is what the click changed."""
        self.input.key('super', 'end')  # switch-to-workspace-last: always an empty one
        self.workspace_moved = True
        time.sleep(2.5)
        if imaging.color_fraction(self.grab(), imaging.LOCATE_COLOR) > 0.0005:
            raise StoryError('the backdrop is still on screen; the view did not reach an empty workspace')
        self.wallpaper()
        boxes = []
        for theme in ('dark', 'light'):
            self.set_theme(theme, backdrop=False)
            self.park(self.screen[0] - 1, self.screen[1] - 1)
            time.sleep(1.5)
            before = self.grab()
            bar = imaging.bar_height(before, self.scale)
            if bar < 16 * self.scale:
                raise StoryError('no top bar at the top of the screen')
            try:
                icon = imaging.tray_icon(before.crop((0, 0, before.size[0], bar)), self.scale)
            except ValueError as error:
                raise StoryError(f'tray icon: {error}') from error
            self.log(f'  tray icon at {icon}')
            self.input.click(icon[0], icon[1])
            time.sleep(0.8)
            self.park(self.screen[0] - 1, self.screen[1] - 1)
            frame = self.keep(step['id'], theme)
            box = imaging.changed_box(before, frame, min_run=8 * self.scale)
            if not box or box[3] < 160 * self.scale or box[2] > box[3]:
                raise StoryError(f'no menu opened under the tray icon (changed area {box})')
            boxes.append(box)
            self.input.key('esc')
            time.sleep(1.0)
        x0, y0 = min(b[0] for b in boxes), min(b[1] for b in boxes)
        x1, y1 = max(b[0] + b[2] for b in boxes), max(b[1] + b[3] for b in boxes)
        self.anchors[step['id']] = {'menu': [x0, y0, x1 - x0, y1 - y0], 'screen': [0, 0, self.screen[0], self.screen[1]]}
        self.leave_workspace()
        self.set_theme('dark')

    def leave_workspace(self):
        if self.workspace_moved:
            self.input.key('super', 'home')  # switch-to-workspace-1, where the session started
            self.workspace_moved = False
            time.sleep(1.5)

    def run(self, steps=None):
        handlers = {'region-capture': self.region_capture, 'edit': self.edit, 'record': self.record,
                    'file-upload': self.file_upload, 'history': self.history, 'destinations': self.destinations,
                    'destination': self.destination, 'settings': self.settings, 'tray': self.tray,
                    'file-manager': self.file_manager, 'about': self.about,
                    'desktop': self.desktop}
        self.set_theme('dark')
        for step in self.cfg['story']:
            if steps and step['id'] not in steps:
                continue
            self.log(f'story: {step["id"]} ({step["kind"]})')
            handlers[step['kind']](step)
            self.step_pause()


def new_reference():
    return f'putgd-lab-{uuid.uuid4()}'
