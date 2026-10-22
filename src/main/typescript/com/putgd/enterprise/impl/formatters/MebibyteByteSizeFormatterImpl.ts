import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { Formatter } from "../../interfaces/formatters/Formatter";

@EnterpriseBean("com.putgd.enterprise.impl.formatters.MebibyteByteSizeFormatterImpl")
export class MebibyteByteSizeFormatterImpl implements Formatter<number> {
  public constructor(
    private readonly bytesPerDisplayUnit: number,
    private readonly numberOfFractionDigits: number,
    private readonly displayUnitSuffix: string,
  ) {}

  public format(sizeInBytes: number): string {
    return `${(sizeInBytes / this.bytesPerDisplayUnit).toFixed(this.numberOfFractionDigits)}${this.displayUnitSuffix}`;
  }
}
