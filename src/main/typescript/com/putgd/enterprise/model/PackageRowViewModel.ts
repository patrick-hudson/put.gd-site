export type PackageFileCellViewModel =
  | { readonly packageFileCellKind: "PLACEHOLDER_FILE_NAME"; readonly placeholderFileName: string }
  | { readonly packageFileCellKind: "RESOLVED_RELEASE_ASSET"; readonly assetFileName: string; readonly formattedAssetSize: string };

export interface PackageRowViewModel {
  readonly releaseAssetMatchKey: string;
  readonly operatingSystemDescription: string;
  readonly packageFileCell: PackageFileCellViewModel;
  readonly qtToolkitProvenanceDescription: string;
  readonly downloadLinkHref: string;
  readonly downloadLinkLabel: string;
}
