import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useEnterpriseBean } from "@putgd-enterprise/framework/ioc/react/EnterpriseApplicationContextReactBridge";
import { renderWithinProductionEnterpriseApplicationContext } from "../../support/EnterpriseTestApplicationContextFactory";

function BeanDisplayingTestComponent() {
  const releaseChannelDisplayNameProvider = useEnterpriseBean<{ provideReleaseChannelDisplayName(releaseChannel: string): string }>(
    "releaseChannelDisplayNameProvider",
  );
  return <span>{releaseChannelDisplayNameProvider.provideReleaseChannelDisplayName("nightly")}</span>;
}

describe("EnterpriseApplicationContextReactBridge", () => {
  it("hands components beans from the provided context", () => {
    const { getByText } = renderWithinProductionEnterpriseApplicationContext(<BeanDisplayingTestComponent />);
    expect(getByText("Nightly")).toBeInTheDocument();
  });

  it("throws when a bean is requested outside a provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<BeanDisplayingTestComponent />)).toThrow(/outside an EnterpriseApplicationContextProviderComponent/);
  });
});
