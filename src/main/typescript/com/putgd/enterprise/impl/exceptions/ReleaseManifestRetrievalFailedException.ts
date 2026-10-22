import { AbstractEnterpriseFrameworkException } from "../../framework/ioc/exceptions/AbstractEnterpriseFrameworkException";

export class ReleaseManifestRetrievalFailedException extends AbstractEnterpriseFrameworkException {
  public constructor(httpResponseStatusCode: number) {
    super(`The release manifest could not be retrieved (HTTP ${httpResponseStatusCode})`);
  }
}
