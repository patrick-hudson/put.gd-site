import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { ExternalUrlResolver } from "../../interfaces/resolvers/ExternalUrlResolver";
import { UnresolvableExternalUrlKeyException } from "../exceptions/UnresolvableExternalUrlKeyException";

@EnterpriseBean("com.putgd.enterprise.impl.resolvers.EqualsSignDelimitedKeyValuePairExternalUrlResolverImpl")
export class EqualsSignDelimitedKeyValuePairExternalUrlResolverImpl implements ExternalUrlResolver {
  private static readonly KEY_VALUE_DELIMITER = "=";

  private readonly externalUrlsByExternalUrlKey = new Map<string, string>();

  public constructor(equalsSignDelimitedKeyValuePairs: readonly string[]) {
    for (const equalsSignDelimitedKeyValuePair of equalsSignDelimitedKeyValuePairs) {
      const delimiterIndex = equalsSignDelimitedKeyValuePair.indexOf(
        EqualsSignDelimitedKeyValuePairExternalUrlResolverImpl.KEY_VALUE_DELIMITER,
      );
      this.externalUrlsByExternalUrlKey.set(
        equalsSignDelimitedKeyValuePair.slice(0, delimiterIndex).trim(),
        equalsSignDelimitedKeyValuePair.slice(delimiterIndex + 1).trim(),
      );
    }
  }

  public resolveExternalUrl(externalUrlKey: string): string {
    const resolvedExternalUrl = this.externalUrlsByExternalUrlKey.get(externalUrlKey);
    if (resolvedExternalUrl === undefined) {
      throw new UnresolvableExternalUrlKeyException(externalUrlKey);
    }
    return resolvedExternalUrl;
  }
}
