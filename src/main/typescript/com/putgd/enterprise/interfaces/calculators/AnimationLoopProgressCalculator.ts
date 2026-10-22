export interface AnimationLoopProgressCalculator {
  calculateNormalizedAnimationLoopProgress(runningAnimation: Animation): number;
}
