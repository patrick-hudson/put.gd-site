import { describe, expect, it } from "vitest";
import { AppImageAwareReleaseAssetMatchKeyToPermalinkSlugConverterImpl } from "@putgd-enterprise/impl/converters/AppImageAwareReleaseAssetMatchKeyToPermalinkSlugConverterImpl";
import { EnumMappingPageComponentFactoryImpl } from "@putgd-enterprise/impl/factories/EnumMappingPageComponentFactoryImpl";
import { EnumMappingSectionComponentFactoryImpl } from "@putgd-enterprise/impl/factories/EnumMappingSectionComponentFactoryImpl";
import { OptionsProviderBackedIntersectionObserverFactoryImpl } from "@putgd-enterprise/impl/factories/OptionsProviderBackedIntersectionObserverFactoryImpl";
import { SlugConvertingPermalinkUrlFactoryImpl } from "@putgd-enterprise/impl/factories/SlugConvertingPermalinkUrlFactoryImpl";
import { ConfigurableIntersectionObserverOptionsProviderImpl } from "@putgd-enterprise/impl/providers/ConfigurableIntersectionObserverOptionsProviderImpl";
import { PageType } from "@putgd-enterprise/model/PageType";
import { ReleaseChannel } from "@putgd-enterprise/model/ReleaseChannel";
import { SectionType } from "@putgd-enterprise/model/SectionType";
import { LandingPageComponent } from "@putgd-enterprise/presentation/components/pages/LandingPageComponent";
import { NotFoundPageComponent } from "@putgd-enterprise/presentation/components/pages/NotFoundPageComponent";
import { DetailsSectionComponent } from "@putgd-enterprise/presentation/components/sections/details/DetailsSectionComponent";
import { HeroSectionComponent } from "@putgd-enterprise/presentation/components/sections/hero/HeroSectionComponent";
import { InstallSectionComponent } from "@putgd-enterprise/presentation/components/sections/install/InstallSectionComponent";
import { PipelineSectionComponent } from "@putgd-enterprise/presentation/components/sections/pipeline/PipelineSectionComponent";
import { ScriptSectionComponent } from "@putgd-enterprise/presentation/components/sections/script/ScriptSectionComponent";
import { FakeIntersectionObserver } from "../../support/FakeIntersectionObserver";

describe("SlugConvertingPermalinkUrlFactoryImpl", () => {
  const permalinkUrlFactory = new SlugConvertingPermalinkUrlFactoryImpl(
    "https://app.put.gd/dl",
    new AppImageAwareReleaseAssetMatchKeyToPermalinkSlugConverterImpl(".AppImage", "appimage"),
    "checksums",
  );

  it.each([
    [ReleaseChannel.STABLE, "ubuntu24.04", "https://app.put.gd/dl/stable/ubuntu24.04"],
    [ReleaseChannel.NIGHTLY, "fedora44", "https://app.put.gd/dl/nightly/fedora44"],
    [ReleaseChannel.STABLE, ".AppImage", "https://app.put.gd/dl/stable/appimage"],
  ])("builds the %s permalink for %s", (releaseChannel, releaseAssetMatchKey, expectedPermalinkUrl) => {
    expect(permalinkUrlFactory.createPackagePermalinkUrl(releaseChannel, releaseAssetMatchKey)).toBe(expectedPermalinkUrl);
  });

  it("builds the checksums permalink", () => {
    expect(permalinkUrlFactory.createChecksumsPermalinkUrl(ReleaseChannel.NIGHTLY)).toBe("https://app.put.gd/dl/nightly/checksums");
  });
});

describe("OptionsProviderBackedIntersectionObserverFactoryImpl", () => {
  it("creates observers with the provided options", () => {
    const intersectionObserver = new OptionsProviderBackedIntersectionObserverFactoryImpl(
      new ConfigurableIntersectionObserverOptionsProviderImpl("0px 0px -12% 0px", 0.15),
    ).createIntersectionObserver(() => undefined);
    expect(intersectionObserver).toBeInstanceOf(FakeIntersectionObserver);
    expect(intersectionObserver.rootMargin).toBe("0px 0px -12% 0px");
    expect(intersectionObserver.thresholds).toEqual([0.15]);
  });
});

describe("EnumMappingSectionComponentFactoryImpl", () => {
  it.each([
    [SectionType.HERO, HeroSectionComponent],
    [SectionType.PIPELINE, PipelineSectionComponent],
    [SectionType.SCRIPT, ScriptSectionComponent],
    [SectionType.INSTALL, InstallSectionComponent],
    [SectionType.DETAILS, DetailsSectionComponent],
  ])("maps %s to its component", (sectionType, expectedSectionComponent) => {
    expect(new EnumMappingSectionComponentFactoryImpl().createSectionComponent(sectionType)).toBe(expectedSectionComponent);
  });
});

describe("EnumMappingPageComponentFactoryImpl", () => {
  it.each([
    [PageType.LANDING_PAGE, LandingPageComponent],
    [PageType.NOT_FOUND_PAGE, NotFoundPageComponent],
  ])("maps %s to its component", (pageType, expectedPageComponent) => {
    expect(new EnumMappingPageComponentFactoryImpl().createPageComponent(pageType)).toBe(expectedPageComponent);
  });
});
