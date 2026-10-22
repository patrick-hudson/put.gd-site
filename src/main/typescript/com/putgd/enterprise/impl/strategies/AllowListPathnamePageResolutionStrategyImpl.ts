import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { PageResolutionStrategy } from "../../interfaces/strategies/PageResolutionStrategy";
import { PageType } from "../../model/PageType";

@EnterpriseBean("com.putgd.enterprise.impl.strategies.AllowListPathnamePageResolutionStrategyImpl")
export class AllowListPathnamePageResolutionStrategyImpl implements PageResolutionStrategy {
  public constructor(private readonly landingPagePathnameAllowList: readonly string[]) {}

  public resolvePageType(requestedPathname: string): PageType {
    return this.landingPagePathnameAllowList.includes(requestedPathname) ? PageType.LANDING_PAGE : PageType.NOT_FOUND_PAGE;
  }
}
