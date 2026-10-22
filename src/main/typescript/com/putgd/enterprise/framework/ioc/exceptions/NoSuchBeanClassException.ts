import { AbstractEnterpriseFrameworkException } from "./AbstractEnterpriseFrameworkException";

export class NoSuchBeanClassException extends AbstractEnterpriseFrameworkException {
  public constructor(fullyQualifiedClassName: string) {
    super(`No bean class is registered as '${fullyQualifiedClassName}'. Is it imported by ComponentScan.ts?`);
  }
}
