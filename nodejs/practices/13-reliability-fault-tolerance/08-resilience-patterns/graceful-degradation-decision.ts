export function chooseDegradation(required: boolean, healthy: boolean): "ready" | "degraded" | "not_ready" {
  if (healthy) return "ready";
  return required ? "not_ready" : "degraded";
}
