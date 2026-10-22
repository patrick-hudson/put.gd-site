import type { PageType } from "../../model/PageType";

export interface PageResolutionStrategy {
  resolvePageType(requestedPathname: string): PageType;
}
