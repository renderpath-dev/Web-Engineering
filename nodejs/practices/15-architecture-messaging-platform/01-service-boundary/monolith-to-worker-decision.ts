export type WorkloadShape = {
  userWaitsForResult: boolean;
  durationMs: number;
  retryable: boolean;
  requiresHttpResponse: boolean;
  ownsLargeSideEffect: boolean;
};

export function chooseRuntime(workload: WorkloadShape): "http-handler" | "worker-service" {
  if (workload.requiresHttpResponse || workload.userWaitsForResult) return "http-handler";
  if (workload.retryable && workload.ownsLargeSideEffect) return "worker-service";
  if (workload.durationMs > 1000 && workload.retryable) return "worker-service";
  return "http-handler";
}
