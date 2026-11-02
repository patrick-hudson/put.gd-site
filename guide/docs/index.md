# Install put.gd

By the end of this page, put.gd is installed and running in your tray. There is no stable release yet, so every download here is the newest nightly build.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-light.avif 1920w, /_site/shots/desktop-light@2x.avif 3840w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-dark.avif 1920w, /_site/shots/desktop-dark@2x.avif 3840w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-light.webp 1920w, /_site/shots/desktop-light@2x.webp 3840w">
  <img src="/_site/shots/desktop-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-dark.webp 1920w, /_site/shots/desktop-dark@2x.webp 3840w" width="1920" height="1080" loading="lazy" alt="put.gd running on Fedora 44 with GNOME: the History window open on the desktop.">
</picture>

## Install with one line

This works on x86_64 Linux.

1. Open a terminal.
2. Run the installer, and enter your password if asked:

    ```bash
    curl -fsSL https://app.put.gd/install | sh
    ```

The installer checks the download against the release's checksums before it installs anything. It asks for your password only to run `apt install` or `dnf install`. If no package matches your system, it installs the AppImage instead.

On Fedora it also installs the H.264 encoder that recording needs. If the `fedora-cisco-openh264` repository is turned off, it prints the commands for you to run.

To install the AppImage without a password, run this instead. The file goes to `~/.local/bin/putgd.AppImage`, and you start put.gd by running that file.

```bash
curl -fsSL https://app.put.gd/install | sh -s -- --appimage
```

## Or download it yourself

=== "Ubuntu and Mint"

    1. Download the package for your release:
        - [Ubuntu 24.04 or Linux Mint 22](https://app.put.gd/dl/nightly/ubuntu24.04)
        - [Ubuntu or Kubuntu 26.04](https://app.put.gd/dl/nightly/ubuntu26.04)
    2. Open a terminal in your download folder.
    3. Install the package:

        ```bash
        sudo apt install ./putgd-*.deb
        ```

=== "Debian"

    1. Download the [package for Debian 13](https://app.put.gd/dl/nightly/debian13).
    2. Open a terminal in your download folder.
    3. Install the package:

        ```bash
        sudo apt install ./putgd-*.deb
        ```

=== "Fedora"

    1. Download the [package for Fedora 44](https://app.put.gd/dl/nightly/fedora44).
    2. Open a terminal in your download folder.
    3. Install the package:

        ```bash
        sudo dnf install ./putgd-*.rpm
        ```

    4. Replace Fedora's placeholder with Cisco's H.264 encoder, which recording needs. The package can't do this for you:

        ```bash
        sudo dnf install openh264 gstreamer1-plugin-openh264
        ```

        If the `fedora-cisco-openh264` repository is turned off, first run `sudo dnf config-manager setopt fedora-cisco-openh264.enabled=1`.

=== "AppImage"

    For any distribution with glibc 2.39 or newer.

    1. Download the [AppImage](https://app.put.gd/dl/nightly/appimage).
    2. Open a terminal in your download folder.
    3. Make the file executable and start it:

        ```bash
        chmod +x putgd-*.AppImage && ./putgd-*.AppImage
        ```

??? note "Check a download yourself"
    Download [SHA256SUMS](https://app.put.gd/dl/nightly/checksums) into the same folder, then run:

    ```bash
    sha256sum --check --ignore-missing SHA256SUMS
    ```

## Start put.gd

After a package install, start put.gd from your applications menu or run `putgd`. Closing its window keeps it running in the tray. Click the tray icon to open History again.

## Turn on the GNOME extension

On GNOME 50, put.gd captures through an extension for GNOME Shell. The DEB and RPM include it, but GNOME only finds it after a new login, so do these in order:

1. Log out and back in.
2. Run:

    ```bash
    gnome-extensions enable putgd@put.gd
    ```

It works right away, with no second logout. If you run the command before logging out, it can say `Extension "putgd@put.gd" doesn't exist`, even though the package installed it.

The AppImage doesn't include the extension: follow the [AppImage steps for GNOME](desktops.md#gnome).

## Right-click upload

The DEB and RPM also add **Upload with put.gd** to your file manager's right-click menu. See [Upload from your file manager](file-manager.md).

On GNOME, Files only picks up the entry when it starts, and it keeps running after you close its last window. The first time put.gd runs after installing, its notification says: "Upload with put.gd is in your right-click menu. Restart Files if it's missing; that closes its windows." If your desktop's notifications can show buttons, it offers **Restart Files**.

[Next: your first capture](quickstart.md)
