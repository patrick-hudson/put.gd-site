import { BeanClassRegistry } from "./BeanClassRegistry";
import type { BeanConstructor } from "./BeanConstructor";

export function EnterpriseBean(fullyQualifiedClassName: string) {
  return function enterpriseBeanClassDecorator<TBeanConstructor extends BeanConstructor>(
    beanConstructor: TBeanConstructor,
  ): TBeanConstructor {
    BeanClassRegistry.getInstance().registerBeanClass(fullyQualifiedClassName, beanConstructor);
    return beanConstructor;
  };
}
