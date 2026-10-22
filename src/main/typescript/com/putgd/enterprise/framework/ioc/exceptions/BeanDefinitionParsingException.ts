import { AbstractEnterpriseFrameworkException } from "./AbstractEnterpriseFrameworkException";

export class BeanDefinitionParsingException extends AbstractEnterpriseFrameworkException {
  public constructor(parsingProblemDescription: string) {
    super(`Invalid bean definition document: ${parsingProblemDescription}`);
  }
}
