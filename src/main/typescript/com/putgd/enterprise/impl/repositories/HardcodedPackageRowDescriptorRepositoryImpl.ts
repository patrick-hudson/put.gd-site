import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { ReadOnlyRepository } from "../../interfaces/repositories/ReadOnlyRepository";
import { PackageRowDescriptor } from "../../model/PackageRowDescriptor";

@EnterpriseBean("com.putgd.enterprise.impl.repositories.HardcodedPackageRowDescriptorRepositoryImpl")
export class HardcodedPackageRowDescriptorRepositoryImpl implements ReadOnlyRepository<PackageRowDescriptor> {
  public findAll(): readonly PackageRowDescriptor[] {
    return [
      new PackageRowDescriptor("ubuntu24.04", "Ubuntu 24.04, Linux Mint 22", "putgd-VERSION-ubuntu24.04-x86_64.deb", "distro Qt 6.4"),
      new PackageRowDescriptor("ubuntu26.04", "Ubuntu 26.04, Kubuntu 26.04", "putgd-VERSION-ubuntu26.04-x86_64.deb", "distro Qt and LayerShellQt"),
      new PackageRowDescriptor("debian13", "Debian 13", "putgd-VERSION-debian13-x86_64.deb", "distro Qt 6.8 and LayerShellQt"),
      new PackageRowDescriptor("fedora44", "Fedora 44", "putgd-VERSION-fedora44-x86_64.rpm", "distro Qt and LayerShellQt"),
      new PackageRowDescriptor(".AppImage", "Anything else with glibc 2.39 or newer", "putgd-VERSION-x86_64.AppImage", "bundled Qt 6.8.3"),
    ];
  }
}
