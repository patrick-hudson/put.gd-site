export type ReleaseLineViewModel =
  | { readonly releaseLineVariant: "INITIAL_STATIC_RELEASE_LINE"; readonly releasesPageHref: string }
  | { readonly releaseLineVariant: "CHANNEL_HAS_NO_RELEASE"; readonly releasesPageHref: string }
  | {
      readonly releaseLineVariant: "CHANNEL_HAS_RELEASE";
      readonly releaseChannelDisplayName: string;
      readonly releaseTag: string;
      readonly releasePageHref: string;
      readonly formattedPublicationDate: string;
      readonly checksumsPermalinkHref: string | null;
    };
