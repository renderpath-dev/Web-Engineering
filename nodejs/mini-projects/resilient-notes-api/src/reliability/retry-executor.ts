import { abortableDelay } from "./abortable.js";
import { classifyFailure } from "./error-classifier.js";
import { calculateBackoffDelay, consumeRetryBudget, createRetryBudget, type RetryPolicy } from "./retry-policy.js";
import { recordRetryAttempt, recordRetryExhausted } from "../observability/reliability-metrics.js";

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  policy: RetryPolicy,
  signal?: AbortSignal
): Promise<T> {
  const budget = createRetryBudget(policy.retryBudget);
  let lastError: unknown;

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt += 1) {
    if (signal?.aborted) throw signal.reason ?? new Error("Retry aborted");
    try {
      return await operation();
    } catch (error) {
      const classification = classifyFailure(error);
      lastError = error;
      if (!classification.retryable || attempt === policy.maxAttempts || !consumeRetryBudget(budget)) {
        recordRetryExhausted(policy.operation, classification.kind);
        break;
      }

      recordRetryAttempt(policy.operation, classification.kind);
      await abortableDelay(
        calculateBackoffDelay(attempt, policy.baseDelayMs, policy.maxDelayMs),
        signal,
        policy.operation
      );
    }
  }

  throw lastError;
}
