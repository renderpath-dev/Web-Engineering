export type NavigationFailureReason = "none" | "aborted" | "redirected" | "error";

export interface RouteNavigationSignal {
  readonly routeName: string;
  readonly redactedPath: string;
  readonly durationMs: number;
  readonly failureReason: NavigationFailureReason;
  readonly taskContext: string;
}

export function createRouteNavigationSignal(input: {
  readonly routeName: string;
  readonly fullPath: string;
  readonly durationMs: number;
  readonly failureReason: NavigationFailureReason;
  readonly taskContext: string;
}): RouteNavigationSignal {
  return {
    routeName: input.routeName,
    redactedPath: input.fullPath.split("?")[0],
    durationMs: input.durationMs,
    failureReason: input.failureReason,
    taskContext: input.taskContext,
  };
}

export function isSlowNavigation(signal: RouteNavigationSignal, budgetMs = 800): boolean {
  return signal.durationMs > budgetMs;
}
