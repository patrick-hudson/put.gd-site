import { AbstractEnterpriseFrameworkException } from "../../framework/ioc/exceptions/AbstractEnterpriseFrameworkException";

export class UnresolvableExternalUrlKeyException extends AbstractEnterpriseFrameworkException {
  public constructor(externalUrlKey: string) {
    super(`No external URL is configured for the key '${externalUrlKey}'`);
  }
}
