import type { PipelineStop } from "../../../../model/PipelineStop";
import { KeyboardShortcutKeymapComponent } from "./KeyboardShortcutKeymapComponent";
import { PipelinePlateFigureComponent } from "./PipelinePlateFigureComponent";

export interface PipelineStopComponentProperties {
  readonly pipelineStop: PipelineStop;
}

export function PipelineStopComponent(pipelineStopComponentProperties: PipelineStopComponentProperties) {
  const { pipelineStop } = pipelineStopComponentProperties;
  return (
    <li className="stop">
      <div className="stop-text">
        <h3>{pipelineStop.pipelineStopHeading}</h3>
        <p>{pipelineStop.pipelineStopBody}</p>
        <KeyboardShortcutKeymapComponent keyboardShortcutBindings={pipelineStop.keyboardShortcutBindings} />
      </div>
      <PipelinePlateFigureComponent plateImage={pipelineStop.plateImage} plateCaption={pipelineStop.plateCaption} />
    </li>
  );
}
