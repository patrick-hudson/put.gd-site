export interface EasingStrategy {
  applyEasing(normalizedLinearProgress: number): number;
}
