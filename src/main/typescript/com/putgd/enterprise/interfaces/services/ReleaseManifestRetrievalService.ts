import type { ReleaseManifest } from "../../model/ReleaseManifest";

export interface ReleaseManifestRetrievalService {
  retrieveReleaseManifest(): Promise<ReleaseManifest>;
}
