import { BeanClassRegistry } from "../BeanClassRegistry";
import type { BeanDefinition } from "../definitions/BeanDefinition";
import type { BeanDefinitionReader } from "../definitions/BeanDefinitionReader";
import type { ConstructorArgumentDefinition } from "../definitions/ConstructorArgumentDefinition";
import { BeanCurrentlyInCreationException } from "../exceptions/BeanCurrentlyInCreationException";
import { NoSuchBeanDefinitionException } from "../exceptions/NoSuchBeanDefinitionException";
import type { EnterpriseApplicationContext } from "./EnterpriseApplicationContext";

export class DefaultSingletonEnterpriseApplicationContextImpl implements EnterpriseApplicationContext {
  private readonly beanDefinitionsByBeanIdentifier = new Map<string, BeanDefinition>();
  private readonly singletonBeanInstancesByBeanIdentifier = new Map<string, object>();
  private readonly beanIdentifiersCurrentlyInCreation: string[] = [];

  public constructor(
    beanDefinitionReader: BeanDefinitionReader,
    private readonly beanClassRegistry: BeanClassRegistry = BeanClassRegistry.getInstance(),
  ) {
    for (const beanDefinition of beanDefinitionReader.readBeanDefinitions()) {
      this.beanDefinitionsByBeanIdentifier.set(beanDefinition.beanIdentifier, beanDefinition);
    }
  }

  public containsBeanDefinition(beanIdentifier: string): boolean {
    return this.beanDefinitionsByBeanIdentifier.has(beanIdentifier);
  }

  public getBean<TBean>(beanIdentifier: string): TBean {
    const existingSingletonBeanInstance = this.singletonBeanInstancesByBeanIdentifier.get(beanIdentifier);
    if (existingSingletonBeanInstance !== undefined) {
      return existingSingletonBeanInstance as TBean;
    }
    const beanDefinition = this.beanDefinitionsByBeanIdentifier.get(beanIdentifier);
    if (beanDefinition === undefined) {
      throw new NoSuchBeanDefinitionException(beanIdentifier);
    }
    if (this.beanIdentifiersCurrentlyInCreation.includes(beanIdentifier)) {
      throw new BeanCurrentlyInCreationException([...this.beanIdentifiersCurrentlyInCreation, beanIdentifier]);
    }
    this.beanIdentifiersCurrentlyInCreation.push(beanIdentifier);
    try {
      const newlyInstantiatedSingletonBeanInstance = this.instantiateBean(beanDefinition);
      this.singletonBeanInstancesByBeanIdentifier.set(beanIdentifier, newlyInstantiatedSingletonBeanInstance);
      return newlyInstantiatedSingletonBeanInstance as TBean;
    } finally {
      this.beanIdentifiersCurrentlyInCreation.pop();
    }
  }

  private instantiateBean(beanDefinition: BeanDefinition): object {
    const beanConstructor = this.beanClassRegistry.resolveBeanClass(
      beanDefinition.fullyQualifiedClassName,
    ) as unknown as new (...resolvedConstructorArguments: unknown[]) => object;
    const resolvedConstructorArguments = beanDefinition.constructorArgumentDefinitions.map(
      (constructorArgumentDefinition) => this.resolveConstructorArgument(constructorArgumentDefinition),
    );
    return new beanConstructor(...resolvedConstructorArguments);
  }

  private resolveConstructorArgument(constructorArgumentDefinition: ConstructorArgumentDefinition): unknown {
    switch (constructorArgumentDefinition.constructorArgumentKind) {
      case "BEAN_REFERENCE":
        return this.getBean(constructorArgumentDefinition.referencedBeanIdentifier);
      case "BEAN_REFERENCE_LIST":
        return constructorArgumentDefinition.referencedBeanIdentifiers.map((referencedBeanIdentifier) =>
          this.getBean(referencedBeanIdentifier),
        );
      case "STRING_LITERAL_VALUE":
      case "NUMERIC_LITERAL_VALUE":
        return constructorArgumentDefinition.literalValue;
      case "STRING_LITERAL_VALUE_LIST":
        return constructorArgumentDefinition.literalValues;
    }
  }
}
