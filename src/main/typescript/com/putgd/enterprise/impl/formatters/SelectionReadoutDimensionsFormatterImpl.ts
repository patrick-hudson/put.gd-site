import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { Formatter } from "../../interfaces/formatters/Formatter";
import type { SelectionReadoutDimensions } from "../../model/SelectionReadoutDimensions";

@EnterpriseBean("com.putgd.enterprise.impl.formatters.SelectionReadoutDimensionsFormatterImpl")
export class SelectionReadoutDimensionsFormatterImpl implements Formatter<SelectionReadoutDimensions> {
  public constructor(private readonly dimensionSeparator: string) {}

  public format(selectionReadoutDimensions: SelectionReadoutDimensions): string {
    return `${selectionReadoutDimensions.selectionWidthInPixels}${this.dimensionSeparator}${selectionReadoutDimensions.selectionHeightInPixels}`;
  }
}
