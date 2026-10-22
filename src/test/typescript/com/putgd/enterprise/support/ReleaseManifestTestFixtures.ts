import type { Release, ReleaseAsset, ReleaseManifest } from "@putgd-enterprise/model/ReleaseManifest";
import { fakeFetch } from "./FakeBrowserEnvironment";

export const ONE_MEBIBYTE_IN_BYTES = 1048576;

function createReleaseAsset(assetFileName: string): ReleaseAsset {
  return { name: assetFileName, url: `https://example.invalid/${assetFileName}`, size: ONE_MEBIBYTE_IN_BYTES };
}

export const STABLE_RELEASE_WITH_EVERY_PACKAGE: Release = {
  tag: "v1.0.0",
  html_url: "https://github.com/patrick-hudson/put.gd-desktop/releases/tag/v1.0.0",
  published_at: "2026-10-01T12:00:00Z",
  checksums: "https://example.invalid/SHA256SUMS",
  assets: {
    "ubuntu24.04": createReleaseAsset("putgd-1.0.0-ubuntu24.04-x86_64.deb"),
    "ubuntu26.04": createReleaseAsset("putgd-1.0.0-ubuntu26.04-x86_64.deb"),
    debian13: createReleaseAsset("putgd-1.0.0-debian13-x86_64.deb"),
    fedora44: createReleaseAsset("putgd-1.0.0-fedora44-x86_64.rpm"),
    ".AppImage": createReleaseAsset("putgd-1.0.0-x86_64.AppImage"),
  },
};

export const NIGHTLY_RELEASE_WITH_ONLY_FEDORA_AND_NO_CHECKSUMS: Release = {
  tag: "v26.1022.968-nightly",
  html_url: "https://github.com/patrick-hudson/put.gd-desktop/releases/tag/v26.1022.968-nightly",
  published_at: "2026-10-22T03:00:00Z",
  checksums: null,
  assets: {
    fedora44: createReleaseAsset("putgd-26.1022.968-nightly-fedora44-x86_64.rpm"),
  },
};

export const RELEASE_MANIFEST_WITH_BOTH_CHANNELS: ReleaseManifest = {
  stable: STABLE_RELEASE_WITH_EVERY_PACKAGE,
  nightly: NIGHTLY_RELEASE_WITH_ONLY_FEDORA_AND_NO_CHECKSUMS,
};

export const RELEASE_MANIFEST_WITH_ONLY_NIGHTLY: ReleaseManifest = {
  stable: null,
  nightly: NIGHTLY_RELEASE_WITH_ONLY_FEDORA_AND_NO_CHECKSUMS,
};

export const RELEASE_MANIFEST_WITH_NO_RELEASES: ReleaseManifest = { stable: null, nightly: null };

export function serveReleaseManifest(releaseManifestToServe: ReleaseManifest): void {
  fakeFetch.mockResolvedValue(new Response(JSON.stringify(releaseManifestToServe), { status: 200 }));
}

export function formatPublicationDateTheWayTheUserLocaleWould(iso8601PublicationTimestamp: string): string {
  return new Date(iso8601PublicationTimestamp).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
