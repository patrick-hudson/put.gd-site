# Check for private details before uploading

Have put.gd read each capture before it uploads, and warn you or cover it when it shows a card number, a key, your name or other private text.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/text-settings-light.avif 1368w, /_site/shots/text-settings-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/text-settings-dark.avif 1368w, /_site/shots/text-settings-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/text-settings-light.webp 1368w, /_site/shots/text-settings-light@2x.webp 2736w">
  <img src="/_site/shots/text-settings-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/text-settings-dark.webp 1368w, /_site/shots/text-settings-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → Capture, further down: Text recognition with three languages, Always suggest redacting and Patterns (regular expressions). The check for sensitive text is below these.">
</picture>

!!! note "In nightly builds for now"
    This check arrives in the next stable release. See [stable or nightly](index.md#stable-or-nightly).

1. Open **Settings → Capture** and scroll to **Text recognition**.
2. Turn on **Check captures for sensitive text before uploading**. It is off until you do.
3. For each kind of text, choose **Off**, **Warn** or **Redact automatically**.

**Card numbers**, **Keys and tokens** and **My redaction list** start on **Warn**. **Email addresses**, **Phone numbers**, **IP addresses** and **My username and name** start **Off**, because many screenshots show some of those. **Apply to all kinds** sets them all at once.

!!! warning "It only covers what it detects"
    Recognition can miss very small, faint or low-contrast text, and a number split across two lines. A capture that uploads without a prompt can still show something private. Look before you share.

## When it finds something

If only kinds set to **Redact automatically** turn up, put.gd covers them and uploads without asking.

For a kind set to **Warn**, nothing uploads yet. A small panel says what it found, with a preview that shows the suggested covers. It never shows the text itself.

- **Redact and upload** (++enter++) covers what the preview shows and uploads.
- **Open in editor** opens the [editor](edit.md) with the covers in place. Check them, then click **Upload**.
- **Upload anyway** uploads without covering the **Warn** kinds. What was covered automatically stays covered.
- **Cancel** (++esc++) uploads nothing. With **Keep a local copy** on, the capture is saved on this computer as taken.

The panel has no title bar: drag it by its body. If another window hides it, click **Show** on put.gd's notification, where your desktop's notifications have buttons.

If put.gd couldn't finish checking, it asks you anyway and says why. It never uploads a capture it couldn't check without asking.

After an upload it covered, the notification says what, such as "Covered 1 card number." With **Keep a local copy** on, both the covered image and the original, with `-original` in its name, stay on this computer.

## What is checked

Region, window, monitor, desktop and [scrolling](scrolling.md) captures, images uploaded from the clipboard, and PNG and JPEG files you upload [from your file manager](file-manager.md).

Not checked: **Capture region & edit**, recordings, other kinds of file, and retries of an earlier upload. A capture that only saves on this computer isn't read either.

The check takes about a quarter to half a second for a region on our test machines. A screen full of small text takes longer.

## Your own words and patterns

**My redaction list** covers words you choose, such as a host name, a client or a project name. Add them in **Settings → Capture → Text recognition**:

- **Always suggest redacting** takes one word or phrase per line. Case and accents don't matter, and `Project Aurora` also covers `project-aurora`.
- **Patterns (regular expressions)** takes one pattern per line, such as `\bJIRA-\d+\b` for ticket numbers.

The list stays on this computer. It is never uploaded or written to put.gd's logs.

**My username and name** covers your login name and the real name on your account, as a terminal prompt or a home folder path shows them.
