import { describe, expect, it } from "vitest";
import { AllowListPathnamePageResolutionStrategyImpl } from "@putgd-enterprise/impl/strategies/AllowListPathnamePageResolutionStrategyImpl";
import { ConfigurableBoundsClampingStrategyImpl } from "@putgd-enterprise/impl/strategies/ConfigurableBoundsClampingStrategyImpl";
import { ExplanatoryCommentAwareTypewriterDelayCalculationStrategyImpl } from "@putgd-enterprise/impl/strategies/ExplanatoryCommentAwareTypewriterDelayCalculationStrategyImpl";
import { LocationHashAwareInitialReleaseChannelSelectionStrategyImpl } from "@putgd-enterprise/impl/strategies/LocationHashAwareInitialReleaseChannelSelectionStrategyImpl";
import { QuadraticEaseOutEasingStrategyImpl } from "@putgd-enterprise/impl/strategies/QuadraticEaseOutEasingStrategyImpl";
import { XmlConfiguredSectionOrderingStrategyImpl } from "@putgd-enterprise/impl/strategies/XmlConfiguredSectionOrderingStrategyImpl";
import type { BrowserLocationService } from "@putgd-enterprise/interfaces/services/BrowserLocationService";
import { ConsoleLineClassification } from "@putgd-enterprise/model/ConsoleLine";
import { PageType } from "@putgd-enterprise/model/PageType";
import { ReleaseChannel } from "@putgd-enterprise/model/ReleaseChannel";
import { SectionType } from "@putgd-enterprise/model/SectionType";
import {
  RELEASE_MANIFEST_WITH_BOTH_CHANNELS,
  RELEASE_MANIFEST_WITH_ONLY_NIGHTLY,
  STABLE_RELEASE_WITH_EVERY_PACKAGE,
} from "../../support/ReleaseManifestTestFixtures";

describe("QuadraticEaseOutEasingStrategyImpl", () => {
  const quadraticEaseOutEasingStrategy = new QuadraticEaseOutEasingStrategyImpl();

  it.each([
    [0, 0],
    [0.5, 0.75],
    [1, 1],
  ])("eases %d to %d", (normalizedLinearProgress, expectedEasedProgress) => {
    expect(quadraticEaseOutEasingStrategy.applyEasing(normalizedLinearProgress)).toBeCloseTo(expectedEasedProgress);
  });

  it("starts fast and slows down", () => {
    const firstQuarterGain = quadraticEaseOutEasingStrategy.applyEasing(0.25);
    const lastQuarterGain = 1 - quadraticEaseOutEasingStrategy.applyEasing(0.75);
    expect(firstQuarterGain).toBeGreaterThan(lastQuarterGain);
  });
});

describe("ConfigurableBoundsClampingStrategyImpl", () => {
  const unitIntervalClampingStrategy = new ConfigurableBoundsClampingStrategyImpl(0, 1);

  it.each([
    [-0.5, 0],
    [0, 0],
    [0.4, 0.4],
    [1, 1],
    [7, 1],
  ])("clamps %d to %d", (unclampedValue, expectedClampedValue) => {
    expect(unitIntervalClampingStrategy.clamp(unclampedValue)).toBe(expectedClampedValue);
  });
});

describe("ExplanatoryCommentAwareTypewriterDelayCalculationStrategyImpl", () => {
  const typewriterDelayCalculationStrategy = new ExplanatoryCommentAwareTypewriterDelayCalculationStrategyImpl(300, 260, 520);

  it("waits the initial delay before the first line", () => {
    expect(typewriterDelayCalculationStrategy.calculateInitialDelayInMilliseconds()).toBe(300);
  });

  it("moves on quickly after a comment", () => {
    expect(
      typewriterDelayCalculationStrategy.calculateDelayAfterRevealedLineInMilliseconds({
        consoleLineClassification: ConsoleLineClassification.EXPLANATORY_COMMENT,
        consoleLineText: "# a comment",
      }),
    ).toBe(260);
  });

  it("lingers after a shell command", () => {
    expect(
      typewriterDelayCalculationStrategy.calculateDelayAfterRevealedLineInMilliseconds({
        consoleLineClassification: ConsoleLineClassification.SHELL_COMMAND,
        consoleLineText: "putgd-cli capabilities",
      }),
    ).toBe(520);
  });
});

describe("LocationHashAwareInitialReleaseChannelSelectionStrategyImpl", () => {
  function createStrategyWithLocationHash(currentLocationHash: string) {
    const fixedBrowserLocationService: BrowserLocationService = {
      getCurrentLocationHash: () => currentLocationHash,
      getCurrentLocationPathname: () => "/",
    };
    return new LocationHashAwareInitialReleaseChannelSelectionStrategyImpl(fixedBrowserLocationService, "#nightly");
  }

  it("prefers stable when it exists", () => {
    expect(createStrategyWithLocationHash("").selectInitialReleaseChannel(RELEASE_MANIFEST_WITH_BOTH_CHANNELS)).toBe(
      ReleaseChannel.STABLE,
    );
  });

  it("falls back to nightly when there is no stable release", () => {
    expect(createStrategyWithLocationHash("").selectInitialReleaseChannel(RELEASE_MANIFEST_WITH_ONLY_NIGHTLY)).toBe(
      ReleaseChannel.NIGHTLY,
    );
  });

  it("honors #nightly when a nightly exists", () => {
    expect(createStrategyWithLocationHash("#nightly").selectInitialReleaseChannel(RELEASE_MANIFEST_WITH_BOTH_CHANNELS)).toBe(
      ReleaseChannel.NIGHTLY,
    );
  });

  it("ignores #nightly when there is no nightly", () => {
    expect(
      createStrategyWithLocationHash("#nightly").selectInitialReleaseChannel({ stable: STABLE_RELEASE_WITH_EVERY_PACKAGE, nightly: null }),
    ).toBe(ReleaseChannel.STABLE);
  });

  it("ignores other hashes", () => {
    expect(createStrategyWithLocationHash("#install").selectInitialReleaseChannel(RELEASE_MANIFEST_WITH_BOTH_CHANNELS)).toBe(
      ReleaseChannel.STABLE,
    );
  });
});

describe("AllowListPathnamePageResolutionStrategyImpl", () => {
  const pageResolutionStrategy = new AllowListPathnamePageResolutionStrategyImpl(["/", "/index.html"]);

  it.each(["/", "/index.html"])("serves the landing page at %s", (requestedPathname) => {
    expect(pageResolutionStrategy.resolvePageType(requestedPathname)).toBe(PageType.LANDING_PAGE);
  });

  it.each(["/dl/stable", "/index.htm", "/_site/site.css", ""])("serves the not found page at '%s'", (requestedPathname) => {
    expect(pageResolutionStrategy.resolvePageType(requestedPathname)).toBe(PageType.NOT_FOUND_PAGE);
  });
});

describe("XmlConfiguredSectionOrderingStrategyImpl", () => {
  it("keeps the configured order", () => {
    expect(new XmlConfiguredSectionOrderingStrategyImpl(["DETAILS", "HERO"]).getOrderedSectionTypes()).toEqual([
      SectionType.DETAILS,
      SectionType.HERO,
    ]);
  });

  it("trims whitespace and drops names that are not section types", () => {
    expect(new XmlConfiguredSectionOrderingStrategyImpl(["  HERO\n", "FOOTER", "install"]).getOrderedSectionTypes()).toEqual([
      SectionType.HERO,
    ]);
  });
});
