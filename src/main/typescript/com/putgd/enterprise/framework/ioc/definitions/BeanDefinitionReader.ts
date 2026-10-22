import type { BeanDefinition } from "./BeanDefinition";

export interface BeanDefinitionReader {
  readBeanDefinitions(): readonly BeanDefinition[];
}
