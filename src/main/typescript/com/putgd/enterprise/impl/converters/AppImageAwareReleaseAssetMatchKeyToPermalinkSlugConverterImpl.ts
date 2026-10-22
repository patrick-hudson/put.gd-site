import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { Converter } from "../../interfaces/converters/Converter";

@EnterpriseBean("com.putgd.enterprise.impl.converters.AppImageAwareReleaseAssetMatchKeyToPermalinkSlugConverterImpl")
export class AppImageAwareReleaseAssetMatchKeyToPermalinkSlugConverterImpl implements Converter<string, string> {
  public constructor(
    private readonly appImageReleaseAssetMatchKey: string,
    private readonly appImagePermalinkSlug: string,
  ) {}

  public convert(releaseAssetMatchKey: string): string {
    return releaseAssetMatchKey === this.appImageReleaseAssetMatchKey ? this.appImagePermalinkSlug : releaseAssetMatchKey;
  }
}
