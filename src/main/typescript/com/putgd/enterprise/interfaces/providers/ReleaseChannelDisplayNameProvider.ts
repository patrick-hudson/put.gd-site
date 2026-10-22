import type { ReleaseChannel } from "../../model/ReleaseChannel";

export interface ReleaseChannelDisplayNameProvider {
  provideReleaseChannelDisplayName(releaseChannel: ReleaseChannel): string;
}
