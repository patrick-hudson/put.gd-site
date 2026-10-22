import type { ComponentType } from "react";
import type { SectionType } from "../../model/SectionType";

export interface SectionComponentFactory {
  createSectionComponent(sectionType: SectionType): ComponentType;
}
