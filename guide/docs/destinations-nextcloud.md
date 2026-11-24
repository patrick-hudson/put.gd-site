# Nextcloud and WebDAV

Upload to a folder in your Nextcloud and get a share link for each file, or upload to any WebDAV server.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/nextcloud-light.avif 1368w, /_site/shots/nextcloud-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/nextcloud-dark.avif 1368w, /_site/shots/nextcloud-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/nextcloud-light.webp 1368w, /_site/shots/nextcloud-light@2x.webp 2736w">
  <img src="/_site/shots/nextcloud-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/nextcloud-dark.webp 1368w, /_site/shots/nextcloud-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="The Destinations page with a new Nextcloud destination, signed out: Server, Sign in and Use an app password instead, and the Folder put.gd.">
</picture>

## Nextcloud

1. In **Destinations**, click **Add destination** and choose **Nextcloud**.
2. Enter the **Server**: the address you open Nextcloud at, such as `https://cloud.example.com`. A Files link or a share link from your Nextcloud works too.
3. Click **Sign in…**. Your browser opens Nextcloud's **Connect to your account** page. Log in and choose **Grant access**. put.gd then shows **Signed in as** and your name.
4. **Folder** is `put.gd` to begin with. Change it if you like, such as `Screenshots/put.gd`. The test or the first upload creates it.
5. Click **Test upload and link**. It uploads a small test file, opens its share link without signing in, then deletes it.

Signing in gives put.gd an app password of its own. Your Nextcloud password never reaches put.gd. Nextcloud lists it under **Personal settings → Security → Devices & sessions** as `put.gd` and your computer's name. To keep it only until put.gd closes, choose **This session only** under **Credential storage** before you sign in.

If the browser doesn't open, click **Open browser again**. Sign-in stops waiting by itself after 20 minutes.

**Sign out** removes the app password from your Nextcloud and forgets it here. Sign out before you change the **Server**, because the app password only works for the address it was given for.

### Without browser sign-in

Some Nextcloud-compatible servers don't offer browser sign-in.

1. In Nextcloud, go to **Personal settings → Security → Devices & sessions** and click **Create new app password**.
2. In put.gd, click **Use an app password instead**.
3. Enter the **Login name** and **App password**, then click **Save to keychain** or **Use for this session**.

### Links

Every upload gets a view-only public share link, such as `https://cloud.example.com/s/…`. Anyone with it can view and download the file. put.gd has no choice of expiry or password: your Nextcloud's own rules apply.

- If your Nextcloud sets an expiry on public links, History shows when each one expires.
- If it requires a password on public links, or has them turned off, put.gd can't make a link. The test says so.

If an upload arrives but its link can't be made, the file stays in your Nextcloud. Fix the cause, then use **Finish share link** in [History](history.md). **Revoke link…** ends a link and keeps the file.

Files over 50 MiB go up in pieces. Nextcloud then puts the file together, which can take a while for a large one.

## WebDAV

1. In **Destinations**, click **Add destination** and choose **WebDAV**.
2. Enter the **Folder address**: the WebDAV address of the folder, such as `https://dav.example.com/uploads/`.
3. Optional: enter a **Link address**, where the server shows the same folder to the public, such as `https://files.example.com/uploads/`. Without it, the link is the file's WebDAV address, which works only if your server lets visitors read without signing in.
4. Enter the **User** and **Password**, then click **Save to keychain** or **Use for this session**.
5. Click **Test upload and link**.

The folder must exist. If it doesn't, the test offers **Create folder**. If the test finds a Nextcloud, it suggests the Nextcloud service instead.

The test also checks that your server refuses to replace an existing file. If it doesn't, you get a warning under the form, and uploads still work.

## Good to know

- **Names.** An upload never replaces a file. Under **Settings → Capture → File names → When a name exists**, choose **Add a unique suffix** or **Skip duplicate names**.
- **Deleting.** **Delete from destination…** removes a file only while it is still the one uploaded. Nextcloud keeps deleted files in its trash bin.
- **Certificates.** put.gd trusts what your system trusts. If a server's certificate isn't trusted, the message says why and how to add your own certificate authority.
- **Plain HTTP.** An `http://` address on another computer needs **Allow plain HTTP for this destination**, which sends your files and password unencrypted.
