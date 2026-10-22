import { useRef } from "react";
import { useEnterpriseBean } from "../../../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { AssetPathResolver } from "../../../../interfaces/resolvers/AssetPathResolver";
import type { PipelineStopPlateImage } from "../../../../model/PipelineStop";
import { useScrollRevealFallback } from "../../../hooks/useScrollRevealFallback";

export interface PipelinePlateFigureComponentProperties {
  readonly plateImage: PipelineStopPlateImage;
  readonly plateCaption: string;
}

export function PipelinePlateFigureComponent(pipelinePlateFigureComponentProperties: PipelinePlateFigureComponentProperties) {
  const assetPathResolver = useEnterpriseBean<AssetPathResolver>("assetPathResolver");
  const plateFigureElementReference = useRef<HTMLElement>(null);
  const hasPlateBeenRevealed = useScrollRevealFallback(plateFigureElementReference);
  const { plateImage, plateCaption } = pipelinePlateFigureComponentProperties;
  return (
    <figure className={hasPlateBeenRevealed ? "plate in" : "plate"} ref={plateFigureElementReference}>
      <div className="plate-frame">
        <img
          src={assetPathResolver.resolveAssetPath(plateImage.relativeAssetPath)}
          width={plateImage.intrinsicWidthInPixels}
          height={plateImage.intrinsicHeightInPixels}
          loading="lazy"
          alt={plateImage.alternativeText}
        />
      </div>
      <figcaption>{plateCaption}</figcaption>
    </figure>
  );
}
