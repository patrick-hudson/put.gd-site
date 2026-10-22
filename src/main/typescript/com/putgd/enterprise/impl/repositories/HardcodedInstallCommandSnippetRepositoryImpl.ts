import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { ReadOnlyRepository } from "../../interfaces/repositories/ReadOnlyRepository";
import type { InstallCommandSnippet } from "../../model/InstallCommandSnippet";

@EnterpriseBean("com.putgd.enterprise.impl.repositories.HardcodedInstallCommandSnippetRepositoryImpl")
export class HardcodedInstallCommandSnippetRepositoryImpl implements ReadOnlyRepository<InstallCommandSnippet> {
  public findAll(): readonly InstallCommandSnippet[] {
    return [
      { installCommandSnippetHeading: "Debian, Ubuntu and Mint", installCommandText: "sudo apt install ./putgd-*.deb" },
      { installCommandSnippetHeading: "Fedora", installCommandText: "sudo dnf install ./putgd-*.rpm" },
      { installCommandSnippetHeading: "AppImage", installCommandText: "chmod +x putgd-*.AppImage && ./putgd-*.AppImage" },
    ];
  }
}
