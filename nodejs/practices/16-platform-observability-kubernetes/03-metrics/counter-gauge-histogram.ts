export type MetricKind = "counter" | "gauge" | "histogram";

export function metricKindForSignal(signal: "total" | "current" | "duration"): MetricKind {
  if (signal === "total") return "counter";
  if (signal === "current") return "gauge";
  return "histogram";
}
