# Capture

This page shows you how to capture a region, a window, one monitor or the whole desktop, how to upload your clipboard, and how to choose where the results go. For a page longer than the screen, see [Capture a scrolling page](scrolling.md). To copy the words out of a picture instead, see [Copy text from the screen](copy-text.md).

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-light.avif 975w, /_site/shots/capture-light@2x.avif 1950w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-dark.avif 975w, /_site/shots/capture-dark@2x.avif 1950w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-light.webp 975w, /_site/shots/capture-light@2x.webp 1950w">
  <img src="/_site/shots/capture-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-dark.webp 975w, /_site/shots/capture-dark@2x.webp 1950w" width="975" height="1021" loading="lazy" alt="A region being selected over a photo, with its size shown beside the selection.">
</picture>

Every action is a button across the top of the put.gd window and an entry in the tray menu. In the window, **Capture region** comes first, then **Window**, **Monitor**, **Desktop** and **Scrolling region**. Each button's tooltip names its key and where its result goes. The put.gd window closes during a screen capture to keep itself out of the picture. You can change any key in [hotkeys](settings.md#hotkeys).

## Capture region

1. Press ++ctrl+shift+1++, or choose **Capture region**.
2. Drag across the area you want, then let go. To cancel, press ++esc++.

### Capture an open menu

1. Go to **Settings → Capture → Region selection** and set **While selecting** to **Screenshot first**.
2. Open the menu you want, then press ++ctrl+shift+1++.
3. Close the menu if it is still open. The selector appears over a frozen picture of your screen.
4. Drag across the area you want.

### Repeat last region

Choose **Repeat last region** in the tray menu, or open the arrow beside the **Capture region** button, or right-click it. put.gd captures the same rectangle as your last region capture, with nothing to drag. It has no key until you set one.

The result goes wherever **Capture region** sends its captures. put.gd forgets the rectangle when it quits, and tells you when there is nothing to repeat or your monitors have changed since.

## Capture window

1. Click the window you want. put.gd does not capture its own windows.
2. Press ++ctrl+shift+2++, or choose **Capture window**.

Support varies by desktop. See [your desktop](desktops.md).

## Capture monitor

1. Move the pointer onto the monitor you want.
2. Choose **Capture monitor**. It has no key until you set one.

You get that one monitor at its full size. With several monitors, this is the choice between a region and the very wide picture **Capture desktop** makes.

## Capture desktop

Press ++ctrl+shift+3++, or choose **Capture desktop**. You get all your enabled monitors, panels included.

## Capture after a delay

A delay gives you time to open a menu, hover over a button or hold a key before the capture.

1. Choose the delay in one of three places. They all show the same choice:
    - **Capture delay** at the bottom of the put.gd window.
    - The **Capture delay** submenu in the tray menu.
    - **Settings → Capture → Capture delay**.
2. Choose **3 seconds**, **5 seconds** or **10 seconds**.
3. Start a region, window, monitor or desktop capture, **Repeat last region**, **Capture region & edit** or **Copy text from region**.

While a delay is set, the control at the bottom of the window is highlighted, and the buttons that wait say so in their tooltip.

A small pill at the top of the screen counts down. It never appears in the picture. Click it to cancel.

- For a region, you drag the area first and the countdown runs afterwards. With **Screenshot first**, the countdown runs first.
- A window or monitor capture takes the window that is active, or the monitor under the pointer, when the countdown ends.
- A capture started with a key is immediate, unless you turn on **Also delay captures started by a hotkey** in **Settings → Capture → Capture delay**.
- Scrolling captures and recordings never wait.
- If the screen is locked when the countdown ends, nothing is captured.

The delay stays until you set it back to **None**.

## Upload clipboard

1. Copy what you want to upload.
2. Choose **Upload clipboard**. It has no key until you set one.

put.gd looks for copied files first, then an image, then text. A copied web address uploads as text. The put.gd window stays open. To upload files without copying them, see [Upload from your file manager](file-manager.md).

## After a capture

- **Link.** The link is copied to your clipboard. Uploads set to **Keep private** create no link and leave your clipboard alone.
- **Local copy.** The file is also saved on this computer if **Keep a local copy** is on.
- **History.** The capture appears in [History](history.md), which is also where you recover from a failed upload.

## Where captures go

Go to **Settings → Capture**, or open **Capture output** in the tray menu and choose **Change output…**.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-settings-light.avif 1368w, /_site/shots/capture-settings-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-settings-dark.avif 1368w, /_site/shots/capture-settings-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-settings-light.webp 1368w, /_site/shots/capture-settings-light@2x.webp 2736w">
  <img src="/_site/shots/capture-settings-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-settings-dark.webp 1368w, /_site/shots/capture-settings-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="Settings → Capture: Capture output with Destination, Sharing, After uploading and Different output for some actions, then Region selection and Capture delay.">
</picture>

- **Destination** is where uploads go. **No destination** turns uploads off. To add one, see [Set up a destination](destinations.md).
- **Sharing** decides whether an upload gets a link.
- **Different output for some actions** sends one action somewhere else.

[Settings → Capture](settings.md#capture) explains every row.

**Keep a local copy** is further down the same page, under **Local copies**. Files go to the **Save to** folder, which starts as `put.gd` inside your Documents folder.

| Destination | Keep a local copy | What happens |
| --- | --- | --- |
| Chosen | Off | Uploads the file |
| Chosen | On | Saves the file on this computer and uploads it |
| None | On | Saves the file on this computer only |
| None | Off | Shows an error and captures nothing |

## Make captures look finished

**Capture style** puts each screenshot on a backdrop with padding, rounded corners and a shadow before it uploads. It is off until you turn it on. See [Style your screenshots](style.md).
