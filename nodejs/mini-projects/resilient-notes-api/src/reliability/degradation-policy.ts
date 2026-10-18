export interface DegradationDecision {
  status: "ready" | "degraded" | "not_ready";
  dependency: string;
  reason: string;
}

export function chooseDegradationPolicy(
  dependency: string,
  required: boolean,
  healthy: boolean,
  reason: string
): DegradationDecision {
  if (healthy) return { status: "ready", dependency, reason: "ok" };
  return {
    status: required ? "not_ready" : "degraded",
    dependency,
    reason
  };
}
