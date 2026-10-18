export type OperationResult =
  | { outcome: "success" }
  | { outcome: "timeout"; retryable: true }
  | { outcome: "aborted"; retryable: false }
  | { outcome: "dependency_error"; retryable: boolean }
  | { outcome: "validation_error"; retryable: false };

export type NextAction = "return_success" | "retry" | "fallback" | "reject";

export function chooseNextAction(result: OperationResult, fallbackAvailable: boolean): NextAction {
  if (result.outcome === "success") return "return_success";
  if (result.outcome === "aborted") return "reject";
  if (result.retryable) return "retry";
  if (fallbackAvailable && result.outcome === "dependency_error") return "fallback";
  return "reject";
}
