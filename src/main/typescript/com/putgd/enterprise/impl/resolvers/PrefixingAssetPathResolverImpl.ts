import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { AssetPathResolver } from "../../interfaces/resolvers/AssetPathResolver";

@EnterpriseBean("com.putgd.enterprise.impl.resolvers.PrefixingAssetPathResolverImpl")
export class PrefixingAssetPathResolverImpl implements AssetPathResolver {
  public constructor(private readonly assetPathPrefix: string) {}

  public resolveAssetPath(relativeAssetPath: string): string {
    return this.assetPathPrefix + relativeAssetPath;
  }
}
