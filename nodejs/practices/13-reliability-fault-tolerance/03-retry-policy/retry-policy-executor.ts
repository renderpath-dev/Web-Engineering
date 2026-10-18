import { setTimeout as delay } from "node:timers/promises";

export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryBudget: number;
}

export function calculateBackoffWithJitter(attempt: number, policy: RetryPolicy): number {
  const exponential = Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** Math.max(0, attempt - 1));
  const jitter = Math.floor(Math.random() * Math.max(1, exponential * 0.2));
  return exponential + jitter;
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  policy: RetryPolicy,
  signal?: AbortSignal
): Promise<T> {
  let remainingBudget = policy.retryBudget;
  let lastError: unknown;

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt += 1) {
    if (signal?.aborted) {
      throw signal.reason ?? new Error("Retry aborted");
    }

    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === policy.maxAttempts || remainingBudget <= 0) break;
      remainingBudget -= 1;
      await delay(calculateBackoffWithJitter(attempt, policy), undefined, { signal });
    }
  }

  throw lastError;
}
