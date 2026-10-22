import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { DurationProvider } from "../../interfaces/providers/DurationProvider";

@EnterpriseBean("com.putgd.enterprise.impl.providers.ConfigurableDurationProviderImpl")
export class ConfigurableDurationProviderImpl implements DurationProvider {
  public constructor(private readonly configuredDurationInMilliseconds: number) {}

  public provideDurationInMilliseconds(): number {
    return this.configuredDurationInMilliseconds;
  }
}
