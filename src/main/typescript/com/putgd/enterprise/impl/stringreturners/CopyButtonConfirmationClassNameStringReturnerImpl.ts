import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { StringReturner } from "../../interfaces/stringreturners/StringReturner";
import { PutGdEnterpriseStringConstants } from "../constants/PutGdEnterpriseStringConstants";

@EnterpriseBean("com.putgd.enterprise.impl.stringreturners.CopyButtonConfirmationClassNameStringReturnerImpl")
export class CopyButtonConfirmationClassNameStringReturnerImpl implements StringReturner {
  public getReturnString(): string {
    return PutGdEnterpriseStringConstants.COPY_BUTTON_CONFIRMATION_CLASS_NAME;
  }
}
