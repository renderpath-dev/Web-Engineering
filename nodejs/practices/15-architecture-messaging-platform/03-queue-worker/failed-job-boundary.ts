export type FailedJobDecision = "retry" | "dead-letter" | "operator-review";

export function classifyFailedJob(reason: string, attemptsMade: number): FailedJobDecision {
  if (reason === "validation_failed") return "dead-letter";
  if (attemptsMade >= 3) return "operator-review";
  return "retry";
}
