import { ConsoleLineClassification, type ConsoleLine } from "../../../../model/ConsoleLine";

export interface ConsoleLineComponentProperties {
  readonly consoleLine: ConsoleLine;
}

export function ConsoleLineComponent(consoleLineComponentProperties: ConsoleLineComponentProperties) {
  const { consoleLine } = consoleLineComponentProperties;
  switch (consoleLine.consoleLineClassification) {
    case ConsoleLineClassification.SHELL_COMMAND:
      return (
        <>
          <span className="dim">$</span>
          {" " + consoleLine.consoleLineText}
        </>
      );
    case ConsoleLineClassification.EXPLANATORY_COMMENT:
      return <span className="dim">{consoleLine.consoleLineText}</span>;
  }
}
