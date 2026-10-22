import { useEnterpriseBean } from "../../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { ReadOnlyRepository } from "../../../interfaces/repositories/ReadOnlyRepository";
import type { NavigationLink } from "../../../model/NavigationLink";
import { NavigationLinkListComponent } from "../primitives/NavigationLinkListComponent";
import { BrandMarkComponent } from "./BrandMarkComponent";

export function SiteFooterComponent() {
  const footerNavigationLinkRepository = useEnterpriseBean<ReadOnlyRepository<NavigationLink>>("footerNavigationLinkRepository");
  return (
    <footer className="foot">
      <BrandMarkComponent brandLogoSizeInPixels={24} />
      <NavigationLinkListComponent navigationAccessibleLabel="Footer" navigationLinks={footerNavigationLinkRepository.findAll()} />
    </footer>
  );
}
