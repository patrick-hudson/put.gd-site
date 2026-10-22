import type { ConstructorArgumentDefinition } from "./ConstructorArgumentDefinition";

export interface BeanDefinition {
  readonly beanIdentifier: string;
  readonly fullyQualifiedClassName: string;
  readonly constructorArgumentDefinitions: readonly ConstructorArgumentDefinition[];
}
