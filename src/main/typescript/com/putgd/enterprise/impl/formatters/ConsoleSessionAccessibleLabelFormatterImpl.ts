import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { Formatter } from "../../interfaces/formatters/Formatter";
import { ConsoleLineClassification, type ConsoleLine } from "../../model/ConsoleLine";

@EnterpriseBean("com.putgd.enterprise.impl.formatters.ConsoleSessionAccessibleLabelFormatterImpl")
export class ConsoleSessionAccessibleLabelFormatterImpl implements Formatter<readonly ConsoleLine[]> {
  public constructor(
    private readonly accessibleLabelPrefix: string,
    private readonly shellPromptCharacter: string,
  ) {}

  public format(consoleLines: readonly ConsoleLine[]): string {
    const plainTextConsoleSessionTranscript = consoleLines
      .map((consoleLine) =>
        consoleLine.consoleLineClassification === ConsoleLineClassification.SHELL_COMMAND
          ? `${this.shellPromptCharacter} ${consoleLine.consoleLineText}`
          : consoleLine.consoleLineText,
      )
      .join(" ");
    return this.accessibleLabelPrefix + plainTextConsoleSessionTranscript.split(/\s+/).filter(Boolean).join(" ");
  }
}
