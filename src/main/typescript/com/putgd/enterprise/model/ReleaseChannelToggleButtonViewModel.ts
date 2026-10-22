import type { ReleaseChannel } from "./ReleaseChannel";

export interface ReleaseChannelToggleButtonViewModel {
  readonly releaseChannel: ReleaseChannel;
  readonly releaseChannelDisplayName: string;
  readonly isPressed: boolean;
  readonly isDisabled: boolean;
}
