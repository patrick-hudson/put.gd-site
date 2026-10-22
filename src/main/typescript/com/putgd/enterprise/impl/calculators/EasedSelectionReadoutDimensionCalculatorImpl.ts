import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { SelectionReadoutDimensionCalculator } from "../../interfaces/calculators/SelectionReadoutDimensionCalculator";
import type { ClampingStrategy } from "../../interfaces/strategies/ClampingStrategy";
import type { EasingStrategy } from "../../interfaces/strategies/EasingStrategy";
import type { SelectionReadoutDimensions } from "../../model/SelectionReadoutDimensions";

@EnterpriseBean("com.putgd.enterprise.impl.calculators.EasedSelectionReadoutDimensionCalculatorImpl")
export class EasedSelectionReadoutDimensionCalculatorImpl implements SelectionReadoutDimensionCalculator {
  public constructor(
    private readonly easingStrategy: EasingStrategy,
    private readonly clampingStrategy: ClampingStrategy,
    private readonly finalSelectionWidthInPixels: number,
    private readonly finalSelectionHeightInPixels: number,
    private readonly selectionDragStartLoopFraction: number,
    private readonly selectionDragEndLoopFraction: number,
  ) {}

  public calculateSelectionReadoutDimensions(normalizedAnimationLoopProgress: number): SelectionReadoutDimensions {
    const linearSelectionDragProgress = this.clampingStrategy.clamp(
      (normalizedAnimationLoopProgress - this.selectionDragStartLoopFraction) /
        (this.selectionDragEndLoopFraction - this.selectionDragStartLoopFraction),
    );
    const easedSelectionDragProgress = this.easingStrategy.applyEasing(linearSelectionDragProgress);
    return {
      selectionWidthInPixels: Math.round(this.finalSelectionWidthInPixels * easedSelectionDragProgress),
      selectionHeightInPixels: Math.round(this.finalSelectionHeightInPixels * easedSelectionDragProgress),
    };
  }

  public calculateFinalSelectionReadoutDimensions(): SelectionReadoutDimensions {
    return {
      selectionWidthInPixels: this.finalSelectionWidthInPixels,
      selectionHeightInPixels: this.finalSelectionHeightInPixels,
    };
  }
}
