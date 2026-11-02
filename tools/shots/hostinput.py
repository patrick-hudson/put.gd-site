"""Pointer and keyboard through the lab's kernel input agent (tools/lab/host_input.py).

VNC keeps the frames, so the run stays watchable. It can't carry the input at 200%: the
server drops pointer positions past the desktop's logical size, 1920x1080 on a 3840x2160
screen. The agent's devices reach the compositor like hardware and cover the whole screen.
Same calls as rfb.RFB."""
import json
import shlex
import socket
import subprocess
import tempfile
import time
from pathlib import Path

AXIS_MAX = 32767
QCODES = {'super': 'meta_l', 'shift': 'shift', 'end': 'end', 'home': 'home', 'esc': 'esc'}
AGENT_PATTERN = '[h]ost_input.py serve'


def stop_agent(host):
    host.run(f'sudo -n pkill -f {shlex.quote(AGENT_PATTERN)} || true')


class HostInput:
    def __init__(self, host, source, width, height):
        self.host, self.width, self.height = host, width, height
        uid = host.run('id -u').strip()
        self.remote = f'/run/user/{uid}/putgd-lab-input.sock'
        agent = f'{host.run_dir}/host_input.py'
        host.put(source, agent)
        host.run(f'sudo -n setsid nohup python3 -I {shlex.quote(agent)} serve --socket {self.remote} '
                 f'--user {shlex.quote(host.cfg["user"])} >/dev/null 2>&1 </dev/null &')
        self.scratch = tempfile.mkdtemp(prefix='site-shots-input-')
        self.local = Path(self.scratch) / 'input.sock'
        self.tunnel = None
        self.sock = None
        deadline = time.monotonic() + 20
        while True:
            if host.run(f'test -S {self.remote} && echo y || true').strip() == 'y':
                break
            if time.monotonic() > deadline:
                raise RuntimeError('the input agent did not start')
            time.sleep(0.5)
        time.sleep(1.0)  # the compositor enumerates the new devices
        self.tunnel = subprocess.Popen(['ssh', '-N', '-o', 'ExitOnForwardFailure=yes', '-L', f'{self.local}:{self.remote}']
                                       + host.ssh_args() + [host.target], stdin=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        while not self.local.exists():
            if time.monotonic() > deadline or self.tunnel.poll() is not None:
                raise RuntimeError('no tunnel to the input agent')
            time.sleep(0.2)
        self.sock = socket.socket(socket.AF_UNIX)
        self.sock.connect(str(self.local))
        self.stream = self.sock.makefile('r')
        self.stream.readline()  # greeting
        self._call({'execute': 'qmp_capabilities'})

    def _call(self, request):
        self.sock.sendall((json.dumps(request) + '\n').encode())
        reply = json.loads(self.stream.readline())
        if 'error' in reply:
            raise RuntimeError(f'input agent: {reply["error"]}')

    def _send(self, events):
        self._call({'execute': 'input-send-event', 'arguments': {'events': events}})

    def pointer(self, x, y, down=None):
        self._send([{'type': 'abs', 'data': {'axis': 'x', 'value': axis(x, self.width)}},
                    {'type': 'abs', 'data': {'axis': 'y', 'value': axis(y, self.height)}}])
        if down is not None:
            time.sleep(0.03)
            self._send([{'type': 'btn', 'data': {'down': down, 'button': 'left'}}])

    def click(self, x, y):
        self.pointer(x, y)
        time.sleep(0.15)
        self.pointer(x, y, True)
        time.sleep(0.05)
        self.pointer(x, y, False)

    def key(self, *names, hold=0.05):
        codes = [QCODES[n] for n in names]
        press = lambda code, down: {'type': 'key', 'data': {'down': down, 'key': {'type': 'qcode', 'data': code}}}
        for code in codes:
            self._send([press(code, True)])
            time.sleep(0.01)
        time.sleep(hold)
        for code in reversed(codes):
            self._send([press(code, False)])
            time.sleep(0.01)

    def close(self):
        if self.sock:
            self.sock.close()
        if self.tunnel:
            self.tunnel.terminate()
            self.tunnel.wait(timeout=10)
        self.local.unlink(missing_ok=True)
        Path(self.scratch).rmdir()


def axis(value, size):
    return max(0, min(AXIS_MAX, round(value * AXIS_MAX / max(1, size - 1))))
