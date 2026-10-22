import { AbstractEnterpriseFrameworkException } from "./AbstractEnterpriseFrameworkException";

export class DuplicateBeanClassRegistrationException extends AbstractEnterpriseFrameworkException {
  public constructor(fullyQualifiedClassName: string) {
    super(`A different bean class is already registered as '${fullyQualifiedClassName}'`);
  }
}
