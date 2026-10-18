export interface ShutdownStep {
  resource: "http-server" | "redis" | "prisma";
  action: "stop-accepting" | "quit" | "disconnect";
}

export const shutdownSteps: ShutdownStep[] = [
  { resource: "http-server", action: "stop-accepting" },
  { resource: "redis", action: "quit" },
  { resource: "prisma", action: "disconnect" }
];
