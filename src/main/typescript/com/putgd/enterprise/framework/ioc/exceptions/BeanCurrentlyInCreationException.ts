import { AbstractEnterpriseFrameworkException } from "./AbstractEnterpriseFrameworkException";

export class BeanCurrentlyInCreationException extends AbstractEnterpriseFrameworkException {
  public constructor(beanCreationPath: readonly string[]) {
    super(`Circular bean reference: ${beanCreationPath.join(" -> ")}`);
  }
}
