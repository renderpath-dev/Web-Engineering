export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export function shouldWriteLog(level: LogLevel, minimum: LogLevel): boolean {
  const order: LogLevel[] = ["trace", "debug", "info", "warn", "error", "fatal"];
  return order.indexOf(level) >= order.indexOf(minimum);
}
