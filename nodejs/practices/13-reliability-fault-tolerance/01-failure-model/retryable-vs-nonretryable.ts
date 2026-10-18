export interface RetryDecision {
  retryable: boolean;
  reason: string;
}

export function decideRetry(errorCode: string): RetryDecision {
  if (["ETIMEDOUT", "ECONNRESET", "P2034"].includes(errorCode)) {
    return { retryable: true, reason: "temporary dependency boundary" };
  }
  return { retryable: false, reason: "permanent caller or data boundary" };
}
