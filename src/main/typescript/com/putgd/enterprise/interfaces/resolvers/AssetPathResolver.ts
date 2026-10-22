export interface AssetPathResolver {
  resolveAssetPath(relativeAssetPath: string): string;
}
