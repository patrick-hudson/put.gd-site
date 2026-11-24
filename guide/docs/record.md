# Record the screen

Record an area of your screen, with your voice if you like, tidy up the clip, then choose what happens to it. Nothing is saved or uploaded until you choose.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-bar-light.avif 1278w, /_site/shots/record-bar-light@2x.avif 2556w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-bar-dark.avif 1278w, /_site/shots/record-bar-dark@2x.avif 2556w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-bar-light.webp 1278w, /_site/shots/record-bar-light@2x.webp 2556w">
  <img src="/_site/shots/record-bar-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-bar-dark.webp 1278w, /_site/shots/record-bar-dark@2x.webp 2556w" width="1278" height="747" loading="lazy" alt="An area of a video outlined and ready to record, with the floating bar below it: Ready to record, System audio, Microphone with its level meter, the format, Start recording and Cancel.">
</picture>

1. Click **Record screen** at the top of the put.gd window or in the tray menu. You can also assign a key in [**Settings → Hotkeys**](settings.md#hotkeys); it has none by default.
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

While recording, use **Pause** and **Resume**, then **Stop recording**. Your hotkey also starts and stops the recording. **Cancel** closes the bar; once recording, it becomes **Discard…** and asks first.

If the bar has no room outside the recorded area, it shrinks to a small handle in the corner. The handle appears in the clip.

## Record your voice

Tick **Microphone** on the bar. The meter beside it moves with your voice, so you can check the microphone before you start. put.gd opens the microphone only while the box is ticked, and remembers your choice for next time.

- **Which microphone.** put.gd uses your system's default. To pick another, go to **Settings → Capture → Screen recording → Microphone**.
- **No microphone.** If none can be opened, the box reads **No microphone** and is greyed out. Hover over it for the reason. Plug one in while the bar is showing and it is offered within a second or two.
- **Unplugged while recording.** The recording carries on, silent from there.

## Show your clicks

Turn on **Settings → Capture → Screen recording → Draw a ring at each click**. Each click then draws a ring at the pointer in the clip, so a viewer can see what you pressed.

On KDE Plasma you also see the rings on your screen while recording. Not every desktop reports clicks for every kind of recording. Where it can't, the switch says why, and recordings start without rings.

## The review window

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-light.avif 1488w, /_site/shots/record-light@2x.avif 2976w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-dark.avif 1488w, /_site/shots/record-dark@2x.avif 2976w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-light.webp 1488w, /_site/shots/record-light@2x.webp 2976w">
  <img src="/_site/shots/record-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-dark.webp 1488w, /_site/shots/record-dark@2x.webp 2976w" width="1488" height="948" loading="lazy" alt="The recording review window with a timeline and trim handles.">
</picture>

Stopping always opens this private review. Nothing is saved or uploaded until you choose. A clip that needs no changes can go straight to **Upload**.

- **Play it back** with ++space++, or click the timeline to move the playhead. ++comma++ and ++period++, or the arrow keys, step one frame. The preview is silent; the sound stays in the file.
- **Skim** by moving the pointer along the timeline while paused. The picture follows without moving the playhead. Press ++s++ to turn skimming off.
- **Trim the ends** by dragging the bracket at either end of the timeline, or press ++i++ and ++o++ at the playhead.
- **Cut out the middle** by dragging across the timeline to select a stretch, then choosing **Cut** or pressing ++c++. The cut stays on the timeline, hatched, and playback skips it. Select it and choose **Restore** to put it back, or **Play across** to see the join.
- **Cover part of the picture** with **Redact** (++x++) or **Blur** (++b++): drag a box on the picture. With time selected first, the cover lasts only for that stretch. Otherwise it covers the whole clip.
- **Move or resize a cover** by clicking it, then dragging inside it or one of its eight handles. On the timeline, drag its bar to change when it shows, or set **Shows from** and **Until** in the side panel.
- **Zoom the timeline** with ++ctrl++ and the scroll wheel, or ++equal++ and ++minus++. ++shift+z++ fits the whole clip again.
- **Undo** with ++ctrl+z++, up to 200 steps.

Edges snap to the playhead, the clip's ends and other edits. Press ++n++ to turn snapping off, or hold ++ctrl++ while you drag. The **Edits** list in the side panel shows every trim, cut and cover; click one to go to it.

**Format** switches between MP4, WebM, GIF and WebP, and turning off the sound there removes it from the file. GIF and WebP count only the time you keep, so a cut can bring a long clip under their limit.

!!! warning "Blur can sometimes be undone"
    Use **Redact**, not blur, for passwords, names and anything else private. Before you upload sensitive footage, use **Save a copy…** and watch the saved file, especially the frames next to each cut and at each cover's start and end.

When you are done:

- **Upload** (++ctrl+enter++) closes the window and uploads in the background. The result appears in [History](history.md).
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
