import { useEnterpriseBean } from "../../../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { ExternalUrlResolver } from "../../../../interfaces/resolvers/ExternalUrlResolver";
import { HeroStageComponent } from "./HeroStageComponent";

export function HeroSectionComponent() {
  const externalUrlResolver = useEnterpriseBean<ExternalUrlResolver>("externalUrlResolver");
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-text">
        <h1 id="hero-title">Anything you capture or copy, uploaded to storage you control.</h1>
        <div className="hero-side">
          <p>
            put.gd is a tray app for Linux. Press a key and drag a region, record the screen, or hand it whatever is on
            the clipboard: files, an image, text. It goes to your S3 bucket or Proton Drive, and the link comes back to
            the clipboard. Capture uses each desktop's own screenshot service on Cinnamon, GNOME 50 and KDE Plasma 6, on
            X11 and Wayland.
          </p>
          <p className="actions">
            <a className="btn btn-primary" href="#install">
              Install for Linux
            </a>{" "}
            <a className="btn" href={externalUrlResolver.resolveExternalUrl("SOURCE_REPOSITORY")}>
              Source on GitHub
            </a>
          </p>
        </div>
      </div>
      <HeroStageComponent />
    </section>
  );
}
