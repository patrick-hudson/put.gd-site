import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { PermalinkUrlFactory } from "../../interfaces/factories/PermalinkUrlFactory";
import type { Formatter } from "../../interfaces/formatters/Formatter";
import type { ExternalUrlResolver } from "../../interfaces/resolvers/ExternalUrlResolver";
import type { StringReturner } from "../../interfaces/stringreturners/StringReturner";
import type { PackageRowDescriptorVisitor } from "../../interfaces/visitors/PackageRowDescriptorVisitor";
import type { PackageRowDescriptor } from "../../model/PackageRowDescriptor";
import type { PackageRowViewModel } from "../../model/PackageRowViewModel";
import type { PackageRowVisitationContext } from "../../model/PackageRowVisitationContext";

@EnterpriseBean("com.putgd.enterprise.impl.visitors.ReleaseAwarePackageRowDescriptorVisitorImpl")
export class ReleaseAwarePackageRowDescriptorVisitorImpl implements PackageRowDescriptorVisitor {
  public constructor(
    private readonly permalinkUrlFactory: PermalinkUrlFactory,
    private readonly byteSizeFormatter: Formatter<number>,
    private readonly downloadLinkLabelStringReturner: StringReturner,
    private readonly releasePageLinkLabelStringReturner: StringReturner,
    private readonly externalUrlResolver: ExternalUrlResolver,
  ) {}

  public visitPackageRowDescriptor(
    packageRowDescriptor: PackageRowDescriptor,
    packageRowVisitationContext: PackageRowVisitationContext,
  ): PackageRowViewModel {
    const packageRowViewModelInvariantProperties = {
      releaseAssetMatchKey: packageRowDescriptor.releaseAssetMatchKey,
      operatingSystemDescription: packageRowDescriptor.operatingSystemDescription,
      qtToolkitProvenanceDescription: packageRowDescriptor.qtToolkitProvenanceDescription,
    };
    const placeholderPackageFileCell = {
      packageFileCellKind: "PLACEHOLDER_FILE_NAME" as const,
      placeholderFileName: packageRowDescriptor.placeholderFileName,
    };
    const releasesPageHref = this.externalUrlResolver.resolveExternalUrl("RELEASES_PAGE");

    if (packageRowVisitationContext.releaseManifestAvailability === "RELEASE_MANIFEST_NOT_YET_AVAILABLE") {
      return {
        ...packageRowViewModelInvariantProperties,
        packageFileCell: placeholderPackageFileCell,
        downloadLinkHref: releasesPageHref,
        downloadLinkLabel: this.downloadLinkLabelStringReturner.getReturnString(),
      };
    }

    const { selectedReleaseChannel, selectedRelease } = packageRowVisitationContext;
    const matchingReleaseAsset = selectedRelease?.assets[packageRowDescriptor.releaseAssetMatchKey];
    if (matchingReleaseAsset === undefined) {
      return {
        ...packageRowViewModelInvariantProperties,
        packageFileCell: placeholderPackageFileCell,
        downloadLinkHref: selectedRelease?.html_url ?? releasesPageHref,
        downloadLinkLabel: this.releasePageLinkLabelStringReturner.getReturnString(),
      };
    }
    return {
      ...packageRowViewModelInvariantProperties,
      packageFileCell: {
        packageFileCellKind: "RESOLVED_RELEASE_ASSET",
        assetFileName: matchingReleaseAsset.name,
        formattedAssetSize: this.byteSizeFormatter.format(matchingReleaseAsset.size),
      },
      downloadLinkHref: this.permalinkUrlFactory.createPackagePermalinkUrl(
        selectedReleaseChannel,
        packageRowDescriptor.releaseAssetMatchKey,
      ),
      downloadLinkLabel: this.downloadLinkLabelStringReturner.getReturnString(),
    };
  }
}
