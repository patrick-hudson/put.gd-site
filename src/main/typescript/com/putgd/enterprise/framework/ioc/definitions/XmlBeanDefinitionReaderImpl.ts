import { BeanDefinitionParsingException } from "../exceptions/BeanDefinitionParsingException";
import type { BeanDefinition } from "./BeanDefinition";
import type { BeanDefinitionReader } from "./BeanDefinitionReader";
import type { ConstructorArgumentDefinition } from "./ConstructorArgumentDefinition";

export class XmlBeanDefinitionReaderImpl implements BeanDefinitionReader {
  public constructor(private readonly applicationContextXmlDocumentSource: string) {}

  public readBeanDefinitions(): readonly BeanDefinition[] {
    const parsedApplicationContextDocument = new DOMParser().parseFromString(
      this.applicationContextXmlDocumentSource,
      "application/xml",
    );
    const xmlParserErrorElement = parsedApplicationContextDocument.querySelector("parsererror");
    if (xmlParserErrorElement !== null) {
      throw new BeanDefinitionParsingException(xmlParserErrorElement.textContent ?? "unknown XML error");
    }
    return Array.from(parsedApplicationContextDocument.documentElement.children)
      .filter((childElement) => childElement.tagName === "bean")
      .map((beanElement) => this.convertBeanElementToBeanDefinition(beanElement));
  }

  private convertBeanElementToBeanDefinition(beanElement: Element): BeanDefinition {
    return {
      beanIdentifier: this.getRequiredAttribute(beanElement, "id"),
      fullyQualifiedClassName: this.getRequiredAttribute(beanElement, "class"),
      constructorArgumentDefinitions: Array.from(beanElement.children)
        .filter((childElement) => childElement.tagName === "constructor-arg")
        .map((constructorArgumentElement) => this.convertConstructorArgumentElement(constructorArgumentElement)),
    };
  }

  private convertConstructorArgumentElement(constructorArgumentElement: Element): ConstructorArgumentDefinition {
    const referencedBeanIdentifier = constructorArgumentElement.getAttribute("ref");
    if (referencedBeanIdentifier !== null) {
      return { constructorArgumentKind: "BEAN_REFERENCE", referencedBeanIdentifier };
    }
    const literalValue = constructorArgumentElement.getAttribute("value");
    if (literalValue !== null) {
      if (constructorArgumentElement.getAttribute("type") === "number") {
        return { constructorArgumentKind: "NUMERIC_LITERAL_VALUE", literalValue: Number(literalValue) };
      }
      return { constructorArgumentKind: "STRING_LITERAL_VALUE", literalValue };
    }
    const listElement = constructorArgumentElement.querySelector(":scope > list");
    if (listElement !== null) {
      const listItemElements = Array.from(listElement.children);
      if (listItemElements.every((listItemElement) => listItemElement.tagName === "ref")) {
        return {
          constructorArgumentKind: "BEAN_REFERENCE_LIST",
          referencedBeanIdentifiers: listItemElements.map((refElement) => this.getRequiredAttribute(refElement, "bean")),
        };
      }
      return {
        constructorArgumentKind: "STRING_LITERAL_VALUE_LIST",
        literalValues: listItemElements.map((valueElement) => valueElement.textContent ?? ""),
      };
    }
    throw new BeanDefinitionParsingException("a <constructor-arg> needs ref, value or a nested <list>");
  }

  private getRequiredAttribute(element: Element, attributeName: string): string {
    const attributeValue = element.getAttribute(attributeName);
    if (attributeValue === null) {
      throw new BeanDefinitionParsingException(`<${element.tagName}> is missing its '${attributeName}' attribute`);
    }
    return attributeValue;
  }
}
