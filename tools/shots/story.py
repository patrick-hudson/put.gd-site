"""The demo story, driven on a physical desktop's real session. put.gd is
driven through putgd-cli; drags, clicks and keys are real input sent over
the host's loopback VNC; every frame is read back from that same VNC stream.

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
DONE_STATES = {'completed', 'failed', 'partial', 'cancelled', 'interrupted'}


class StoryError(RuntimeError):
    pass


def find_id(result, *keys):
    for key in keys + ('operationId', 'id'):
        if isinstance(result, dict) and isinstance(result.get(key), str):
            return result[key]
    raise StoryError(f'no id in reply {json.dumps(result)[:300]}')


class Story:
    def __init__(self, host, rfb, cfg, media, frames_dir, log):
        self.host, self.rfb, self.cfg, self.media = host, rfb, cfg, media
        self.frames_dir, self.log = frames_dir, log
        self.pace = cfg['pace']
        self.themes = cfg['themes']
        self.anchors, self.frames, self.uploads = {}, {}, []
        self.theme = None
        self.screen = [rfb.width, rfb.height]
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
        self.rfb.pointer(self.screen[0] - 4 if x is None else x, self.screen[1] - 4 if y is None else y)
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
        rfb = self.rfb
        rfb.pointer(*p0)
        time.sleep(0.4)
        rfb.pointer(*p0, down=True)
        time.sleep(0.3)
        steps = 30
        for i in range(1, steps + 1):
            rfb.pointer(p0[0] + (p1[0] - p0[0]) * i / steps, p0[1] + (p1[1] - p0[1]) * i / steps)
            time.sleep(0.04)
        time.sleep(0.5)
        if not hold:
            rfb.pointer(*p1, down=False)

    def release(self, point):
        self.rfb.pointer(*point, down=False)

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
        self.rfb.click(40, self.screen[1] - 40)
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
            if box[2] >= expect_min[0] and box[3] >= expect_min[1]:
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
                    self.rfb.key('esc')
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
        self.cli('editor.apply', {'id': op, 'commands': [{'op': 'add', 'shape': {'kind': 'redact', 'rect': rect}}]},
                 retry=('editor_starting',))
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
                      f"{self.media[step['media']]} -an -vf scale=1280:-2 -c:v libvpx-vp9 -deadline realtime -cpu-used 8 -b:v 4M "
                      f"-row-mt 1 {clip}", timeout=300)
        player = self.open_app('player', self.host.cfg['player'] + [clip])
        self.backdrop(self.themes[self.theme]['backdrop'].lstrip('#'))
        self.park()
        area = self.inner(player, step['area'])
        caps = self.cli('recording.capabilities')
        fmt = 'mp4'
        encoders = (caps.get('gstreamer') or {}).get('usableH264Encoders')
        if encoders == []:
            fmt = 'webm'
        rid = find_id(self.cli('recording.prepare', {'target': {'kind': 'region', 'rect': area}, 'format': fmt}))
        deadline = time.monotonic() + 30
        while self.cli('recording.inspect', {'id': rid}).get('state') != 'ready':
            if time.monotonic() > deadline:
                raise StoryError('recording never became ready')
            time.sleep(0.5)
        self.cli('recording.start', {'id': rid})
        time.sleep(step['seconds'])
        self.cli('recording.stop', {'id': rid})
        self.close_app('player')
        time.sleep(2.0)
        us = 1_000_000
        for action in ({'action': 'seek', 'time': round(step['trim'][0] * us)}, {'action': 'setIn'},
                       {'action': 'seek', 'time': round(step['trim'][1] * us)}, {'action': 'setOut'},
                       {'action': 'seek', 'time': round(step['playhead'] * us)}):
            self.cli('recording.review', {'id': rid, **action})
            time.sleep(0.6)
        self.step_pause()
        self.park()
        window = self.locate()
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
        if size and (abs(box[2] - size[0]) > 2 or abs(box[3] - size[1]) > 2):
            # Resize by the bottom-right corner, then centre it below the top bar, by real drags.
            corner = (box[0] + box[2] - 3, box[1] + box[3] - 3)
            self.drag(corner, (box[0] + size[0] - 3, box[1] + size[1] - 3))
            time.sleep(1.0)
            self.park()
            box = self.locate(expect=size, tolerance=4)
            target = ((self.screen[0] - box[2]) // 2, 32 + (self.screen[1] - 32 - box[3]) // 2)
            grip = (box[0] + 240, box[1] + 26)
            self.drag(grip, (grip[0] + target[0] - box[0], grip[1] + target[1] - box[1]))
            time.sleep(1.0)
            self.park()
            box = self.locate(expect=size, tolerance=4)
        return box

    def history(self, step):
        self.idle()
        box = self.main_window('history', step['window'])
        listing = self.cli('history.list', {'limit': 10, 'offset': 0})
        items = listing.get('records') or []
        if len(items) < 5:
            raise StoryError(f'History holds {len(items)} items; the story should leave 5 or 6')
        self.cli('ui.history', {'action': 'select', 'ids': [items[0]['id']]})
        time.sleep(2.0)
        self.anchors[step['id']] = {'window': box}
        for theme in ('dark', 'light'):
            self.set_theme(theme)
            self.park()
            self.keep(step['id'], theme)
        self.set_theme('dark')

    def destinations(self, step):
        self.cli('ui.show', {'view': 'destinations'})
        time.sleep(2.0)
        self.park()
        self.anchors[step['id']] = {'window': self.locate()}
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
        box = self.locate(expect=step['window'], tolerance=4)  # leaves the backdrop magenta
        self.rfb.click(box[0] + 240, box[1] + 26)  # focus the window by its header
        time.sleep(0.5)
        self.rfb.key('super', 'shift', 'end')  # move-to-workspace-last; the view follows
        self.workspace_moved = True
        time.sleep(2.5)
        if imaging.color_fraction(self.grab(), imaging.LOCATE_COLOR) > 0.0005:
            raise StoryError('the backdrop is still on screen; the window did not reach an empty workspace')
        wallpaper = self.host.cfg['wallpaper']
        for key, value in wallpaper.items():
            self.host.agent('gsettings', 'set', 'org.gnome.desktop.background', key, value.strip("'"))
        self.park(self.screen[0] - 1, self.screen[1] - 1)  # the arrow's hotspot in the corner: the arrow is off screen
        for theme in ('dark', 'light'):
            self.set_theme(theme, backdrop=False)
            time.sleep(1.5)
            self.keep(step['id'], theme)
        self.anchors[step['id']] = {'window': box, 'screen': [0, 0, self.screen[0], self.screen[1]]}
        self.leave_workspace()
        self.set_theme('dark')  # also returns the backdrop on workspace 1 to its colour

    def leave_workspace(self):
        if self.workspace_moved:
            self.rfb.key('super', 'home')  # switch-to-workspace-1, where the session started
            self.workspace_moved = False
            time.sleep(1.5)

    def run(self, steps=None):
        handlers = {'region-capture': self.region_capture, 'edit': self.edit, 'record': self.record,
                    'file-upload': self.file_upload, 'history': self.history, 'destinations': self.destinations,
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
