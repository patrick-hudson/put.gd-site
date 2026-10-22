import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderEnterpriseApplication } from "../support/EnterpriseTestApplicationContextFactory";
import { configureFakeBrowserEnvironment } from "../support/FakeBrowserEnvironment";
import { FakeIntersectionObserver } from "../support/FakeIntersectionObserver";

const FULL_CONSOLE_SESSION_TRANSCRIPT = [
  "$ putgd-cli capabilities",
  "# what this desktop actually supports",
  `$ putgd-cli action.invoke '{"action":"region"}'`,
  "# returns an operation id right away",
  `$ putgd-cli operation.inspect '{"id":"OPERATION-ID"}'`,
  "# phase, bytes, link, outcome",
  `$ putgd-cli history.list '{"limit":5,"category":"images"}'`,
  `$ putgd-cli recording.prepare '{"target":{"kind":"region"},"format":"mp4"}'`,
].join("\n");

function getConsoleElements() {
  const consolePreformattedElement = document.getElementById("console")!;
  return {
    consoleWrapperElement: consolePreformattedElement.closest(".console")!,
    consolePreformattedElement,
    consoleCodeElement: consolePreformattedElement.querySelector("code")!,
  };
}

function countRevealedConsoleLines(): number {
  const revealedConsoleText = getConsoleElements().consoleCodeElement.textContent ?? "";
  return revealedConsoleText === "" ? 0 : revealedConsoleText.split("\n").length;
}

function advanceTypewriterBy(elapsedMilliseconds: number): void {
  act(() => vi.advanceTimersByTime(elapsedMilliseconds));
}

describe("typewriter console", () => {
  it("waits with only a caret until the console scrolls into view", () => {
    vi.useFakeTimers();
    renderEnterpriseApplication();
    advanceTypewriterBy(10_000);
    expect(countRevealedConsoleLines()).toBe(0);
    expect(getConsoleElements().consoleCodeElement.querySelector(".caret")).toBeInTheDocument();
  });

  it("observes the console at 40% visibility", () => {
    renderEnterpriseApplication();
    const [consoleIntersectionObserver] = FakeIntersectionObserver.findObserversOfElement(getConsoleElements().consolePreformattedElement);
    expect(consoleIntersectionObserver.thresholds).toEqual([0.4]);
  });

  it("types lines with a longer pause after commands than after comments", () => {
    vi.useFakeTimers();
    renderEnterpriseApplication();
    act(() => FakeIntersectionObserver.simulateElementEnteringViewport(getConsoleElements().consolePreformattedElement));

    advanceTypewriterBy(299);
    expect(countRevealedConsoleLines()).toBe(0);
    advanceTypewriterBy(1);
    expect(countRevealedConsoleLines()).toBe(1);

    advanceTypewriterBy(519);
    expect(countRevealedConsoleLines()).toBe(1);
    advanceTypewriterBy(1);
    expect(countRevealedConsoleLines()).toBe(2);

    advanceTypewriterBy(259);
    expect(countRevealedConsoleLines()).toBe(2);
    advanceTypewriterBy(1);
    expect(countRevealedConsoleLines()).toBe(3);
  });

  it("ends with the full session and no caret", () => {
    vi.useFakeTimers();
    renderEnterpriseApplication();
    act(() => FakeIntersectionObserver.simulateElementEnteringViewport(getConsoleElements().consolePreformattedElement));
    advanceTypewriterBy(300 + 4 * 520 + 3 * 260);
    expect(getConsoleElements().consoleCodeElement.textContent).toBe(FULL_CONSOLE_SESSION_TRANSCRIPT);
    expect(getConsoleElements().consoleCodeElement.querySelector(".caret")).not.toBeInTheDocument();
  });

  it("only types the session once", () => {
    vi.useFakeTimers();
    renderEnterpriseApplication();
    const { consolePreformattedElement } = getConsoleElements();
    act(() => FakeIntersectionObserver.simulateElementEnteringViewport(consolePreformattedElement));
    advanceTypewriterBy(300);
    act(() => FakeIntersectionObserver.simulateElementEnteringViewport(consolePreformattedElement));
    advanceTypewriterBy(300);
    expect(countRevealedConsoleLines()).toBe(1);
  });

  it("labels the console with the whole session for screen readers", () => {
    renderEnterpriseApplication();
    expect(getConsoleElements().consoleWrapperElement).toHaveAttribute(
      "aria-label",
      `Example putgd-cli session: ${FULL_CONSOLE_SESSION_TRANSCRIPT.split("\n").join(" ")}`,
    );
  });

  it.each([
    ["the user prefers reduced motion", { isReducedMotionPreferred: true }],
    ["IntersectionObserver is missing", { isIntersectionObserverSupported: false }],
  ])("shows the whole session immediately when %s", (_scenarioDescription, fakeBrowserEnvironmentConfiguration) => {
    configureFakeBrowserEnvironment(fakeBrowserEnvironmentConfiguration);
    renderEnterpriseApplication();
    const { consoleWrapperElement, consoleCodeElement } = getConsoleElements();
    expect(consoleCodeElement.textContent).toBe(FULL_CONSOLE_SESSION_TRANSCRIPT);
    expect(consoleCodeElement.querySelector(".caret")).not.toBeInTheDocument();
    expect(consoleWrapperElement).toHaveAttribute("aria-label", "Example putgd-cli session");
  });

  it("stops typing when unmounted mid-session", () => {
    vi.useFakeTimers();
    const { unmount } = renderEnterpriseApplication();
    act(() => FakeIntersectionObserver.simulateElementEnteringViewport(getConsoleElements().consolePreformattedElement));
    advanceTypewriterBy(1000);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
