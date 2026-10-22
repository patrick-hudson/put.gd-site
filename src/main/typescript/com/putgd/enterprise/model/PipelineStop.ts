import type { ReactNode } from "react";
import type { KeyboardShortcutBinding } from "./KeyboardShortcutBinding";

export interface PipelineStopPlateImage {
  readonly relativeAssetPath: string;
  readonly intrinsicWidthInPixels: number;
  readonly intrinsicHeightInPixels: number;
  readonly alternativeText: string;
}

export interface PipelineStop {
  readonly pipelineStopHeading: string;
  readonly pipelineStopBody: ReactNode;
  readonly keyboardShortcutBindings: readonly KeyboardShortcutBinding[];
  readonly plateImage: PipelineStopPlateImage;
  readonly plateCaption: string;
}
