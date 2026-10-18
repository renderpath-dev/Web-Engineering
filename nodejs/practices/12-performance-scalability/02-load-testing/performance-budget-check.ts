
export interface BaselineResult {
  requestsPerSecond: number;
  latencyP95: number;
  errors: number;
  timeouts: number;
}

export interface PerformanceBudget {
  minRequestsPerSecond: number;
  maxLatencyP95: number;
  maxErrors: number;
  maxTimeouts: number;
}

export function findBudgetViolations(result: BaselineResult, budget: PerformanceBudget): string[] {
  return [
    result.requestsPerSecond < budget.minRequestsPerSecond ? "requestsPerSecond" : undefined,
    result.latencyP95 > budget.maxLatencyP95 ? "latencyP95" : undefined,
    result.errors > budget.maxErrors ? "errors" : undefined,
    result.timeouts > budget.maxTimeouts ? "timeouts" : undefined
  ].filter((value): value is string => Boolean(value));
}
