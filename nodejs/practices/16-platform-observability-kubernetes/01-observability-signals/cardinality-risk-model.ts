const riskyLabelNames = new Set(["user_id", "request_id", "trace_id", "span_id", "email", "raw_url", "token"]);

export function cardinalityRisk(labelName: string): "low" | "high" {
  return riskyLabelNames.has(labelName.toLowerCase()) ? "high" : "low";
}
