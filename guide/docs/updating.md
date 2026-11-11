# Keeping it updated

put.gd checks once a day and tells you when a new version is out, but nothing installs without you. By the end of this page, you can install an update and change channel.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/updates-light.avif 1368w, /_site/shots/updates-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/updates-dark.avif 1368w, /_site/shots/updates-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/updates-light.webp 1368w, /_site/shots/updates-light@2x.webp 2736w">
  <img src="/_site/shots/updates-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/updates-dark.webp 1368w, /_site/shots/updates-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → General scrolled to Updates: Check for updates once a day, Channel, Status with Check now, and Other channel.">
</picture>

## What the Updates section shows

Open **Settings → General** and scroll to **Updates**. The picture is the nightly Fedora package with the daily check turned off.

- **Check for updates once a day** is on until you turn it off. **Check now** works either way.
- **Channel** is *Stable* or *Nightly*. You choose it on an AppImage. On a package, the line below names the repository file that sets it.
- **Status** gives the last result and when the next check runs.
- **Other channel**, on a package, lists the commands that change channel.

The request carries nothing that identifies you, and your computer does the comparison.

## Which version you have

Choose **About put.gd** in the tray menu. The version is under the name, and **Build details** has more to quote in a bug report. The version is also at the bottom right of the main window.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 528px" srcset="/_site/shots/about-light.avif 528w, /_site/shots/about-light@2x.avif 1056w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 528px" srcset="/_site/shots/about-dark.avif 528w, /_site/shots/about-dark@2x.avif 1056w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 528px" srcset="/_site/shots/about-light.webp 528w, /_site/shots/about-light@2x.webp 1056w">
  <img src="/_site/shots/about-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 528px" srcset="/_site/shots/about-dark.webp 528w, /_site/shots/about-dark@2x.webp 1056w" width="528" height="361" loading="lazy" alt="The About put.gd window: the app icon, its version, Build details and a link to the put.gd website.">
</picture>

## Who is told

**Update available** appears beside the version at the bottom right of the main window. Click it to open the Updates section. Some installs also list it in the tray menu.

| Your install | Notification | Tray menu |
| --- | --- | --- |
| Nightly, any format | Never | No |
| Stable DEB, RPM or Arch package | Never: your system's updater tells you | Yes |
| Stable AppImage | Once per version | Yes |

## Update a DEB or RPM

The packages add put.gd's repository, so updates arrive like any other package's.

1. In **Updates**, click **Open software updates**. This opens Update Manager on Cinnamon, Discover on Plasma or GNOME Software on GNOME.
2. Install the update there.

The **Or in a terminal** row has the command instead.

On GNOME, put.gd asks you to log out and back in after an update that changes its Shell extension. Until you do, window and desktop captures keep working, but region captures and recordings are refused.

## Update the Arch package

The installer added put.gd's signed pacman repository, so put.gd updates with the rest of your system:

```bash
sudo pacman -Syu
```

## Update the AppImage

1. In **Updates**, click **Download and install**.
2. Click **Restart put.gd**.

put.gd checks the download against the release's signed checksums and replaces your AppImage, keeping its name. It refuses, and says why, during a recording or upload, or if the folder isn't writable or is short of room.

### If the new version won't start

The old version stays beside the AppImage as a hidden file until the new one has started once.

1. If any of put.gd is still running, choose **Quit put.gd** in the tray menu.
2. In a terminal, go to the AppImage's folder: `~/.local/bin` if you used the one-line installer.
3. Find the backup:

    ```bash
    ls -a .putgd-update-backup-*.AppImage
    ```

4. Move it over your AppImage, using `mv` and not `cp`, with the names from your folder:

    ```bash
    mv .putgd-update-backup-VERSION.AppImage putgd.AppImage
    ```

5. Start put.gd as usual. It runs the old version and offers the update again.

## Switch between nightly and stable

Nightly builds carry [what's new since the last stable release](index.md#stable-or-nightly). A stable release is usually older than the nightly you have.

=== "AppImage"

    1. In **Updates**, choose the other **Channel**.
    2. Click **Switch to** and the version. If it's older, put.gd asks first, because it may not open settings or history saved by a newer one.
    3. Click **Restart put.gd**.

=== "DEB, RPM or Arch package"

    Your system's repository sets the channel.

    1. In **Updates**, find **Other channel** and click **Copy**.
    2. Paste the commands into a terminal and run them.

    Stable is usually older than a nightly, so the last command installs it as a downgrade. Leave it out to keep your version until a newer stable release is out.
