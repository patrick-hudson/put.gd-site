import type { BeanConstructor } from "./BeanConstructor";
import { DuplicateBeanClassRegistrationException } from "./exceptions/DuplicateBeanClassRegistrationException";
import { NoSuchBeanClassException } from "./exceptions/NoSuchBeanClassException";

export class BeanClassRegistry {
  private static singletonBeanClassRegistryInstance: BeanClassRegistry | null = null;

  private readonly beanConstructorsByFullyQualifiedClassName = new Map<string, BeanConstructor>();

  private constructor() {}

  public static getInstance(): BeanClassRegistry {
    if (BeanClassRegistry.singletonBeanClassRegistryInstance === null) {
      BeanClassRegistry.singletonBeanClassRegistryInstance = new BeanClassRegistry();
    }
    return BeanClassRegistry.singletonBeanClassRegistryInstance;
  }

  public registerBeanClass(fullyQualifiedClassName: string, beanConstructor: BeanConstructor): void {
    const existingBeanConstructor = this.beanConstructorsByFullyQualifiedClassName.get(fullyQualifiedClassName);
    if (existingBeanConstructor !== undefined && existingBeanConstructor !== beanConstructor) {
      throw new DuplicateBeanClassRegistrationException(fullyQualifiedClassName);
    }
    this.beanConstructorsByFullyQualifiedClassName.set(fullyQualifiedClassName, beanConstructor);
  }

  public resolveBeanClass(fullyQualifiedClassName: string): BeanConstructor {
    const beanConstructor = this.beanConstructorsByFullyQualifiedClassName.get(fullyQualifiedClassName);
    if (beanConstructor === undefined) {
      throw new NoSuchBeanClassException(fullyQualifiedClassName);
    }
    return beanConstructor;
  }
}
