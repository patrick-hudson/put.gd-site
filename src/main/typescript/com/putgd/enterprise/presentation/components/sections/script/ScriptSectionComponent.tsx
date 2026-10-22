import { useEnterpriseBean } from "../../../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { ExternalUrlResolver } from "../../../../interfaces/resolvers/ExternalUrlResolver";
import { TypewriterConsoleComponent } from "./TypewriterConsoleComponent";

export function ScriptSectionComponent() {
  const externalUrlResolver = useEnterpriseBean<ExternalUrlResolver>("externalUrlResolver");
  return (
    <section className="script" id="script" aria-labelledby="script-title">
      <div className="script-text">
        <h2 id="script-title">The same actions from a script</h2>
        <p>
          The resident speaks newline-delimited JSON over an owner-only Unix socket. The tray, the windows and{" "}
          <code>putgd-cli</code> all call the same methods, so anything you can click, a script can do. Every call
          returns an operation ID you can inspect for the phase, the bytes, the link and the outcome.
        </p>
        <p>An optional MCP helper wraps the CLI with typed tools for Claude Code, Claude Desktop or any stdio MCP client.</p>
        <p className="links">
          <a href={externalUrlResolver.resolveExternalUrl("CLI_REFERENCE")}>CLI reference</a>{" "}
          <a href={externalUrlResolver.resolveExternalUrl("MCP_HELPER")}>MCP helper</a>
        </p>
      </div>
      <TypewriterConsoleComponent />
    </section>
  );
}
