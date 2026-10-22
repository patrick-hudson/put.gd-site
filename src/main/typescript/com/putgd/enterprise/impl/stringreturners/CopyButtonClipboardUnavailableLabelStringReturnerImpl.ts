import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { StringReturner } from "../../interfaces/stringreturners/StringReturner";
import { PutGdEnterpriseStringConstants } from "../constants/PutGdEnterpriseStringConstants";

@EnterpriseBean("com.putgd.enterprise.impl.stringreturners.CopyButtonClipboardUnavailableLabelStringReturnerImpl")
export class CopyButtonClipboardUnavailableLabelStringReturnerImpl implements StringReturner {
  public getReturnString(): string {
    return PutGdEnterpriseStringConstants.COPY_BUTTON_CLIPBOARD_UNAVAILABLE_LABEL;
  }
}
