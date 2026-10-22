import { render, type RenderResult } from "@testing-library/react";
import type { ReactNode } from "react";
import applicationContextXmlDocumentSource from "@putgd-enterprise-resources/applicationContext.xml?raw";
import type { EnterpriseApplicationContext } from "@putgd-enterprise/framework/ioc/context/EnterpriseApplicationContext";
import { DefaultSingletonEnterpriseApplicationContextImpl } from "@putgd-enterprise/framework/ioc/context/DefaultSingletonEnterpriseApplicationContextImpl";
import { XmlBeanDefinitionReaderImpl } from "@putgd-enterprise/framework/ioc/definitions/XmlBeanDefinitionReaderImpl";
import { EnterpriseApplicationContextProviderComponent } from "@putgd-enterprise/framework/ioc/react/EnterpriseApplicationContextReactBridge";
import { EnterpriseApplicationRootComponent } from "@putgd-enterprise/presentation/components/layout/EnterpriseApplicationRootComponent";

export { applicationContextXmlDocumentSource };

export function createProductionEnterpriseApplicationContext(): EnterpriseApplicationContext {
  return new DefaultSingletonEnterpriseApplicationContextImpl(new XmlBeanDefinitionReaderImpl(applicationContextXmlDocumentSource));
}

export function renderWithinProductionEnterpriseApplicationContext(componentTreeToRender: ReactNode): RenderResult {
  return render(
    <EnterpriseApplicationContextProviderComponent enterpriseApplicationContext={createProductionEnterpriseApplicationContext()}>
      {componentTreeToRender}
    </EnterpriseApplicationContextProviderComponent>,
  );
}

export function renderEnterpriseApplication(): RenderResult {
  return renderWithinProductionEnterpriseApplicationContext(<EnterpriseApplicationRootComponent />);
}
