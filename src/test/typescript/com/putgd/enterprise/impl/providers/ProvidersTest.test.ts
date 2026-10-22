import { describe, expect, it } from "vitest";
import { createProductionEnterpriseApplicationContext } from "../../support/EnterpriseTestApplicationContextFactory";
import { ConfigurableDurationProviderImpl } from "@putgd-enterprise/impl/providers/ConfigurableDurationProviderImpl";
import { ConfigurableIntersectionObserverOptionsProviderImpl } from "@putgd-enterprise/impl/providers/ConfigurableIntersectionObserverOptionsProviderImpl";
import { EnumMappingReleaseChannelDisplayNameProviderImpl } from "@putgd-enterprise/impl/providers/EnumMappingReleaseChannelDisplayNameProviderImpl";
import { ReleaseAvailabilityAwareChannelNoteMessageProviderImpl } from "@putgd-enterprise/impl/providers/ReleaseAvailabilityAwareChannelNoteMessageProviderImpl";
import type { ReleaseLineViewModelProvider } from "@putgd-enterprise/interfaces/providers/ReleaseLineViewModelProvider";
import { ReleaseChannel } from "@putgd-enterprise/model/ReleaseChannel";
import {
  formatPublicationDateTheWayTheUserLocaleWould,
  NIGHTLY_RELEASE_WITH_ONLY_FEDORA_AND_NO_CHECKSUMS,
  STABLE_RELEASE_WITH_EVERY_PACKAGE,
} from "../../support/ReleaseManifestTestFixtures";

const RELEASES_PAGE_URL = "https://github.com/patrick-hudson/put.gd-desktop/releases";

describe("ConfigurableDurationProviderImpl", () => {
  it("provides the configured duration", () => {
    expect(new ConfigurableDurationProviderImpl(1800).provideDurationInMilliseconds()).toBe(1800);
  });
});

describe("ConfigurableIntersectionObserverOptionsProviderImpl", () => {
  it("provides the configured root margin and threshold", () => {
    expect(
      new ConfigurableIntersectionObserverOptionsProviderImpl("0px 0px -12% 0px", 0.15).provideIntersectionObserverOptions(),
    ).toEqual({ rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
  });
});

describe("EnumMappingReleaseChannelDisplayNameProviderImpl", () => {
  const releaseChannelDisplayNameProvider = new EnumMappingReleaseChannelDisplayNameProviderImpl("Stable", "Nightly");

  it.each([
    [ReleaseChannel.STABLE, "Stable"],
    [ReleaseChannel.NIGHTLY, "Nightly"],
  ])("names %s '%s'", (releaseChannel, expectedDisplayName) => {
    expect(releaseChannelDisplayNameProvider.provideReleaseChannelDisplayName(releaseChannel)).toBe(expectedDisplayName);
  });
});

describe("ReleaseAvailabilityAwareChannelNoteMessageProviderImpl", () => {
  const channelNoteMessageProvider = new ReleaseAvailabilityAwareChannelNoteMessageProviderImpl(
    "no stable",
    "no nightly",
    "nightly disclaimer",
  );

  it("explains a missing stable release", () => {
    expect(channelNoteMessageProvider.provideChannelNoteMessage(ReleaseChannel.STABLE, null)).toBe("no stable");
  });

  it("explains a missing nightly release", () => {
    expect(channelNoteMessageProvider.provideChannelNoteMessage(ReleaseChannel.NIGHTLY, null)).toBe("no nightly");
  });

  it("warns that nightlies are not desktop-certified", () => {
    expect(
      channelNoteMessageProvider.provideChannelNoteMessage(ReleaseChannel.NIGHTLY, NIGHTLY_RELEASE_WITH_ONLY_FEDORA_AND_NO_CHECKSUMS),
    ).toBe("nightly disclaimer");
  });

  it("says nothing about a stable release", () => {
    expect(channelNoteMessageProvider.provideChannelNoteMessage(ReleaseChannel.STABLE, STABLE_RELEASE_WITH_EVERY_PACKAGE)).toBeNull();
  });
});

describe("DefaultReleaseLineViewModelProviderImpl", () => {
  const releaseLineViewModelProvider = createProductionEnterpriseApplicationContext().getBean<ReleaseLineViewModelProvider>(
    "releaseLineViewModelProvider",
  );

  it("points at the releases page before the manifest arrives", () => {
    expect(
      releaseLineViewModelProvider.provideReleaseLineViewModel({ releaseManifestAvailability: "RELEASE_MANIFEST_NOT_YET_AVAILABLE" }),
    ).toEqual({ releaseLineVariant: "INITIAL_STATIC_RELEASE_LINE", releasesPageHref: RELEASES_PAGE_URL });
  });

  it("points at the releases page when the selected channel is empty", () => {
    expect(
      releaseLineViewModelProvider.provideReleaseLineViewModel({
        releaseManifestAvailability: "RELEASE_MANIFEST_AVAILABLE",
        selectedReleaseChannel: ReleaseChannel.STABLE,
        selectedRelease: null,
      }),
    ).toEqual({ releaseLineVariant: "CHANNEL_HAS_NO_RELEASE", releasesPageHref: RELEASES_PAGE_URL });
  });

  it("describes a release with checksums", () => {
    expect(
      releaseLineViewModelProvider.provideReleaseLineViewModel({
        releaseManifestAvailability: "RELEASE_MANIFEST_AVAILABLE",
        selectedReleaseChannel: ReleaseChannel.STABLE,
        selectedRelease: STABLE_RELEASE_WITH_EVERY_PACKAGE,
      }),
    ).toEqual({
      releaseLineVariant: "CHANNEL_HAS_RELEASE",
      releaseChannelDisplayName: "Stable",
      releaseTag: "v1.0.0",
      releasePageHref: STABLE_RELEASE_WITH_EVERY_PACKAGE.html_url,
      formattedPublicationDate: formatPublicationDateTheWayTheUserLocaleWould(STABLE_RELEASE_WITH_EVERY_PACKAGE.published_at),
      checksumsPermalinkHref: "https://app.put.gd/dl/stable/checksums",
    });
  });

  it("leaves out the checksums link when the release has no SHA256SUMS", () => {
    const releaseLineViewModel = releaseLineViewModelProvider.provideReleaseLineViewModel({
      releaseManifestAvailability: "RELEASE_MANIFEST_AVAILABLE",
      selectedReleaseChannel: ReleaseChannel.NIGHTLY,
      selectedRelease: NIGHTLY_RELEASE_WITH_ONLY_FEDORA_AND_NO_CHECKSUMS,
    });
    expect(releaseLineViewModel).toMatchObject({ releaseChannelDisplayName: "Nightly", checksumsPermalinkHref: null });
  });
});
