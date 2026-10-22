import type { InstallCommandSnippet } from "../../../../model/InstallCommandSnippet";
import { useCopyButtonInteraction } from "../../../hooks/useCopyButtonInteraction";

export interface InstallCommandSnippetComponentProperties {
  readonly installCommandSnippet: InstallCommandSnippet;
}

export function InstallCommandSnippetComponent(installCommandSnippetComponentProperties: InstallCommandSnippetComponentProperties) {
  const { installCommandSnippet } = installCommandSnippetComponentProperties;
  const { copyButtonLabel, copyButtonClassName, handleCopyButtonClick } = useCopyButtonInteraction(
    installCommandSnippet.installCommandText,
  );
  return (
    <div className="snippet">
      <p>{installCommandSnippet.installCommandSnippetHeading}</p>
      <pre>
        <code>{installCommandSnippet.installCommandText}</code>
      </pre>
      <button type="button" className={copyButtonClassName} onClick={handleCopyButtonClick}>
        {copyButtonLabel}
      </button>
    </div>
  );
}
