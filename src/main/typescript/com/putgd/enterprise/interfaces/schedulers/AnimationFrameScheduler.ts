import type { CancellationHandle } from "../../model/CancellationHandle";

export interface AnimationFrameScheduler {
  scheduleBeforeNextRepaint(animationFrameCallback: () => void): CancellationHandle;
}
