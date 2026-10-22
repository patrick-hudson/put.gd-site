import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderEnterpriseApplication } from "../support/EnterpriseTestApplicationContextFactory";
import { configureFakeBrowserEnvironment } from "../support/FakeBrowserEnvironment";
import { FakeIntersectionObserver } from "../support/FakeIntersectionObserver";

function getPipelinePlates(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("figure.plate"));
}

describe("pipeline plate reveal fallback", () => {
  it("leaves the reveal to CSS when scroll-driven animations are supported", () => {
    renderEnterpriseApplication();
    expect(getPipelinePlates()).toHaveLength(5);
    for (const pipelinePlate of getPipelinePlates()) {
      expect(FakeIntersectionObserver.findObserversOfElement(pipelinePlate)).toEqual([]);
      expect(pipelinePlate).not.toHaveClass("in");
    }
  });

  it("observes each plate with the legacy root margin and threshold when they are not", () => {
    configureFakeBrowserEnvironment({ isScrollDrivenAnimationTimelineSupported: false });
    renderEnterpriseApplication();
    for (const pipelinePlate of getPipelinePlates()) {
      const [plateRevealIntersectionObserver] = FakeIntersectionObserver.findObserversOfElement(pipelinePlate);
      expect(plateRevealIntersectionObserver.rootMargin).toBe("0px 0px -12% 0px");
      expect(plateRevealIntersectionObserver.thresholds).toEqual([0.15]);
    }
  });

  it("reveals a plate once it scrolls into view, and stops watching it", () => {
    configureFakeBrowserEnvironment({ isScrollDrivenAnimationTimelineSupported: false });
    renderEnterpriseApplication();
    const [firstPipelinePlate, secondPipelinePlate] = getPipelinePlates();

    act(() => FakeIntersectionObserver.simulateElementEnteringViewport(firstPipelinePlate));

    expect(firstPipelinePlate).toHaveClass("plate", "in");
    expect(secondPipelinePlate).not.toHaveClass("in");
    expect(FakeIntersectionObserver.findObserversOfElement(firstPipelinePlate)).toEqual([]);
    expect(FakeIntersectionObserver.findObserversOfElement(secondPipelinePlate)).toHaveLength(1);
  });

  it("does nothing without IntersectionObserver", () => {
    configureFakeBrowserEnvironment({ isScrollDrivenAnimationTimelineSupported: false, isIntersectionObserverSupported: false });
    renderEnterpriseApplication();
    for (const pipelinePlate of getPipelinePlates()) {
      expect(pipelinePlate).not.toHaveClass("in");
    }
  });

  it("serves every screenshot from /_site/", () => {
    renderEnterpriseApplication();
    expect(getPipelinePlates().map((pipelinePlate) => pipelinePlate.querySelector("img")!.getAttribute("src"))).toEqual([
      "/_site/shots/tray-trio.webp",
      "/_site/shots/review-plasma.webp",
      "/_site/shots/editor-gnome.webp",
      "/_site/shots/destinations-plasma.webp",
      "/_site/shots/history-plasma.webp",
    ]);
  });
});
