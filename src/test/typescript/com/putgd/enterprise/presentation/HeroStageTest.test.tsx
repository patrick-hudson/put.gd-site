import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderEnterpriseApplication } from "../support/EnterpriseTestApplicationContextFactory";
import { configureFakeBrowserEnvironment, createFakeRunningAnimation } from "../support/FakeBrowserEnvironment";

const HERO_ANIMATION_LOOP_DURATION_IN_MILLISECONDS = 9000;

function getSelectionReadoutText(): string | null {
  return document.getElementById("readout")!.textContent;
}

describe("hero stage selection readout", () => {
  it.each([
    ["the user prefers reduced motion", { isReducedMotionPreferred: true }],
    ["the Web Animations API is missing", { isWebAnimationsApiSupported: false }],
  ])("shows the final 612 × 133 when %s", (_scenarioDescription, fakeBrowserEnvironmentConfiguration) => {
    configureFakeBrowserEnvironment(fakeBrowserEnvironmentConfiguration);
    renderEnterpriseApplication();
    expect(getSelectionReadoutText()).toBe("612 × 133");
  });

  it("starts at 0 × 0 when animating", () => {
    renderEnterpriseApplication();
    expect(getSelectionReadoutText()).toBe("0 × 0");
  });

  it("follows the CSS animation's progress every frame", () => {
    vi.useFakeTimers();
    configureFakeBrowserEnvironment({
      runningAnimations: [createFakeRunningAnimation(0.26 * HERO_ANIMATION_LOOP_DURATION_IN_MILLISECONDS, HERO_ANIMATION_LOOP_DURATION_IN_MILLISECONDS)],
    });
    renderEnterpriseApplication();
    act(() => vi.advanceTimersByTime(16));
    expect(getSelectionReadoutText()).toBe("459 × 100");

    configureFakeBrowserEnvironment({
      runningAnimations: [createFakeRunningAnimation(0.5 * HERO_ANIMATION_LOOP_DURATION_IN_MILLISECONDS, HERO_ANIMATION_LOOP_DURATION_IN_MILLISECONDS)],
    });
    act(() => vi.advanceTimersByTime(16));
    expect(getSelectionReadoutText()).toBe("612 × 133");
  });

  it("keeps its last value while no animation is running", () => {
    vi.useFakeTimers();
    renderEnterpriseApplication();
    act(() => vi.advanceTimersByTime(160));
    expect(getSelectionReadoutText()).toBe("0 × 0");
  });

  it("stops polling when unmounted", () => {
    vi.useFakeTimers();
    const { unmount } = renderEnterpriseApplication();
    act(() => vi.advanceTimersByTime(48));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("hero stage markup", () => {
  it("draws all eight resize handles on the selection", () => {
    renderEnterpriseApplication();
    expect(
      Array.from(document.querySelectorAll("#sel .h")).map((resizeHandleElement) => resizeHandleElement.getAttribute("class")),
    ).toEqual(["h nw", "h n", "h ne", "h e", "h se", "h s", "h sw", "h w"]);
  });

  it("shares one path between the latency line and its filled area", () => {
    renderEnterpriseApplication();
    const latencyLinePathDefinition = document.querySelector(".chart path.line")!.getAttribute("d")!;
    expect(document.querySelector(".chart path.area")!.getAttribute("d")).toBe(`${latencyLinePathDefinition} V140 H0Z`);
  });
});
