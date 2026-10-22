import type { Release } from "./ReleaseManifest";
import type { ReleaseChannel } from "./ReleaseChannel";

export type PackageRowVisitationContext =
  | { readonly releaseManifestAvailability: "RELEASE_MANIFEST_NOT_YET_AVAILABLE" }
  | {
      readonly releaseManifestAvailability: "RELEASE_MANIFEST_AVAILABLE";
      readonly selectedReleaseChannel: ReleaseChannel;
      readonly selectedRelease: Release | null;
    };
