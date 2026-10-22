import { useRef } from "react";
import { useSelectionReadoutText } from "../../../hooks/useSelectionReadoutText";

const SELECTION_RESIZE_HANDLE_COMPASS_DIRECTIONS = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;

export function SelectionMarqueeComponent() {
  const selectionMarqueeElementReference = useRef<HTMLDivElement>(null);
  const selectionReadoutText = useSelectionReadoutText(selectionMarqueeElementReference);
  return (
    <div className="sel" id="sel" aria-hidden="true" ref={selectionMarqueeElementReference}>
      <svg className="ants" preserveAspectRatio="none">
        <rect x="0.75" y="0.75" width="calc(100% - 1.5px)" height="calc(100% - 1.5px)" />
      </svg>
      {SELECTION_RESIZE_HANDLE_COMPASS_DIRECTIONS.map((selectionResizeHandleCompassDirection) => (
        <b key={selectionResizeHandleCompassDirection} className={`h ${selectionResizeHandleCompassDirection}`}></b>
      ))}
      <span className="readout" id="readout">
        {selectionReadoutText}
      </span>
    </div>
  );
}
