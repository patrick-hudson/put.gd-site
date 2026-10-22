import { describe, expect, it, vi } from "vitest";
import { ReleaseManifestRetrievalFailedException } from "@putgd-enterprise/impl/exceptions/ReleaseManifestRetrievalFailedException";
import { PrefixingAssetPathResolverImpl } from "@putgd-enterprise/impl/resolvers/PrefixingAssetPathResolverImpl";
import { WindowRequestAnimationFrameSchedulerImpl } from "@putgd-enterprise/impl/schedulers/WindowRequestAnimationFrameSchedulerImpl";
import { WindowSetTimeoutDelayedTaskSchedulerImpl } from "@putgd-enterprise/impl/schedulers/WindowSetTimeoutDelayedTaskSchedulerImpl";
import { FetchApiReleaseManifestRetrievalServiceImpl } from "@putgd-enterprise/impl/services/FetchApiReleaseManifestRetrievalServiceImpl";
import { GlobalScopeBrowserCapabilityDetectionServiceImpl } from "@putgd-enterprise/impl/services/GlobalScopeBrowserCapabilityDetectionServiceImpl";
import { MatchMediaMotionPreferenceDetectionServiceImpl } from "@putgd-enterprise/impl/services/MatchMediaMotionPreferenceDetectionServiceImpl";
import { NavigatorClipboardServiceImpl } from "@putgd-enterprise/impl/services/NavigatorClipboardServiceImpl";
import { WindowLocationBrowserLocationServiceImpl } from "@putgd-enterprise/impl/services/WindowLocationBrowserLocationServiceImpl";
import { configureFakeBrowserEnvironment, fakeClipboardWriteText, fakeFetch } from "../../support/FakeBrowserEnvironment";
import { RELEASE_MANIFEST_WITH_BOTH_CHANNELS, serveReleaseManifest } from "../../support/ReleaseManifestTestFixtures";

describe("MatchMediaMotionPreferenceDetectionServiceImpl", () => {
  const motionPreferenceDetectionService = new MatchMediaMotionPreferenceDetectionServiceImpl("(prefers-reduced-motion: reduce)");

  it("reports a reduced motion preference", () => {
    configureFakeBrowserEnvironment({ isReducedMotionPreferred: true });
    expect(motionPreferenceDetectionService.isReducedMotionPreferredByUser()).toBe(true);
  });

  it("reports no preference", () => {
    expect(motionPreferenceDetectionService.isReducedMotionPreferredByUser()).toBe(false);
  });
});

describe("GlobalScopeBrowserCapabilityDetectionServiceImpl", () => {
  const browserCapabilityDetectionService = new GlobalScopeBrowserCapabilityDetectionServiceImpl("animation-timeline: view()");

  it("detects every capability when present", () => {
    expect(browserCapabilityDetectionService.isScrollDrivenAnimationTimelineSupported()).toBe(true);
    expect(browserCapabilityDetectionService.isIntersectionObserverSupported()).toBe(true);
    expect(browserCapabilityDetectionService.isWebAnimationsApiSupported()).toBe(true);
    expect(browserCapabilityDetectionService.isFetchApiSupported()).toBe(true);
  });

  it("detects missing capabilities", () => {
    configureFakeBrowserEnvironment({
      isScrollDrivenAnimationTimelineSupported: false,
      isIntersectionObserverSupported: false,
      isWebAnimationsApiSupported: false,
    });
    expect(browserCapabilityDetectionService.isScrollDrivenAnimationTimelineSupported()).toBe(false);
    expect(browserCapabilityDetectionService.isIntersectionObserverSupported()).toBe(false);
    expect(browserCapabilityDetectionService.isWebAnimationsApiSupported()).toBe(false);
  });
});

describe("WindowLocationBrowserLocationServiceImpl", () => {
  it("reads the hash and pathname", () => {
    window.history.replaceState(null, "", "/index.html#nightly");
    const browserLocationService = new WindowLocationBrowserLocationServiceImpl();
    expect(browserLocationService.getCurrentLocationHash()).toBe("#nightly");
    expect(browserLocationService.getCurrentLocationPathname()).toBe("/index.html");
  });
});

describe("NavigatorClipboardServiceImpl", () => {
  it("writes through navigator.clipboard", async () => {
    await new NavigatorClipboardServiceImpl().writeTextToClipboard("sudo dnf install ./putgd-*.rpm");
    expect(fakeClipboardWriteText).toHaveBeenCalledWith("sudo dnf install ./putgd-*.rpm");
  });

  it("propagates a refusal", async () => {
    fakeClipboardWriteText.mockRejectedValueOnce(new DOMException("denied", "NotAllowedError"));
    await expect(new NavigatorClipboardServiceImpl().writeTextToClipboard("anything")).rejects.toThrow("denied");
  });
});

describe("FetchApiReleaseManifestRetrievalServiceImpl", () => {
  const releaseManifestRetrievalService = new FetchApiReleaseManifestRetrievalServiceImpl(
    new PrefixingAssetPathResolverImpl("/_site/"),
    "releases.json",
  );

  it("fetches /_site/releases.json without the HTTP cache and parses it", async () => {
    serveReleaseManifest(RELEASE_MANIFEST_WITH_BOTH_CHANNELS);
    await expect(releaseManifestRetrievalService.retrieveReleaseManifest()).resolves.toEqual(RELEASE_MANIFEST_WITH_BOTH_CHANNELS);
    expect(fakeFetch).toHaveBeenCalledWith("/_site/releases.json", { cache: "no-cache" });
  });

  it("throws with the HTTP status when the manifest is missing", async () => {
    fakeFetch.mockResolvedValue(new Response("not found", { status: 404 }));
    await expect(releaseManifestRetrievalService.retrieveReleaseManifest()).rejects.toThrow(ReleaseManifestRetrievalFailedException);
    await expect(releaseManifestRetrievalService.retrieveReleaseManifest()).rejects.toThrow("HTTP 404");
  });
});

describe("WindowSetTimeoutDelayedTaskSchedulerImpl", () => {
  it("runs the task after the delay", () => {
    vi.useFakeTimers();
    const delayedTask = vi.fn();
    new WindowSetTimeoutDelayedTaskSchedulerImpl().scheduleDelayedTask(delayedTask, 1800);
    vi.advanceTimersByTime(1799);
    expect(delayedTask).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(delayedTask).toHaveBeenCalledOnce();
  });

  it("can be cancelled", () => {
    vi.useFakeTimers();
    const delayedTask = vi.fn();
    new WindowSetTimeoutDelayedTaskSchedulerImpl().scheduleDelayedTask(delayedTask, 100).cancel();
    vi.advanceTimersByTime(1000);
    expect(delayedTask).not.toHaveBeenCalled();
  });
});

describe("WindowRequestAnimationFrameSchedulerImpl", () => {
  it("runs the callback before the next repaint unless cancelled", () => {
    vi.useFakeTimers();
    const animationFrameScheduler = new WindowRequestAnimationFrameSchedulerImpl();
    const keptAnimationFrameCallback = vi.fn();
    const cancelledAnimationFrameCallback = vi.fn();
    animationFrameScheduler.scheduleBeforeNextRepaint(keptAnimationFrameCallback);
    animationFrameScheduler.scheduleBeforeNextRepaint(cancelledAnimationFrameCallback).cancel();
    vi.advanceTimersByTime(16);
    expect(keptAnimationFrameCallback).toHaveBeenCalledOnce();
    expect(cancelledAnimationFrameCallback).not.toHaveBeenCalled();
  });
});
