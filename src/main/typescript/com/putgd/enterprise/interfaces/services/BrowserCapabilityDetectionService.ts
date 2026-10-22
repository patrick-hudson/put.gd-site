export interface BrowserCapabilityDetectionService {
  isScrollDrivenAnimationTimelineSupported(): boolean;
  isIntersectionObserverSupported(): boolean;
  isWebAnimationsApiSupported(): boolean;
  isFetchApiSupported(): boolean;
}
