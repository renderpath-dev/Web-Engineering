export type FailureClass = "transient" | "permanent" | "unknown";

export function shouldRetryJob(failureClass: FailureClass, attemptsMade: number, maxAttempts: number): boolean {
  if (failureClass === "permanent") return false;
  return attemptsMade < maxAttempts;
}

export function exponentialBackoffDelay(attemptNumber: number, baseDelayMs: number): number {
  return baseDelayMs * 2 ** Math.max(0, attemptNumber - 1);
}
