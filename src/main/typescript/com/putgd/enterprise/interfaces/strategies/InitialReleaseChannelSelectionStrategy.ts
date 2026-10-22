import type { ReleaseChannel } from "../../model/ReleaseChannel";
import type { ReleaseManifest } from "../../model/ReleaseManifest";

export interface InitialReleaseChannelSelectionStrategy {
  selectInitialReleaseChannel(releaseManifest: ReleaseManifest): ReleaseChannel;
}
