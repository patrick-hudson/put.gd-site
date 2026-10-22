import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { Converter } from "../../interfaces/converters/Converter";
import type { StringReturner } from "../../interfaces/stringreturners/StringReturner";
import { CopyButtonState } from "../../model/CopyButtonState";

@EnterpriseBean("com.putgd.enterprise.impl.converters.CopyButtonStateToClassNameConverterImpl")
export class CopyButtonStateToClassNameConverterImpl implements Converter<CopyButtonState, string> {
  public constructor(
    private readonly baseClassNameStringReturner: StringReturner,
    private readonly confirmationClassNameStringReturner: StringReturner,
  ) {}

  public convert(copyButtonState: CopyButtonState): string {
    return copyButtonState === CopyButtonState.TEXT_COPIED_TO_CLIPBOARD
      ? this.confirmationClassNameStringReturner.getReturnString()
      : this.baseClassNameStringReturner.getReturnString();
  }
}
