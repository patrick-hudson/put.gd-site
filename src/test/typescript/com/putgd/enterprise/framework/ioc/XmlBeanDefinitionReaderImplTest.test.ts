import { describe, expect, it } from "vitest";
import { XmlBeanDefinitionReaderImpl } from "@putgd-enterprise/framework/ioc/definitions/XmlBeanDefinitionReaderImpl";
import { BeanDefinitionParsingException } from "@putgd-enterprise/framework/ioc/exceptions/BeanDefinitionParsingException";

function readBeanDefinitionsFromXml(beansElementInnerXml: string) {
  return new XmlBeanDefinitionReaderImpl(`<?xml version="1.0"?><beans>${beansElementInnerXml}</beans>`).readBeanDefinitions();
}

describe("XmlBeanDefinitionReaderImpl", () => {
  it("reads a bean with no constructor arguments", () => {
    expect(readBeanDefinitionsFromXml(`<bean id="leafBean" class="com.example.LeafBeanImpl"/>`)).toEqual([
      { beanIdentifier: "leafBean", fullyQualifiedClassName: "com.example.LeafBeanImpl", constructorArgumentDefinitions: [] },
    ]);
  });

  it("reads bean references, string values and numeric values in declaration order", () => {
    const [beanDefinition] = readBeanDefinitionsFromXml(`
      <bean id="compositeBean" class="com.example.CompositeBeanImpl">
        <constructor-arg ref="leafBean"/>
        <constructor-arg value=" &#215; "/>
        <constructor-arg value="0.32" type="number"/>
      </bean>`);
    expect(beanDefinition.constructorArgumentDefinitions).toEqual([
      { constructorArgumentKind: "BEAN_REFERENCE", referencedBeanIdentifier: "leafBean" },
      { constructorArgumentKind: "STRING_LITERAL_VALUE", literalValue: " × " },
      { constructorArgumentKind: "NUMERIC_LITERAL_VALUE", literalValue: 0.32 },
    ]);
  });

  it("reads a list of string values", () => {
    const [beanDefinition] = readBeanDefinitionsFromXml(`
      <bean id="listBean" class="com.example.ListBeanImpl">
        <constructor-arg><list><value>HERO</value><value>DETAILS</value></list></constructor-arg>
      </bean>`);
    expect(beanDefinition.constructorArgumentDefinitions).toEqual([
      { constructorArgumentKind: "STRING_LITERAL_VALUE_LIST", literalValues: ["HERO", "DETAILS"] },
    ]);
  });

  it("reads a list of bean references", () => {
    const [beanDefinition] = readBeanDefinitionsFromXml(`
      <bean id="listBean" class="com.example.ListBeanImpl">
        <constructor-arg><list><ref bean="firstBean"/><ref bean="secondBean"/></list></constructor-arg>
      </bean>`);
    expect(beanDefinition.constructorArgumentDefinitions).toEqual([
      { constructorArgumentKind: "BEAN_REFERENCE_LIST", referencedBeanIdentifiers: ["firstBean", "secondBean"] },
    ]);
  });

  it("ignores comments and elements that are not beans", () => {
    expect(readBeanDefinitionsFromXml(`<!-- a comment --><description>ignored</description>`)).toEqual([]);
  });

  it("rejects malformed XML", () => {
    expect(() => readBeanDefinitionsFromXml(`<bean id="unclosed">`)).toThrow(BeanDefinitionParsingException);
  });

  it("rejects a bean without an id", () => {
    expect(() => readBeanDefinitionsFromXml(`<bean class="com.example.AnonymousBeanImpl"/>`)).toThrow(/'id'/);
  });

  it("rejects a bean without a class", () => {
    expect(() => readBeanDefinitionsFromXml(`<bean id="classlessBean"/>`)).toThrow(/'class'/);
  });

  it("rejects a constructor argument with neither ref, value nor list", () => {
    expect(() =>
      readBeanDefinitionsFromXml(`<bean id="emptyArgumentBean" class="com.example.Impl"><constructor-arg/></bean>`),
    ).toThrow(/needs ref, value or a nested <list>/);
  });

  it("rejects a list reference without a bean attribute", () => {
    expect(() =>
      readBeanDefinitionsFromXml(
        `<bean id="brokenListBean" class="com.example.Impl"><constructor-arg><list><ref/></list></constructor-arg></bean>`,
      ),
    ).toThrow(/'bean'/);
  });
});
