import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import { ConsoleLineClassification, type ConsoleLine } from "../../model/ConsoleLine";
import type { TypewriterDelayCalculationStrategy } from "../../interfaces/strategies/TypewriterDelayCalculationStrategy";

@EnterpriseBean("com.putgd.enterprise.impl.strategies.ExplanatoryCommentAwareTypewriterDelayCalculationStrategyImpl")
export class ExplanatoryCommentAwareTypewriterDelayCalculationStrategyImpl implements TypewriterDelayCalculationStrategy {
  public constructor(
    private readonly initialDelayInMilliseconds: number,
    private readonly delayAfterExplanatoryCommentInMilliseconds: number,
    private readonly delayAfterShellCommandInMilliseconds: number,
  ) {}

  public calculateInitialDelayInMilliseconds(): number {
    return this.initialDelayInMilliseconds;
  }

  public calculateDelayAfterRevealedLineInMilliseconds(mostRecentlyRevealedConsoleLine: ConsoleLine): number {
    switch (mostRecentlyRevealedConsoleLine.consoleLineClassification) {
      case ConsoleLineClassification.EXPLANATORY_COMMENT:
        return this.delayAfterExplanatoryCommentInMilliseconds;
      case ConsoleLineClassification.SHELL_COMMAND:
        return this.delayAfterShellCommandInMilliseconds;
    }
  }
}
