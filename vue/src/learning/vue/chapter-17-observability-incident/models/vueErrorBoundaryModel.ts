export type ErrorPropagationDecision = "propagate-to-app" | "stop-at-boundary";

export interface ComponentFallbackState {
  readonly hasError: boolean;
  readonly message: string;
  readonly reportCreated: boolean;
  readonly propagation: ErrorPropagationDecision;
}

export function createComponentFallbackState(input: {
  readonly message: string;
  readonly reportCreated: boolean;
  readonly stopPropagation: boolean;
}): ComponentFallbackState {
  return {
    hasError: true,
    message: input.message,
    reportCreated: input.reportCreated,
    propagation: input.stopPropagation ? "stop-at-boundary" : "propagate-to-app",
  };
}

export function shouldPropagateError(state: ComponentFallbackState): boolean {
  return state.propagation === "propagate-to-app";
}
