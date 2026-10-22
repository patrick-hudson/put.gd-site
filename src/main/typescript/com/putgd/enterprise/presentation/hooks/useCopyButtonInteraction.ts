import { useCallback, useEffect, useReducer, useRef } from "react";
import { useEnterpriseBean } from "../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { Converter } from "../../interfaces/converters/Converter";
import type { DurationProvider } from "../../interfaces/providers/DurationProvider";
import type { DelayedTaskScheduler } from "../../interfaces/schedulers/DelayedTaskScheduler";
import type { ClipboardService } from "../../interfaces/services/ClipboardService";
import type { StateMachine } from "../../interfaces/statemachines/StateMachine";
import type { CancellationHandle } from "../../model/CancellationHandle";
import type { CopyButtonState } from "../../model/CopyButtonState";
import { CopyButtonStateTransitionEvent } from "../../model/CopyButtonStateTransitionEvent";

export interface CopyButtonInteraction {
  readonly copyButtonLabel: string;
  readonly copyButtonClassName: string;
  readonly handleCopyButtonClick: () => Promise<void>;
}

export function useCopyButtonInteraction(textToCopy: string): CopyButtonInteraction {
  const clipboardService = useEnterpriseBean<ClipboardService>("clipboardService");
  const copyButtonStateMachine = useEnterpriseBean<StateMachine<CopyButtonState, CopyButtonStateTransitionEvent>>("copyButtonStateMachine");
  const copyButtonStateToLabelConverter = useEnterpriseBean<Converter<CopyButtonState, string>>("copyButtonStateToLabelConverter");
  const copyButtonStateToClassNameConverter = useEnterpriseBean<Converter<CopyButtonState, string>>("copyButtonStateToClassNameConverter");
  const copyConfirmationDisplayDurationProvider = useEnterpriseBean<DurationProvider>("copyConfirmationDisplayDurationProvider");
  const delayedTaskScheduler = useEnterpriseBean<DelayedTaskScheduler>("delayedTaskScheduler");

  const [copyButtonState, dispatchCopyButtonStateTransitionEvent] = useReducer(
    (currentState: CopyButtonState, stateTransitionEvent: CopyButtonStateTransitionEvent) =>
      copyButtonStateMachine.transition(currentState, stateTransitionEvent),
    copyButtonStateMachine.getInitialState(),
  );
  const pendingConfirmationResetCancellationHandle = useRef<CancellationHandle | null>(null);

  useEffect(() => () => pendingConfirmationResetCancellationHandle.current?.cancel(), []);

  const handleCopyButtonClick = useCallback(async () => {
    try {
      await clipboardService.writeTextToClipboard(textToCopy);
      dispatchCopyButtonStateTransitionEvent(CopyButtonStateTransitionEvent.CLIPBOARD_WRITE_SUCCEEDED);
      pendingConfirmationResetCancellationHandle.current?.cancel();
      pendingConfirmationResetCancellationHandle.current = delayedTaskScheduler.scheduleDelayedTask(
        () => dispatchCopyButtonStateTransitionEvent(CopyButtonStateTransitionEvent.CONFIRMATION_DISPLAY_PERIOD_ELAPSED),
        copyConfirmationDisplayDurationProvider.provideDurationInMilliseconds(),
      );
    } catch {
      dispatchCopyButtonStateTransitionEvent(CopyButtonStateTransitionEvent.CLIPBOARD_WRITE_FAILED);
    }
  }, [clipboardService, textToCopy, delayedTaskScheduler, copyConfirmationDisplayDurationProvider]);

  return {
    copyButtonLabel: copyButtonStateToLabelConverter.convert(copyButtonState),
    copyButtonClassName: copyButtonStateToClassNameConverter.convert(copyButtonState),
    handleCopyButtonClick,
  };
}
