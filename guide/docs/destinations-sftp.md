# SFTP

Upload to a folder on your own server over SFTP, signing in the same way `ssh` does in your terminal.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/sftp-light.avif 1368w, /_site/shots/sftp-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/sftp-dark.avif 1368w, /_site/shots/sftp-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/sftp-light.webp 1368w, /_site/shots/sftp-light@2x.webp 2736w">
  <img src="/_site/shots/sftp-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/sftp-dark.webp 1368w, /_site/shots/sftp-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="The Destinations page with a new SFTP destination: Server, User, Folder on server with the line saying how ssh will connect, and Link address.">
</picture>

put.gd connects with your own OpenSSH client, so your `~/.ssh/config`, host aliases, jump hosts, SSH agent, security keys and `known_hosts` work as they do in a terminal. The packages bring the client with them. With the AppImage, install it yourself if `ssh` is missing.

1. In **Destinations**, click **Add destination** and choose **SFTP**.
2. Enter the **Server**: a host name, `host:port`, or a host alias from `~/.ssh/config`. You can paste a whole address such as `sftp://alice@files.example.com:2222/srv/www/shots`, which fills **User** and **Folder on server** too.
3. Leave **User** empty to use the one `ssh` would.
4. Enter the **Folder on server**. A path without a leading `/` starts in your login folder.
5. Optional: enter a **Link address**, the public address the folder is served at, such as `https://files.example.com/shots/`.
6. Click **Test upload**, or **Test upload and link** with a link address.

Under **Folder on server**, a line says what `ssh` makes of it, such as "Connects to files.example.com:2222 as alice with key id_ed25519 (agent)".

## Signing in

Leave every sign-in field empty to use your SSH agent and `~/.ssh/config`. Otherwise:

- **SSH key** is a private key file for a key that isn't in your agent or config. Type its path or click **Choose…**.
- **Key passphrase** unlocks an encrypted key.
- **Password** is for a server that takes a password.

Click **Save to keychain** or **Use for this session**. A new SFTP destination starts with **Use for this session**.

A security key works as in a terminal: touch it when it blinks. A server that asks for a one-time code can't be used. Sign in with a key instead.

## The first connection

The test shows a server put.gd hasn't seen before with its key, such as `ED25519 SHA256:lKD1cde7…`. Compare it with the key your server's admin gave you, then click **Trust key** and test again.

put.gd keeps keys it trusts in its own file and never writes to your `~/.ssh`. If your own `known_hosts` already knows the server, that decides, as in a terminal.

!!! warning "A changed key can mean someone is intercepting the connection"
    If put.gd says the server's key changed, trust the new key only after your server's admin confirms it was replaced.

If the folder doesn't exist, the test offers **Create folder**. Uploads never create folders by themselves.

## Without a link address

The upload still works, but nothing is copied to your clipboard. The notification says where the file went, such as "Saved to files.example.com:/srv/www/shots/shot.png", and **Copy path** in [History](history.md) copies the same.

## Good to know

- **Names.** An upload never replaces a file on the server. A name that is taken is handled by **When a name exists** in **Settings → Capture → File names**.
- **Cancelling** removes the part already on the server, or tells you which file to check.
- **Deleting.** **Delete from destination…** removes a file only while it is still the one uploaded, from the same server.
- **Not supported.** Servers that offer only SCP or a shell, without SFTP.
