# Set up a destination

A destination is the place put.gd uploads your files to, such as a storage bucket or a Proton Drive folder, together with how it makes your links. By the end of this page you will have added one and made it your default.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-light.avif 1368w, /_site/shots/storage-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-dark.avif 1368w, /_site/shots/storage-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-light.webp 1368w, /_site/shots/storage-light@2x.webp 2736w">
  <img src="/_site/shots/storage-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-dark.webp 1368w, /_site/shots/storage-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="The Destinations page with an S3 bucket and its link domain.">
</picture>

1. Open the put.gd window and choose **Destinations**.
2. Click **Add destination**.
3. Choose your storage service, then follow its page to fill in the form:
    - [Amazon S3 and compatible storage](destinations-s3.md): your own bucket on Amazon S3, Cloudflare R2 or a similar service.
    - [Backblaze B2](destinations-b2.md): a Backblaze bucket with public or expiring links.
    - [Proton Drive](destinations-proton.md): a folder in your Proton account, shared through Proton's own page.
4. Click **Test upload and link**. On Proton Drive the button is **Check account and folder**.
5. Click **Make default** to send your captures there.

Fields save as soon as they are valid. Keys are the exception: each has its own button on the form.

## Choose the default destination

1. Open **Settings → Capture**.
2. Under **Capture output**, choose a destination in **Destination**.

**Make default** on the destination does the same thing. If the destination has not passed a test since put.gd started, you are asked to confirm first.

The new default applies to new captures. Earlier uploads stay where they are, and actions with their own [exception](settings.md#capture) keep it.

## Turn uploads off

In **Settings → Capture**, set **Destination** to **No destination**. put.gd then stops uploading your captures.

Local copies are a separate choice. Turn on **Keep a local copy** to keep saving captures on this computer. With no destination and no local copy, captures can't run, and the page offers both ways out.

## Change the order

Drag a destination up or down the list. A line shows where it will land.

From the keyboard, select a destination and press ++alt+up++ or ++alt+down++. You can also use **Move up** and **Move down** in its **⋯** menu.

The new order saves right away and also sets the order of the **Destination** lists. Nothing else changes: your default, exceptions and history stay with the same destinations.

## Remove a destination

1. Select the destination.
2. Open its **⋯** menu and choose **Remove destination…**.
3. Confirm.

Your history, your local copies and the files already in storage all stay. If the default or an exception used this destination, that choice is cleared, so check **Settings → Capture** afterwards.
