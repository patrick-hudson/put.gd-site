import { useEnterpriseBean } from "../../../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { Converter } from "../../../../interfaces/converters/Converter";
import type { ReleaseChannel } from "../../../../model/ReleaseChannel";
import type { ReleaseChannelToggleButtonViewModel } from "../../../../model/ReleaseChannelToggleButtonViewModel";

export interface ReleaseChannelToggleComponentProperties {
  readonly releaseChannelToggleButtonViewModels: readonly ReleaseChannelToggleButtonViewModel[] | null;
  readonly onReleaseChannelSelected: (selectedReleaseChannel: ReleaseChannel) => void;
}

export function ReleaseChannelToggleComponent(releaseChannelToggleComponentProperties: ReleaseChannelToggleComponentProperties) {
  const booleanToAriaBooleanAttributeValueConverter = useEnterpriseBean<Converter<boolean, "true" | "false">>(
    "booleanToAriaBooleanAttributeValueConverter",
  );
  const { releaseChannelToggleButtonViewModels, onReleaseChannelSelected } = releaseChannelToggleComponentProperties;
  return (
    <div className="channel" role="group" aria-label="Release channel" id="channel" hidden={releaseChannelToggleButtonViewModels === null}>
      {releaseChannelToggleButtonViewModels?.map((releaseChannelToggleButtonViewModel) => (
        <button
          key={releaseChannelToggleButtonViewModel.releaseChannel}
          type="button"
          data-channel={releaseChannelToggleButtonViewModel.releaseChannel}
          aria-pressed={booleanToAriaBooleanAttributeValueConverter.convert(releaseChannelToggleButtonViewModel.isPressed)}
          disabled={releaseChannelToggleButtonViewModel.isDisabled}
          onClick={() => onReleaseChannelSelected(releaseChannelToggleButtonViewModel.releaseChannel)}
        >
          {releaseChannelToggleButtonViewModel.releaseChannelDisplayName}
        </button>
      ))}
    </div>
  );
}
