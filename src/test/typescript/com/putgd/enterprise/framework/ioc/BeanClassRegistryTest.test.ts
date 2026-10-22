import { describe, expect, it } from "vitest";
import { BeanClassRegistry } from "@putgd-enterprise/framework/ioc/BeanClassRegistry";
import { DuplicateBeanClassRegistrationException } from "@putgd-enterprise/framework/ioc/exceptions/DuplicateBeanClassRegistrationException";
import { NoSuchBeanClassException } from "@putgd-enterprise/framework/ioc/exceptions/NoSuchBeanClassException";

class FirstRegistrationTestBeanImpl {}
class SecondRegistrationTestBeanImpl {}

describe("BeanClassRegistry", () => {
  it("is a singleton", () => {
    expect(BeanClassRegistry.getInstance()).toBe(BeanClassRegistry.getInstance());
  });

  it("resolves a registered class by its fully qualified name", () => {
    BeanClassRegistry.getInstance().registerBeanClass("com.putgd.enterprise.test.registry.Resolvable", FirstRegistrationTestBeanImpl);
    expect(BeanClassRegistry.getInstance().resolveBeanClass("com.putgd.enterprise.test.registry.Resolvable")).toBe(
      FirstRegistrationTestBeanImpl,
    );
  });

  it("accepts registering the same class twice, as happens when a module is re-evaluated", () => {
    const beanClassRegistry = BeanClassRegistry.getInstance();
    beanClassRegistry.registerBeanClass("com.putgd.enterprise.test.registry.Idempotent", FirstRegistrationTestBeanImpl);
    expect(() =>
      beanClassRegistry.registerBeanClass("com.putgd.enterprise.test.registry.Idempotent", FirstRegistrationTestBeanImpl),
    ).not.toThrow();
  });

  it("rejects a different class under a name that is already taken", () => {
    const beanClassRegistry = BeanClassRegistry.getInstance();
    beanClassRegistry.registerBeanClass("com.putgd.enterprise.test.registry.Contested", FirstRegistrationTestBeanImpl);
    expect(() =>
      beanClassRegistry.registerBeanClass("com.putgd.enterprise.test.registry.Contested", SecondRegistrationTestBeanImpl),
    ).toThrow(DuplicateBeanClassRegistrationException);
  });

  it("throws for an unknown class name and points at ComponentScan.ts", () => {
    expect(() => BeanClassRegistry.getInstance().resolveBeanClass("com.example.Unknown")).toThrow(NoSuchBeanClassException);
    expect(() => BeanClassRegistry.getInstance().resolveBeanClass("com.example.Unknown")).toThrow(/ComponentScan\.ts/);
  });
});
