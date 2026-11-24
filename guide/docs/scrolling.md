# Capture a scrolling page

Get one tall image of something longer than your screen, such as a web page, a document, a chat or a long settings list.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-light.avif 975w, /_site/shots/capture-light@2x.avif 1950w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-dark.avif 975w, /_site/shots/capture-dark@2x.avif 1950w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-light.webp 975w, /_site/shots/capture-light@2x.webp 1950w">
  <img src="/_site/shots/capture-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-dark.webp 975w, /_site/shots/capture-dark@2x.webp 1950w" width="975" height="1021" loading="lazy" alt="A region being selected with put.gd. A scrolling capture starts the same way: drag over the content you want.">
</picture>

1. Choose **Capture scrolling region** in the tray menu, or **Scrolling region** at the top of the put.gd window. It has no key until you set one in [hotkeys](settings.md#hotkeys).
2. Drag a rectangle over the content that scrolls, and include its scrollbar. The capture starts as soon as you let go.
3. Scroll down with the mouse wheel, the touchpad, the keys or the scrollbar. The image grows as the page moves.
4. Click **Done** at the end, or press your scrolling capture key again.

The result is one PNG. It goes where **Capture region** sends its captures, unless you give **Capture scrolling region** its own [exception](settings.md#capture).

## Let put.gd scroll for you

Click **Auto-scroll** on the bar. put.gd turns the wheel in small steps and finishes by itself at the end of the page.

- **Move the mouse** to pause it. The bar says **Paused: you moved the mouse**. Click **Auto-scroll** again to carry on.
- **Start every capture this way** with **Settings → Capture → Scrolling capture → Start with auto-scroll**.
- **Start at the top** with **Auto-scroll goes to the top first**, in the same place. If put.gd can't reach the top, the image starts partway down and says so.

## What the bar says

| The bar says | What to do |
| --- | --- |
| **Following** | Keep scrolling. The height so far is beside it |
| **Lost the page**, with **Scroll back a little** | You jumped too far, or the page changed. Scroll back until it says **Found the page again** |
| **Nothing scrolled here** | Auto-scroll's wheel moved nothing. Scroll the page yourself |
| **Auto-scroll lost the page** | The page rearranged itself. Scroll back a little, then scroll on yourself or press **Auto-scroll** |

**Cancel** throws everything away. Nothing is saved, uploaded or added to History.

## Limits

- The image stops at **Maximum height** in **Settings → Capture → Scrolling capture**: 30,000 pixels to begin with, and anything from 2,000 to 60,000. You keep what was captured, with a note that the page continues.
- The rectangle has to lie on one monitor and be at least 64 pixels each way.
- A capture with nothing scrolled for 10 minutes ends by itself. It keeps the image if you scrolled at all.
- If you click **Done** while put.gd has lost the page, the image ends where it last found it.

## Tips

- A sticky header, a footer or a side bar appears once in the image, not on every screenful.
- Videos, carousels and other things that change in place appear as they were first seen.
- A long blank stretch stops auto-scroll, which keeps the image so far. Start another capture below it for the rest.
- Keep the pointer off links while you scroll yourself, or a link's address or tooltip can end up in the image.
- Close other apps' notifications over the rectangle first. put.gd hides its own while you capture.

## On your desktop

- **Esc** finishes the capture on Cinnamon and other X11 sessions. On Wayland there is no Esc, so give **Capture scrolling region** a key if you want one that finishes it.
- **GNOME** shows its screen-sharing indicator while you capture. Clicking it finishes the capture like **Done**. After an update, log out and back in once if scrolling capture reports a problem with the extension.
- **KDE Plasma on Ubuntu 24.04** has no region selector in the package, so scrolling capture is unavailable there. Use the AppImage.
