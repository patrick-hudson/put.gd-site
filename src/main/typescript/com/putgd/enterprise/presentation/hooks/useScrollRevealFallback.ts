import { useEffect, useState, type RefObject } from "react";
import { useEnterpriseBean } from "../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { IntersectionObserverFactory } from "../../interfaces/factories/IntersectionObserverFactory";
import type { BrowserCapabilityDetectionService } from "../../interfaces/services/BrowserCapabilityDetectionService";

export function useScrollRevealFallback(revealableElementReference: RefObject<HTMLElement | null>): boolean {
  const browserCapabilityDetectionService = useEnterpriseBean<BrowserCapabilityDetectionService>("browserCapabilityDetectionService");
  const plateRevealIntersectionObserverFactory = useEnterpriseBean<IntersectionObserverFactory>("plateRevealIntersectionObserverFactory");
  const [hasRevealableElementBeenRevealed, setHasRevealableElementBeenRevealed] = useState(false);

  useEffect(() => {
    const revealableElement = revealableElementReference.current;
    if (
      revealableElement === null ||
      browserCapabilityDetectionService.isScrollDrivenAnimationTimelineSupported() ||
      !browserCapabilityDetectionService.isIntersectionObserverSupported()
    ) {
      return;
    }
    const revealIntersectionObserver = plateRevealIntersectionObserverFactory.createIntersectionObserver(
      (intersectionObserverEntries) => {
        if (intersectionObserverEntries.some((intersectionObserverEntry) => intersectionObserverEntry.isIntersecting)) {
          setHasRevealableElementBeenRevealed(true);
          revealIntersectionObserver.disconnect();
        }
      },
    );
    revealIntersectionObserver.observe(revealableElement);
    return () => revealIntersectionObserver.disconnect();
  }, [revealableElementReference, browserCapabilityDetectionService, plateRevealIntersectionObserverFactory]);

  return hasRevealableElementBeenRevealed;
}
