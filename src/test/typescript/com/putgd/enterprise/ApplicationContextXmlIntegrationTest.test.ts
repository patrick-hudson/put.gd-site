import { describe, expect, it } from "vitest";
import { XmlBeanDefinitionReaderImpl } from "@putgd-enterprise/framework/ioc/definitions/XmlBeanDefinitionReaderImpl";
import {
  applicationContextXmlDocumentSource,
  createProductionEnterpriseApplicationContext,
} from "./support/EnterpriseTestApplicationContextFactory";

const productionBeanDefinitions = new XmlBeanDefinitionReaderImpl(applicationContextXmlDocumentSource).readBeanDefinitions();

describe("applicationContext.xml", () => {
  it("defines every bean id only once", () => {
    const beanIdentifiers = productionBeanDefinitions.map((beanDefinition) => beanDefinition.beanIdentifier);
    expect(new Set(beanIdentifiers).size).toBe(beanIdentifiers.length);
  });

  it("only references beans that are defined", () => {
    const definedBeanIdentifiers = new Set(productionBeanDefinitions.map((beanDefinition) => beanDefinition.beanIdentifier));
    for (const beanDefinition of productionBeanDefinitions) {
      for (const constructorArgumentDefinition of beanDefinition.constructorArgumentDefinitions) {
        if (constructorArgumentDefinition.constructorArgumentKind === "BEAN_REFERENCE") {
          expect(definedBeanIdentifiers, `${beanDefinition.beanIdentifier} references it`).toContain(
            constructorArgumentDefinition.referencedBeanIdentifier,
          );
        }
      }
    }
  });

  it.each(productionBeanDefinitions.map((beanDefinition) => [beanDefinition.beanIdentifier, beanDefinition.fullyQualifiedClassName]))(
    "instantiates %s as %s",
    (beanIdentifier, fullyQualifiedClassName) => {
      const instantiatedBean = createProductionEnterpriseApplicationContext().getBean<object>(beanIdentifier);
      expect(instantiatedBean.constructor.name).toBe(fullyQualifiedClassName.split(".").at(-1));
    },
  );

  it("registers bean classes under a fully qualified name that matches their package", () => {
    for (const beanDefinition of productionBeanDefinitions) {
      expect(beanDefinition.fullyQualifiedClassName).toMatch(/^com\.putgd\.enterprise\.impl\.[a-z]+\.[A-Za-z]+Impl$/);
    }
  });
});
