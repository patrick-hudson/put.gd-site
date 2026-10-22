import { AbstractEnterpriseFrameworkException } from "./AbstractEnterpriseFrameworkException";

export class NoSuchBeanDefinitionException extends AbstractEnterpriseFrameworkException {
  public constructor(beanIdentifier: string) {
    super(`No bean named '${beanIdentifier}' is defined in applicationContext.xml`);
  }
}
