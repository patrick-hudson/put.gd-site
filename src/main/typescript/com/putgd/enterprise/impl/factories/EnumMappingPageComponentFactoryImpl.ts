import type { ComponentType } from "react";
import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { PageComponentFactory } from "../../interfaces/factories/PageComponentFactory";
import { PageType } from "../../model/PageType";
import { LandingPageComponent } from "../../presentation/components/pages/LandingPageComponent";
import { NotFoundPageComponent } from "../../presentation/components/pages/NotFoundPageComponent";

@EnterpriseBean("com.putgd.enterprise.impl.factories.EnumMappingPageComponentFactoryImpl")
export class EnumMappingPageComponentFactoryImpl implements PageComponentFactory {
  public createPageComponent(pageType: PageType): ComponentType {
    switch (pageType) {
      case PageType.LANDING_PAGE:
        return LandingPageComponent;
      case PageType.NOT_FOUND_PAGE:
        return NotFoundPageComponent;
    }
  }
}
