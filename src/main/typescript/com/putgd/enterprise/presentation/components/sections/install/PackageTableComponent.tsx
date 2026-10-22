import type { PackageRowViewModel } from "../../../../model/PackageRowViewModel";
import { PackageTableRowComponent } from "./PackageTableRowComponent";

export interface PackageTableComponentProperties {
  readonly packageRowViewModels: readonly PackageRowViewModel[];
}

export function PackageTableComponent(packageTableComponentProperties: PackageTableComponentProperties) {
  return (
    <table className="packages" id="packages">
      <thead>
        <tr>
          <th scope="col">You run</th>
          <th scope="col">File</th>
          <th scope="col">Qt</th>
          <th scope="col">
            <span className="visually-hidden">Download</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {packageTableComponentProperties.packageRowViewModels.map((packageRowViewModel) => (
          <PackageTableRowComponent key={packageRowViewModel.releaseAssetMatchKey} packageRowViewModel={packageRowViewModel} />
        ))}
      </tbody>
    </table>
  );
}
