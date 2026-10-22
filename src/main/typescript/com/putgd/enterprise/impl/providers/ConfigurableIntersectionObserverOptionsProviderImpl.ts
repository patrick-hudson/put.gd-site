import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { IntersectionObserverOptionsProvider } from "../../interfaces/providers/IntersectionObserverOptionsProvider";

@EnterpriseBean("com.putgd.enterprise.impl.providers.ConfigurableIntersectionObserverOptionsProviderImpl")
export class ConfigurableIntersectionObserverOptionsProviderImpl implements IntersectionObserverOptionsProvider {
  public constructor(
    private readonly intersectionRootMargin: string,
    private readonly intersectionThreshold: number,
  ) {}

  public provideIntersectionObserverOptions(): IntersectionObserverInit {
    return { rootMargin: this.intersectionRootMargin, threshold: this.intersectionThreshold };
  }
}
