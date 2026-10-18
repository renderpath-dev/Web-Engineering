export type FailureClassification = "retryable" | "non_retryable" | "conflict" | "duplicate";

export function classifyStatus(status: number): FailureClassification {
  if (status === 409) return "conflict";
  if (status === 408 || status === 429 || status >= 500) return "retryable";
  return "non_retryable";
}
