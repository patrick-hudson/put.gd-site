import type { ReleaseChannel } from "./ReleaseChannel";

export interface ReleaseAsset {
  readonly name: string;
  readonly url: string;
  readonly size: number;
}

export interface Release {
  readonly tag: string;
  readonly html_url: string;
  readonly published_at: string;
  readonly checksums: string | null;
  readonly assets: Readonly<Record<string, ReleaseAsset>>;
}

export type ReleaseManifest = Readonly<Record<ReleaseChannel, Release | null>>;
