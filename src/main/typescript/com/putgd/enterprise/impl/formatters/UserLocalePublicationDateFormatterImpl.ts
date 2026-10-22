import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { Formatter } from "../../interfaces/formatters/Formatter";

@EnterpriseBean("com.putgd.enterprise.impl.formatters.UserLocalePublicationDateFormatterImpl")
export class UserLocalePublicationDateFormatterImpl implements Formatter<string> {
  private static readonly PUBLICATION_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  public format(iso8601PublicationTimestamp: string): string {
    return new Date(iso8601PublicationTimestamp).toLocaleDateString(
      undefined,
      UserLocalePublicationDateFormatterImpl.PUBLICATION_DATE_FORMAT_OPTIONS,
    );
  }
}
