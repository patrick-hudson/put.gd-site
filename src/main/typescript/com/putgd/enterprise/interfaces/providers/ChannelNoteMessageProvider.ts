import type { ReleaseChannel } from "../../model/ReleaseChannel";
import type { Release } from "../../model/ReleaseManifest";

export interface ChannelNoteMessageProvider {
  provideChannelNoteMessage(selectedReleaseChannel: ReleaseChannel, selectedRelease: Release | null): string | null;
}
