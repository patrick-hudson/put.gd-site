import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { StateMachine } from "../../interfaces/statemachines/StateMachine";
import { CopyButtonState } from "../../model/CopyButtonState";
import { CopyButtonStateTransitionEvent } from "../../model/CopyButtonStateTransitionEvent";

@EnterpriseBean("com.putgd.enterprise.impl.statemachines.CopyButtonStateMachineImpl")
export class CopyButtonStateMachineImpl implements StateMachine<CopyButtonState, CopyButtonStateTransitionEvent> {
  public getInitialState(): CopyButtonState {
    return CopyButtonState.AWAITING_USER_INTERACTION;
  }

  public transition(currentState: CopyButtonState, stateTransitionEvent: CopyButtonStateTransitionEvent): CopyButtonState {
    switch (stateTransitionEvent) {
      case CopyButtonStateTransitionEvent.CLIPBOARD_WRITE_SUCCEEDED:
        return CopyButtonState.TEXT_COPIED_TO_CLIPBOARD;
      case CopyButtonStateTransitionEvent.CLIPBOARD_WRITE_FAILED:
        return CopyButtonState.CLIPBOARD_UNAVAILABLE;
      case CopyButtonStateTransitionEvent.CONFIRMATION_DISPLAY_PERIOD_ELAPSED:
        return currentState === CopyButtonState.TEXT_COPIED_TO_CLIPBOARD
          ? CopyButtonState.AWAITING_USER_INTERACTION
          : currentState;
    }
  }
}
