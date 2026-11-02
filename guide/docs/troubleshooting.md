# Troubleshooting

Find your problem below. If you are still stuck, [get help](#get-help).

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-light.avif 1920w, /_site/shots/desktop-light@2x.avif 3840w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-dark.avif 1920w, /_site/shots/desktop-dark@2x.avif 3840w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-light.webp 1920w, /_site/shots/desktop-light@2x.webp 3840w">
  <img src="/_site/shots/desktop-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-dark.webp 1920w, /_site/shots/desktop-dark@2x.webp 3840w" width="1920" height="1080" loading="lazy" alt="put.gd running on Fedora 44 with GNOME: the History window open on the desktop.">
</picture>

## The link was not copied

Something else used the clipboard during the upload, so put.gd left it alone.

1. Open [History](history.md) and select the upload.
2. Click **Copy link**.

## Region selection will not start while a menu is open

An open menu or another app is holding the keyboard or mouse.

1. Press ++esc++ or click outside the menu.
2. Capture again.

To capture the menu itself, set **While selecting** to **Screenshot first** in [**Settings → Capture**](settings.md#capture).

## A shortcut does nothing

The desktop may not have given put.gd that key, often because something else uses it.

1. Open [**Settings → Shortcuts**](settings.md#shortcuts) and read the action's row. A row with no status line is bound as requested.
2. If it reports a problem, record a different combination.
3. On GNOME, check [the extension](#nothing-captures-on-gnome).

## Upload fails with access denied

Your storage refused the request, usually because the credentials lack a permission.

1. In **Destinations**, check the bucket and credentials.
2. On S3, ask the bucket owner for `s3:GetObject` and `s3:PutObject`, plus `s3:PutObjectAcl` for public-read. Without `s3:ListBucket`, a missing file can also look denied.
3. Select the item in History and click **Retry upload**.

## The public link does not open

The file uploaded, but its link domain or access settings don't serve it publicly.

1. In **Destinations**, correct the link domain and access choice.
2. Click **Test upload and link**.
3. Upload again. Existing items keep their original link.

## An upload says its state is unknown

The reply was lost, so the file may or may not have arrived. History shows **Upload outcome unknown**.

1. Select the item in History.
2. Click **Retry upload**. put.gd checks what arrived before uploading again.
3. Don't clear temporary files first; the retry needs them.

## Nothing captures on GNOME

GNOME needs put.gd's Shell extension, turned on in your current login.

1. Log out and back in. This is needed after installing or updating.
2. Turn it on:

    ```bash
    gnome-extensions enable putgd@put.gd
    ```

3. Capture again. With the AppImage, [install the extension first](desktops.md#gnome).

## Recording will not start

Something recording needs is missing, and put.gd's message names it.

1. If it mentions an encoder, follow [these steps](record.md#if-recording-will-not-start).
2. If it mentions the GNOME extension, follow [the steps above](#nothing-captures-on-gnome).
3. If it mentions disk space, free some and try again.

## Get help

1. In **Settings → Advanced → Diagnostics**, tick **Keep detailed debug logs for 24 hours**. It turns itself off.
2. Make the problem happen again.
3. Beside **Diagnostics package**, click **Create…**.
4. Leave **Include file names** off to keep names hashed.
5. Click **Save package**. To keep it local, untick **Also upload to … and copy a link** if it appears.
6. Attach the file to [a new issue](https://github.com/patrick-hudson/put.gd-desktop/issues).

For one failed upload, click **Save diagnostics…** on its History item instead.

The package holds your system and desktop versions, put.gd's status, settings without credentials, crash stack traces, recent failed uploads and logs. It never holds credentials, tokens, signed links, screenshots, file contents or clipboard text.
