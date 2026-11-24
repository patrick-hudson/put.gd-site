# What's new in 26.1124

This stable release follows 26.1105.3906. It adds new places to upload to, a check that catches passwords, keys and card numbers before a capture leaves your computer, styled screenshots, text reading in more languages, and many reliability fixes. To get it, see [Keeping it updated](updating.md).

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 672px" srcset="/_site/shots/sensitive-light.avif 672w, /_site/shots/sensitive-light@2x.avif 1344w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 672px" srcset="/_site/shots/sensitive-dark.avif 672w, /_site/shots/sensitive-dark@2x.avif 1344w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 672px" srcset="/_site/shots/sensitive-light.webp 672w, /_site/shots/sensitive-light@2x.webp 1344w">
  <img src="/_site/shots/sensitive-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 672px" srcset="/_site/shots/sensitive-dark.webp 672w, /_site/shots/sensitive-dark@2x.webp 1344w" width="672" height="371" loading="lazy" alt="The Sensitive text found panel: the capture shows a card number and 2 keys or tokens, with a preview that covers them, and the buttons Cancel, Open in editor, Upload anyway and Redact and upload.">
</picture>

## New places to upload

- **[SFTP](destinations-sftp.md)** uploads to your own server over SSH, signing in with a password or a key file.
- **[Nextcloud and WebDAV](destinations-nextcloud.md)** uploads to a Nextcloud server or any WebDAV share, and copies a share link for you.
- **[Cloudflare R2](destinations-r2.md)** is its own destination, with tokens for a single bucket.
- **[Custom uploader](destinations-custom.md)** sends captures to your own upload address, and imports a ShareX `.sxcu` file.
- S3 can hand out [links that expire](destinations-s3.md#links), and you can [renew an S3 or B2 link](history.md#when-a-link-expires) from History.
- Large B2 uploads send four parts at a time. Proton Drive, still experimental, uploads with a share link in under two seconds.

## Catch private details before they upload

Turn on **Check captures for sensitive text before uploading** in **Settings → Capture → Text recognition**. put.gd then reads each capture before it uploads and looks for card numbers, keys and tokens, email addresses, phone numbers, IP addresses, your username and name, and your own words and patterns. For each kind you choose **Off**, **Warn** or **Redact automatically**.

When it warns, a small panel shows a preview with the covers in place, never the text itself, and four buttons: **Redact and upload**, **Open in editor**, **Upload anyway** and **Cancel**. Kinds set to **Redact automatically** are covered and uploaded without asking. If the check can't finish, put.gd asks instead of uploading. See [Check for private details](sensitive-text.md).

## Quick redact covers much more

The editor's [Quick redact](edit.md#quick-redact) now finds passwords in connection strings, commands, forms and diffs, secret settings, webhook addresses, 2FA secrets and QR codes that hold one, keys from many more providers, your username and name, and your own list. It also leaves hashes, dates, version numbers and other look-alikes alone far more often.

## Capture style

[Capture style](style.md) puts screenshots on a backdrop with padding, rounded corners and a soft shadow: a dark grey gradient, **Amber**, **Paper**, **Clear** or your own. The original is kept beside the styled copy, and the editor's **Style** tool changes the look later.

## Text in more languages

[Copy text](copy-text.md) and the private-details check read Chinese, Russian and other non-Latin pages in their own language while you leave the languages on **Automatic** (see [text in another script](copy-text.md#text-in-another-script)). Emoji copy as emoji, faint lines get a second read, and dense 4K screens finish faster.

## Unhinged mode

**Unhinged mode**, under [Settings → Advanced](settings.md#advanced), lets text reading, recording and History previews use more of the processor, so they finish sooner while your other apps may slow down. It is off by default.

## More ways to capture

- [Scrolling capture](scrolling.md) for pages taller than the screen, scrolled by you or by put.gd.
- [Capture monitor, Capture after a delay and Repeat last region](capture.md).
- [Copy text from region](copy-text.md) and QR codes.
- The editor's line, ellipse, pen, step number and pixelate tools, and **Copy image**.
- Recordings with your [microphone](record.md#record-your-voice) and [click highlights](record.md#show-your-clicks), and a new [review window](record.md#the-review-window) with cuts and a filmstrip.
- The [error log](settings.md#error-log) in Settings, and a [QR code](history.md#show-a-link-as-a-qr-code) for any link in History.

## More desktops and packages

- [Budgie on Wayland and Hyprland](desktops.md).
- A Fedora 45 package, and Arch packages from a signed repository.
- On GNOME 50, setup takes [a single logout](index.md#on-gnome-log-out-once).

## Reliability

- A recording whose screen share disappears stops with a clear error instead of getting stuck.
- A region you accepted is kept when capture is slow to finish.
- An unclear reply from the server no longer sends an upload twice, and slow S3 and B2 uploads are allowed to finish.
- An upload whose link didn't finish is no longer shown as failed, and one **Retry** finishes it.
- Settings save one change at a time, and a destination keeps its passed test.
- The AppImage bundles a newer FFmpeg with known security fixes.

## Known limits

- The private-details check only covers text put.gd can read. Very small, faint or low-contrast text, and a number split across two lines, can be missed.
- On a page in a script you haven't chosen, the check can mistake text for a key. Choose **Upload anyway** when nothing is secret.
- On Fedora with GNOME, about one time in a hundred the editor closes as it opens. Open it again.
