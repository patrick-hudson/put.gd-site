# Troubleshooting

Find your problem below. If you are still stuck, [get help](#get-help).

## The link was not copied

Something else used the clipboard during the upload, so put.gd left it alone.

1. Open [History](history.md) and select the upload.
2. Click **Copy link**.

## Region selection will not start while a menu is open

An open menu or another app is holding the keyboard or mouse.

Press ++esc++ or click outside the menu, then capture again.

To capture the menu itself, set **While selecting** to **Screenshot first** in [**Settings → Capture**](settings.md#capture).

## A shortcut does nothing

The desktop may not have given put.gd that key.

1. Open [**Settings → Shortcuts**](settings.md#shortcuts) and read the action's row.
2. If it reports a problem, record a different combination.
3. On GNOME, check [the extension](#nothing-captures-on-gnome).

## Upload fails with access denied

Your storage refused the request, usually because the credentials lack a permission.

1. In **Destinations**, check the bucket and credentials.
2. On S3, ask the bucket owner for `s3:GetObject` and `s3:PutObject`, plus `s3:PutObjectAcl` for public-read.
3. In History, click **Retry upload** on the item's row.

## The public link does not open

The file uploaded, but its link domain or access settings don't serve it publicly.

1. In **Destinations**, correct the link domain and access choice.
2. Click **Test upload and link**.
3. Upload again. Existing items keep their original link.

## An upload says its state is unknown

The reply was lost, so the file may or may not have arrived. History shows **Upload outcome unknown**.

In History, click **Retry upload** on the item's row. put.gd checks what arrived before uploading again. Don't clear temporary files first; the retry needs them.

## Upload with put.gd is missing from the right-click menu

The file manager may not have loaded the entry yet, or it may sit in a submenu; see [where it appears](file-manager.md).

- **Files** keeps running after its last window closes, so the entry may appear only after a restart. Restart it; put.gd's first-run notice offers **Restart Files** if your notifications can show buttons. That closes all Files windows.
- **PCManFM and PCManFM-Qt** load their entries at the first file menu they show. Restart one that has already shown a menu.
- **With the AppImage**, check that **Settings → General → File manager → File manager menu** is on.

## The file manager upload was refused

A notification names the problem and every file affected. Nothing was uploaded.

- **No local path:** the location has no path on this computer. Network locations through GVfs need the `gvfs-fuse` package.
- **Empty file:** put.gd won't upload a file of 0 bytes.
- **Over the limit:** raise **Largest file** or **Largest batch** under **Settings → Advanced → Resource limits**. A destination's own maximum still applies.
- **put.gd was just updated:** quit put.gd from its tray menu, then try again.

## Nothing captures on GNOME

GNOME needs put.gd's Shell extension, turned on in your current login.

1. Log out and back in. This is needed after installing or updating.
2. Turn it on:

    ```bash
    gnome-extensions enable putgd@put.gd
    ```

3. Capture again. With the AppImage, [install the extension first](desktops.md#gnome).

## Recording will not start

put.gd's message names what is missing: an [encoder](record.md#if-recording-will-not-start), the [GNOME extension](#nothing-captures-on-gnome) or disk space.

## Get help

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/advanced-light.avif 1368w, /_site/shots/advanced-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/advanced-dark.avif 1368w, /_site/shots/advanced-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/advanced-light.webp 1368w, /_site/shots/advanced-light@2x.webp 2736w">
  <img src="/_site/shots/advanced-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/advanced-dark.webp 1368w, /_site/shots/advanced-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → Advanced: limits, thumbnail cache, history retention, Diagnostics and the configuration file.">
</picture>

1. In **Settings → Advanced → Diagnostics**, tick **Keep detailed debug logs for 24 hours**.
2. Make the problem happen again.
3. Beside **Diagnostics package**, click **Create…**.
4. Leave **Include file names** off to keep names hashed.
5. To keep the package on this computer, untick **Also upload to … and copy a link** if it appears, then click **Save package**.
6. Attach the file to [a new issue](https://github.com/patrick-hudson/put.gd-desktop/issues).

For one failed upload, click **Save diagnostics…** on its History item instead.

The package never holds credentials, tokens, signed links, screenshots, file contents or clipboard text.
