import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { BrowserCapabilityDetectionService } from "../../interfaces/services/BrowserCapabilityDetectionService";

@EnterpriseBean("com.putgd.enterprise.impl.services.GlobalScopeBrowserCapabilityDetectionServiceImpl")
export class GlobalScopeBrowserCapabilityDetectionServiceImpl implements BrowserCapabilityDetectionService {
  public constructor(private readonly scrollDrivenAnimationTimelineCssDeclaration: string) {}

  public isScrollDrivenAnimationTimelineSupported(): boolean {
    return CSS.supports(this.scrollDrivenAnimationTimelineCssDeclaration);
  }

  public isIntersectionObserverSupported(): boolean {
    return "IntersectionObserver" in window;
  }

  public isWebAnimationsApiSupported(): boolean {
    return typeof Element.prototype.getAnimations === "function";
  }

  public isFetchApiSupported(): boolean {
    return "fetch" in window;
  }
}
