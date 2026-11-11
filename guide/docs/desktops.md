# Your desktop

put.gd supports GNOME 50, KDE Plasma, Cinnamon, Budgie and Hyprland. By the end of this page, you know what to set up on yours and what to expect.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 389px" srcset="/_site/shots/tray-light.avif 389w, /_site/shots/tray-light@2x.avif 778w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 389px" srcset="/_site/shots/tray-dark.avif 389w, /_site/shots/tray-dark@2x.avif 778w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 389px" srcset="/_site/shots/tray-light.webp 389w, /_site/shots/tray-light@2x.webp 778w">
  <img src="/_site/shots/tray-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 389px" srcset="/_site/shots/tray-dark.webp 389w, /_site/shots/tray-dark@2x.webp 778w" width="389" height="746" loading="lazy" alt="The put.gd tray menu on GNOME: the current output, Change output, Capture region, Repeat last region, Capture window, Capture monitor, Capture desktop, Capture delay, Capture region &amp; edit, Edit image, Record screen and Upload clipboard, then History, Destinations and Settings, then About put.gd and Quit put.gd.">
</picture>

This GNOME tray menu lists everything you can do from the tray. On every desktop, click the tray icon to open History, or right-click it for this menu. The pictures in this guide are all from GNOME, because that is what our lab captures them on.

To see what your own desktop supports, open **Settings → Advanced → Desktop support details**.

## GNOME

**Install.** GNOME 50 on Wayland needs put.gd's Shell extension. Without it, put.gd can't capture your screen. On a nightly, put.gd sets it up itself: start put.gd and [log out and back in once](index.md#on-gnome-log-out-once) when it asks.

??? note "The AppImage on the stable release"
    The stable AppImage doesn't include the extension, so install it yourself:

    1. On the [releases page](https://github.com/patrick-hudson/put.gd-desktop/releases), open **Sources and GNOME integration** for your version.
    2. Download `putgd-gnome50-VERSION.zip`.
    3. Install it, using its full path:

        ```bash
        gnome-extensions install /absolute/path/to/putgd-gnome50-VERSION.zip
        ```

    4. Log out and back in.
    5. Turn it on:

        ```bash
        gnome-extensions enable putgd@put.gd
        ```

**Tray.** The icon sits in the top bar, through GNOME's AppIndicator extension. Without that there is no tray icon, but notifications still appear.

**Region selection.** The desktop keeps moving while you drag. Press ++esc++ or right-click to cancel.

**Recording.** The recording bar sits outside the area. If there is no room, as when you record your only monitor, it shrinks to a dot and a Stop button in the corner, and appears in the video. On Fedora, recording needs [Cisco's H.264 encoder](index.md#install-with-one-line).

## KDE Plasma

**Install.** Plasma works on Wayland or X11, with nothing extra to install. The AppImage needs Plasma 6: on Plasma 5.27 it says so and exits, so use the DEB. Aurora uses the AppImage.

**Region selection.** On Wayland, a crosshair and rectangle appear over the live desktop. On X11 it works as on Cinnamon.

**Recording.** On Wayland, Plasma 6.6 and later leave the recording bar out of your video. Debian 13's older Plasma doesn't, so the bar can appear when you record a whole monitor.

## Cinnamon

**Install.** Cinnamon runs on X11, and there is nothing extra to install.

**Region selection.** Windows and video keep updating while you select. Drag with the left button, and press ++esc++ or right-click to cancel.

**Recording.** The screen outside the area dims, and the recording bar sits outside the area or on another monitor.

## Budgie

Budgie 10.10 on Wayland, as in Fedora 44 and Ubuntu Budgie 26.04, is supported in [nightly builds](index.md#stable-or-nightly). Budgie 10.9 runs on X11 and works as Cinnamon does.

**Capture window.** This needs labwc 0.20 or newer. Fedora 44 and Ubuntu 26.04 ship an older one, so the **Capture window** button shows a warning there. Capture a region instead.

**Shortcuts.** A key Budgie already uses, such as ++print-screen++, is reported as a conflict in **Settings → Shortcuts** and left alone.

**Locked or blanked screen.** Captures are refused while the screen is locked, blanked or powered off.

**Recording.** Record one monitor at a time. An area can't span two monitors.

## Hyprland

Hyprland is supported in [nightly builds](index.md#stable-or-nightly) and tested on Omarchy. Other Hyprland setups use the same code but haven't been tested.

**Shortcuts.** put.gd adds its keys while it runs and writes nothing to your Hyprland configuration. A key that another bind already uses is reported as a conflict. Shortcuts need Hyprland's Lua configuration; with the older `hyprland.conf`, use the tray.

**Capture permissions.** If you turned on Hyprland's permission enforcement, a capture is refused until you allow put.gd. See [troubleshooting](troubleshooting.md#captures-are-refused-on-hyprland).

**Recording.** Record one monitor at a time. Install `gst-plugin-va` to encode with your graphics card.

## X11 and Wayland

Plasma can run on either, so these depend on your session too.

| | X11 | Wayland |
| --- | --- | --- |
| **Capture window** | Anything overlapping the window appears in the image. | GNOME captures the window on its own. Plasma includes the title bar and leaves out shadows. Budgie leaves out the title bar. |
| **Region selection** | Close any open menu first. | GNOME's selector opens over an open menu. Plasma closes the menu. |

To include a menu on any desktop, use [Screenshot first](capture.md#capture-an-open-menu). To upload from your file manager on any of them, see [Upload from your file manager](file-manager.md).
