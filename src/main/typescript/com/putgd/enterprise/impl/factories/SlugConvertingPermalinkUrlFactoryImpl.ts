import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { Converter } from "../../interfaces/converters/Converter";
import type { PermalinkUrlFactory } from "../../interfaces/factories/PermalinkUrlFactory";
import type { ReleaseChannel } from "../../model/ReleaseChannel";

@EnterpriseBean("com.putgd.enterprise.impl.factories.SlugConvertingPermalinkUrlFactoryImpl")
export class SlugConvertingPermalinkUrlFactoryImpl implements PermalinkUrlFactory {
  public constructor(
    private readonly permalinkBaseUrl: string,
    private readonly releaseAssetMatchKeyToPermalinkSlugConverter: Converter<string, string>,
    private readonly checksumsPermalinkSlug: string,
  ) {}

  public createPackagePermalinkUrl(releaseChannel: ReleaseChannel, releaseAssetMatchKey: string): string {
    return `${this.permalinkBaseUrl}/${releaseChannel}/${this.releaseAssetMatchKeyToPermalinkSlugConverter.convert(releaseAssetMatchKey)}`;
  }

  public createChecksumsPermalinkUrl(releaseChannel: ReleaseChannel): string {
    return `${this.permalinkBaseUrl}/${releaseChannel}/${this.checksumsPermalinkSlug}`;
  }
}
