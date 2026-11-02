# Install put.gd

By the end of this page, put.gd is installed and running in your tray. There is no stable release yet, so every download here is the newest nightly build.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-light.avif 1920w, /_site/shots/desktop-light@2x.avif 3840w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-dark.avif 1920w, /_site/shots/desktop-dark@2x.avif 3840w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-light.webp 1920w, /_site/shots/desktop-light@2x.webp 3840w">
  <img src="/_site/shots/desktop-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/desktop-dark.webp 1920w, /_site/shots/desktop-dark@2x.webp 3840w" width="1920" height="1080" loading="lazy" alt="put.gd running on Fedora 44 with GNOME: the History window open on the desktop.">
</picture>

Choose your system. The one-line installer is the quick way: it checks the download against the published checksums before installing anything.

=== "Ubuntu and Mint"

    **One line**

    1. Open a terminal.
    2. Run the installer, and enter your password if asked:

        ```bash
        curl -fsSL https://app.put.gd/install | sh
        ```

    **By hand**

    1. Download the package for your system. Each one installs only on the release it names.
        - [Ubuntu 24.04 or Linux Mint 22](https://app.put.gd/dl/nightly/ubuntu24.04)
        - [Ubuntu or Kubuntu 26.04](https://app.put.gd/dl/nightly/ubuntu26.04)
    2. Open a terminal in your download folder.
    3. Install the package:

        ```bash
        sudo apt install ./putgd-*.deb
        ```

=== "Debian"

    **One line**

    1. Open a terminal.
    2. Run the installer, and enter your password if asked:

        ```bash
        curl -fsSL https://app.put.gd/install | sh
        ```

    **By hand**

    1. Download the [package for Debian 13](https://app.put.gd/dl/nightly/debian13).
    2. Open a terminal in your download folder.
    3. Install the package:

        ```bash
        sudo apt install ./putgd-*.deb
        ```

=== "Fedora"

    **One line**

    1. Open a terminal.
    2. Run the installer, and enter your password if asked:

        ```bash
        curl -fsSL https://app.put.gd/install | sh
        ```

    The installer also sets up the H.264 encoder that recording needs. If it can't, it prints the commands to run.

    **By hand**

    1. Download the [package for Fedora 44](https://app.put.gd/dl/nightly/fedora44).
    2. Open a terminal in your download folder.
    3. Install the package:

        ```bash
        sudo dnf install ./putgd-*.rpm
        ```

    4. Install Cisco's H.264 encoder, which recording needs:

        ```bash
        sudo dnf install openh264 gstreamer1-plugin-openh264
        ```

        If the `fedora-cisco-openh264` repository was turned off, first run `sudo dnf config-manager setopt fedora-cisco-openh264.enabled=1`.

=== "AppImage"

    For any distribution with glibc 2.39 or newer. No password needed for the one-line install.

    **One line**

    1. Open a terminal.
    2. Run the installer:

        ```bash
        curl -fsSL https://app.put.gd/install | sh -s -- --appimage
        ```

    3. Start put.gd:

        ```bash
        ~/.local/bin/putgd.AppImage
        ```

    **By hand**

    1. Download the [AppImage](https://app.put.gd/dl/nightly/appimage).
    2. Open a terminal in your download folder.
    3. Make the file executable:

        ```bash
        chmod +x putgd-*.AppImage
        ```

    4. Start put.gd:

        ```bash
        ./putgd-*.AppImage
        ```

After a package install, start put.gd from your applications menu or run `putgd`. It lives in the tray, and the window opens when you need it.

!!! warning "On GNOME: turn on the capture extension"
    put.gd captures through an extension for GNOME Shell. The Ubuntu, Debian and Fedora packages include it, but GNOME only finds it after a new login.

    1. Log out and back in.
    2. Run:

        ```bash
        gnome-extensions enable putgd@put.gd
        ```

    It works right away, with no second logout. The AppImage doesn't include the extension: follow the [AppImage steps for GNOME](desktops.md#gnome).

??? note "Check a download yourself"
    Download [SHA256SUMS](https://app.put.gd/dl/nightly/checksums) into the same folder, then run:

    ```bash
    sha256sum --check --ignore-missing SHA256SUMS
    ```

[Next: your first capture](quickstart.md)
