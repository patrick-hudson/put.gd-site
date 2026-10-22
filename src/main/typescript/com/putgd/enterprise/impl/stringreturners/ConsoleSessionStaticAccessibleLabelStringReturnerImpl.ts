import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { StringReturner } from "../../interfaces/stringreturners/StringReturner";
import { PutGdEnterpriseStringConstants } from "../constants/PutGdEnterpriseStringConstants";

@EnterpriseBean("com.putgd.enterprise.impl.stringreturners.ConsoleSessionStaticAccessibleLabelStringReturnerImpl")
export class ConsoleSessionStaticAccessibleLabelStringReturnerImpl implements StringReturner {
  public getReturnString(): string {
    return PutGdEnterpriseStringConstants.CONSOLE_SESSION_STATIC_ACCESSIBLE_LABEL;
  }
}
