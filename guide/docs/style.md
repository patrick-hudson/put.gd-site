# Style your screenshots

Put each screenshot on a backdrop, with padding, rounded corners and a soft shadow, so it looks finished when you paste the link into a chat or a document.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/style-light.avif 1368w, /_site/shots/style-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/style-dark.avif 1368w, /_site/shots/style-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/style-light.webp 1368w, /_site/shots/style-light@2x.webp 2736w">
  <img src="/_site/shots/style-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/style-dark.webp 1368w, /_site/shots/style-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → Capture → Capture style with Style screenshots on: Look set to Amber, Padding, Rounded corners, Soft shadow and the Preview.">
</picture>

1. Open **Settings → Capture** and scroll to **Capture style**.
2. Turn on **Style screenshots**.
3. Pick a **Look**, and a **Padding** of **Small**, **Medium** or **Large**.
4. Capture as usual.

The **Preview** shows the look on a sample window, with the size a 1920 × 1080 capture becomes.

## Looks

- A dark grey gradient, the first look in the list, is chosen to begin with.
- **Amber** is a warm gold gradient.
- **Paper** is plain off-white.
- **Clear** has no backdrop: rounded corners and a shadow on a transparent PNG. The shadow can disappear in dark chat apps.
- **Custom** lets you choose a colour, a two-colour gradient, a picture of your own, or no backdrop.

Padding grows with the capture, so a small region gets a little space and a full screen more. **Rounded corners** and **Soft shadow** can each be turned off.

A picture you choose is copied into put.gd, so moving or deleting your own file later changes nothing.

## What gets styled

Region, window, monitor, desktop and [scrolling](scrolling.md) captures, and **Repeat last region**. Recordings, clipboard uploads and files from your file manager are never styled.

A capture too large to style uploads as it was, with a note.

## Change the look later

With **Keep a local copy** on, the capture as it was taken is saved beside the styled one, with `-original` in its name. **Edit…** in [History](history.md) then opens that original with the style on, so you can pick another look.

In the [editor](edit.md), the **Style** tool (++s++) turns the style on or off for the image you are editing, and changes its look and padding. A new capture starts with it on while **Style screenshots** is on. An image from the clipboard or a file starts with it off. ++ctrl+z++ undoes a style change like any other edit.

!!! tip "Keep the backdrop picture clean"
    The [check for private details](sensitive-text.md) reads only your capture, never the backdrop. Use a picture with nothing private in it.
