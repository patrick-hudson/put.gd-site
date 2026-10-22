import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { ReleaseChannelDisplayNameProvider } from "../../interfaces/providers/ReleaseChannelDisplayNameProvider";
import { ReleaseChannel } from "../../model/ReleaseChannel";

@EnterpriseBean("com.putgd.enterprise.impl.providers.EnumMappingReleaseChannelDisplayNameProviderImpl")
export class EnumMappingReleaseChannelDisplayNameProviderImpl implements ReleaseChannelDisplayNameProvider {
  public constructor(
    private readonly stableReleaseChannelDisplayName: string,
    private readonly nightlyReleaseChannelDisplayName: string,
  ) {}

  public provideReleaseChannelDisplayName(releaseChannel: ReleaseChannel): string {
    switch (releaseChannel) {
      case ReleaseChannel.STABLE:
        return this.stableReleaseChannelDisplayName;
      case ReleaseChannel.NIGHTLY:
        return this.nightlyReleaseChannelDisplayName;
    }
  }
}
