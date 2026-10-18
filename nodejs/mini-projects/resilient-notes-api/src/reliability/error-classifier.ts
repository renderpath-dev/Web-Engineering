import { TimeoutError } from "./timeout.js";

export type FailureKind =
  | "timeout"
  | "abort"
  | "transient"
  | "permanent"
  | "conflict"
  | "duplicate"
  | "overload"
  | "dependency";

export interface FailureClassification {
  kind: FailureKind;
  retryable: boolean;
}

export function classifyFailure(error: unknown): FailureClassification {
  if (error instanceof TimeoutError) return { kind: "timeout", retryable: true };
  if (error instanceof Error && error.name === "AbortError") return { kind: "abort", retryable: false };
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = Number((error as { status?: unknown }).status);
    if (status === 408 || status === 429 || status >= 500) return { kind: "transient", retryable: true };
    if (status === 409) return { kind: "conflict", retryable: false };
  }
  return { kind: "permanent", retryable: false };
}
