import type { PackageRowDescriptor } from "../../model/PackageRowDescriptor";
import type { PackageRowViewModel } from "../../model/PackageRowViewModel";
import type { PackageRowVisitationContext } from "../../model/PackageRowVisitationContext";

export interface PackageRowDescriptorVisitor {
  visitPackageRowDescriptor(
    packageRowDescriptor: PackageRowDescriptor,
    packageRowVisitationContext: PackageRowVisitationContext,
  ): PackageRowViewModel;
}
