# GNOME, KDE and Cinnamon

put.gd supports GNOME 50 on Wayland, KDE Plasma on Wayland or X11, and Cinnamon on X11. By the end of this page, you know what to set up on yours and what to expect.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 389px" srcset="/_site/shots/tray-light.avif 389w, /_site/shots/tray-light@2x.avif 778w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 389px" srcset="/_site/shots/tray-dark.avif 389w, /_site/shots/tray-dark@2x.avif 778w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 389px" srcset="/_site/shots/tray-light.webp 389w, /_site/shots/tray-light@2x.webp 778w">
  <img src="/_site/shots/tray-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 389px" srcset="/_site/shots/tray-dark.webp 389w, /_site/shots/tray-dark@2x.webp 778w" width="389" height="635" loading="lazy" alt="The put.gd tray menu on GNOME: the current output, Change output, Capture region, Capture window, Capture desktop, Capture region & edit, Edit image, Record screen, Upload clipboard, then History, Destinations and Settings.">
</picture>

This GNOME tray menu lists everything you can do from the tray. On every desktop, click the tray icon to open History, or right-click it for this menu. The pictures in this guide are all from GNOME, because that is what our lab runs.

To see what your own desktop supports, open **Settings → Advanced → Desktop support details**.

## GNOME

**Install.** GNOME needs put.gd's Shell extension, made for GNOME 50. Without it, put.gd can't capture your screen. The packages include it: [log out and back in, then enable it](index.md#turn-on-the-gnome-extension). After a later update, log out and back in again.

With the AppImage, install the extension yourself:

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

**Right-click upload.** Choose **Upload with put.gd** in Files. With the AppImage, and on desktop icons, it's under **Scripts**.

**Recording.** The recording bar moves outside the area. If there is no room, as when you record your only monitor, it shrinks to a dot and a Stop button in the corner, and appears in the video. On Fedora, recording needs [Cisco's H.264 encoder](index.md#install-with-one-line).

## KDE Plasma

**Install.** There is nothing extra to install. The AppImage needs Plasma 6: on Plasma 5.27 it says so and exits, so use the DEB. Aurora uses the AppImage.

**Tray.** The icon sits in the system tray on your panel.

**Region selection.** On Wayland, a crosshair and rectangle appear over the live desktop. On X11 it works as on Cinnamon. Press ++esc++ or right-click to cancel.

**Right-click upload.** Choose **Upload with put.gd** in Dolphin.

**Recording.** On Wayland, Plasma 6.6 and later leave the recording bar out of your video. Debian 13's older Plasma doesn't, so the bar can appear when you record a whole monitor.

## Cinnamon

**Install.** Cinnamon runs on X11, and there is nothing extra to install.

**Tray.** The icon sits in the system tray on your panel.

**Region selection.** Windows and video keep updating while you select. Drag with the left button, and press ++esc++ or right-click to cancel.

**Right-click upload.** Choose **Upload with put.gd** in Nemo.

**Recording.** The screen outside the area dims, and the recording bar sits outside the area or on another monitor. If there is no room, it shrinks to a dot and a Stop button in the corner, and appears in the video.

## X11 and Wayland

Plasma can run on either, so these depend on your session too.

| | X11 | Wayland |
| --- | --- | --- |
| **Capture window** | Anything overlapping the window appears in the image. | GNOME captures the window on its own. Plasma includes the title bar and leaves out shadows. |
| **Record screen** | Drag the area to record. | Drag the area on GNOME and Plasma. Other Wayland desktops ask once which screen or window to share. |

Region selection needs any open menu closed first, on every desktop. To include a menu, use [Screenshot first](capture.md#capture-an-open-menu).
