import type { SelectionReadoutDimensions } from "../../model/SelectionReadoutDimensions";

export interface SelectionReadoutDimensionCalculator {
  calculateSelectionReadoutDimensions(normalizedAnimationLoopProgress: number): SelectionReadoutDimensions;
  calculateFinalSelectionReadoutDimensions(): SelectionReadoutDimensions;
}
