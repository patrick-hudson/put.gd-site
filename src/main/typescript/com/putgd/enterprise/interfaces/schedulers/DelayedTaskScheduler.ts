import type { CancellationHandle } from "../../model/CancellationHandle";

export interface DelayedTaskScheduler {
  scheduleDelayedTask(delayedTask: () => void, delayInMilliseconds: number): CancellationHandle;
}
