import { useEffect, useState, type RefObject } from "react";
import { useEnterpriseBean } from "../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { AnimationLoopProgressCalculator } from "../../interfaces/calculators/AnimationLoopProgressCalculator";
import type { SelectionReadoutDimensionCalculator } from "../../interfaces/calculators/SelectionReadoutDimensionCalculator";
import type { Formatter } from "../../interfaces/formatters/Formatter";
import type { AnimationFrameScheduler } from "../../interfaces/schedulers/AnimationFrameScheduler";
import type { BrowserCapabilityDetectionService } from "../../interfaces/services/BrowserCapabilityDetectionService";
import type { MotionPreferenceDetectionService } from "../../interfaces/services/MotionPreferenceDetectionService";
import type { CancellationHandle } from "../../model/CancellationHandle";
import type { SelectionReadoutDimensions } from "../../model/SelectionReadoutDimensions";

export function useSelectionReadoutText(selectionMarqueeElementReference: RefObject<HTMLElement | null>): string {
  const motionPreferenceDetectionService = useEnterpriseBean<MotionPreferenceDetectionService>("motionPreferenceDetectionService");
  const browserCapabilityDetectionService = useEnterpriseBean<BrowserCapabilityDetectionService>("browserCapabilityDetectionService");
  const animationFrameScheduler = useEnterpriseBean<AnimationFrameScheduler>("animationFrameScheduler");
  const animationLoopProgressCalculator = useEnterpriseBean<AnimationLoopProgressCalculator>("animationLoopProgressCalculator");
  const selectionReadoutDimensionCalculator = useEnterpriseBean<SelectionReadoutDimensionCalculator>("selectionReadoutDimensionCalculator");
  const selectionReadoutDimensionsFormatter = useEnterpriseBean<Formatter<SelectionReadoutDimensions>>("selectionReadoutDimensionsFormatter");

  const [isSelectionReadoutSynchronizationEnabled] = useState(
    () =>
      !motionPreferenceDetectionService.isReducedMotionPreferredByUser() &&
      browserCapabilityDetectionService.isWebAnimationsApiSupported(),
  );
  const [selectionReadoutText, setSelectionReadoutText] = useState(() =>
    selectionReadoutDimensionsFormatter.format(
      isSelectionReadoutSynchronizationEnabled
        ? selectionReadoutDimensionCalculator.calculateSelectionReadoutDimensions(0)
        : selectionReadoutDimensionCalculator.calculateFinalSelectionReadoutDimensions(),
    ),
  );

  useEffect(() => {
    const selectionMarqueeElement = selectionMarqueeElementReference.current;
    if (!isSelectionReadoutSynchronizationEnabled || selectionMarqueeElement === null) {
      return;
    }
    let pendingAnimationFrameCancellationHandle: CancellationHandle | null = null;
    const synchronizeSelectionReadoutWithRunningAnimation = () => {
      const runningSelectionMarqueeAnimation = selectionMarqueeElement.getAnimations()[0];
      if (runningSelectionMarqueeAnimation?.effect) {
        setSelectionReadoutText(
          selectionReadoutDimensionsFormatter.format(
            selectionReadoutDimensionCalculator.calculateSelectionReadoutDimensions(
              animationLoopProgressCalculator.calculateNormalizedAnimationLoopProgress(runningSelectionMarqueeAnimation),
            ),
          ),
        );
      }
      pendingAnimationFrameCancellationHandle = animationFrameScheduler.scheduleBeforeNextRepaint(
        synchronizeSelectionReadoutWithRunningAnimation,
      );
    };
    pendingAnimationFrameCancellationHandle = animationFrameScheduler.scheduleBeforeNextRepaint(
      synchronizeSelectionReadoutWithRunningAnimation,
    );
    return () => pendingAnimationFrameCancellationHandle?.cancel();
  }, [
    selectionMarqueeElementReference,
    isSelectionReadoutSynchronizationEnabled,
    animationFrameScheduler,
    animationLoopProgressCalculator,
    selectionReadoutDimensionCalculator,
    selectionReadoutDimensionsFormatter,
  ]);

  return selectionReadoutText;
}
