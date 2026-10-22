import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { AnimationFrameScheduler } from "../../interfaces/schedulers/AnimationFrameScheduler";
import type { CancellationHandle } from "../../model/CancellationHandle";

@EnterpriseBean("com.putgd.enterprise.impl.schedulers.WindowRequestAnimationFrameSchedulerImpl")
export class WindowRequestAnimationFrameSchedulerImpl implements AnimationFrameScheduler {
  public scheduleBeforeNextRepaint(animationFrameCallback: () => void): CancellationHandle {
    const animationFrameRequestIdentifier = window.requestAnimationFrame(animationFrameCallback);
    return { cancel: () => window.cancelAnimationFrame(animationFrameRequestIdentifier) };
  }
}
