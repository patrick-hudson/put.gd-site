import { useEffect } from "react";
import { useEnterpriseBean } from "../../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { ExternalUrlResolver } from "../../../interfaces/resolvers/ExternalUrlResolver";
import { BrandMarkComponent } from "../layout/BrandMarkComponent";

export function NotFoundPageComponent() {
  const externalUrlResolver = useEnterpriseBean<ExternalUrlResolver>("externalUrlResolver");
  useEffect(() => {
    document.title = "Not found, put.gd";
  }, []);
  return (
    <>
      <header className="top">
        <BrandMarkComponent brandLogoSizeInPixels={30} />
      </header>
      <main className="hero" style={{ paddingBottom: "20vh" }}>
        <h1 style={{ fontSize: "clamp(1.6rem, 1rem + 2vw, 2.4rem)" }}>There is nothing at this address.</h1>
        <p style={{ marginTop: 14, color: "var(--text-2)", maxWidth: "52ch" }}>
          If you followed a download link, the current packages are on the <a href="/#install">install section</a> or
          the <a href={externalUrlResolver.resolveExternalUrl("RELEASES_PAGE")}>releases page</a>.
        </p>
      </main>
    </>
  );
}
