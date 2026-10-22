import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { ClampingStrategy } from "../../interfaces/strategies/ClampingStrategy";

@EnterpriseBean("com.putgd.enterprise.impl.strategies.ConfigurableBoundsClampingStrategyImpl")
export class ConfigurableBoundsClampingStrategyImpl implements ClampingStrategy {
  public constructor(
    private readonly inclusiveLowerBound: number,
    private readonly inclusiveUpperBound: number,
  ) {}

  public clamp(unclampedValue: number): number {
    return Math.min(this.inclusiveUpperBound, Math.max(this.inclusiveLowerBound, unclampedValue));
  }
}
