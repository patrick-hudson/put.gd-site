# Upload from your file manager

By the end of this page you will have uploaded a file or folder with a right-click and have its link on your clipboard.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/file-manager-light.avif 954w, /_site/shots/file-manager-light@2x.avif 1908w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/file-manager-dark.avif 954w, /_site/shots/file-manager-dark@2x.avif 1908w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/file-manager-light.webp 954w, /_site/shots/file-manager-light@2x.webp 1908w">
  <img src="/_site/shots/file-manager-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/file-manager-dark.webp 954w, /_site/shots/file-manager-dark@2x.webp 1908w" width="954" height="702" loading="lazy" alt="The Files window with a photo selected and its right-click menu open; Upload with put.gd is near the bottom of the menu.">
</picture>

1. Right-click one or more files or folders.
2. Choose **Upload with put.gd**. In Thunar it is under **Send To**. With the AppImage, Files and Caja show it under **Scripts**.

## What happens

There is no confirmation step. The upload starts right away.

- **Destination.** It goes to your capture destination, or to your only destination if you have not chosen one. If put.gd cannot tell which to use, Settings opens on **Destinations**. See [Set up a destination](destinations.md).
- **Link.** The link is copied, as for a [capture](capture.md). Uploads set to **Keep private** create no link and leave your clipboard alone.
- **Notification.** You get one when it finishes or fails, unless **Show desktop notifications** is off.
- **History.** The upload appears in [History](history.md).

## Which file managers have it

| File manager | Desktop | Where the entry is |
| --- | --- | --- |
| Files | GNOME, Unity, Flashback, Budgie, Hyprland on Omarchy | Right-click menu; **Scripts** with the AppImage |
| Dolphin | KDE Plasma | Right-click menu |
| Nemo | Cinnamon, Budgie | Right-click menu |
| Thunar | XFCE | **Send To** |
| Caja | MATE | Right-click menu; **Scripts** with the AppImage |
| PCManFM | LXDE, LXQt | Right-click menu |
| COSMIC Files | COSMIC | Right-click menu |
| Pantheon Files | Pantheon | Right-click menu |
| Peony | UKUI | Right-click menu, also on folders and the desktop; DEB only |

Files needs version 43 or later, and COSMIC Files needs epoch-1.0.10 or later.

On Pantheon's Secure Session the upload works but the link is not copied. Find it in History.

## Folders

Choose how folders upload in **Settings → General → File manager → Folders**:

- **Upload as a .zip** is the default. You get one `.zip` named after the folder, and one link. Symbolic links are skipped.
- **Upload each file** uploads every file in the folder and its subfolders, with one link each. Symbolic links are skipped. **Files in a batch** under **Settings → Advanced** (100 by default, up to 10,000) counts every file, so a larger folder is refused.

## Turn the entry on or off

With a package the entry is always on. With the AppImage, the first run adds it and shows a notice: "Upload with put.gd is now in your file manager's right-click menu." To turn it off or back on, use **Settings → General → File manager → File manager menu**.

## If the entry does not appear yet

Files keeps running after you close its last window, so the entry may appear only after it restarts. Caja and PCManFM can also need a restart. Logging out and back in restarts them all.

With the AppImage, the first-run notice names the file manager if it needs a restart. If your desktop's notifications can show buttons, the notice offers **Restart Files**, or the same for PCManFM. This closes all of that file manager's windows.

## What is refused

put.gd checks your selection first. If anything is refused, a notification names it and nothing uploads.

- **Empty files.**
- **Files over the size limit.** That is **Largest file** under **Settings → Advanced**, or the most your destination accepts. A folder uploaded as a `.zip` is checked before it is zipped, so one whose `.zip` would fit can still be refused.
- **Items with no local path.** put.gd can't read them.
