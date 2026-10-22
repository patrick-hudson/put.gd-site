import { describe, expect, it } from "vitest";
import { CopyButtonStateMachineImpl } from "@putgd-enterprise/impl/statemachines/CopyButtonStateMachineImpl";
import { CopyButtonState } from "@putgd-enterprise/model/CopyButtonState";
import { CopyButtonStateTransitionEvent } from "@putgd-enterprise/model/CopyButtonStateTransitionEvent";

const { AWAITING_USER_INTERACTION, TEXT_COPIED_TO_CLIPBOARD, CLIPBOARD_UNAVAILABLE } = CopyButtonState;
const { CLIPBOARD_WRITE_SUCCEEDED, CLIPBOARD_WRITE_FAILED, CONFIRMATION_DISPLAY_PERIOD_ELAPSED } = CopyButtonStateTransitionEvent;

describe("CopyButtonStateMachineImpl", () => {
  const copyButtonStateMachine = new CopyButtonStateMachineImpl();

  it("starts out waiting for the user", () => {
    expect(copyButtonStateMachine.getInitialState()).toBe(AWAITING_USER_INTERACTION);
  });

  it.each([
    [AWAITING_USER_INTERACTION, CLIPBOARD_WRITE_SUCCEEDED, TEXT_COPIED_TO_CLIPBOARD],
    [AWAITING_USER_INTERACTION, CLIPBOARD_WRITE_FAILED, CLIPBOARD_UNAVAILABLE],
    [AWAITING_USER_INTERACTION, CONFIRMATION_DISPLAY_PERIOD_ELAPSED, AWAITING_USER_INTERACTION],
    [TEXT_COPIED_TO_CLIPBOARD, CLIPBOARD_WRITE_SUCCEEDED, TEXT_COPIED_TO_CLIPBOARD],
    [TEXT_COPIED_TO_CLIPBOARD, CLIPBOARD_WRITE_FAILED, CLIPBOARD_UNAVAILABLE],
    [TEXT_COPIED_TO_CLIPBOARD, CONFIRMATION_DISPLAY_PERIOD_ELAPSED, AWAITING_USER_INTERACTION],
    [CLIPBOARD_UNAVAILABLE, CLIPBOARD_WRITE_SUCCEEDED, TEXT_COPIED_TO_CLIPBOARD],
    [CLIPBOARD_UNAVAILABLE, CLIPBOARD_WRITE_FAILED, CLIPBOARD_UNAVAILABLE],
    [CLIPBOARD_UNAVAILABLE, CONFIRMATION_DISPLAY_PERIOD_ELAPSED, CLIPBOARD_UNAVAILABLE],
  ])("goes from %s on %s to %s", (currentState, stateTransitionEvent, expectedNextState) => {
    expect(copyButtonStateMachine.transition(currentState, stateTransitionEvent)).toBe(expectedNextState);
  });
});
