import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { IntersectionObserverFactory } from "../../interfaces/factories/IntersectionObserverFactory";
import type { IntersectionObserverOptionsProvider } from "../../interfaces/providers/IntersectionObserverOptionsProvider";

@EnterpriseBean("com.putgd.enterprise.impl.factories.OptionsProviderBackedIntersectionObserverFactoryImpl")
export class OptionsProviderBackedIntersectionObserverFactoryImpl implements IntersectionObserverFactory {
  public constructor(private readonly intersectionObserverOptionsProvider: IntersectionObserverOptionsProvider) {}

  public createIntersectionObserver(intersectionObserverCallback: IntersectionObserverCallback): IntersectionObserver {
    return new IntersectionObserver(
      intersectionObserverCallback,
      this.intersectionObserverOptionsProvider.provideIntersectionObserverOptions(),
    );
  }
}
