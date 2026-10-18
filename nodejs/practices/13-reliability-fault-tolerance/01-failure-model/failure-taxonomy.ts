export type FailureKind =
  | "timeout"
  | "abort"
  | "transient"
  | "permanent"
  | "conflict"
  | "duplicate"
  | "overload";

export type SafePolicy = "reject" | "retry" | "replay" | "fallback" | "shed";

export type FailureEvent =
  | { kind: "timeout"; signal: "AbortError"; retryable: true }
  | { kind: "abort"; signal: "AbortSignal"; retryable: false }
  | { kind: "transient"; signal: "ECONNRESET"; retryable: true }
  | { kind: "permanent"; signal: "ZodError"; retryable: false }
  | { kind: "conflict"; signal: "P2034"; retryable: true }
  | { kind: "duplicate"; signal: "Idempotency-Key"; retryable: false }
  | { kind: "overload"; signal: "429"; retryable: true };

export interface FailureExample {
  kind: FailureKind;
  retryable: boolean;
  safePolicy: SafePolicy;
  signal: string;
}

export const failureTaxonomy: FailureExample[] = [
  { kind: "timeout", retryable: true, safePolicy: "retry", signal: "AbortError" },
  { kind: "permanent", retryable: false, safePolicy: "reject", signal: "ZodError" },
  { kind: "duplicate", retryable: false, safePolicy: "replay", signal: "Idempotency-Key" },
  { kind: "overload", retryable: true, safePolicy: "shed", signal: "429" }
];

export function chooseSafePolicy(event: FailureEvent): SafePolicy {
  switch (event.kind) {
    case "timeout":
    case "transient":
    case "conflict":
      return "retry";
    case "abort":
    case "permanent":
      return "reject";
    case "duplicate":
      return "replay";
    case "overload":
      return "shed";
  }
}
