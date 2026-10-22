export class FakeIntersectionObserver implements IntersectionObserver {
  private static readonly liveFakeIntersectionObserverInstances = new Set<FakeIntersectionObserver>();

  public readonly root = null;
  public readonly rootMargin: string;
  public readonly thresholds: readonly number[];
  private readonly observedElements = new Set<Element>();

  public constructor(
    private readonly intersectionObserverCallback: IntersectionObserverCallback,
    intersectionObserverOptions: IntersectionObserverInit = {},
  ) {
    this.rootMargin = intersectionObserverOptions.rootMargin ?? "0px";
    this.thresholds = [intersectionObserverOptions.threshold ?? 0].flat();
    FakeIntersectionObserver.liveFakeIntersectionObserverInstances.add(this);
  }

  public static simulateElementEnteringViewport(intersectingElement: Element): void {
    for (const fakeIntersectionObserver of [...FakeIntersectionObserver.liveFakeIntersectionObserverInstances]) {
      if (fakeIntersectionObserver.observedElements.has(intersectingElement)) {
        fakeIntersectionObserver.intersectionObserverCallback(
          [{ isIntersecting: true, target: intersectingElement } as IntersectionObserverEntry],
          fakeIntersectionObserver,
        );
      }
    }
  }

  public static findObserversOfElement(observedElement: Element): readonly FakeIntersectionObserver[] {
    return [...FakeIntersectionObserver.liveFakeIntersectionObserverInstances].filter((fakeIntersectionObserver) =>
      fakeIntersectionObserver.observedElements.has(observedElement),
    );
  }

  public static disconnectAllFakeIntersectionObservers(): void {
    FakeIntersectionObserver.liveFakeIntersectionObserverInstances.clear();
  }

  public observe(elementToObserve: Element): void {
    this.observedElements.add(elementToObserve);
  }

  public unobserve(elementToStopObserving: Element): void {
    this.observedElements.delete(elementToStopObserving);
  }

  public disconnect(): void {
    this.observedElements.clear();
    FakeIntersectionObserver.liveFakeIntersectionObserverInstances.delete(this);
  }

  public takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
