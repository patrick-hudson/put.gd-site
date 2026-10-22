import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { ReadOnlyRepository } from "../../interfaces/repositories/ReadOnlyRepository";
import type { PipelineStop } from "../../model/PipelineStop";

@EnterpriseBean("com.putgd.enterprise.impl.repositories.HardcodedPipelineStopRepositoryImpl")
export class HardcodedPipelineStopRepositoryImpl implements ReadOnlyRepository<PipelineStop> {
  public findAll(): readonly PipelineStop[] {
    return [
      {
        pipelineStopHeading: "Trigger",
        pipelineStopBody: (
          <>A global hotkey, the tray menu, or <code>putgd-cli action.invoke</code>. Three keys are bound out of the box and every action can be rebound. Each row in Settings reports whether the desktop actually granted the key, because on Wayland that is not a given.</>
        ),
        keyboardShortcutBindings: [
          { keyboardKeyLabels: ["Ctrl", "Shift", "1"], boundActionDescription: "Capture region" },
          { keyboardKeyLabels: ["Ctrl", "Shift", "2"], boundActionDescription: "Capture window" },
          { keyboardKeyLabels: ["Ctrl", "Shift", "3"], boundActionDescription: "Capture desktop" },
        ],
        plateImage: {
          relativeAssetPath: "shots/tray-trio.webp",
          intrinsicWidthInPixels: 922,
          intrinsicHeightInPixels: 420,
          alternativeText: "The put.gd tray menu on Cinnamon, GNOME and KDE Plasma, each listing capture region, region and edit, window, desktop, screen recording, edit image and upload clipboard.",
        },
        plateCaption: "The same tray menu on Cinnamon, GNOME and Plasma.",
      },
      {
        pipelineStopHeading: "Capture",
        pipelineStopBody: (
          <>A region drawn over the live desktop, the focused window with its frame, every enabled monitor, whatever is on the clipboard (files, an image, or text), or a screen recording. Cinnamon is captured through the compositor's screenshot service, GNOME through a small Shell extension the packages install, and Plasma through KWin's ScreenShot2 with layer-shell overlays. There is no portal picker for regions and no XWayland workaround.</>
        ),
        keyboardShortcutBindings: [],
        plateImage: {
          relativeAssetPath: "shots/review-plasma.webp",
          intrinsicWidthInPixels: 904,
          intrinsicHeightInPixels: 726,
          alternativeText: "The recording review window on KDE Plasma with playback, trim, blur and solid masks, and the output format.",
        },
        plateCaption: "Stop on a recording opens this review. Trim, add timed blur or solid masks, choose MP4, WebM, GIF or WebP, then Upload or Discard.",
      },
      {
        pipelineStopHeading: "Edit, if you want to",
        pipelineStopBody: (
          <>Capture region &amp; edit opens an editor before anything is stored. Redact removes the covered pixels from the file rather than blurring them. Crop, arrow, rectangle, highlight and text, with undo and a 100% zoom to check edges. Nothing leaves the machine until you press Upload, and Cancel stores nothing.</>
        ),
        keyboardShortcutBindings: [],
        plateImage: {
          relativeAssetPath: "shots/editor-gnome.webp",
          intrinsicWidthInPixels: 1344,
          intrinsicHeightInPixels: 998,
          alternativeText: "The put.gd editor on GNOME: a photo of Earth with a rectangle, a highlight, a solid redaction box, an arrow and a caption.",
        },
        plateCaption: "The editor on GNOME. The black box is a redaction; those pixels are gone from the upload.",
      },
      {
        pipelineStopHeading: "Upload",
        pipelineStopBody: (
          <>Any S3-compatible bucket with your own link domain, or Proton Drive through the official SDK. Public-read or private is chosen per destination and per action; a private upload makes no link and leaves the clipboard alone. Credentials live in the system keychain or for the session only, never in a file, and the CLI refuses them on the command line. Test connection uploads a sample object, checks the public link, then deletes it.</>
        ),
        keyboardShortcutBindings: [],
        plateImage: {
          relativeAssetPath: "shots/destinations-plasma.webp",
          intrinsicWidthInPixels: 1322,
          intrinsicHeightInPixels: 908,
          alternativeText: "The Destinations page on KDE Plasma: an S3 bucket with region, endpoint, link domain and access policy.",
        },
        plateCaption: "A destination: bucket, region, link domain and access policy up front; endpoints, addressing and timeouts under Advanced.",
      },
      {
        pipelineStopHeading: "Receipt",
        pipelineStopBody: (
          <>The link is on the clipboard, a notification says so, and History gets an entry with a thumbnail, the size and the outcome. History works offline: it never lists or fetches anything from the bucket to show you what you have. From there you can copy the link again, re-edit the local copy, or delete the remote object after reviewing exactly what will be removed. An interrupted upload is recorded as unknown, never as a made-up URL.</>
        ),
        keyboardShortcutBindings: [],
        plateImage: {
          relativeAssetPath: "shots/history-plasma.webp",
          intrinsicWidthInPixels: 1322,
          intrinsicHeightInPixels: 908,
          alternativeText: "History in gallery view on KDE Plasma, showing region captures, desktop captures and a screen recording with Copy result buttons.",
        },
        plateCaption: "History in gallery view. The list view has the same rows with search and filters.",
      },
    ];
  }
}
