export interface RetryPolicy {
  operation: string;
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryBudget: number;
}

export interface RetryBudget {
  remaining: number;
}

export function createRetryBudget(retryBudget: number): RetryBudget {
  return { remaining: retryBudget };
}

export function consumeRetryBudget(budget: RetryBudget): boolean {
  if (budget.remaining <= 0) return false;
  budget.remaining -= 1;
  return true;
}

export function calculateBackoffDelay(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  const exponential = Math.min(maxDelayMs, baseDelayMs * 2 ** Math.max(0, attempt - 1));
  const jitter = Math.floor(Math.random() * Math.max(1, exponential * 0.2));
  return exponential + jitter;
}

export function isRetrySafeMethod(method: string, hasIdempotencyKey: boolean): boolean {
  const normalized = method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(normalized)) return true;
  if (["PUT", "DELETE"].includes(normalized)) return true;
  return normalized === "POST" && hasIdempotencyKey;
}
