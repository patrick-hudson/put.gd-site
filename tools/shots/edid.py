"""An EDID for a display that isn't there: 3840x2160 at 30 Hz over HDMI (pure).

The lab desktops have no monitor; the kernel is told to pretend one exists. This one has
four times the pixels of the usual pretend 1080p panel, so GNOME at 200% draws the same
1920x1080 layout with twice the detail. It needs the HDMI block: without it, i915 treats
the output as DVI, limited to 165 MHz, and rejects the mode's 297 MHz.

It keeps the 1080p panel's identity (LNX, "Linux FHD", serial "Linux #0"): the desktop's
VNC server may share that monitor without a prompt, and a prompt on a screen nobody can
reach would stop the run."""
import struct

CLOCK_KHZ = 297_000
H_ACTIVE, H_FRONT, H_SYNC, H_BACK = 3840, 176, 88, 296  # CEA mode 95
V_ACTIVE, V_FRONT, V_SYNC, V_BACK = 2160, 8, 10, 72


def _checked(block):
    block = bytes(block)
    return block + bytes([-sum(block) & 0xFF])


def _timing():
    hblank, vblank = H_FRONT + H_SYNC + H_BACK, V_FRONT + V_SYNC + V_BACK
    return bytes([
        (CLOCK_KHZ // 10) & 0xFF, (CLOCK_KHZ // 10) >> 8,
        H_ACTIVE & 0xFF, hblank & 0xFF, ((H_ACTIVE >> 8) << 4) | (hblank >> 8),
        V_ACTIVE & 0xFF, vblank & 0xFF, ((V_ACTIVE >> 8) << 4) | (vblank >> 8),
        H_FRONT & 0xFF, H_SYNC & 0xFF, ((V_FRONT & 0xF) << 4) | (V_SYNC & 0xF),
        ((H_FRONT >> 8) << 6) | ((H_SYNC >> 8) << 4) | ((V_FRONT >> 4) << 2) | (V_SYNC >> 4),
        600 & 0xFF, 340 & 0xFF, ((600 >> 8) << 4) | (340 >> 8),  # 600 x 340 mm
        0, 0, 0x1E,  # digital separate sync, both positive
    ])


def _descriptor(tag, payload):
    return bytes([0, 0, 0, tag, 0]) + payload


def _text(text):
    return (text.encode() + b'\n').ljust(13, b' ')


def build():
    """The two 128-byte blocks: base EDID and the CTA extension with the HDMI block."""
    base = bytearray(b'\x00\xff\xff\xff\xff\xff\xff\x00')
    base += struct.pack('>H', (ord('L') - 64) << 10 | (ord('N') - 64) << 5 | (ord('X') - 64))
    base += struct.pack('<HIBB', 0, 0, 1, 2012 - 1990)
    base += bytes([1, 4, 0x80, 60, 34, 120, 0x0A])  # EDID 1.4, digital, 60 x 34 cm, gamma 2.2, RGB
    base += bytes([0xEE, 0x91, 0xA3, 0x54, 0x4C, 0x99, 0x26, 0x0F, 0x50, 0x54])  # sRGB chromaticity
    base += bytes(3) + bytes([1, 1] * 8)  # no legacy timings
    base += _timing()
    base += _descriptor(0xFC, _text('Linux FHD'))
    base += _descriptor(0xFD, bytes([24, 60, 30, 140, 30, 0]) + b'\n' + b' ' * 6)  # 24-60 Hz, 30-140 kHz, 300 MHz
    base += _descriptor(0xFF, _text('Linux #0'))
    base += bytes([1])  # one extension block
    vsdb = bytes([0x60 | 6, 0x03, 0x0C, 0x00, 0x10, 0x00, 60])  # HDMI, address 1.0.0.0, max TMDS 60 x 5 MHz
    cta = bytearray([0x02, 0x03, 4 + len(vsdb), 0x00]) + vsdb
    cta += bytes(127 - len(cta))
    return _checked(base) + _checked(cta)


def monitors_xml(connector):
    """GNOME's saved layout for this display at 200%, so a fresh login starts in it."""
    return f"""<monitors version="2">
  <configuration>
    <layoutmode>logical</layoutmode>
    <logicalmonitor>
      <x>0</x>
      <y>0</y>
      <scale>2</scale>
      <primary>yes</primary>
      <monitor>
        <monitorspec>
          <connector>{connector}</connector>
          <vendor>LNX</vendor>
          <product>Linux FHD</product>
          <serial>Linux #0</serial>
        </monitorspec>
        <mode>
          <width>{H_ACTIVE}</width>
          <height>{V_ACTIVE}</height>
          <rate>30.000</rate>
        </mode>
      </monitor>
    </logicalmonitor>
  </configuration>
</monitors>
"""
