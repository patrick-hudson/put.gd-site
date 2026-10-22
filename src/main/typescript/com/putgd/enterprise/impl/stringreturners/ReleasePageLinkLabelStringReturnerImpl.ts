import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { StringReturner } from "../../interfaces/stringreturners/StringReturner";
import { PutGdEnterpriseStringConstants } from "../constants/PutGdEnterpriseStringConstants";

@EnterpriseBean("com.putgd.enterprise.impl.stringreturners.ReleasePageLinkLabelStringReturnerImpl")
export class ReleasePageLinkLabelStringReturnerImpl implements StringReturner {
  public getReturnString(): string {
    return PutGdEnterpriseStringConstants.RELEASE_PAGE_LINK_LABEL;
  }
}
