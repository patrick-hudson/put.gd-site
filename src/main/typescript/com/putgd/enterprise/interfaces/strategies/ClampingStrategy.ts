export interface ClampingStrategy {
  clamp(unclampedValue: number): number;
}
