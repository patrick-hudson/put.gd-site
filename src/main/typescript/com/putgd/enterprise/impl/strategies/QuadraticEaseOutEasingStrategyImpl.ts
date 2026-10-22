import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { EasingStrategy } from "../../interfaces/strategies/EasingStrategy";

@EnterpriseBean("com.putgd.enterprise.impl.strategies.QuadraticEaseOutEasingStrategyImpl")
export class QuadraticEaseOutEasingStrategyImpl implements EasingStrategy {
  private static readonly QUADRATIC_EXPONENT = 2;

  public applyEasing(normalizedLinearProgress: number): number {
    return 1 - Math.pow(1 - normalizedLinearProgress, QuadraticEaseOutEasingStrategyImpl.QUADRATIC_EXPONENT);
  }
}
