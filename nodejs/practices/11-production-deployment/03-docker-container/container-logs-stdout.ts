export interface LogEvent {
  level: "info" | "warn" | "error";
  message: string;
  target: "stdout" | "stderr";
}

export function routeContainerLog(event: LogEvent): "stdout" | "stderr" {
  if (event.level === "error") return "stderr";
  return "stdout";
}

export const noLocalLogFileRule = "Containers should emit process logs to stdout or stderr.";
