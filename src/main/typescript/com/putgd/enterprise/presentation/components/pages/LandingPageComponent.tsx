import { useEnterpriseBean } from "../../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { SectionComponentFactory } from "../../../interfaces/factories/SectionComponentFactory";
import type { SectionOrderingStrategy } from "../../../interfaces/strategies/SectionOrderingStrategy";
import { PrimaryNavigationHeaderComponent } from "../layout/PrimaryNavigationHeaderComponent";
import { SiteFooterComponent } from "../layout/SiteFooterComponent";
import { SkipToMainContentLinkComponent } from "../layout/SkipToMainContentLinkComponent";

export function LandingPageComponent() {
  const sectionOrderingStrategy = useEnterpriseBean<SectionOrderingStrategy>("sectionOrderingStrategy");
  const sectionComponentFactory = useEnterpriseBean<SectionComponentFactory>("sectionComponentFactory");
  return (
    <>
      <SkipToMainContentLinkComponent />
      <PrimaryNavigationHeaderComponent />
      <main id="main">
        {sectionOrderingStrategy.getOrderedSectionTypes().map((sectionType) => {
          const OrderedSectionComponent = sectionComponentFactory.createSectionComponent(sectionType);
          return <OrderedSectionComponent key={sectionType} />;
        })}
      </main>
      <SiteFooterComponent />
    </>
  );
}
