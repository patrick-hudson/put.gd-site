import type { PackageRowVisitationContext } from "../../model/PackageRowVisitationContext";
import type { ReleaseLineViewModel } from "../../model/ReleaseLineViewModel";

export interface ReleaseLineViewModelProvider {
  provideReleaseLineViewModel(packageRowVisitationContext: PackageRowVisitationContext): ReleaseLineViewModel;
}
