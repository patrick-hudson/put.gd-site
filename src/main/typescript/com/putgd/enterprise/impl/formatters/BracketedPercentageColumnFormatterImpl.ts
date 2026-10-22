import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { Formatter } from "../../interfaces/formatters/Formatter";

@EnterpriseBean("com.putgd.enterprise.impl.formatters.BracketedPercentageColumnFormatterImpl")
export class BracketedPercentageColumnFormatterImpl implements Formatter<number> {
  public constructor(private readonly percentageColumnWidthInCharacters: number) {}

  public format(completionPercentage: number): string {
    return `[${String(completionPercentage).padStart(this.percentageColumnWidthInCharacters)}%]`;
  }
}
