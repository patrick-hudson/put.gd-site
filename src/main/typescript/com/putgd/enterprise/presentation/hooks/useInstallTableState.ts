import { useCallback, useEffect, useState } from "react";
import { useEnterpriseBean } from "../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { ChannelNoteMessageProvider } from "../../interfaces/providers/ChannelNoteMessageProvider";
import type { ReleaseChannelDisplayNameProvider } from "../../interfaces/providers/ReleaseChannelDisplayNameProvider";
import type { ReleaseLineViewModelProvider } from "../../interfaces/providers/ReleaseLineViewModelProvider";
import type { ReadOnlyRepository } from "../../interfaces/repositories/ReadOnlyRepository";
import type { BrowserCapabilityDetectionService } from "../../interfaces/services/BrowserCapabilityDetectionService";
import type { ReleaseManifestRetrievalService } from "../../interfaces/services/ReleaseManifestRetrievalService";
import type { InitialReleaseChannelSelectionStrategy } from "../../interfaces/strategies/InitialReleaseChannelSelectionStrategy";
import type { PackageRowDescriptorVisitor } from "../../interfaces/visitors/PackageRowDescriptorVisitor";
import type { PackageRowDescriptor } from "../../model/PackageRowDescriptor";
import type { PackageRowViewModel } from "../../model/PackageRowViewModel";
import type { PackageRowVisitationContext } from "../../model/PackageRowVisitationContext";
import { ReleaseChannel } from "../../model/ReleaseChannel";
import type { ReleaseChannelToggleButtonViewModel } from "../../model/ReleaseChannelToggleButtonViewModel";
import type { ReleaseLineViewModel } from "../../model/ReleaseLineViewModel";
import type { ReleaseManifest } from "../../model/ReleaseManifest";

export interface InstallTableState {
  readonly releaseLineViewModel: ReleaseLineViewModel;
  readonly releaseChannelToggleButtonViewModels: readonly ReleaseChannelToggleButtonViewModel[] | null;
  readonly channelNoteMessage: string | null;
  readonly packageRowViewModels: readonly PackageRowViewModel[];
  readonly selectReleaseChannel: (requestedReleaseChannel: ReleaseChannel) => void;
}

export function useInstallTableState(): InstallTableState {
  const browserCapabilityDetectionService = useEnterpriseBean<BrowserCapabilityDetectionService>("browserCapabilityDetectionService");
  const releaseManifestRetrievalService = useEnterpriseBean<ReleaseManifestRetrievalService>("releaseManifestRetrievalService");
  const initialReleaseChannelSelectionStrategy = useEnterpriseBean<InitialReleaseChannelSelectionStrategy>("initialReleaseChannelSelectionStrategy");
  const packageRowDescriptorRepository = useEnterpriseBean<ReadOnlyRepository<PackageRowDescriptor>>("packageRowDescriptorRepository");
  const packageRowDescriptorVisitor = useEnterpriseBean<PackageRowDescriptorVisitor>("packageRowDescriptorVisitor");
  const releaseLineViewModelProvider = useEnterpriseBean<ReleaseLineViewModelProvider>("releaseLineViewModelProvider");
  const channelNoteMessageProvider = useEnterpriseBean<ChannelNoteMessageProvider>("channelNoteMessageProvider");
  const releaseChannelDisplayNameProvider = useEnterpriseBean<ReleaseChannelDisplayNameProvider>("releaseChannelDisplayNameProvider");

  const [releaseManifest, setReleaseManifest] = useState<ReleaseManifest | null>(null);
  const [selectedReleaseChannel, setSelectedReleaseChannel] = useState<ReleaseChannel>(ReleaseChannel.STABLE);

  useEffect(() => {
    if (!browserCapabilityDetectionService.isFetchApiSupported()) {
      return;
    }
    let isReleaseManifestRetrievalStillRelevant = true;
    releaseManifestRetrievalService
      .retrieveReleaseManifest()
      .then((retrievedReleaseManifest) => {
        if (
          !isReleaseManifestRetrievalStillRelevant ||
          (!retrievedReleaseManifest[ReleaseChannel.STABLE] && !retrievedReleaseManifest[ReleaseChannel.NIGHTLY])
        ) {
          return;
        }
        setReleaseManifest(retrievedReleaseManifest);
        setSelectedReleaseChannel(initialReleaseChannelSelectionStrategy.selectInitialReleaseChannel(retrievedReleaseManifest));
      })
      .catch(() => {
        // The static links to the releases page stay in place.
      });
    return () => {
      isReleaseManifestRetrievalStillRelevant = false;
    };
  }, [browserCapabilityDetectionService, releaseManifestRetrievalService, initialReleaseChannelSelectionStrategy]);

  const packageRowVisitationContext: PackageRowVisitationContext =
    releaseManifest === null
      ? { releaseManifestAvailability: "RELEASE_MANIFEST_NOT_YET_AVAILABLE" }
      : {
          releaseManifestAvailability: "RELEASE_MANIFEST_AVAILABLE",
          selectedReleaseChannel,
          selectedRelease: releaseManifest[selectedReleaseChannel] ?? null,
        };

  const selectReleaseChannel = useCallback(
    (requestedReleaseChannel: ReleaseChannel) => {
      if (releaseManifest?.[requestedReleaseChannel]) {
        setSelectedReleaseChannel(requestedReleaseChannel);
      }
    },
    [releaseManifest],
  );

  return {
    releaseLineViewModel: releaseLineViewModelProvider.provideReleaseLineViewModel(packageRowVisitationContext),
    releaseChannelToggleButtonViewModels:
      releaseManifest === null
        ? null
        : Object.values(ReleaseChannel).map((releaseChannel) => ({
            releaseChannel,
            releaseChannelDisplayName: releaseChannelDisplayNameProvider.provideReleaseChannelDisplayName(releaseChannel),
            isPressed: releaseChannel === selectedReleaseChannel,
            isDisabled: !releaseManifest[releaseChannel],
          })),
    channelNoteMessage:
      packageRowVisitationContext.releaseManifestAvailability === "RELEASE_MANIFEST_AVAILABLE"
        ? channelNoteMessageProvider.provideChannelNoteMessage(
            packageRowVisitationContext.selectedReleaseChannel,
            packageRowVisitationContext.selectedRelease,
          )
        : null,
    packageRowViewModels: packageRowDescriptorRepository
      .findAll()
      .map((packageRowDescriptor) => packageRowDescriptor.accept(packageRowDescriptorVisitor, packageRowVisitationContext)),
    selectReleaseChannel,
  };
}
