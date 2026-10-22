import { AbstractEnterpriseFrameworkException } from "./AbstractEnterpriseFrameworkException";

export class ApplicationContextNotProvidedException extends AbstractEnterpriseFrameworkException {
  public constructor(requestedBeanIdentifier: string) {
    super(`Bean '${requestedBeanIdentifier}' was requested outside an EnterpriseApplicationContextProviderComponent`);
  }
}
