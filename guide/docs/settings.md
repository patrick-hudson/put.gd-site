# Settings

Change how put.gd behaves, from where captures go to which keys start them.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/general-light.avif 1368w, /_site/shots/general-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/general-dark.avif 1368w, /_site/shots/general-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/general-light.webp 1368w, /_site/shots/general-light@2x.webp 2736w">
  <img src="/_site/shots/general-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/general-dark.webp 1368w, /_site/shots/general-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → General: Startup and notifications, Appearance, File manager and Updates.">
</picture>

1. From the tray menu, choose **Settings**.
2. Pick **General**, **Capture**, **Hotkeys**, **Advanced** or **Error log**.
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

- **Add Upload with put.gd to the right-click menu** is always on with a package, because the package adds it for everyone. With the AppImage it is a switch, and turning it off removes only the entries the AppImage wrote.
- **Folders** is **Upload as a .zip** (the default), which makes one file and one link, or **Upload each file**, which gives each file its own link.

### Updates

**Check for updates once a day**, **Channel**, **Status** with **Check now**, and **Other channel** on a package are covered in [Keeping it updated](updating.md). Nothing installs automatically.

## Capture

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-settings-light.avif 1368w, /_site/shots/capture-settings-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-settings-dark.avif 1368w, /_site/shots/capture-settings-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-settings-light.webp 1368w, /_site/shots/capture-settings-light@2x.webp 2736w">
  <img src="/_site/shots/capture-settings-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-settings-dark.webp 1368w, /_site/shots/capture-settings-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → Capture: Capture output with Destination, Sharing, After uploading and Different output for some actions, then Region selection and Capture delay.">
</picture>

- **Destination** is your [default destination](destinations.md#choose-the-default-destination), or **No destination**.
- **Sharing** is **Destination default**, **Create a share link** or **Keep private**.
- **After uploading** is **Copy each link as it finishes** or **Copy a list when uploads finish**.
- **Different output for some actions** holds your exceptions, and reads **None** until you add one. Open it, click **Add an exception…** and pick an action, then set its **Destination** and **Sharing**.

Further down the same page:

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/text-settings-light.avif 1368w, /_site/shots/text-settings-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/text-settings-dark.avif 1368w, /_site/shots/text-settings-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/text-settings-light.webp 1368w, /_site/shots/text-settings-light@2x.webp 2736w">
  <img src="/_site/shots/text-settings-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/text-settings-dark.webp 1368w, /_site/shots/text-settings-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → Capture, further down: Text recognition with three languages, Always suggest redacting and Patterns (regular expressions).">
</picture>

- **Region selection** sets **While selecting**: **Live desktop** (the default), or **Screenshot first** so open menus and tooltips are included. Recording always selects over the live desktop.
- **Capture delay** sets **Wait before capturing**, the same choice as at the bottom of the window. **Also delay captures started by a hotkey** is off by default. See [capture after a delay](capture.md#capture-after-a-delay).
- **Capture style**, from the next nightly build, puts screenshots on a backdrop. See [Style your screenshots](style.md).
- **Scrolling capture** sets **Maximum height (px)**, **Start with auto-scroll** and **Auto-scroll goes to the top first**. See [Capture a scrolling page](scrolling.md).
- **Text recognition** holds the languages for [Copy text](copy-text.md#other-languages), your [redaction list](sensitive-text.md#your-own-words-and-patterns), and **Check captures for sensitive text before uploading**. See [Check for private details](sensitive-text.md).
- **Screen recording** sets the **Frame rate**: 30 frames per second (the default) or 60. **Microphone** chooses which microphone [recordings use](record.md#record-your-voice), and starts as **System default**. **Draw a ring at each click** [shows your clicks](record.md#show-your-clicks) in recordings, and is off by default.
- **Local copies** has **Keep a local copy**, off by default, which saves files to the **Save to** folder, normally `put.gd` in Documents. **Different folders by file type** gives images, videos, text and other files their own folders.

Under **File names**, **Naming** is **Keep original names**, **Random names** or **Custom template**. Random names are a long UUID unless you set **Random name** to **Random characters**: then choose the **Length**, from 4 to 64 (12 by default), and whether to **Include capital letters** and **Include numbers**. Shorter names repeat sooner, and put.gd picks a new one if a name is taken. Templates can use `{name}`, `{ext}`, `{yyyy}`, `{MM}`, `{dd}`, `{HH}`, `{mm}`, `{ss}` and `{uuid}`. **When a name exists** applies to uploads; local files always get a suffix.

## Hotkeys

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/settings-light.avif 1368w, /_site/shots/settings-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/settings-dark.avif 1368w, /_site/shots/settings-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/settings-light.webp 1368w, /_site/shots/settings-light@2x.webp 2736w">
  <img src="/_site/shots/settings-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/settings-dark.webp 1368w, /_site/shots/settings-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → Hotkeys: a key for each action, with Capture region, Capture window and Capture desktop set and the rest Not set.">
</picture>

1. Click the field next to an action.
2. Press one key with optional modifiers.
3. Release all keys.

++esc++ cancels. The **×** in the field turns the hotkey off.

**Capture region**, **Capture window** and **Capture desktop** start as ++ctrl+shift+1++, ++ctrl+shift+2++ and ++ctrl+shift+3++. The other actions, including **Repeat last region** and **Capture monitor**, read **Not set** until you give them a key.

A row with no status line works as you set it. Otherwise it reports the problem, such as **Conflict** or **Unsupported hotkey**. Your desktop holds these hotkeys, so choose another combination.

Capture hotkeys also work while a menu is open, in put.gd or another app. On X11, **Capture region** starts once the menu closes: press ++esc++ or click outside it within 3 seconds.

## Error log

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/error-log-light.avif 1368w, /_site/shots/error-log-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/error-log-dark.avif 1368w, /_site/shots/error-log-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/error-log-light.webp 1368w, /_site/shots/error-log-light@2x.webp 2736w">
  <img src="/_site/shots/error-log-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/error-log-dark.webp 1368w, /_site/shots/error-log-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → Error log with no errors yet: a filter for actions, a search box and Open problems only.">
</picture>

**Settings → Error log** keeps every error put.gd reported, newest first: when it happened, what was being done, the file, the destination and a short message.

1. Select an entry to see the whole message and what put.gd recorded.
2. Use the buttons it offers, such as **Retry**, **Unlock saved credentials**, **Open destination settings**, **Show in History** or **Save diagnostics for this operation**.

An entry whose problem went away later, such as a retry that worked, says **Resolved**. Filter by kind or search, and use **Clear…** to remove resolved entries or all of them. put.gd keeps the newest 500 entries from the last 90 days.

## Advanced

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/advanced-light.avif 1368w, /_site/shots/advanced-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/advanced-dark.avif 1368w, /_site/shots/advanced-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/advanced-light.webp 1368w, /_site/shots/advanced-light@2x.webp 2736w">
  <img src="/_site/shots/advanced-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/advanced-dark.webp 1368w, /_site/shots/advanced-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → Advanced: History, Resource limits and Diagnostics.">
</picture>

- **Keep history for** defaults to **Forever**. **Keep files for retry** defaults to 7 days.
- **Desktop support details** lists what your desktop offers put.gd: capture, hotkeys, the tray, recording and click rings.
- **Resource limits** opens the limits for uploads, images, the clipboard, memory and the **Thumbnail cache**, which defaults to 256 MB. **Reset resource and history limits…** restores these limits and nothing else.
- **Diagnostics** holds **Keep detailed debug logs for 24 hours**, **Clear logs…**, **Last unclean exit** and **Diagnostics package**. Logs and packages stay on this computer unless you choose to upload a package.
- **Configuration file** shows the file's path. **Reload from file…** replaces this window's settings with the file and asks first if that discards edits.
