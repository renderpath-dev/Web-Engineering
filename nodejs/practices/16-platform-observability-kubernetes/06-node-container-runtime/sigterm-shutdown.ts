export type ShutdownStep = "stop-accepting" | "close-http-server" | "close-dependencies" | "shutdown-telemetry" | "exit";

export const gracefulShutdownOrder: ShutdownStep[] = [
  "stop-accepting",
  "close-http-server",
  "close-dependencies",
  "shutdown-telemetry",
  "exit"
];
