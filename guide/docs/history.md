# History

By the end of this page you can find anything you captured, copy its link again and recover an upload that failed.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/history-light.avif 1368w, /_site/shots/history-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/history-dark.avif 1368w, /_site/shots/history-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/history-light.webp 1368w, /_site/shots/history-light@2x.webp 2736w">
  <img src="/_site/shots/history-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/history-dark.webp 1368w, /_site/shots/history-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="The History window: recent captures with thumbnails, the newest one selected and marked Shared link.">
</picture>

1. Click the tray icon, or choose **History** in the tray menu.
2. Type in **Search history**, or pick a list on the left such as **Images** or **Recordings**.
3. Select an item. Its preview, link and details open on the right.
4. Click **Copy link**. This never uploads anything again.

## Find an item

Switch between **List** and **Gallery** at the top. Search looks through the stored file names. **Filters** narrows the list by date, file type, destination and state. Browsing works from what is stored on your computer; it doesn't list or download your cloud files.

## Use a result

- **Copy link** puts the link on your clipboard. An item with only a local copy offers **Copy result** instead.
- **Open** opens the link in your browser.
- **Edit…** starts a new edit of the saved image when a local PNG or JPEG copy was kept. Your earlier marks are flattened, and the result uploads as a new item.
- **Save a copy…**, in the **⋯** menu, writes the original file somewhere you choose. **Copy image** is in the same menu.

## When something failed

Open **Failed uploads** on the left, or find the item in any list.

- **Retry upload**, on the item's row, tries the same file again.
- **Retry local save** saves the local copy again without uploading.
- **Save diagnostics…** saves a report you can [send for help](troubleshooting.md#get-help).

If nothing was stored, the item is marked **Edit failed**, **Upload failed** or **Capture failed** with the reason, and has no retry. Start a new capture instead.

## How links reach the clipboard

In [**Settings → Capture**](settings.md#capture), **After uploading** has two choices:

- **Copy each link as it finishes** is the default.
- **Copy a list when uploads finish** copies one list, a link per line, after overlapping uploads settle.

Failed, cancelled and private uploads add no link. If you copy something else in the meantime, your clipboard is left alone; use **Copy link** when you are ready.

## Delete a file from its destination

1. Select one or more items.
2. Click **Delete from destination…**.
3. Read the confirmation. It lists each file, its destination and what deleting does there.
4. Confirm, or click **Cancel** to send nothing.

Your local copies and History stay. Copies cached by browsers or a CDN can stay visible for a while. put.gd can't safely delete from Proton Drive, so those files and share links remain.

## Clear local history

1. Click **More** at the top of History.
2. Choose **Clear history records…** and confirm.

This clears every record at once; you can't remove just one. Uploaded files and your local copies remain. **Clear temporary files…**, in the same menu, removes cached previews and temporary upload files, so some failed uploads can no longer be retried.

## What the tray icon shows

Hover over the tray icon to see current work without opening a window. The tooltip lists up to three active items and a count of the rest. The icon fills as an upload runs, turns green when it completes, and turns red when something needs attention. Cancelling a capture is not an error.
