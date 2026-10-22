import { describe, expect, it } from "vitest";
import { EnterpriseBean } from "@putgd-enterprise/framework/ioc/EnterpriseBean";
import { DefaultSingletonEnterpriseApplicationContextImpl } from "@putgd-enterprise/framework/ioc/context/DefaultSingletonEnterpriseApplicationContextImpl";
import { XmlBeanDefinitionReaderImpl } from "@putgd-enterprise/framework/ioc/definitions/XmlBeanDefinitionReaderImpl";
import { BeanCurrentlyInCreationException } from "@putgd-enterprise/framework/ioc/exceptions/BeanCurrentlyInCreationException";
import { NoSuchBeanClassException } from "@putgd-enterprise/framework/ioc/exceptions/NoSuchBeanClassException";
import { NoSuchBeanDefinitionException } from "@putgd-enterprise/framework/ioc/exceptions/NoSuchBeanDefinitionException";

@EnterpriseBean("com.putgd.enterprise.test.ioc.LeafTestBeanImpl")
class LeafTestBeanImpl {
  public static numberOfInstancesCreated = 0;

  public constructor() {
    LeafTestBeanImpl.numberOfInstancesCreated++;
  }
}

@EnterpriseBean("com.putgd.enterprise.test.ioc.CompositeTestBeanImpl")
class CompositeTestBeanImpl {
  public constructor(
    public readonly leafTestBean: LeafTestBeanImpl,
    public readonly configuredLabel: string,
    public readonly configuredCount: number,
    public readonly configuredNames: readonly string[],
    public readonly listedLeafTestBeans: readonly LeafTestBeanImpl[],
  ) {}
}

@EnterpriseBean("com.putgd.enterprise.test.ioc.SelfReferencingTestBeanImpl")
export class SelfReferencingTestBeanImpl {
  public constructor(public readonly collaboratingTestBean: object) {}
}

function createApplicationContextFromXml(beansElementInnerXml: string) {
  return new DefaultSingletonEnterpriseApplicationContextImpl(
    new XmlBeanDefinitionReaderImpl(`<beans>${beansElementInnerXml}</beans>`),
  );
}

const LEAF_BEAN_DEFINITION_XML = `<bean id="leafTestBean" class="com.putgd.enterprise.test.ioc.LeafTestBeanImpl"/>`;

describe("DefaultSingletonEnterpriseApplicationContextImpl", () => {
  it("instantiates a registered bean class", () => {
    const applicationContext = createApplicationContextFromXml(LEAF_BEAN_DEFINITION_XML);
    expect(applicationContext.getBean("leafTestBean")).toBeInstanceOf(LeafTestBeanImpl);
  });

  it("returns the same singleton instance on every request and creates it lazily", () => {
    const instancesCreatedBeforeContextStarted = LeafTestBeanImpl.numberOfInstancesCreated;
    const applicationContext = createApplicationContextFromXml(LEAF_BEAN_DEFINITION_XML);
    expect(LeafTestBeanImpl.numberOfInstancesCreated).toBe(instancesCreatedBeforeContextStarted);
    const firstRequestedInstance = applicationContext.getBean("leafTestBean");
    const secondRequestedInstance = applicationContext.getBean("leafTestBean");
    expect(secondRequestedInstance).toBe(firstRequestedInstance);
    expect(LeafTestBeanImpl.numberOfInstancesCreated).toBe(instancesCreatedBeforeContextStarted + 1);
  });

  it("injects references, values, numbers and lists through the constructor", () => {
    const applicationContext = createApplicationContextFromXml(`
      ${LEAF_BEAN_DEFINITION_XML}
      <bean id="compositeTestBean" class="com.putgd.enterprise.test.ioc.CompositeTestBeanImpl">
        <constructor-arg ref="leafTestBean"/>
        <constructor-arg value="configured label"/>
        <constructor-arg value="42" type="number"/>
        <constructor-arg><list><value>first</value><value>second</value></list></constructor-arg>
        <constructor-arg><list><ref bean="leafTestBean"/><ref bean="leafTestBean"/></list></constructor-arg>
      </bean>`);
    const compositeTestBean = applicationContext.getBean<CompositeTestBeanImpl>("compositeTestBean");
    const leafTestBean = applicationContext.getBean<LeafTestBeanImpl>("leafTestBean");
    expect(compositeTestBean.leafTestBean).toBe(leafTestBean);
    expect(compositeTestBean.configuredLabel).toBe("configured label");
    expect(compositeTestBean.configuredCount).toBe(42);
    expect(compositeTestBean.configuredNames).toEqual(["first", "second"]);
    expect(compositeTestBean.listedLeafTestBeans).toEqual([leafTestBean, leafTestBean]);
  });

  it("reports whether a bean definition exists", () => {
    const applicationContext = createApplicationContextFromXml(LEAF_BEAN_DEFINITION_XML);
    expect(applicationContext.containsBeanDefinition("leafTestBean")).toBe(true);
    expect(applicationContext.containsBeanDefinition("missingTestBean")).toBe(false);
  });

  it("throws for an undefined bean", () => {
    expect(() => createApplicationContextFromXml("").getBean("missingTestBean")).toThrow(NoSuchBeanDefinitionException);
  });

  it("throws for a bean whose class was never registered", () => {
    const applicationContext = createApplicationContextFromXml(`<bean id="ghostBean" class="com.example.NeverRegisteredImpl"/>`);
    expect(() => applicationContext.getBean("ghostBean")).toThrow(NoSuchBeanClassException);
  });

  it("detects a circular reference and names the whole path", () => {
    const applicationContext = createApplicationContextFromXml(`
      <bean id="firstSelfReferencingBean" class="com.putgd.enterprise.test.ioc.SelfReferencingTestBeanImpl">
        <constructor-arg ref="secondSelfReferencingBean"/>
      </bean>
      <bean id="secondSelfReferencingBean" class="com.putgd.enterprise.test.ioc.SelfReferencingTestBeanImpl">
        <constructor-arg ref="firstSelfReferencingBean"/>
      </bean>`);
    expect(() => applicationContext.getBean("firstSelfReferencingBean")).toThrow(BeanCurrentlyInCreationException);
    expect(() => applicationContext.getBean("firstSelfReferencingBean")).toThrow(
      "firstSelfReferencingBean -> secondSelfReferencingBean -> firstSelfReferencingBean",
    );
  });

  it("can still create other beans after a failed creation", () => {
    const applicationContext = createApplicationContextFromXml(`
      ${LEAF_BEAN_DEFINITION_XML}
      <bean id="selfReferencingBean" class="com.putgd.enterprise.test.ioc.SelfReferencingTestBeanImpl">
        <constructor-arg ref="selfReferencingBean"/>
      </bean>`);
    expect(() => applicationContext.getBean("selfReferencingBean")).toThrow(BeanCurrentlyInCreationException);
    expect(applicationContext.getBean("leafTestBean")).toBeInstanceOf(LeafTestBeanImpl);
  });
});
