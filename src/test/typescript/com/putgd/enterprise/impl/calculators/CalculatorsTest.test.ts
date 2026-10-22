import { describe, expect, it } from "vitest";
import { EasedSelectionReadoutDimensionCalculatorImpl } from "@putgd-enterprise/impl/calculators/EasedSelectionReadoutDimensionCalculatorImpl";
import { WebAnimationsApiAnimationLoopProgressCalculatorImpl } from "@putgd-enterprise/impl/calculators/WebAnimationsApiAnimationLoopProgressCalculatorImpl";
import { ConfigurableBoundsClampingStrategyImpl } from "@putgd-enterprise/impl/strategies/ConfigurableBoundsClampingStrategyImpl";
import { QuadraticEaseOutEasingStrategyImpl } from "@putgd-enterprise/impl/strategies/QuadraticEaseOutEasingStrategyImpl";
import { createFakeRunningAnimation } from "../../support/FakeBrowserEnvironment";

describe("WebAnimationsApiAnimationLoopProgressCalculatorImpl", () => {
  const animationLoopProgressCalculator = new WebAnimationsApiAnimationLoopProgressCalculatorImpl();

  it("returns the fraction of the current iteration", () => {
    expect(animationLoopProgressCalculator.calculateNormalizedAnimationLoopProgress(createFakeRunningAnimation(2250, 9000))).toBe(0.25);
  });

  it("wraps around on later iterations", () => {
    expect(animationLoopProgressCalculator.calculateNormalizedAnimationLoopProgress(createFakeRunningAnimation(20250, 9000))).toBe(0.25);
  });

  it("treats a missing current time as the start", () => {
    expect(
      animationLoopProgressCalculator.calculateNormalizedAnimationLoopProgress({
        currentTime: null,
        effect: { getComputedTiming: () => ({ duration: 9000 }) },
      } as unknown as Animation),
    ).toBe(0);
  });

  it("returns 0 for an animation without a usable duration instead of NaN", () => {
    expect(animationLoopProgressCalculator.calculateNormalizedAnimationLoopProgress(createFakeRunningAnimation(100, 0))).toBe(0);
    expect(
      animationLoopProgressCalculator.calculateNormalizedAnimationLoopProgress({ currentTime: 100, effect: null } as unknown as Animation),
    ).toBe(0);
  });
});

describe("EasedSelectionReadoutDimensionCalculatorImpl", () => {
  const selectionReadoutDimensionCalculator = new EasedSelectionReadoutDimensionCalculatorImpl(
    new QuadraticEaseOutEasingStrategyImpl(),
    new ConfigurableBoundsClampingStrategyImpl(0, 1),
    612,
    133,
    0.2,
    0.32,
  );

  it("reports 0 × 0 before the drag starts", () => {
    expect(selectionReadoutDimensionCalculator.calculateSelectionReadoutDimensions(0.1)).toEqual({
      selectionWidthInPixels: 0,
      selectionHeightInPixels: 0,
    });
  });

  it("follows the eased drag halfway through", () => {
    expect(selectionReadoutDimensionCalculator.calculateSelectionReadoutDimensions(0.26)).toEqual({
      selectionWidthInPixels: 459,
      selectionHeightInPixels: 100,
    });
  });

  it("holds the full size after the drag ends", () => {
    expect(selectionReadoutDimensionCalculator.calculateSelectionReadoutDimensions(0.9)).toEqual({
      selectionWidthInPixels: 612,
      selectionHeightInPixels: 133,
    });
  });

  it("reports the full size as the final dimensions", () => {
    expect(selectionReadoutDimensionCalculator.calculateFinalSelectionReadoutDimensions()).toEqual({
      selectionWidthInPixels: 612,
      selectionHeightInPixels: 133,
    });
  });
});
