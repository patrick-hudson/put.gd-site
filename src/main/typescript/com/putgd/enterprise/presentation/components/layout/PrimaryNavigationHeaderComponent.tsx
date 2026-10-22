import { useEnterpriseBean } from "../../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { ReadOnlyRepository } from "../../../interfaces/repositories/ReadOnlyRepository";
import type { NavigationLink } from "../../../model/NavigationLink";
import { NavigationLinkListComponent } from "../primitives/NavigationLinkListComponent";
import { BrandMarkComponent } from "./BrandMarkComponent";

export function PrimaryNavigationHeaderComponent() {
  const primaryNavigationLinkRepository = useEnterpriseBean<ReadOnlyRepository<NavigationLink>>("primaryNavigationLinkRepository");
  return (
    <header className="top">
      <BrandMarkComponent brandLogoSizeInPixels={30} brandMarkAccessibleLabel="put.gd home" />
      <NavigationLinkListComponent
        navigationAccessibleLabel="Primary"
        navigationLinks={primaryNavigationLinkRepository.findAll()}
      />
    </header>
  );
}
