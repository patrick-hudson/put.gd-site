import { createContext, useContext, type ReactNode } from "react";
import type { EnterpriseApplicationContext } from "../context/EnterpriseApplicationContext";
import { ApplicationContextNotProvidedException } from "../exceptions/ApplicationContextNotProvidedException";

const EnterpriseApplicationContextReactContext = createContext<EnterpriseApplicationContext | null>(null);

export interface EnterpriseApplicationContextProviderComponentProperties {
  readonly enterpriseApplicationContext: EnterpriseApplicationContext;
  readonly children: ReactNode;
}

export function EnterpriseApplicationContextProviderComponent(
  enterpriseApplicationContextProviderComponentProperties: EnterpriseApplicationContextProviderComponentProperties,
) {
  return (
    <EnterpriseApplicationContextReactContext.Provider
      value={enterpriseApplicationContextProviderComponentProperties.enterpriseApplicationContext}
    >
      {enterpriseApplicationContextProviderComponentProperties.children}
    </EnterpriseApplicationContextReactContext.Provider>
  );
}

export function useEnterpriseBean<TBean>(beanIdentifier: string): TBean {
  const enterpriseApplicationContext = useContext(EnterpriseApplicationContextReactContext);
  if (enterpriseApplicationContext === null) {
    throw new ApplicationContextNotProvidedException(beanIdentifier);
  }
  return enterpriseApplicationContext.getBean<TBean>(beanIdentifier);
}
