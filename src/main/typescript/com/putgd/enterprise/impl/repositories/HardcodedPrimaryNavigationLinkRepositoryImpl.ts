import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { ReadOnlyRepository } from "../../interfaces/repositories/ReadOnlyRepository";
import type { ExternalUrlResolver } from "../../interfaces/resolvers/ExternalUrlResolver";
import type { NavigationLink } from "../../model/NavigationLink";

@EnterpriseBean("com.putgd.enterprise.impl.repositories.HardcodedPrimaryNavigationLinkRepositoryImpl")
export class HardcodedPrimaryNavigationLinkRepositoryImpl implements ReadOnlyRepository<NavigationLink> {
  public constructor(private readonly externalUrlResolver: ExternalUrlResolver) {}

  public findAll(): readonly NavigationLink[] {
    return [
      { navigationLinkLabel: "How it works", navigationLinkHref: "#pipeline" },
      { navigationLinkLabel: "Scripting", navigationLinkHref: "#script" },
      { navigationLinkLabel: "Source", navigationLinkHref: this.externalUrlResolver.resolveExternalUrl("SOURCE_REPOSITORY") },
      { navigationLinkLabel: "Install", navigationLinkHref: "#install" },
    ];
  }
}
