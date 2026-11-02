# Settings

Change how put.gd behaves, from where captures go to which keys start them.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/general-light.avif 1368w, /_site/shots/general-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/general-dark.avif 1368w, /_site/shots/general-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/general-light.webp 1368w, /_site/shots/general-light@2x.webp 2736w">
  <img src="/_site/shots/general-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/general-dark.webp 1368w, /_site/shots/general-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → General: Launch at login, Unlock saved credentials, Show desktop notifications, Theme, File manager and Updates.">
</picture>

1. From the tray menu, choose **Settings**.
2. Pick **General**, **Capture**, **Shortcuts** or **Advanced**.
3. Make your change. It saves by itself.

## How settings save

Each finished change saves automatically. If a field is invalid, it says why while your other settings stay active.

If saving fails, your changes stay in the window and **Retry saving** appears.

## General

- **Launch at login** is off by default.
- **Unlock saved credentials when put.gd starts** is on by default. See [unlocking saved credentials](destinations-s3.md#unlocking-saved-credentials).
- **Show desktop notifications** is on by default.
- **Theme** is **Match the desktop** (the default), **Dark** or **Light**, and changes at once.

### File manager

These rows control [uploading from your file manager](file-manager.md).

- **Add Upload with put.gd to the right-click menu** is always on with the DEB or RPM, because the package adds it for everyone. With the AppImage it is a switch, and turning it off removes only the entries the AppImage wrote.
- **Folders** is **Upload as a .zip** (the default), which makes one file and one link, or **Upload each file**, which gives each file its own link.

### Updates

**Check for updates once a day**, **Channel**, **Status** with **Check now**, and **Other channel** on a DEB or RPM are covered in [Keeping it updated](updating.md). Nothing installs automatically.

## Capture

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-settings-light.avif 1368w, /_site/shots/capture-settings-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-settings-dark.avif 1368w, /_site/shots/capture-settings-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-settings-light.webp 1368w, /_site/shots/capture-settings-light@2x.webp 2736w">
  <img src="/_site/shots/capture-settings-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-settings-dark.webp 1368w, /_site/shots/capture-settings-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → Capture: Destination, Sharing, After uploading, Different output for some actions, and Region selection.">
</picture>

- **Destination** is your [default destination](destinations.md#choose-the-default-destination), or **No destination**.
- **Sharing** is **Destination default**, **Create a share link** or **Keep private**.
- **After uploading** is **Copy each link as it finishes** or **Copy a list when uploads finish**.
- **Different output for some actions** holds your exceptions. Click **Add an exception…** and pick an action, then set its **Destination** and **Sharing**.
- **Region selection** sets **While selecting**: **Live desktop** (the default), or **Screenshot first** so open menus and tooltips are included. Recording always selects over the live desktop.
- **Screen recording** sets the **Frame rate**: 30 frames per second (the default) or 60.
- **Local copies** has **Keep a local copy**, off by default, which saves files to the **Save to** folder, normally `put.gd` in Documents.

Under **File names**, **Naming** is **Keep original names**, **Random names** or **Custom template**. Templates can use `{name}`, `{ext}`, `{yyyy}`, `{MM}`, `{dd}`, `{HH}`, `{mm}`, `{ss}` and `{uuid}`. **When a name exists** applies to uploads; local files always get a suffix.

## Shortcuts

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/settings-light.avif 1368w, /_site/shots/settings-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/settings-dark.avif 1368w, /_site/shots/settings-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/settings-light.webp 1368w, /_site/shots/settings-light@2x.webp 2736w">
  <img src="/_site/shots/settings-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/settings-dark.webp 1368w, /_site/shots/settings-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → Shortcuts, with global shortcuts for capturing, recording and uploading.">
</picture>

1. Click the field next to an action.
2. Press one key with optional modifiers.
3. Release all keys.

++esc++ cancels. The **×** in the field turns the shortcut off.

A row with no status line works as you set it. Otherwise it reports the problem, such as **Conflict** or **Unsupported shortcut**. Your desktop holds these shortcuts, so choose another combination.

Capture shortcuts also work while a menu is open, in put.gd or another app. On X11, **Capture region** starts once the menu closes: press ++esc++ or click outside it within 3 seconds.

## Advanced

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/advanced-light.avif 1368w, /_site/shots/advanced-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/advanced-dark.avif 1368w, /_site/shots/advanced-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/advanced-light.webp 1368w, /_site/shots/advanced-light@2x.webp 2736w">
  <img src="/_site/shots/advanced-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/advanced-dark.webp 1368w, /_site/shots/advanced-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → Advanced: limits, thumbnail cache, history retention, Diagnostics and the configuration file.">
</picture>

- **Keep history for** defaults to **Forever**. **Keep files for retry** defaults to 7 days.
- **Resource limits** opens the limits for uploads, images, the clipboard, memory and the **Thumbnail cache**, which defaults to 256 MB. **Reset resource and history limits…** restores these limits and nothing else.
- **Diagnostics** holds **Keep detailed debug logs for 24 hours**, **Clear logs…**, **Last unclean exit** and **Diagnostics package**. Logs and packages stay on this computer unless you choose to upload a package.
- **Configuration file** shows the file's path. **Reload from file…** replaces this window's settings with the file and asks first if that discards edits.
