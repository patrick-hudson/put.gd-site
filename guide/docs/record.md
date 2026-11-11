# Record the screen

Record an area of your screen, with your voice if you like, tidy up the clip, then choose what happens to it. Nothing is saved or uploaded until you choose.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-bar-light.avif 1278w, /_site/shots/record-bar-light@2x.avif 2556w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-bar-dark.avif 1278w, /_site/shots/record-bar-dark@2x.avif 2556w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-bar-light.webp 1278w, /_site/shots/record-bar-light@2x.webp 2556w">
  <img src="/_site/shots/record-bar-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-bar-dark.webp 1278w, /_site/shots/record-bar-dark@2x.webp 2556w" width="1278" height="747" loading="lazy" alt="An area of a video outlined and ready to record, with the floating bar below it: Ready to record, System audio, Microphone with its level meter, the format, Start recording and Cancel.">
</picture>

1. Click **Record screen** at the top of the put.gd window or in the tray menu. You can also assign a key in [**Settings → Shortcuts**](settings.md#shortcuts); it has none by default.
2. Drag the area to record. ++esc++ cancels.
3. On the floating bar, choose a format, and tick **System audio** or **Microphone** if you want sound.
4. Click **Start recording**.
5. Click **Stop recording**. The **Review recording** window opens.
6. Trim or cover what you need, then click **Upload**, **Save a copy…** or **Discard…**.

## Choosing the area

You drag the area on every supported desktop. GNOME needs the put.gd Shell extension for this; see [GNOME](desktops.md#gnome). On Budgie and Hyprland the area has to sit on one monitor.

## The floating bar

| Format | Good for |
| --- | --- |
| **Compatible video — MP4 (H.264)** | Sharing links. This is the default. |
| **Smaller video — MP4 (H.265)** | Smaller files, but Firefox and Chrome on Linux can't play these links. |
| **Browser video — WebM (VP9)** | Browsers, except older Safari. |
| **Animated GIF** | Short silent clips: at most 60 seconds, scaled to fit 1280 pixels. |
| **Animated WebP — silent** | The same limits as GIF, in a smaller file. |

**System audio** records the sound your computer plays. **Microphone** records your voice. Tick both to get both. GIF and WebP have no sound.

The format and the sound choices lock when recording begins, though the review window can still change the format.

While recording, use **Pause** and **Resume**, then **Stop recording**. Your shortcut also starts and stops the recording. **Cancel** closes the bar; once recording, it becomes **Discard…** and asks first.

If the bar has no room outside the recorded area, it shrinks to a small handle in the corner. The handle appears in the clip.

## Record your voice

Tick **Microphone** on the bar. The meter beside it moves with your voice, so you can check the microphone before you start. put.gd opens the microphone only while the box is ticked, and remembers your choice for next time.

- **Which microphone.** put.gd uses your system's default. To pick another, go to **Settings → Capture → Screen recording → Microphone**.
- **No microphone.** If none can be opened, the box reads **No microphone** and is greyed out. Hover over it for the reason. Plug one in while the bar is showing and it is offered within a second or two.
- **Unplugged while recording.** The recording carries on, silent from there.

## Show your clicks

Turn on **Settings → Capture → Screen recording → Draw a ring at each click**. Each click then draws a ring at the pointer in the clip, so a viewer can see what you pressed.

On KDE Plasma you also see the rings on your screen while recording. Not every desktop reports clicks for every kind of recording. Where it can't, the switch says why, and recordings start without rings.

!!! note "In nightly builds for now"
    The microphone and click rings arrive in the next stable release. See [stable or nightly](index.md#stable-or-nightly).

## The review window

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-light.avif 920w, /_site/shots/record-light@2x.avif 1840w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-dark.avif 920w, /_site/shots/record-dark@2x.avif 1840w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-light.webp 920w, /_site/shots/record-light@2x.webp 1840w">
  <img src="/_site/shots/record-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-dark.webp 920w, /_site/shots/record-dark@2x.webp 1840w" width="920" height="768" loading="lazy" alt="The recording review window with a timeline and trim handles.">
</picture>

Stopping always opens this private review.

- **Play it back** with the play button at the top or ++space++. The preview is silent; audio stays in the file.
- **Trim** by dragging the two handles on the timeline, or use **Start here** and **End here** at the playhead. **Keep** shows the part that stays, and **Reset** keeps the whole clip.
- **Cover something** with **+ Add mask**: choose **Add redaction** for a solid cover or **Add blur**, then drag on the picture. Drag the ends of its bar on the timeline to set when it shows.
- **Check the output** at the bottom left: the destination, the sharing choice and the format.

!!! warning "Blur can sometimes be undone"
    Use a redaction, not blur, for passwords, names and anything else private.

When you are done:

- **Upload** closes the window and uploads in the background. The result appears in [History](history.md).
- **Save a copy…** writes a file and keeps the window open, so you can still upload.
- **Discard…** asks first, then deletes the recording and your edits. Copies you saved stay.

## If recording will not start

Recording needs an H.264 encoder. When none works, put.gd tells you what to install instead of starting.

=== "Ubuntu, Kubuntu, Mint and Debian"

    The packages bring an encoder with them.

=== "Fedora"

    Fedora installs a placeholder library. Replace it with Cisco's:

    ```bash
    sudo dnf install openh264 gstreamer1-plugin-openh264
    ```

    If the `fedora-cisco-openh264` repository was turned off, run this first:

    ```bash
    sudo dnf config-manager setopt fedora-cisco-openh264.enabled=1
    ```

=== "Arch"

    The package brings an encoder with it. Install `gst-plugin-va` as well to encode with your graphics card.

=== "AppImage"

    It carries its own recorder and needs no setup.
