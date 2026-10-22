import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { PermalinkUrlFactory } from "../../interfaces/factories/PermalinkUrlFactory";
import type { Formatter } from "../../interfaces/formatters/Formatter";
import type { ReleaseChannelDisplayNameProvider } from "../../interfaces/providers/ReleaseChannelDisplayNameProvider";
import type { ReleaseLineViewModelProvider } from "../../interfaces/providers/ReleaseLineViewModelProvider";
import type { ExternalUrlResolver } from "../../interfaces/resolvers/ExternalUrlResolver";
import type { PackageRowVisitationContext } from "../../model/PackageRowVisitationContext";
import type { ReleaseLineViewModel } from "../../model/ReleaseLineViewModel";

@EnterpriseBean("com.putgd.enterprise.impl.providers.DefaultReleaseLineViewModelProviderImpl")
export class DefaultReleaseLineViewModelProviderImpl implements ReleaseLineViewModelProvider {
  public constructor(
    private readonly permalinkUrlFactory: PermalinkUrlFactory,
    private readonly publicationDateFormatter: Formatter<string>,
    private readonly releaseChannelDisplayNameProvider: ReleaseChannelDisplayNameProvider,
    private readonly externalUrlResolver: ExternalUrlResolver,
  ) {}

  public provideReleaseLineViewModel(packageRowVisitationContext: PackageRowVisitationContext): ReleaseLineViewModel {
    const releasesPageHref = this.externalUrlResolver.resolveExternalUrl("RELEASES_PAGE");
    if (packageRowVisitationContext.releaseManifestAvailability === "RELEASE_MANIFEST_NOT_YET_AVAILABLE") {
      return { releaseLineVariant: "INITIAL_STATIC_RELEASE_LINE", releasesPageHref };
    }
    const { selectedReleaseChannel, selectedRelease } = packageRowVisitationContext;
    if (selectedRelease === null) {
      return { releaseLineVariant: "CHANNEL_HAS_NO_RELEASE", releasesPageHref };
    }
    return {
      releaseLineVariant: "CHANNEL_HAS_RELEASE",
      releaseChannelDisplayName: this.releaseChannelDisplayNameProvider.provideReleaseChannelDisplayName(selectedReleaseChannel),
      releaseTag: selectedRelease.tag,
      releasePageHref: selectedRelease.html_url,
      formattedPublicationDate: this.publicationDateFormatter.format(selectedRelease.published_at),
      checksumsPermalinkHref: selectedRelease.checksums
        ? this.permalinkUrlFactory.createChecksumsPermalinkUrl(selectedReleaseChannel)
        : null,
    };
  }
}
