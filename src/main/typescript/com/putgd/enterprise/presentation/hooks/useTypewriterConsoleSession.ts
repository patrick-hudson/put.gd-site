import { useEffect, useState, type RefObject } from "react";
import { useEnterpriseBean } from "../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { IntersectionObserverFactory } from "../../interfaces/factories/IntersectionObserverFactory";
import type { Formatter } from "../../interfaces/formatters/Formatter";
import type { ReadOnlyRepository } from "../../interfaces/repositories/ReadOnlyRepository";
import type { DelayedTaskScheduler } from "../../interfaces/schedulers/DelayedTaskScheduler";
import type { BrowserCapabilityDetectionService } from "../../interfaces/services/BrowserCapabilityDetectionService";
import type { MotionPreferenceDetectionService } from "../../interfaces/services/MotionPreferenceDetectionService";
import type { TypewriterDelayCalculationStrategy } from "../../interfaces/strategies/TypewriterDelayCalculationStrategy";
import type { StringReturner } from "../../interfaces/stringreturners/StringReturner";
import type { CancellationHandle } from "../../model/CancellationHandle";
import type { ConsoleLine } from "../../model/ConsoleLine";

export interface TypewriterConsoleSessionState {
  readonly revealedConsoleLines: readonly ConsoleLine[];
  readonly isTypewriterCaretVisible: boolean;
  readonly consoleSessionAccessibleLabel: string;
}

export function useTypewriterConsoleSession(
  consoleElementReference: RefObject<HTMLElement | null>,
): TypewriterConsoleSessionState {
  const consoleLineRepository = useEnterpriseBean<ReadOnlyRepository<ConsoleLine>>("consoleLineRepository");
  const motionPreferenceDetectionService = useEnterpriseBean<MotionPreferenceDetectionService>("motionPreferenceDetectionService");
  const browserCapabilityDetectionService = useEnterpriseBean<BrowserCapabilityDetectionService>("browserCapabilityDetectionService");
  const consoleIntersectionObserverFactory = useEnterpriseBean<IntersectionObserverFactory>("consoleIntersectionObserverFactory");
  const delayedTaskScheduler = useEnterpriseBean<DelayedTaskScheduler>("delayedTaskScheduler");
  const typewriterDelayCalculationStrategy = useEnterpriseBean<TypewriterDelayCalculationStrategy>("typewriterDelayCalculationStrategy");
  const consoleSessionAccessibleLabelFormatter = useEnterpriseBean<Formatter<readonly ConsoleLine[]>>("consoleSessionAccessibleLabelFormatter");
  const consoleSessionStaticAccessibleLabelStringReturner = useEnterpriseBean<StringReturner>("consoleSessionStaticAccessibleLabelStringReturner");

  const [allConsoleLines] = useState(() => consoleLineRepository.findAll());
  const [isTypewriterEffectEnabled] = useState(
    () =>
      !motionPreferenceDetectionService.isReducedMotionPreferredByUser() &&
      browserCapabilityDetectionService.isIntersectionObserverSupported(),
  );
  const [revealedConsoleLineCount, setRevealedConsoleLineCount] = useState(
    isTypewriterEffectEnabled ? 0 : allConsoleLines.length,
  );

  useEffect(() => {
    const consoleElement = consoleElementReference.current;
    if (!isTypewriterEffectEnabled || consoleElement === null) {
      return;
    }
    let hasTypewriterSessionStarted = false;
    let pendingDelayedTaskCancellationHandle: CancellationHandle | null = null;
    const consoleIntersectionObserver = consoleIntersectionObserverFactory.createIntersectionObserver(
      (intersectionObserverEntries) => {
        if (
          hasTypewriterSessionStarted ||
          !intersectionObserverEntries.some((intersectionObserverEntry) => intersectionObserverEntry.isIntersecting)
        ) {
          return;
        }
        hasTypewriterSessionStarted = true;
        consoleIntersectionObserver.disconnect();
        let locallyRevealedConsoleLineCount = 0;
        const revealNextConsoleLine = () => {
          locallyRevealedConsoleLineCount++;
          setRevealedConsoleLineCount(locallyRevealedConsoleLineCount);
          if (locallyRevealedConsoleLineCount < allConsoleLines.length) {
            pendingDelayedTaskCancellationHandle = delayedTaskScheduler.scheduleDelayedTask(
              revealNextConsoleLine,
              typewriterDelayCalculationStrategy.calculateDelayAfterRevealedLineInMilliseconds(
                allConsoleLines[locallyRevealedConsoleLineCount - 1],
              ),
            );
          }
        };
        pendingDelayedTaskCancellationHandle = delayedTaskScheduler.scheduleDelayedTask(
          revealNextConsoleLine,
          typewriterDelayCalculationStrategy.calculateInitialDelayInMilliseconds(),
        );
      },
    );
    consoleIntersectionObserver.observe(consoleElement);
    return () => {
      consoleIntersectionObserver.disconnect();
      pendingDelayedTaskCancellationHandle?.cancel();
    };
  }, [
    consoleElementReference,
    isTypewriterEffectEnabled,
    allConsoleLines,
    consoleIntersectionObserverFactory,
    delayedTaskScheduler,
    typewriterDelayCalculationStrategy,
  ]);

  return {
    revealedConsoleLines: allConsoleLines.slice(0, revealedConsoleLineCount),
    isTypewriterCaretVisible: isTypewriterEffectEnabled && revealedConsoleLineCount < allConsoleLines.length,
    consoleSessionAccessibleLabel: isTypewriterEffectEnabled
      ? consoleSessionAccessibleLabelFormatter.format(allConsoleLines)
      : consoleSessionStaticAccessibleLabelStringReturner.getReturnString(),
  };
}
