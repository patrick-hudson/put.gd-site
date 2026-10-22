import { describe, expect, it } from "vitest";
import type { PackageRowDescriptorVisitor } from "@putgd-enterprise/interfaces/visitors/PackageRowDescriptorVisitor";
import { PackageRowDescriptor } from "@putgd-enterprise/model/PackageRowDescriptor";
import { ReleaseChannel } from "@putgd-enterprise/model/ReleaseChannel";
import { createProductionEnterpriseApplicationContext } from "../../support/EnterpriseTestApplicationContextFactory";
import {
  NIGHTLY_RELEASE_WITH_ONLY_FEDORA_AND_NO_CHECKSUMS,
  STABLE_RELEASE_WITH_EVERY_PACKAGE,
} from "../../support/ReleaseManifestTestFixtures";

const RELEASES_PAGE_URL = "https://github.com/patrick-hudson/put.gd-desktop/releases";
const fedoraPackageRowDescriptor = new PackageRowDescriptor("fedora44", "Fedora 44", "putgd-VERSION-fedora44-x86_64.rpm", "distro Qt");
const appImagePackageRowDescriptor = new PackageRowDescriptor(".AppImage", "Anything else", "putgd-VERSION-x86_64.AppImage", "bundled Qt");
const debianPackageRowDescriptor = new PackageRowDescriptor("debian13", "Debian 13", "putgd-VERSION-debian13-x86_64.deb", "distro Qt 6.8");

describe("ReleaseAwarePackageRowDescriptorVisitorImpl", () => {
  const packageRowDescriptorVisitor = createProductionEnterpriseApplicationContext().getBean<PackageRowDescriptorVisitor>(
    "packageRowDescriptorVisitor",
  );

  it("is reached through PackageRowDescriptor.accept", () => {
    const releaseManifestNotYetAvailableContext = { releaseManifestAvailability: "RELEASE_MANIFEST_NOT_YET_AVAILABLE" } as const;
    expect(fedoraPackageRowDescriptor.accept(packageRowDescriptorVisitor, releaseManifestNotYetAvailableContext)).toEqual(
      packageRowDescriptorVisitor.visitPackageRowDescriptor(fedoraPackageRowDescriptor, releaseManifestNotYetAvailableContext),
    );
  });

  it("keeps the static placeholder and a Download link to the releases page before the manifest arrives", () => {
    expect(
      fedoraPackageRowDescriptor.accept(packageRowDescriptorVisitor, { releaseManifestAvailability: "RELEASE_MANIFEST_NOT_YET_AVAILABLE" }),
    ).toEqual({
      releaseAssetMatchKey: "fedora44",
      operatingSystemDescription: "Fedora 44",
      qtToolkitProvenanceDescription: "distro Qt",
      packageFileCell: { packageFileCellKind: "PLACEHOLDER_FILE_NAME", placeholderFileName: "putgd-VERSION-fedora44-x86_64.rpm" },
      downloadLinkHref: RELEASES_PAGE_URL,
      downloadLinkLabel: "Download",
    });
  });

  it("links a matching asset to its channel permalink and shows its name and size", () => {
    expect(
      fedoraPackageRowDescriptor.accept(packageRowDescriptorVisitor, {
        releaseManifestAvailability: "RELEASE_MANIFEST_AVAILABLE",
        selectedReleaseChannel: ReleaseChannel.STABLE,
        selectedRelease: STABLE_RELEASE_WITH_EVERY_PACKAGE,
      }),
    ).toMatchObject({
      packageFileCell: {
        packageFileCellKind: "RESOLVED_RELEASE_ASSET",
        assetFileName: "putgd-1.0.0-fedora44-x86_64.rpm",
        formattedAssetSize: "1.0 MB",
      },
      downloadLinkHref: "https://app.put.gd/dl/stable/fedora44",
      downloadLinkLabel: "Download",
    });
  });

  it("uses the appimage slug for the AppImage permalink", () => {
    expect(
      appImagePackageRowDescriptor.accept(packageRowDescriptorVisitor, {
        releaseManifestAvailability: "RELEASE_MANIFEST_AVAILABLE",
        selectedReleaseChannel: ReleaseChannel.STABLE,
        selectedRelease: STABLE_RELEASE_WITH_EVERY_PACKAGE,
      }).downloadLinkHref,
    ).toBe("https://app.put.gd/dl/stable/appimage");
  });

  it("falls back to that release's page when the release lacks the package", () => {
    expect(
      debianPackageRowDescriptor.accept(packageRowDescriptorVisitor, {
        releaseManifestAvailability: "RELEASE_MANIFEST_AVAILABLE",
        selectedReleaseChannel: ReleaseChannel.NIGHTLY,
        selectedRelease: NIGHTLY_RELEASE_WITH_ONLY_FEDORA_AND_NO_CHECKSUMS,
      }),
    ).toMatchObject({
      packageFileCell: { packageFileCellKind: "PLACEHOLDER_FILE_NAME" },
      downloadLinkHref: NIGHTLY_RELEASE_WITH_ONLY_FEDORA_AND_NO_CHECKSUMS.html_url,
      downloadLinkLabel: "Release page",
    });
  });

  it("falls back to the releases page when the channel has no release", () => {
    expect(
      debianPackageRowDescriptor.accept(packageRowDescriptorVisitor, {
        releaseManifestAvailability: "RELEASE_MANIFEST_AVAILABLE",
        selectedReleaseChannel: ReleaseChannel.STABLE,
        selectedRelease: null,
      }),
    ).toMatchObject({ downloadLinkHref: RELEASES_PAGE_URL, downloadLinkLabel: "Release page" });
  });
});
