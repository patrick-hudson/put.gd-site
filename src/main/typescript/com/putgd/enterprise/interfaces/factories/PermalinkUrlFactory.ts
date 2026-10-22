import type { ReleaseChannel } from "../../model/ReleaseChannel";

export interface PermalinkUrlFactory {
  createPackagePermalinkUrl(releaseChannel: ReleaseChannel, releaseAssetMatchKey: string): string;
  createChecksumsPermalinkUrl(releaseChannel: ReleaseChannel): string;
}
