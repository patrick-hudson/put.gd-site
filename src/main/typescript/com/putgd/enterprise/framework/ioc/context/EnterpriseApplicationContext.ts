export interface EnterpriseApplicationContext {
  getBean<TBean>(beanIdentifier: string): TBean;
  containsBeanDefinition(beanIdentifier: string): boolean;
}
