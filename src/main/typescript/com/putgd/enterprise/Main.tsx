import "./ComponentScan";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import applicationContextXmlDocumentSource from "../../../../resources/applicationContext.xml?raw";
import { DefaultSingletonEnterpriseApplicationContextImpl } from "./framework/ioc/context/DefaultSingletonEnterpriseApplicationContextImpl";
import { XmlBeanDefinitionReaderImpl } from "./framework/ioc/definitions/XmlBeanDefinitionReaderImpl";
import { EnterpriseApplicationContextProviderComponent } from "./framework/ioc/react/EnterpriseApplicationContextReactBridge";
import { EnterpriseApplicationRootComponent } from "./presentation/components/layout/EnterpriseApplicationRootComponent";

const ENTERPRISE_APPLICATION_MOUNT_POINT_ELEMENT_IDENTIFIER = "enterprise-application-mount-point";

const enterpriseApplicationContext = new DefaultSingletonEnterpriseApplicationContextImpl(
  new XmlBeanDefinitionReaderImpl(applicationContextXmlDocumentSource),
);

createRoot(document.getElementById(ENTERPRISE_APPLICATION_MOUNT_POINT_ELEMENT_IDENTIFIER)!).render(
  <StrictMode>
    <EnterpriseApplicationContextProviderComponent enterpriseApplicationContext={enterpriseApplicationContext}>
      <EnterpriseApplicationRootComponent />
    </EnterpriseApplicationContextProviderComponent>
  </StrictMode>,
);
