# Install put.gd

By the end of this page, put.gd is installed and running in your tray.

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

The installer picks the package for your system: Ubuntu 24.04 or 26.04, Linux Mint 22, Debian 13, Fedora 44, or Arch and Arch-based distributions such as EndeavourOS, CachyOS and Omarchy. On anything else it installs the AppImage.

It checks the download against the release's checksums before it installs anything, and asks for your password only to run `apt`, `dnf` or `pacman`. On Arch it adds put.gd's signed repository, and pacman checks the package. On Omarchy it first asks to run Omarchy's own system update.

On Fedora it also installs the H.264 encoder that recording needs. If the `fedora-cisco-openh264` repository is turned off, it prints the commands for you to run.

To install the AppImage without a password, run this instead. The file goes to `~/.local/bin/putgd.AppImage`, and you start put.gd by running that file.

```bash
curl -fsSL https://app.put.gd/install | sh -s -- --appimage
```

## Stable or nightly

The installer gives you the stable release. A nightly build comes out every day with everything finished since, and it is what the pictures in this guide show.

Until the next stable release, you need a nightly for:

- [Budgie and Hyprland](desktops.md), and the Arch package. On Arch the installer already picks the nightly.
- The [custom uploader](destinations-custom.md) destination.
- [Capture monitor, Repeat last region and Capture delay](capture.md#capture-monitor).
- The [microphone and click highlights](record.md#record-your-voice) in recordings.
- The editor's [line, ellipse, pen, step number and pixelate tools](edit.md#tools), and **Copy image**.
- [Links that expire](destinations-s3.md#links) on S3, and [renewing an expired link](history.md#when-a-link-expires).
- Setting up GNOME with a single logout.

To install the nightly:

```bash
curl -fsSL https://app.put.gd/install | sh -s -- --channel nightly
```

To change channel later, see [Keeping it updated](updating.md#switch-between-nightly-and-stable).

## Or download it yourself

Each package comes as a stable release and a nightly build.

=== "Ubuntu and Mint"

    1. Download the package for your release:
        - Ubuntu 24.04 or Linux Mint 22: [stable](https://app.put.gd/dl/stable/ubuntu24.04) or [nightly](https://app.put.gd/dl/nightly/ubuntu24.04)
        - Ubuntu or Kubuntu 26.04: [stable](https://app.put.gd/dl/stable/ubuntu26.04) or [nightly](https://app.put.gd/dl/nightly/ubuntu26.04)
    2. Open a terminal in your download folder.
    3. Install the package:

        ```bash
        sudo apt install ./putgd-*.deb
        ```

=== "Debian"

    1. Download the package for Debian 13: [stable](https://app.put.gd/dl/stable/debian13) or [nightly](https://app.put.gd/dl/nightly/debian13).
    2. Open a terminal in your download folder.
    3. Install the package:

        ```bash
        sudo apt install ./putgd-*.deb
        ```

=== "Fedora"

    1. Download the package for your Fedora release. Fedora 44: [stable](https://app.put.gd/dl/stable/fedora44) or [nightly](https://app.put.gd/dl/nightly/fedora44). Fedora 45: [stable](https://app.put.gd/dl/stable/fedora45) or [nightly](https://app.put.gd/dl/nightly/fedora45).
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

=== "Arch"

    Use the [one-line installer](#install-with-one-line). It adds put.gd's signed pacman repository, so put.gd then updates with the rest of your system:

    ```bash
    sudo pacman -Syu
    ```

=== "AppImage"

    For any distribution with glibc 2.39 or newer.

    1. Download the AppImage: [stable](https://app.put.gd/dl/stable/appimage) or [nightly](https://app.put.gd/dl/nightly/appimage).
    2. Open a terminal in your download folder.
    3. Make the file executable and start it:

        ```bash
        chmod +x putgd-*.AppImage && ./putgd-*.AppImage
        ```

??? note "Check a download yourself"
    Download the checksums for the [stable](https://app.put.gd/dl/stable/checksums) or [nightly](https://app.put.gd/dl/nightly/checksums) release into the same folder as `SHA256SUMS`, then run:

    ```bash
    sha256sum --check --ignore-missing SHA256SUMS
    ```

## Start put.gd

After a package install, start put.gd from your applications menu or run `putgd`. Closing its window keeps it running in the tray. Click the tray icon to open History again.

## On GNOME, log out once

On GNOME 50, put.gd captures through an extension for GNOME Shell.

=== "Nightly"

    put.gd sets the extension up itself, whichever way you installed it.

    1. Start put.gd.
    2. When it asks, log out and back in.
    3. Start put.gd again, unless you turned on **Launch at login**.

=== "Stable"

    The DEB and RPM include the extension, but GNOME only finds it after a new login.

    1. Log out and back in.
    2. Turn the extension on:

        ```bash
        gnome-extensions enable putgd@put.gd
        ```

    The AppImage doesn't include the extension: follow the [AppImage steps for GNOME](desktops.md#gnome).

## Right-click upload

The packages also add **Upload with put.gd** to your file manager's right-click menu. See [Upload from your file manager](file-manager.md).

Files only picks up the entry when it starts, and it keeps running after you close its last window. If the entry is missing, log out and back in.

[Next: your first capture](quickstart.md)
