# Proton Drive

Connect your Proton account so that put.gd uploads to a folder in your Drive and, if you like, creates a share link for each file.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-light.avif 1368w, /_site/shots/storage-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-dark.avif 1368w, /_site/shots/storage-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-light.webp 1368w, /_site/shots/storage-light@2x.webp 2736w">
  <img src="/_site/shots/storage-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-dark.webp 1368w, /_site/shots/storage-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="The Destinations page with an S3 bucket and its link domain.">
</picture>

The picture shows an S3 destination. A Proton Drive destination asks for your account and a folder instead of a bucket and keys.

1. In **Destinations**, click **Add destination** and choose **Proton Drive**.
2. Click **Connect account…** and finish signing in in your browser. Your email then shows on the form.
3. Choose an **Upload folder** from the top level of My files, or click **New folder…** to create one.
4. Choose **Create a share link** or **Keep private**.
5. Click **Check account and folder**.

Setting up the account never uploads a file. The check confirms that your account and folder can be reached. It doesn't test uploading or sharing.

!!! note "A third-party integration"
    put.gd works with Proton Drive through Proton's own software, but Proton doesn't officially support this integration.

## Refresh folders

If you rename a folder in Proton, click **Refresh folders** beside **Upload folder** to show the new name. Your selection stays the same, and uploads keep going to that folder.

## Private and shared links

- **Create a share link** is the usual choice. Anyone with the link can view the file, and put.gd copies the link for you.
- **Keep private** creates no link and leaves your clipboard alone. Anyone who already has access to the folder keeps it.

To change this for one kind of capture, use the [exceptions in Settings → Capture](settings.md#capture). From [History](history.md) you can create a link for a private upload later, or turn off a link without uploading again.

## Link expiry and password

Open **Advanced link settings**:

- **Link expiration** is 0 to 365 days, and 0 means the link never expires.
- **New link password** sets a password. Enter it, then click **Store link password**.
- **Use no link password** removes the password from future links.

These settings apply only to new links. Existing links stay as they are.

Once a link expires, History says so, and its copy and open buttons turn off. The file stays in your Drive.

## What the links look like

A Proton link opens a Proton share page. It isn't a direct link to the image, so it won't embed as an image.

Treat each link like a password, because the full link is what gives access to the file.

## What isn't available

- **Deleting from put.gd.** put.gd can't safely delete Proton files. Turn off the link in History, or delete the file in Proton.
- **Signing out.** There is no way to sign out of your account from put.gd.
- **Replacing files.** When a name exists, put.gd adds a suffix or skips the file. It never overwrites one.

## If connecting fails

"The private keychain is unavailable." means your desktop has no default keyring, or it is locked. Create or unlock one, then connect again.
