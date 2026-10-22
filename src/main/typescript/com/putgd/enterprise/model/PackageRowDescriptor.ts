import type { PackageRowDescriptorVisitor } from "../interfaces/visitors/PackageRowDescriptorVisitor";
import type { PackageRowViewModel } from "./PackageRowViewModel";
import type { PackageRowVisitationContext } from "./PackageRowVisitationContext";

export class PackageRowDescriptor {
  public constructor(
    public readonly releaseAssetMatchKey: string,
    public readonly operatingSystemDescription: string,
    public readonly placeholderFileName: string,
    public readonly qtToolkitProvenanceDescription: string,
  ) {}

  public accept(
    packageRowDescriptorVisitor: PackageRowDescriptorVisitor,
    packageRowVisitationContext: PackageRowVisitationContext,
  ): PackageRowViewModel {
    return packageRowDescriptorVisitor.visitPackageRowDescriptor(this, packageRowVisitationContext);
  }
}
