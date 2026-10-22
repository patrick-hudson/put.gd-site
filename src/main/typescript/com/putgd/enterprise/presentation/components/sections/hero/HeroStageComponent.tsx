import { KeyboardChordComponent } from "../../primitives/KeyboardChordComponent";
import { DesktopPanelComponent } from "./DesktopPanelComponent";
import { LatencyChartWindowComponent } from "./LatencyChartWindowComponent";
import { LinkCopiedToastNotificationComponent } from "./LinkCopiedToastNotificationComponent";
import { SelectionMarqueeComponent } from "./SelectionMarqueeComponent";
import { TestRunnerTerminalWindowComponent } from "./TestRunnerTerminalWindowComponent";

export function HeroStageComponent() {
  return (
    <figure className="stage-wrap">
      <div
        className="stage"
        id="stage"
        role="img"
        aria-label="Animation: Ctrl+Shift+1 is pressed, a region around a failing test is selected, the capture flies to the put.gd tray icon, and a notification confirms the link was copied."
      >
        <div className="desk" id="desk">
          <TestRunnerTerminalWindowComponent />
          <LatencyChartWindowComponent />
        </div>

        <div className="keys" id="keys" aria-hidden="true">
          <KeyboardChordComponent keyboardKeyLabels={["Ctrl", "Shift", "1"]} />
        </div>

        <SelectionMarqueeComponent />

        <div className="shot" aria-hidden="true">
          <pre>{"FAILED tests/test_upload.py::test_retry\n  AssertionError: expected 201, got 503\n1 failed, 214 passed in 8.31s"}</pre>
        </div>

        <svg className="cursor" id="cursor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2v7M12 15v7M2 12h7M15 12h7" />
          <circle cx="12" cy="12" r="1.4" />
        </svg>

        <DesktopPanelComponent />
        <LinkCopiedToastNotificationComponent />
      </div>
      <figcaption>
        The region hotkey, a drag around the failing test, the upload to the tray, the receipt. On a real desktop this
        takes about as long as it does here.
      </figcaption>
    </figure>
  );
}
