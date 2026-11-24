# Copy text from the screen

Copy the words out of something you can see but can't select, such as an error in a dialog, a terminal in a screenshot, a slide or a video frame. QR codes in the area are read too.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-light.avif 975w, /_site/shots/capture-light@2x.avif 1950w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-dark.avif 975w, /_site/shots/capture-dark@2x.avif 1950w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-light.webp 975w, /_site/shots/capture-light@2x.webp 1950w">
  <img src="/_site/shots/capture-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/capture-dark.webp 975w, /_site/shots/capture-dark@2x.webp 1950w" width="975" height="1021" loading="lazy" alt="A region being selected with put.gd. Copy text from region uses the same selector: drag over the text you want.">
</picture>

1. Choose **Copy text from region** in the tray menu, or **Copy text** at the top of the put.gd window. It has no key until you set one in [hotkeys](settings.md#hotkeys).
2. Drag a rectangle over the text. To cancel, press ++esc++.
3. Paste. The text is on your clipboard, and a notification says how much was copied.

Nothing is saved or uploaded, and nothing is added to History. put.gd reads the area on your computer, and the text never goes into its logs or settings.

## What you get

| put.gd found | On your clipboard | The notification says |
| --- | --- | --- |
| Text | The text | **Copied 214 characters** |
| Text and QR codes | The text, then what each code holds on a line of its own | **Copied 214 characters and 1 code** |
| Only codes | What the codes hold, one per line | **Copied 1 code** |
| Nothing | No change | **No text found** |

put.gd reads QR, Micro QR, Data Matrix and Aztec codes. It never opens a link it finds here.

Check what you paste, because recognition can make mistakes, especially with unusual fonts, small type and columns side by side. Text too faint or too small for a person to read is left out. Emoji are copied as emoji.

!!! warning "Your clipboard manager may keep the text"
    put.gd doesn't mark the copy as private. If you use a clipboard manager, clear sensitive text there.

## How long it takes

About half a second for a paragraph, and several seconds for an area packed with text. A whole 4K screen takes longer. If put.gd can't read it all in about 16 seconds, you get what it read so far, and the notification says the text was cut. Select a smaller area to read the rest.

## Other languages

English comes with put.gd. By default put.gd also reads your desktop's language, if its data is installed.

1. Install your distribution's Tesseract package for the language. For German that is `tesseract-ocr-deu` on Ubuntu, Mint and Debian, `tesseract-langpack-deu` on Fedora, or `tesseract-data-deu` on Arch.
2. Open **Settings → Capture → Text recognition**.
3. Choose up to three: **Language**, **Second language** and **Third language**.

You can also put a language's `.traineddata` file in `~/.local/share/putgd/tessdata/`. put.gd never downloads language data.

### Text in another script

While the languages are left on **Automatic**, put.gd can often tell when lines are in another script, such as Chinese, Japanese, Korean, Russian, Arabic, Hebrew, Hindi, Thai or Greek, and reads them again in that language. It doesn't always manage: a page with only a little such text, or one whose script it can't tell, is read as before.

The AppImage carries those languages. The DEB and RPM recommend their packages, so apt and dnf install them unless you turned recommended packages off. If the language is missing, the notification of the copied text names it, for example "(Chinese data is missing)".

If you often read pages in another language, choose it in **Settings**. It is then used from the start, and the automatic check is off.

## In the editor

In the [editor](edit.md), choose the **Copy text** tool (++g++), the last one.

- Drag from one word to another to select them. Double-click takes a line, and ++ctrl+a++ takes everything.
- **Copy selection** and **Copy all text** are in the side panel, with each QR code and its own **Copy**.
- A link in a code is shown in full, so you can check it before you click **Open link**.
- Words under a **Redact** are never read. **Blur** doesn't hide text from this tool.

## From History

Select an image in [History](history.md) and choose **Copy text**. This reads the copy kept on your computer, so it needs **Keep a local copy** to have been on. put.gd never downloads an upload to read it.

## If it won't run

The button and the tray entry say why. The usual reasons are missing English data or an old kernel. See [troubleshooting](troubleshooting.md#copy-text-doesnt-work).
