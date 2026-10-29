"""The display wall (http://127.0.0.1:8765/): find a physical desktop's tile and
prove it would show "VNC connected". The wall's noVNC tile connects to
ws://WALL/vnc/<machine id> and reports "VNC connected" after the RFB
handshake; `tile_handshake` performs that same handshake as a shared,
view-only client (it sends no input and asks for no pixels) and disconnects."""
import base64
import json
import os
import socket
import struct
import urllib.request
from urllib.parse import urlsplit


class WallError(RuntimeError):
    pass


def machines(wall):
    try:
        with urllib.request.urlopen(wall.rstrip('/') + '/api/machines', timeout=8) as reply:
            return json.load(reply)
    except (OSError, ValueError) as error:
        raise WallError(f'the display wall at {wall} is not answering ({error}); start it before capturing') from error


def find_tile(wall, address):
    for machine in machines(wall):
        if machine.get('type') == 'physical' and machine.get('ip') == address:
            if not machine.get('available'):
                raise WallError(f'the wall lists {machine.get("name")} but marks it unavailable')
            return machine
    raise WallError(f'the display wall has no physical tile for {address}')


class _WebSocket:
    def __init__(self, url, timeout=10):
        parts = urlsplit(url)
        self.sock = socket.create_connection((parts.hostname, parts.port or 80), timeout)
        key = base64.b64encode(os.urandom(16)).decode()
        request = (f'GET {parts.path} HTTP/1.1\r\nHost: {parts.netloc}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n'
                   f'Origin: http://{parts.netloc}\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n')
        self.sock.sendall(request.encode())
        head = b''
        while b'\r\n\r\n' not in head:
            chunk = self.sock.recv(1)
            if not chunk:
                raise WallError('the wall closed the tile connection during the upgrade')
            head += chunk
        if b' 101 ' not in head.split(b'\r\n', 1)[0]:
            raise WallError('the wall refused the tile connection: ' + head.split(b'\r\n', 1)[0].decode(errors='replace'))
        self.buffer = b''

    def send(self, data):
        mask = os.urandom(4)
        length = len(data)
        header = bytes([0x82]) + (bytes([0x80 | length]) if length < 126 else bytes([0x80 | 126]) + struct.pack('>H', length))
        self.sock.sendall(header + mask + bytes(b ^ mask[i % 4] for i, b in enumerate(data)))

    def _frame(self):
        def read(n):
            data = b''
            while len(data) < n:
                chunk = self.sock.recv(n - len(data))
                if not chunk:
                    raise WallError('the wall closed the tile connection')
                data += chunk
            return data
        first, second = read(2)
        length = second & 0x7f
        if length == 126:
            length = struct.unpack('>H', read(2))[0]
        elif length == 127:
            length = struct.unpack('>Q', read(8))[0]
        payload = read(length)
        if first & 0x0f == 0x8:
            raise WallError('the wall closed the tile connection')
        return payload

    def read(self, n):
        while len(self.buffer) < n:
            self.buffer += self._frame()
        data, self.buffer = self.buffer[:n], self.buffer[n:]
        return data

    def close(self):
        try:
            self.sock.sendall(bytes([0x88, 0x80]) + os.urandom(4))
        except OSError:
            pass
        self.sock.close()


def tile_handshake(wall, machine_id):
    """RFB 3.8 handshake through the wall's tile proxy. Returns {"name", "size"}."""
    parts = urlsplit(wall)
    ws = _WebSocket(f'ws://{parts.netloc}/vnc/{machine_id}')
    try:
        if not ws.read(12).startswith(b'RFB '):
            raise WallError('the tile proxy did not speak RFB')
        ws.send(b'RFB 003.008\n')
        count = ws.read(1)[0]
        if count == 0:
            raise WallError('the desktop refused the tile: ' + ws.read(struct.unpack('>I', ws.read(4))[0]).decode(errors='replace'))
        if 1 not in ws.read(count):
            raise WallError('the desktop offers no unauthenticated loopback session')
        ws.send(b'\x01')
        if struct.unpack('>I', ws.read(4))[0] != 0:
            raise WallError('RFB security handshake failed')
        ws.send(b'\x01')  # shared: never disconnect the wall's own viewers
        width, height = struct.unpack('>HH', ws.read(4))
        ws.read(16)
        name = ws.read(struct.unpack('>I', ws.read(4))[0]).decode(errors='replace')
        return {'name': name, 'size': [width, height]}
    finally:
        ws.close()
