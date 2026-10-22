import type { ReleaseLineViewModel } from "../../../../model/ReleaseLineViewModel";

export interface ReleaseLineComponentProperties {
  readonly releaseLineViewModel: ReleaseLineViewModel;
}

export function ReleaseLineComponent(releaseLineComponentProperties: ReleaseLineComponentProperties) {
  const { releaseLineViewModel } = releaseLineComponentProperties;
  switch (releaseLineViewModel.releaseLineVariant) {
    case "INITIAL_STATIC_RELEASE_LINE":
      return (
        <p id="releaseLine">
          x86_64 packages for each supported release are on the{" "}
          <a href={releaseLineViewModel.releasesPageHref}>releases page</a>, with <code>SHA256SUMS</code> and build
          receipts next to them.
        </p>
      );
    case "CHANNEL_HAS_NO_RELEASE":
      return (
        <p id="releaseLine">
          Packages are on the <a href={releaseLineViewModel.releasesPageHref}>releases page</a>, with{" "}
          <code>SHA256SUMS</code> and build receipts next to them.
        </p>
      );
    case "CHANNEL_HAS_RELEASE":
      return (
        <p id="releaseLine">
          {releaseLineViewModel.releaseChannelDisplayName}{" "}
          <a href={releaseLineViewModel.releasePageHref}>{releaseLineViewModel.releaseTag}</a>, published{" "}
          {releaseLineViewModel.formattedPublicationDate}. Every file, the build receipts
          {releaseLineViewModel.checksumsPermalinkHref !== null && (
            <>
              {" and "}
              <a href={releaseLineViewModel.checksumsPermalinkHref}>SHA256SUMS</a>
            </>
          )}{" "}
          are on the release page.
        </p>
      );
  }
}
