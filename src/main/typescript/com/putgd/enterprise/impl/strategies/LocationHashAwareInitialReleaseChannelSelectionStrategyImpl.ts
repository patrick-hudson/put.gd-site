import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { BrowserLocationService } from "../../interfaces/services/BrowserLocationService";
import type { InitialReleaseChannelSelectionStrategy } from "../../interfaces/strategies/InitialReleaseChannelSelectionStrategy";
import { ReleaseChannel } from "../../model/ReleaseChannel";
import type { ReleaseManifest } from "../../model/ReleaseManifest";

@EnterpriseBean("com.putgd.enterprise.impl.strategies.LocationHashAwareInitialReleaseChannelSelectionStrategyImpl")
export class LocationHashAwareInitialReleaseChannelSelectionStrategyImpl implements InitialReleaseChannelSelectionStrategy {
  public constructor(
    private readonly browserLocationService: BrowserLocationService,
    private readonly nightlyChannelLocationHash: string,
  ) {}

  public selectInitialReleaseChannel(releaseManifest: ReleaseManifest): ReleaseChannel {
    const isNightlyChannelRequestedThroughLocationHash =
      this.browserLocationService.getCurrentLocationHash() === this.nightlyChannelLocationHash;
    if (isNightlyChannelRequestedThroughLocationHash && releaseManifest[ReleaseChannel.NIGHTLY] !== null) {
      return ReleaseChannel.NIGHTLY;
    }
    return releaseManifest[ReleaseChannel.STABLE] !== null ? ReleaseChannel.STABLE : ReleaseChannel.NIGHTLY;
  }
}
