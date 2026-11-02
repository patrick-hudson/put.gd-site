# put.gd user guide source

This folder is the source of <https://app.put.gd/userguide>. `tools/userguide.py` builds it with
[Zensical](https://zensical.org/) into `public/userguide/` (not committed); the deploy publishes
that folder. Pages are Markdown in `docs/`, the order is `nav` in `zensical.toml`.

```bash
python3 -m pip install -r tools/requirements-guide.txt
python3 tools/userguide.py            # build into public/userguide/
python3 -m http.server 4411 --directory public   # then open /userguide/
```

## Who it is for and how it reads

The reader has just installed put.gd and wants to get something done. Write to them directly,
in the present tense, with plain words. Every page answers "how do I ..." and shows the screen.

- **Page shape.** An `#` title that names the task. One or two sentences saying what the reader
  will have done by the end. A picture. Numbered steps. Then short `##` sections for the details.
  150 to 600 words.
- **Steps.** One action per step. Bold UI labels exactly as the app shows them, with arrows for
  paths: **Settings → Capture**. Keys as `++ctrl+shift+4++`. Put a result sentence after a step
  only when the reader needs to know what to expect.
- **Words to avoid.** No internal error codes, JSON paths, CLI commands or MCP outside the
  Command line and Troubleshooting pages. No issue numbers. No "resident", "helper process",
  "receipt", "artifact", "publication", "acceptance", "witness", "adapter". Say the app, the
  tray, the link, the upload, the file.
- **Truth.** The desktop app ships from its `nightly` branch. Its docs and source at
  `/home/patrick/work/put.gd-nightly` (a checkout of that branch) are the source of record; the
  `main` checkout at `/home/patrick/work/put.gd` is stale and must not be used. Where a doc and
  the source disagree, the source and the pictures win: the pictures are the current build. Do
  not invent a menu item, a default, a shortcut or a platform behaviour. If a source is unclear,
  say less rather than guess.
- **The app's internal design codename must never appear.** It is the word in the `SITE_CODENAME_GUARD`
  repository variable; the deploy refuses any file that names it, this folder included.
- **Formatting available:** `!!! note "Title"`, `!!! warning "Title"`, `!!! tip`, collapsible
  `??? note`, tabs `=== "Ubuntu and Mint"`, tables, `++key++`, fenced code.
- **Links** between pages are relative Markdown links to the `.md` file: `[Capture](capture.md)`,
  `[shortcuts](settings.md#shortcuts)`. Link only to pages that exist in `zensical.toml`.

## Pictures

Every page starts with a picture when one fits. All pictures are real windows from the current
nightly, captured by `tools/shots/` on the lab's Fedora 44 GNOME desktop and published under
`/_site/shots/` in dark and light. Paste the block as is; change only the `alt` if a more specific
description fits the page. They follow the reader's colour scheme. There are no pictures of KDE
Plasma or Cinnamon: the lab has only GNOME, and the guide says so where it matters.

**desktop** — put.gd running on Fedora 44 with GNOME: the History window open on the desktop.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-light.avif 1920w, /_site/shots/desktop-light@2x.avif 3840w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-dark.avif 1920w, /_site/shots/desktop-dark@2x.avif 3840w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-light.webp 1920w, /_site/shots/desktop-light@2x.webp 3840w">
  <img src="/_site/shots/desktop-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-dark.webp 1920w, /_site/shots/desktop-dark@2x.webp 3840w" width="1920" height="1080" loading="lazy" alt="put.gd running on Fedora 44 with GNOME: the History window open on the desktop.">
</picture>
```

**tray** — The put.gd tray menu on GNOME: the current output, Change output, Capture region, Capture window, Capture desktop, Capture region & edit, Edit image, Record screen, Upload clipboard, then History, Destinations and Settings.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 389px" srcset="/_site/shots/tray-light.avif 389w, /_site/shots/tray-light@2x.avif 778w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 389px" srcset="/_site/shots/tray-dark.avif 389w, /_site/shots/tray-dark@2x.avif 778w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 389px" srcset="/_site/shots/tray-light.webp 389w, /_site/shots/tray-light@2x.webp 778w">
  <img src="/_site/shots/tray-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 389px" srcset="/_site/shots/tray-dark.webp 389w, /_site/shots/tray-dark@2x.webp 778w" width="389" height="635" loading="lazy" alt="The put.gd tray menu on GNOME: the current output, Change output, Capture region, Capture window, Capture desktop, Capture region & edit, Edit image, Record screen, Upload clipboard, then History, Destinations and Settings.">
</picture>
```

**file-manager** — The Files window with a photo selected and its right-click menu open; Upload with put.gd is near the bottom of the menu.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/file-manager-light.avif 954w, /_site/shots/file-manager-light@2x.avif 1908w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/file-manager-dark.avif 954w, /_site/shots/file-manager-dark@2x.avif 1908w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/file-manager-light.webp 954w, /_site/shots/file-manager-light@2x.webp 1908w">
  <img src="/_site/shots/file-manager-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/file-manager-dark.webp 954w, /_site/shots/file-manager-dark@2x.webp 1908w" width="954" height="702" loading="lazy" alt="The Files window with a photo selected and its right-click menu open; Upload with put.gd is near the bottom of the menu.">
</picture>
```

**history** — The History window: recent captures with thumbnails, the newest one selected and marked Shared link.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/history-light.avif 1368w, /_site/shots/history-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/history-dark.avif 1368w, /_site/shots/history-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/history-light.webp 1368w, /_site/shots/history-light@2x.webp 2736w">
  <img src="/_site/shots/history-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/history-dark.webp 1368w, /_site/shots/history-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="The History window: recent captures with thumbnails, the newest one selected and marked Shared link.">
</picture>
```

**capture** — A region being selected over a photo, with its size shown beside the selection.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-light.avif 975w, /_site/shots/capture-light@2x.avif 1950w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-dark.avif 975w, /_site/shots/capture-dark@2x.avif 1950w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-light.webp 975w, /_site/shots/capture-light@2x.webp 1950w">
  <img src="/_site/shots/capture-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-dark.webp 975w, /_site/shots/capture-dark@2x.webp 1950w" width="975" height="1021" loading="lazy" alt="A region being selected over a photo, with its size shown beside the selection.">
</picture>
```

**edit** — The image editor with a box, a highlight, an arrow, a text label and a redaction on a photo.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/edit-light.avif 1609w, /_site/shots/edit-light@2x.avif 3218w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/edit-dark.avif 1609w, /_site/shots/edit-dark@2x.avif 3218w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/edit-light.webp 1609w, /_site/shots/edit-light@2x.webp 3218w">
  <img src="/_site/shots/edit-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/edit-dark.webp 1609w, /_site/shots/edit-dark@2x.webp 3218w" width="1609" height="1020" loading="lazy" alt="The image editor with a box, a highlight, an arrow, a text label and a redaction on a photo.">
</picture>
```

**record** — The recording review window with a timeline and trim handles.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-light.avif 920w, /_site/shots/record-light@2x.avif 1840w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-dark.avif 920w, /_site/shots/record-dark@2x.avif 1840w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-light.webp 920w, /_site/shots/record-light@2x.webp 1840w">
  <img src="/_site/shots/record-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-dark.webp 920w, /_site/shots/record-dark@2x.webp 1840w" width="920" height="768" loading="lazy" alt="The recording review window with a timeline and trim handles.">
</picture>
```

**storage** — The Destinations page with an S3 bucket: S3 service, bucket, region, folder, upload access request and link domain.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-light.avif 1368w, /_site/shots/storage-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-dark.avif 1368w, /_site/shots/storage-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-light.webp 1368w, /_site/shots/storage-light@2x.webp 2736w">
  <img src="/_site/shots/storage-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-dark.webp 1368w, /_site/shots/storage-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="The Destinations page with an S3 bucket: S3 service, bucket, region, folder, upload access request and link domain.">
</picture>
```

**proton** — The Destinations page with a Proton Drive destination that is not connected yet: Connect Proton Drive, Check account and folder, and the Links choice.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/proton-light.avif 1368w, /_site/shots/proton-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/proton-dark.avif 1368w, /_site/shots/proton-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/proton-light.webp 1368w, /_site/shots/proton-light@2x.webp 2736w">
  <img src="/_site/shots/proton-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/proton-dark.webp 1368w, /_site/shots/proton-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="The Destinations page with a Proton Drive destination that is not connected yet: Connect Proton Drive, Check account and folder, and the Links choice.">
</picture>
```

**b2** — The Destinations page with a Backblaze B2 destination: bucket, folder, who can open files, link domain and the application key fields.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/b2-light.avif 1368w, /_site/shots/b2-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/b2-dark.avif 1368w, /_site/shots/b2-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/b2-light.webp 1368w, /_site/shots/b2-light@2x.webp 2736w">
  <img src="/_site/shots/b2-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/b2-dark.webp 1368w, /_site/shots/b2-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="The Destinations page with a Backblaze B2 destination: bucket, folder, who can open files, link domain and the application key fields.">
</picture>
```

**general** — Settings → General: Launch at login, Unlock saved credentials, Show desktop notifications, Theme, File manager and Updates.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/general-light.avif 1368w, /_site/shots/general-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/general-dark.avif 1368w, /_site/shots/general-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/general-light.webp 1368w, /_site/shots/general-light@2x.webp 2736w">
  <img src="/_site/shots/general-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/general-dark.webp 1368w, /_site/shots/general-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → General: Launch at login, Unlock saved credentials, Show desktop notifications, Theme, File manager and Updates.">
</picture>
```

**capture-settings** — Settings → Capture: Destination, Sharing, After uploading, Different output for some actions, and Region selection.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-settings-light.avif 1368w, /_site/shots/capture-settings-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-settings-dark.avif 1368w, /_site/shots/capture-settings-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-settings-light.webp 1368w, /_site/shots/capture-settings-light@2x.webp 2736w">
  <img src="/_site/shots/capture-settings-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-settings-dark.webp 1368w, /_site/shots/capture-settings-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → Capture: Destination, Sharing, After uploading, Different output for some actions, and Region selection.">
</picture>
```

**settings** — Settings → Shortcuts, with global shortcuts for capturing, recording and uploading.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/settings-light.avif 1368w, /_site/shots/settings-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/settings-dark.avif 1368w, /_site/shots/settings-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/settings-light.webp 1368w, /_site/shots/settings-light@2x.webp 2736w">
  <img src="/_site/shots/settings-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/settings-dark.webp 1368w, /_site/shots/settings-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → Shortcuts, with global shortcuts for capturing, recording and uploading.">
</picture>
```

**advanced** — Settings → Advanced: limits, thumbnail cache, history retention, Diagnostics and the configuration file.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/advanced-light.avif 1368w, /_site/shots/advanced-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/advanced-dark.avif 1368w, /_site/shots/advanced-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/advanced-light.webp 1368w, /_site/shots/advanced-light@2x.webp 2736w">
  <img src="/_site/shots/advanced-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/advanced-dark.webp 1368w, /_site/shots/advanced-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → Advanced: limits, thumbnail cache, history retention, Diagnostics and the configuration file.">
</picture>
```

**updates** — Settings → General scrolled to Updates: Check for updates once a day, Channel, Status with Check now, and Other channel.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/updates-light.avif 1368w, /_site/shots/updates-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/updates-dark.avif 1368w, /_site/shots/updates-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/updates-light.webp 1368w, /_site/shots/updates-light@2x.webp 2736w">
  <img src="/_site/shots/updates-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/updates-dark.webp 1368w, /_site/shots/updates-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → General scrolled to Updates: Check for updates once a day, Channel, Status with Check now, and Other channel.">
</picture>
```

