import type { SectionType } from "../../model/SectionType";

export interface SectionOrderingStrategy {
  getOrderedSectionTypes(): readonly SectionType[];
}
