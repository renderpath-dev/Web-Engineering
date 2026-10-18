export type TelemetrySignal = "log" | "metric" | "trace";

export function chooseSignal(question: string): TelemetrySignal {
  if (question.includes("how many") || question.includes("trend")) return "metric";
  if (question.includes("where time went") || question.includes("path")) return "trace";
  return "log";
}
