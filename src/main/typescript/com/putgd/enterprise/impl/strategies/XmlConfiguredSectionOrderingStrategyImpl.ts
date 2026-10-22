import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { SectionOrderingStrategy } from "../../interfaces/strategies/SectionOrderingStrategy";
import { SectionType } from "../../model/SectionType";

@EnterpriseBean("com.putgd.enterprise.impl.strategies.XmlConfiguredSectionOrderingStrategyImpl")
export class XmlConfiguredSectionOrderingStrategyImpl implements SectionOrderingStrategy {
  private readonly orderedSectionTypes: readonly SectionType[];

  public constructor(configuredSectionTypeNames: readonly string[]) {
    const knownSectionTypes: readonly string[] = Object.values(SectionType);
    this.orderedSectionTypes = configuredSectionTypeNames
      .map((configuredSectionTypeName) => configuredSectionTypeName.trim())
      .filter((configuredSectionTypeName): configuredSectionTypeName is SectionType =>
        knownSectionTypes.includes(configuredSectionTypeName),
      );
  }

  public getOrderedSectionTypes(): readonly SectionType[] {
    return this.orderedSectionTypes;
  }
}
