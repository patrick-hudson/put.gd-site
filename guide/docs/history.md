# History

By the end of this page you can find anything you captured, copy its link again and recover an upload that failed.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/history-light.avif 1368w, /_site/shots/history-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/history-dark.avif 1368w, /_site/shots/history-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/history-light.webp 1368w, /_site/shots/history-light@2x.webp 2736w">
  <img src="/_site/shots/history-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/history-dark.webp 1368w, /_site/shots/history-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="The History window: today&#x27;s captures with thumbnails and times, counts beside each list on the left, and the newest capture&#x27;s details and link on the right.">
</picture>

1. Click the tray icon, or choose **History** in the tray menu.
2. Type in **Search history**, or pick a list on the left such as **Images** or **Recordings**.
3. Select an item. Its preview, link and details open on the right.
4. Click **Copy link**. This never uploads anything again.

!!! note "On the stable release"
    History looks a little different until the next stable release: **Manage** is called **More**, the counts and day headings are missing, and links can't be renewed yet. See [stable or nightly](index.md#stable-or-nightly).

## Find an item

Items are grouped by day, with work in progress first. The heading counts what you are looking at, such as **6 items**, or **12 of 168 items** while a search or filter narrows it. Each list on the left shows how many items it holds.

- **Search** looks through the stored file names.
- **Filter** adds a filter for dates, file type, destination or state. Each one shows as a chip you can change or remove.
- **Previous** and **Next** move between pages, as do ++alt+left++ and ++alt+right++.
- **List** and **Gallery**, the two icons beside **Filter**, switch the view.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/gallery-light.avif 1368w, /_site/shots/gallery-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/gallery-dark.avif 1368w, /_site/shots/gallery-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/gallery-light.webp 1368w, /_site/shots/gallery-light@2x.webp 2736w">
  <img src="/_site/shots/gallery-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/gallery-dark.webp 1368w, /_site/shots/gallery-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="History in gallery view: a grid of larger thumbnails, each with its name, details and time.">
</picture>

Browsing works from what is stored on your computer; it doesn't list or download your cloud files.

## The details pane

Close the pane with its **×** or ++esc++. In the list it then stays closed while you select other items. To open it again, press ++enter++, double-click an item or use the details button beside **Manage**.

With the pane closed, select several items to act on them together: the header shows how many are selected, with a button that copies all their links, **Delete from destination…** and **Clear selection**.

## Use a result

- **Copy link** puts the link on your clipboard. An item with only a local copy offers **Copy result** instead.
- **Open** opens the link in your browser.
- **Edit…** starts a new edit of the saved image when a local PNG or JPEG copy was kept. Your earlier marks are flattened, and the result uploads as a new item.
- **Save a copy…**, in the **⋯** menu, writes the original file somewhere you choose. **Copy image** is in the same menu.

## When a link expires

Links from a private [S3](destinations-s3.md#links) or [Backblaze B2](destinations-b2.md) bucket stop working after the time you chose, and History shows when. The file stays in your bucket.

1. Select the item.
2. Click **Refresh and copy link**.

You get a fresh link to the same file, with nothing uploaded again. If your saved keys aren't loaded, click **Unlock saved credentials** first. History never opens your keyring by itself.

## When something failed

Open **Failed uploads** on the left, or find the item in any list.

- **Retry upload**, on the item's row, tries the same file again.
- **Retry local save** saves the local copy again without uploading.
- **Save diagnostics…** saves a report you can [send for help](troubleshooting.md#get-help).

If nothing was stored, the item is marked **Edit failed**, **Upload failed** or **Capture failed** with the reason, and has no retry. Start a new capture instead.

## Delete a file from its destination

1. Select one or more items.
2. Click **Delete from destination…**.
3. Read the confirmation. It lists each file, its destination and what deleting does there.
4. Confirm, or click **Cancel** to send nothing.

Your local copies and History stay. Copies cached by browsers or a CDN can stay visible for a while. put.gd can't safely delete from Proton Drive, and a [custom uploader](destinations-custom.md) can delete only where the server gave a deletion address.

## Clear local history

1. Click **Manage** at the top of History.
2. Choose **Clear history records…** and confirm.

This clears every record at once; you can't remove just one. Uploaded files and your local copies remain. **Clear temporary files…**, in the same menu, removes cached previews and temporary upload files, so some failed uploads can no longer be retried.

## What the tray icon shows

Hover over the tray icon to see current work without opening a window. The tooltip lists up to three active items and a count of the rest. The icon fills as an upload runs, turns green when it completes, and turns red when something needs attention. Cancelling a capture is not an error.
