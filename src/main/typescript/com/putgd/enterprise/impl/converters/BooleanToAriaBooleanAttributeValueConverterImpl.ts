import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { Converter } from "../../interfaces/converters/Converter";
import { PutGdEnterpriseStringConstants } from "../constants/PutGdEnterpriseStringConstants";

@EnterpriseBean("com.putgd.enterprise.impl.converters.BooleanToAriaBooleanAttributeValueConverterImpl")
export class BooleanToAriaBooleanAttributeValueConverterImpl implements Converter<boolean, "true" | "false"> {
  public convert(booleanValue: boolean): "true" | "false" {
    if (booleanValue === true) {
      return PutGdEnterpriseStringConstants.ARIA_TRUE as "true";
    } else if (booleanValue === false) {
      return PutGdEnterpriseStringConstants.ARIA_FALSE as "false";
    }
    return PutGdEnterpriseStringConstants.ARIA_FALSE as "false";
  }
}
