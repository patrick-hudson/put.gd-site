import { useEnterpriseBean } from "../../../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { ReadOnlyRepository } from "../../../../interfaces/repositories/ReadOnlyRepository";
import type { InstallCommandSnippet } from "../../../../model/InstallCommandSnippet";
import { useInstallTableState } from "../../../hooks/useInstallTableState";
import { KeyboardChordComponent } from "../../primitives/KeyboardChordComponent";
import { SectionHeadingHeaderComponent } from "../../primitives/SectionHeadingHeaderComponent";
import { InstallCommandSnippetComponent } from "./InstallCommandSnippetComponent";
import { PackageTableComponent } from "./PackageTableComponent";
import { ReleaseChannelToggleComponent } from "./ReleaseChannelToggleComponent";
import { ReleaseLineComponent } from "./ReleaseLineComponent";

export function InstallSectionComponent() {
  const installCommandSnippetRepository = useEnterpriseBean<ReadOnlyRepository<InstallCommandSnippet>>("installCommandSnippetRepository");
  const {
    releaseLineViewModel,
    releaseChannelToggleButtonViewModels,
    channelNoteMessage,
    packageRowViewModels,
    selectReleaseChannel,
  } = useInstallTableState();

  return (
    <section className="install" id="install" aria-labelledby="install-title">
      <SectionHeadingHeaderComponent sectionHeadingIdentifier="install-title" sectionHeadingText="Install">
        <ReleaseLineComponent releaseLineViewModel={releaseLineViewModel} />
      </SectionHeadingHeaderComponent>

      <ReleaseChannelToggleComponent
        releaseChannelToggleButtonViewModels={releaseChannelToggleButtonViewModels}
        onReleaseChannelSelected={selectReleaseChannel}
      />
      <p className="channel-note" id="channelNote" hidden={channelNoteMessage === null}>
        {channelNoteMessage}
      </p>

      <PackageTableComponent packageRowViewModels={packageRowViewModels} />

      <div className="commands">
        {installCommandSnippetRepository.findAll().map((installCommandSnippet) => (
          <InstallCommandSnippetComponent
            key={installCommandSnippet.installCommandSnippetHeading}
            installCommandSnippet={installCommandSnippet}
          />
        ))}
      </div>

      <p className="permalinks">
        For scripts and docs, <code>https://app.put.gd/dl/stable/fedora44</code> always redirects to the current
        stable RPM. The same pattern works for <code>ubuntu24.04</code>, <code>ubuntu26.04</code>,{" "}
        <code>debian13</code>, <code>appimage</code> and <code>checksums</code>, and with <code>nightly</code> in place
        of <code>stable</code>.
      </p>
      <p className="note">
        Each DEB installs only on the release it names, because it links that release's FFmpeg. On GNOME 50, run{" "}
        <code>gnome-extensions enable putgd@put.gd</code> once and log back in so the capture extension loads. Then add
        a destination under Destinations, store the credentials in the keychain, and press{" "}
        <KeyboardChordComponent keyboardKeyLabels={["Ctrl", "Shift", "1"]} />.
      </p>
    </section>
  );
}
