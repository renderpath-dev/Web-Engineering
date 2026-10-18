export type AsyncComponentPhase = "idle" | "loading" | "timeout" | "error" | "ready";

export interface AsyncComponentState {
  readonly phase: AsyncComponentPhase;
  readonly retryCount: number;
  readonly timeoutMs: number;
  readonly reportCreated: boolean;
}

export function createAsyncComponentState(timeoutMs = 3000): AsyncComponentState {
  return {
    phase: "idle",
    retryCount: 0,
    timeoutMs,
    reportCreated: false,
  };
}

export function transitionAsyncComponent(
  state: AsyncComponentState,
  phase: AsyncComponentPhase,
): AsyncComponentState {
  return {
    ...state,
    phase,
    reportCreated: phase === "error" || phase === "timeout",
  };
}

export function retryAsyncComponent(state: AsyncComponentState): AsyncComponentState {
  return {
    ...state,
    phase: "loading",
    retryCount: state.retryCount + 1,
    reportCreated: false,
  };
}
