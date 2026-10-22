import type { ComponentType } from "react";
import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { SectionComponentFactory } from "../../interfaces/factories/SectionComponentFactory";
import { SectionType } from "../../model/SectionType";
import { DetailsSectionComponent } from "../../presentation/components/sections/details/DetailsSectionComponent";
import { HeroSectionComponent } from "../../presentation/components/sections/hero/HeroSectionComponent";
import { InstallSectionComponent } from "../../presentation/components/sections/install/InstallSectionComponent";
import { PipelineSectionComponent } from "../../presentation/components/sections/pipeline/PipelineSectionComponent";
import { ScriptSectionComponent } from "../../presentation/components/sections/script/ScriptSectionComponent";

@EnterpriseBean("com.putgd.enterprise.impl.factories.EnumMappingSectionComponentFactoryImpl")
export class EnumMappingSectionComponentFactoryImpl implements SectionComponentFactory {
  public createSectionComponent(sectionType: SectionType): ComponentType {
    switch (sectionType) {
      case SectionType.HERO:
        return HeroSectionComponent;
      case SectionType.PIPELINE:
        return PipelineSectionComponent;
      case SectionType.SCRIPT:
        return ScriptSectionComponent;
      case SectionType.INSTALL:
        return InstallSectionComponent;
      case SectionType.DETAILS:
        return DetailsSectionComponent;
    }
  }
}
