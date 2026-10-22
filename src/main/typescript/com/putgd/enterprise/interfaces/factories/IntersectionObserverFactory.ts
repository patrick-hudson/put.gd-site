export interface IntersectionObserverFactory {
  createIntersectionObserver(intersectionObserverCallback: IntersectionObserverCallback): IntersectionObserver;
}
