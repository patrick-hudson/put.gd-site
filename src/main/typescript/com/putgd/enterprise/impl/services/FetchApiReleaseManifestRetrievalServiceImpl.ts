import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { AssetPathResolver } from "../../interfaces/resolvers/AssetPathResolver";
import type { ReleaseManifestRetrievalService } from "../../interfaces/services/ReleaseManifestRetrievalService";
import type { ReleaseManifest } from "../../model/ReleaseManifest";
import { ReleaseManifestRetrievalFailedException } from "../exceptions/ReleaseManifestRetrievalFailedException";

@EnterpriseBean("com.putgd.enterprise.impl.services.FetchApiReleaseManifestRetrievalServiceImpl")
export class FetchApiReleaseManifestRetrievalServiceImpl implements ReleaseManifestRetrievalService {
  public constructor(
    private readonly assetPathResolver: AssetPathResolver,
    private readonly releaseManifestRelativeAssetPath: string,
  ) {}

  public async retrieveReleaseManifest(): Promise<ReleaseManifest> {
    const releaseManifestHttpResponse = await fetch(
      this.assetPathResolver.resolveAssetPath(this.releaseManifestRelativeAssetPath),
      { cache: "no-cache" },
    );
    if (!releaseManifestHttpResponse.ok) {
      throw new ReleaseManifestRetrievalFailedException(releaseManifestHttpResponse.status);
    }
    return (await releaseManifestHttpResponse.json()) as ReleaseManifest;
  }
}
