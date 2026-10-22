import { Fragment, useRef } from "react";
import { useTypewriterConsoleSession } from "../../../hooks/useTypewriterConsoleSession";
import { WindowTitleBarComponent } from "../../primitives/WindowTitleBarComponent";
import { ConsoleLineComponent } from "./ConsoleLineComponent";

export function TypewriterConsoleComponent() {
  const consolePreformattedElementReference = useRef<HTMLPreElement>(null);
  const { revealedConsoleLines, isTypewriterCaretVisible, consoleSessionAccessibleLabel } =
    useTypewriterConsoleSession(consolePreformattedElementReference);
  return (
    <div className="console" aria-label={consoleSessionAccessibleLabel}>
      <WindowTitleBarComponent windowTitle="putgd-cli" />
      <pre id="console" ref={consolePreformattedElementReference}>
        <code>
          {revealedConsoleLines.map((revealedConsoleLine, revealedConsoleLineIndex) => (
            <Fragment key={revealedConsoleLineIndex}>
              {revealedConsoleLineIndex > 0 && "\n"}
              <ConsoleLineComponent consoleLine={revealedConsoleLine} />
            </Fragment>
          ))}
          {isTypewriterCaretVisible && <span className="caret"></span>}
        </code>
      </pre>
    </div>
  );
}
