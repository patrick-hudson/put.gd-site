# Proton Drive

Connect your Proton account so that put.gd uploads to a folder in your Drive and, if you like, creates a share link for each file.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/proton-light.avif 1368w, /_site/shots/proton-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/proton-dark.avif 1368w, /_site/shots/proton-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/proton-light.webp 1368w, /_site/shots/proton-light@2x.webp 2736w">
  <img src="/_site/shots/proton-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/proton-dark.webp 1368w, /_site/shots/proton-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="The Destinations page with a Proton Drive destination that is not connected yet: Connect Proton Drive, Check account and folder, and the Links choice.">
</picture>

1. In **Destinations**, click **Add destination** and choose **Proton Drive**.
2. Under **Account**, click **Connect Proton Drive…** and finish signing in in your browser. Your email then shows on the form, and the button becomes **Reconnect account…**.
3. Choose an **Upload folder** from the top level of My files, or click **New folder…** to create one. These rows appear once you connect.
4. Under **Links**, choose **Create a share link** or **Keep private**.
5. Click **Check account and folder**.

Setting up the account never uploads a file. The check confirms that your account and folder can be reached. It doesn't test uploading or sharing.

!!! note "A third-party integration"
    put.gd works with Proton Drive through Proton's own software, but Proton doesn't officially support this integration.

## Refresh folders

If you rename a folder in Proton, click **Refresh folders** beside **Upload folder** to show the new name. Your selection stays the same, and uploads keep going to that folder.

## Private and shared links

- **Create a share link** is selected to begin with. Anyone with the link can view the file, and they also need any password you set. The link is copied as set under **After uploading** in [**Settings → Capture**](settings.md#capture).
- **Keep private** creates no link and leaves your clipboard alone. Anyone who already has access to the folder keeps it.

To change this for one kind of capture, use the [exceptions in Settings → Capture](settings.md#capture). From [History](history.md) you can use **Create share link** on a private upload later, or **Revoke link…** to end a link without uploading again.

## Advanced link settings

Open **Advanced link settings**:

- **Link expiration** is 0 to 365 days, and 0 means the link never expires.
- **Request deadline** limits how long each request to Proton may take. It starts at 120 seconds.
- **New link password** sets a password. Enter it, then click **Store link password**.
- **Use no link password** removes the password from future links.

Expiration and password apply only to new links. Existing links stay as they are.

Once a link expires, History says so, and **Copy link** and **Open in browser** turn off. The file stays in your Drive.

## What the links look like

A Proton link opens a Proton share page. It isn't a direct link to the image, so it won't embed as an image.

Treat each link like a password, because the full link is what gives access to the file.

## What isn't available

- **Deleting from put.gd.** put.gd can't safely delete Proton files. Revoke the link in History, or delete the file in Proton.
- **Replacing files.** When a name exists, put.gd adds a suffix or skips the file. It never overwrites one.

## If connecting fails

"The private keychain is unavailable." means your desktop has no default keyring, or it is locked. Create or unlock one, then connect again.
