import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { ReadOnlyRepository } from "../../interfaces/repositories/ReadOnlyRepository";
import type { ExternalUrlResolver } from "../../interfaces/resolvers/ExternalUrlResolver";
import type { NavigationLink } from "../../model/NavigationLink";

@EnterpriseBean("com.putgd.enterprise.impl.repositories.HardcodedFooterNavigationLinkRepositoryImpl")
export class HardcodedFooterNavigationLinkRepositoryImpl implements ReadOnlyRepository<NavigationLink> {
  public constructor(private readonly externalUrlResolver: ExternalUrlResolver) {}

  public findAll(): readonly NavigationLink[] {
    return [
      { navigationLinkLabel: "Source", navigationLinkHref: this.externalUrlResolver.resolveExternalUrl("SOURCE_REPOSITORY") },
      { navigationLinkLabel: "Releases", navigationLinkHref: this.externalUrlResolver.resolveExternalUrl("RELEASES_PAGE") },
      { navigationLinkLabel: "User guide", navigationLinkHref: this.externalUrlResolver.resolveExternalUrl("USER_GUIDE") },
      { navigationLinkLabel: "Issues", navigationLinkHref: this.externalUrlResolver.resolveExternalUrl("ISSUES") },
    ];
  }
}
