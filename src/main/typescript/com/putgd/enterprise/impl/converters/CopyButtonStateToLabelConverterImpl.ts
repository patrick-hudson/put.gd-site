import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { Converter } from "../../interfaces/converters/Converter";
import type { StringReturner } from "../../interfaces/stringreturners/StringReturner";
import { CopyButtonState } from "../../model/CopyButtonState";

@EnterpriseBean("com.putgd.enterprise.impl.converters.CopyButtonStateToLabelConverterImpl")
export class CopyButtonStateToLabelConverterImpl implements Converter<CopyButtonState, string> {
  public constructor(
    private readonly idleLabelStringReturner: StringReturner,
    private readonly confirmationLabelStringReturner: StringReturner,
    private readonly clipboardUnavailableLabelStringReturner: StringReturner,
  ) {}

  public convert(copyButtonState: CopyButtonState): string {
    switch (copyButtonState) {
      case CopyButtonState.AWAITING_USER_INTERACTION:
        return this.idleLabelStringReturner.getReturnString();
      case CopyButtonState.TEXT_COPIED_TO_CLIPBOARD:
        return this.confirmationLabelStringReturner.getReturnString();
      case CopyButtonState.CLIPBOARD_UNAVAILABLE:
        return this.clipboardUnavailableLabelStringReturner.getReturnString();
    }
  }
}
