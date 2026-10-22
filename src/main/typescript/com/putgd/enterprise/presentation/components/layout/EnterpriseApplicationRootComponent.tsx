import { useEnterpriseBean } from "../../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { PageComponentFactory } from "../../../interfaces/factories/PageComponentFactory";
import type { BrowserLocationService } from "../../../interfaces/services/BrowserLocationService";
import type { PageResolutionStrategy } from "../../../interfaces/strategies/PageResolutionStrategy";

export function EnterpriseApplicationRootComponent() {
  const browserLocationService = useEnterpriseBean<BrowserLocationService>("browserLocationService");
  const pageResolutionStrategy = useEnterpriseBean<PageResolutionStrategy>("pageResolutionStrategy");
  const pageComponentFactory = useEnterpriseBean<PageComponentFactory>("pageComponentFactory");
  const ResolvedPageComponent = pageComponentFactory.createPageComponent(
    pageResolutionStrategy.resolvePageType(browserLocationService.getCurrentLocationPathname()),
  );
  return <ResolvedPageComponent />;
}
