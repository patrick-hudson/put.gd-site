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
- **Truth.** The desktop repo's `docs/` are the source of record. Do not invent a menu item, a
  default, a shortcut or a platform behaviour. If a source is unclear, say less rather than guess.
- **The app's internal design codename must never appear.** It is the word in the `SITE_CODENAME_GUARD`
  repository variable; the deploy refuses any file that names it, this folder included.
- **Formatting available:** `!!! note "Title"`, `!!! warning "Title"`, `!!! tip`, collapsible
  `??? note`, tabs `=== "Ubuntu and Mint"`, tables, `++key++`, fenced code.
- **Links** between pages are relative Markdown links to the `.md` file: `[Capture](capture.md)`,
  `[shortcuts](settings.md#shortcuts)`. Link only to pages that exist in `zensical.toml`.

## Pictures

Every page starts with a picture when one fits. Two kinds exist.

### Lab screenshots (dark and light, served from the site)

These are real windows from the current nightly, captured by `tools/shots/` and already published
under `/_site/shots/`. Paste the block as is; change only the `alt` if a more specific description
fits the page. They follow the reader's colour scheme.

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

**record** — The recording review window with a timeline and trim handles.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-light.avif 920w, /_site/shots/record-light@2x.avif 1840w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-dark.avif 920w, /_site/shots/record-dark@2x.avif 1840w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-light.webp 920w, /_site/shots/record-light@2x.webp 1840w">
  <img src="/_site/shots/record-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/record-dark.webp 920w, /_site/shots/record-dark@2x.webp 1840w" width="920" height="768" loading="lazy" alt="The recording review window with a timeline and trim handles.">
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

**storage** — The Destinations page with an S3 bucket and its link domain.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-light.avif 1368w, /_site/shots/storage-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-dark.avif 1368w, /_site/shots/storage-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-light.webp 1368w, /_site/shots/storage-light@2x.webp 2736w">
  <img src="/_site/shots/storage-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-dark.webp 1368w, /_site/shots/storage-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="The Destinations page with an S3 bucket and its link domain.">
</picture>
```

**settings** — The Shortcuts page of Settings, with global shortcuts for capturing, recording and uploading.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/settings-light.avif 1368w, /_site/shots/settings-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/settings-dark.avif 1368w, /_site/shots/settings-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/settings-light.webp 1368w, /_site/shots/settings-light@2x.webp 2736w">
  <img src="/_site/shots/settings-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/settings-dark.webp 1368w, /_site/shots/settings-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="The Shortcuts page of Settings, with global shortcuts for capturing, recording and uploading.">
</picture>
```

**desktop** — put.gd running on Fedora 44 with GNOME: the History window open on the desktop.

```html
<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-light.avif 1920w, /_site/shots/desktop-light@2x.avif 3840w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-dark.avif 1920w, /_site/shots/desktop-dark@2x.avif 3840w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-light.webp 1920w, /_site/shots/desktop-light@2x.webp 3840w">
  <img src="/_site/shots/desktop-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-dark.webp 1920w, /_site/shots/desktop-dark@2x.webp 3840w" width="1920" height="1080" loading="lazy" alt="put.gd running on Fedora 44 with GNOME: the History window open on the desktop.">
</picture>
```


### Static pictures (`docs/img/`, from the desktop repo README)

Taken on an older build in October 2026 on Mint Cinnamon, Fedora GNOME and Debian Plasma. Use:

```markdown
![The tray menu on GNOME.](img/tray-gnome.webp){ .shot }
```

- `img/tray-trio.webp` — The tray menu on Cinnamon, GNOME and KDE Plasma side by side: capture region, region & edit, window, desktop, screen recording, edit image, upload clipboard, then settings, upload history, about and quit.
- `img/tray-gnome.webp` — The tray menu on GNOME.
- `img/tray-plasma.webp` — The tray menu on KDE Plasma.
- `img/tray-cinnamon.webp` — The tray menu on Cinnamon.
- `img/desktops-strip.webp` — The same put.gd window on Cinnamon, GNOME and KDE Plasma; the rail shows every action with its live shortcut.
- `img/history-plasma.webp` — History in gallery view with captures, an edited image and a screen recording (Plasma).
- `img/editor-gnome.webp` — Edit & upload: a NASA photo of Earth with a rectangle, highlight, redaction, arrow and text (GNOME).
- `img/review-plasma.webp` — The recording review window: the video with a blur and a solid cover, one timeline with trim handles and mask lanes, icon tools and the Upload row.
- `img/destinations-plasma.webp` — Destinations: an S3 bucket with region, endpoint, link domain and access policy.
- `img/capture-plasma.webp` — Settings → Capture: default destination, sharing, per-action exceptions and file name templates.
- `img/shortcuts-plasma.webp` — Settings → Shortcuts: six global shortcuts with their live binding status.
- `img/settings-gnome.webp` — Settings → General on GNOME.
- `img/settings-plasma.webp` — Settings → General on KDE Plasma.
- `img/settings-cinnamon.webp` — Settings → General on Cinnamon.
