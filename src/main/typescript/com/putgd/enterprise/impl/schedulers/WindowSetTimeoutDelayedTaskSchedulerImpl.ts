import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { DelayedTaskScheduler } from "../../interfaces/schedulers/DelayedTaskScheduler";
import type { CancellationHandle } from "../../model/CancellationHandle";

@EnterpriseBean("com.putgd.enterprise.impl.schedulers.WindowSetTimeoutDelayedTaskSchedulerImpl")
export class WindowSetTimeoutDelayedTaskSchedulerImpl implements DelayedTaskScheduler {
  public scheduleDelayedTask(delayedTask: () => void, delayInMilliseconds: number): CancellationHandle {
    const timeoutIdentifier = window.setTimeout(delayedTask, delayInMilliseconds);
    return { cancel: () => window.clearTimeout(timeoutIdentifier) };
  }
}
