export interface StateMachine<TState, TStateTransitionEvent> {
  getInitialState(): TState;
  transition(currentState: TState, stateTransitionEvent: TStateTransitionEvent): TState;
}
