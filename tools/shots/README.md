# Site screenshots

`public/_site/shots/` is produced by one command. It drives put.gd in the real
GNOME session of a physical lab desktop and reads every frame back from that
screen over the desktop's loopback VNC, so you can watch the whole run on the
display wall.

```sh
python3 tools/shots/capture.py                      # f44, latest nightly
python3 tools/shots/capture.py --host f44 --release v26.1029.2229-nightly
```

Rerun it whenever the app's UI changes. It takes about 10 minutes and is safe to
rerun: it restores the host at the end, and a rerun first repairs anything an
interrupted run left behind.

At start it prints the wall tile to watch (for f44: **Fedora 44 GNOME - build
server** on <http://127.0.0.1:8765/>, VNC `127.0.0.1:5970`). It refuses to run
unless that tile's RFB handshake succeeds through the wall and the VNC port
answers. The tile stays view-only: input goes over the script's own VNC
connection.

## Prerequisites (workstation)

- The display wall and the host's VNC tunnel (`putgd-fedora-vnc.service`) running.
- Pinned SSH to the host (`docs/remote-builders.md` in the app repo). The pin is
  read from `$PUTGD_REPO/work/remote-builders/<host>/known_hosts`; `PUTGD_REPO`
  defaults to `~/work/put.gd`, whose `tools/lab/rfb.py` and
  `tools/lab/desktop_lock.py` are also used.
- `gh` logged in (the release package is downloaded and checked against the
  release's `SHA256SUMS`).
- `~/.config/putgd-site/demo-uploader.json`, mode 0600: the demo.put.gd uploader key.
  It goes to the host's keychain over SSH stdin only.
- Python 3 with Pillow.

Downloads are cached in `~/.cache/putgd-site-shots/`; each run's raw frames are
kept in `~/.cache/putgd-site-shots/runs/<time>/`.

## What it does to the host

Under the host's desktop lock (`desktop_lock.py`, heartbeated, released only after
its cleanup check passes):

1. Installs the release package (refusing a transaction that touches desktop
   packages, or a put.gd it didn't install).
2. Logs the GNOME session out and lets GDM log back in, so Shell loads the put.gd
   extension. It stops instead if the session has apps of yours open.
3. Writes the demo key to the default keyring in put.gd's keychain format under a
   fresh `putgd-lab-<uuid>` reference. The blank lab keyring is unlocked only if
   that needs no prompt.
4. Covers the screen with its own backdrop window. The backdrop is magenta while
   a window is located, then dark `#121212` or light `#EDEDEA`. Your windows stay
   behind it, untouched.
5. Runs put.gd with private config, data, cache, state and runtime dirs, plus
   Loupe and Showtime with private dirs and in-memory settings. It turns
   notification banners off and switches GNOME's colour scheme for each theme.
6. Runs the story: region captures of NASA photos, an edit with a redaction, a
   region recording of the Sintel trailer, a clipboard file upload, then History
   and Destinations.
7. For `desktop`, moves the History window to the last (empty) workspace with
   Super+Shift+End, sets the stock wallpaper and grabs the whole screen, then
   switches back with Super+Home.
8. Restores everything: stops exactly the PIDs it started, deletes the keychain
   entry and the run directory, restores the GNOME settings it changed
   (colour scheme, banners, wallpaper), removes the package and logs in afresh to
   unload the extension.

What it records is kept in `~/.local/state/site-shots/state.json` on the host.
After a crash, run `capture.py --cleanup-only`.

The uploads stay in the `putgd-demo` bucket, so the links shown in the shots
work; the bucket expires them after 30 days.

## Changing shots

- `shots.json`: `story` (the steps, run in order) and `shots` (which step's frame
  each shot uses, and its crops). Crops are relative to a rectangle the step
  records:
  - `window`: the app window.
  - `viewer`/`selection`: the photo viewer and the dragged region.
  - `screen`: the whole screen.

  A crop is one of:
  - `{"pad": N}`: grow the anchor by N.
  - `{"rect": [x, y, w, h]}`: relative to the anchor's top-left.
  - `{"center": [fx, fy], "size": [w, h]}`: a box centred on a fraction of the anchor.

  Add `"clamp": "screen"` to let a crop leave the anchor. Tiles must be 4:3 and
  every crop size even. `mobile` is optional.
- `media.json`: each demo file with its pinned URL, sha256, credit and license.
  A changed upstream file stops the run; pin a new one.
- `hosts.json`: the physical desktops (only GNOME is implemented).

To try a crop change without the desktop, re-crop an earlier run. This encodes
on the host over SSH and needs no lock:

```sh
python3 tools/shots/capture.py --from-frames ~/.cache/putgd-site-shots/runs/<time>
```

For debugging, `--steps a,b` runs only some story steps and writes no outputs.
`--keep-host` leaves the package, run directory and lock in place for the next try.

Outputs are `<shot>-<theme>[-mobile][@2x].{avif,webp}` and `shots.json`
(provenance, pixel sizes and media credits). The host renders at scale 1, so
`@2x` is the native capture and 1x is a half-size downscale.

## Tests

```sh
python3 -m unittest discover -s tools
```

The tests cover crops, locating, the privacy checks, config validation, the
manifest and metadata stripping. One test checks that the app's internal design
codename appears nowhere in `tools/shots` or `public/_site/shots`. Set
`PUTGD_FORBIDDEN_WORD` to check a different word.
