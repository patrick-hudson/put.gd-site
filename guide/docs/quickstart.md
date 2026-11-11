# Your first capture

In about two minutes you will capture part of your screen and have a link to it on your clipboard.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 389px" srcset="/_site/shots/tray-light.avif 389w, /_site/shots/tray-light@2x.avif 778w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 389px" srcset="/_site/shots/tray-dark.avif 389w, /_site/shots/tray-dark@2x.avif 778w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 389px" srcset="/_site/shots/tray-light.webp 389w, /_site/shots/tray-light@2x.webp 778w">
  <img src="/_site/shots/tray-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 389px" srcset="/_site/shots/tray-dark.webp 389w, /_site/shots/tray-dark@2x.webp 778w" width="389" height="746" loading="lazy" alt="The put.gd tray menu on GNOME: the current output, Change output, Capture region, Repeat last region, Capture window, Capture monitor, Capture desktop, Capture delay, Capture region &amp; edit, Edit image, Record screen and Upload clipboard, then History, Destinations and Settings, then About put.gd and Quit put.gd.">
</picture>

!!! note "Set up a destination first"
    Nothing uploads until you tell put.gd where to send your files. If you have not done that yet,
    follow [Set up a destination](destinations.md), then come back. Without a destination or a
    local copy, put.gd shows an error instead of capturing.

## Capture part of your screen

1. Open **put.gd** from your app menu.
2. Find the put.gd icon in your desktop's tray. Closing the window leaves put.gd running there.
3. Right-click the icon and choose **Capture region**, or press ++ctrl+shift+1++.
4. Drag across the area you want, then let go. To cancel, press ++esc++.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-light.avif 975w, /_site/shots/capture-light@2x.avif 1950w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-dark.avif 975w, /_site/shots/capture-dark@2x.avif 1950w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-light.webp 975w, /_site/shots/capture-light@2x.webp 1950w">
  <img src="/_site/shots/capture-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-dark.webp 975w, /_site/shots/capture-dark@2x.webp 1950w" width="975" height="1021" loading="lazy" alt="A region being selected over a photo, with its size shown beside the selection.">
</picture>

The upload starts, and the link lands on your clipboard. Paste it wherever you want to share it.

## Find your capture

Click the tray icon to open **History**. Your capture is listed there, so you can copy its link
again later. See [History](history.md) for what else you can do with it.

The file itself is at your destination. A copy stays on this computer only if you turn on
**Keep a local copy**, which is off until you change it. [Where captures go](capture.md#where-captures-go)
explains how.

## If something is different

- **The shortcut does nothing.** Open **Settings → Shortcuts**. A row with a problem says so, and
  you can choose another key. See [shortcuts](settings.md#shortcuts).
- **No link on the clipboard.** Uploads set to **Keep private** create no link. The sharing choice
  is in **Settings → Capture**.

You can also upload files by right-clicking them: see [Upload from your file manager](file-manager.md).

Next, try the other ways to [capture](capture.md), or [edit an image before uploading](edit.md).
