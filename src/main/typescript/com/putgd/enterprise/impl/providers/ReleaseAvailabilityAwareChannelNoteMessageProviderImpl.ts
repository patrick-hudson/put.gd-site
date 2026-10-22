import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { ChannelNoteMessageProvider } from "../../interfaces/providers/ChannelNoteMessageProvider";
import { ReleaseChannel } from "../../model/ReleaseChannel";
import type { Release } from "../../model/ReleaseManifest";

@EnterpriseBean("com.putgd.enterprise.impl.providers.ReleaseAvailabilityAwareChannelNoteMessageProviderImpl")
export class ReleaseAvailabilityAwareChannelNoteMessageProviderImpl implements ChannelNoteMessageProvider {
  public constructor(
    private readonly stableChannelHasNoReleaseMessage: string,
    private readonly nightlyChannelHasNoReleaseMessage: string,
    private readonly nightlyChannelCertificationDisclaimerMessage: string,
  ) {}

  public provideChannelNoteMessage(selectedReleaseChannel: ReleaseChannel, selectedRelease: Release | null): string | null {
    if (selectedRelease === null) {
      return selectedReleaseChannel === ReleaseChannel.STABLE
        ? this.stableChannelHasNoReleaseMessage
        : this.nightlyChannelHasNoReleaseMessage;
    }
    return selectedReleaseChannel === ReleaseChannel.NIGHTLY ? this.nightlyChannelCertificationDisclaimerMessage : null;
  }
}
