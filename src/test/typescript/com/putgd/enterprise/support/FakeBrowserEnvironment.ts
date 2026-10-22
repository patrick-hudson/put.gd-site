import { vi } from "vitest";
import { FakeIntersectionObserver } from "./FakeIntersectionObserver";

export interface FakeBrowserEnvironmentConfiguration {
  readonly isReducedMotionPreferred: boolean;
  readonly isScrollDrivenAnimationTimelineSupported: boolean;
  readonly isIntersectionObserverSupported: boolean;
  readonly isWebAnimationsApiSupported: boolean;
  readonly runningAnimations: readonly Animation[];
}

const DEFAULT_FAKE_BROWSER_ENVIRONMENT_CONFIGURATION: FakeBrowserEnvironmentConfiguration = {
  isReducedMotionPreferred: false,
  isScrollDrivenAnimationTimelineSupported: true,
  isIntersectionObserverSupported: true,
  isWebAnimationsApiSupported: true,
  runningAnimations: [],
};

let currentFakeBrowserEnvironmentConfiguration = DEFAULT_FAKE_BROWSER_ENVIRONMENT_CONFIGURATION;

export const fakeClipboardWriteText = vi.fn<(textToWrite: string) => Promise<void>>();
export const fakeFetch = vi.fn<typeof fetch>();

export function configureFakeBrowserEnvironment(
  partialFakeBrowserEnvironmentConfiguration: Partial<FakeBrowserEnvironmentConfiguration>,
): void {
  currentFakeBrowserEnvironmentConfiguration = {
    ...currentFakeBrowserEnvironmentConfiguration,
    ...partialFakeBrowserEnvironmentConfiguration,
  };
  applyFakeBrowserEnvironmentConfiguration();
}

export function createFakeRunningAnimation(
  elapsedAnimationTimeInMilliseconds: number,
  singleIterationDurationInMilliseconds: number,
): Animation {
  return {
    currentTime: elapsedAnimationTimeInMilliseconds,
    effect: { getComputedTiming: () => ({ duration: singleIterationDurationInMilliseconds }) },
  } as unknown as Animation;
}

export function resetFakeBrowserEnvironment(): void {
  currentFakeBrowserEnvironmentConfiguration = DEFAULT_FAKE_BROWSER_ENVIRONMENT_CONFIGURATION;
  FakeIntersectionObserver.disconnectAllFakeIntersectionObservers();
  fakeClipboardWriteText.mockReset().mockResolvedValue(undefined);
  fakeFetch.mockReset().mockRejectedValue(new TypeError("fetch is not available in this test"));
  window.history.replaceState(null, "", "/");
  applyFakeBrowserEnvironmentConfiguration();
}

function applyFakeBrowserEnvironmentConfiguration(): void {
  const configuration = currentFakeBrowserEnvironmentConfiguration;

  window.matchMedia = (mediaQuery: string) =>
    ({
      matches: mediaQuery === "(prefers-reduced-motion: reduce)" && configuration.isReducedMotionPreferred,
      media: mediaQuery,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;

  Object.defineProperty(globalThis, "CSS", {
    configurable: true,
    value: {
      supports: (cssDeclaration: string) =>
        cssDeclaration.startsWith("animation-timeline") && configuration.isScrollDrivenAnimationTimelineSupported,
    },
  });

  const windowWithOptionalIntersectionObserver = window as { IntersectionObserver?: unknown };
  if (configuration.isIntersectionObserverSupported) {
    windowWithOptionalIntersectionObserver.IntersectionObserver = FakeIntersectionObserver;
  } else {
    delete windowWithOptionalIntersectionObserver.IntersectionObserver;
  }

  const elementPrototypeWithOptionalGetAnimations = Element.prototype as { getAnimations?: () => Animation[] };
  if (configuration.isWebAnimationsApiSupported) {
    elementPrototypeWithOptionalGetAnimations.getAnimations = () => [...configuration.runningAnimations];
  } else {
    delete elementPrototypeWithOptionalGetAnimations.getAnimations;
  }

  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: fakeClipboardWriteText },
  });

  window.fetch = fakeFetch;
  window.requestAnimationFrame = (animationFrameCallback: FrameRequestCallback) =>
    window.setTimeout(() => animationFrameCallback(performance.now()), 16);
  window.cancelAnimationFrame = (animationFrameRequestIdentifier: number) =>
    window.clearTimeout(animationFrameRequestIdentifier);
}
