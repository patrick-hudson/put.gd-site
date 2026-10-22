import type { ComponentType } from "react";
import type { PageType } from "../../model/PageType";

export interface PageComponentFactory {
  createPageComponent(pageType: PageType): ComponentType;
}
