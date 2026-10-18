export type SignalKind = "log" | "metric" | "trace" | "alert" | "slo";

export function classifySignal(input: { asksForAction: boolean; asksForTarget: boolean; asksForPath: boolean; asksForTrend: boolean }): SignalKind {
  if (input.asksForAction) return "alert";
  if (input.asksForTarget) return "slo";
  if (input.asksForPath) return "trace";
  if (input.asksForTrend) return "metric";
  return "log";
}
