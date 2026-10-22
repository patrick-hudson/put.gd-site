export interface ExternalUrlResolver {
  resolveExternalUrl(externalUrlKey: string): string;
}
