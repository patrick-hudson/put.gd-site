import type { PackageRowViewModel } from "../../../../model/PackageRowViewModel";

export interface PackageTableRowComponentProperties {
  readonly packageRowViewModel: PackageRowViewModel;
}

export function PackageTableRowComponent(packageTableRowComponentProperties: PackageTableRowComponentProperties) {
  const { packageRowViewModel } = packageTableRowComponentProperties;
  const { packageFileCell } = packageRowViewModel;
  return (
    <tr data-match={packageRowViewModel.releaseAssetMatchKey}>
      <th scope="row">{packageRowViewModel.operatingSystemDescription}</th>
      <td className="file">
        {packageFileCell.packageFileCellKind === "RESOLVED_RELEASE_ASSET" ? (
          <>
            {packageFileCell.assetFileName}
            <span className="size">{packageFileCell.formattedAssetSize}</span>
          </>
        ) : (
          packageFileCell.placeholderFileName
        )}
      </td>
      <td>{packageRowViewModel.qtToolkitProvenanceDescription}</td>
      <td>
        <a href={packageRowViewModel.downloadLinkHref}>{packageRowViewModel.downloadLinkLabel}</a>
      </td>
    </tr>
  );
}
