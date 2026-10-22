import type { ConsoleLine } from "../../model/ConsoleLine";

export interface TypewriterDelayCalculationStrategy {
  calculateInitialDelayInMilliseconds(): number;
  calculateDelayAfterRevealedLineInMilliseconds(mostRecentlyRevealedConsoleLine: ConsoleLine): number;
}
