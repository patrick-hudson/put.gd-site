import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { AnimationLoopProgressCalculator } from "../../interfaces/calculators/AnimationLoopProgressCalculator";

@EnterpriseBean("com.putgd.enterprise.impl.calculators.WebAnimationsApiAnimationLoopProgressCalculatorImpl")
export class WebAnimationsApiAnimationLoopProgressCalculatorImpl implements AnimationLoopProgressCalculator {
  public calculateNormalizedAnimationLoopProgress(runningAnimation: Animation): number {
    const singleIterationDurationInMilliseconds = Number(runningAnimation.effect?.getComputedTiming().duration ?? 0);
    if (!(singleIterationDurationInMilliseconds > 0)) {
      return 0;
    }
    const elapsedAnimationTimeInMilliseconds = Number(runningAnimation.currentTime ?? 0);
    return (elapsedAnimationTimeInMilliseconds % singleIterationDurationInMilliseconds) / singleIterationDurationInMilliseconds;
  }
}
