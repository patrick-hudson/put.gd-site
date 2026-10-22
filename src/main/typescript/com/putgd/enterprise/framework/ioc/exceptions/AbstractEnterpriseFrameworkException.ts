export abstract class AbstractEnterpriseFrameworkException extends Error {
  protected constructor(exceptionMessage: string) {
    super(exceptionMessage);
    this.name = new.target.name;
  }
}
