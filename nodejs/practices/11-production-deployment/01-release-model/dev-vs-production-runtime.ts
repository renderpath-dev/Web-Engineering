export type RuntimeRole = "development" | "build" | "production";

export interface RuntimeCommand {
  role: RuntimeRole;
  command: string;
  watchesSource: boolean;
  createsRuntimeArtifact: boolean;
}

export const runtimeCommands: RuntimeCommand[] = [
  { role: "development", command: "tsx watch src/server.ts", watchesSource: true, createsRuntimeArtifact: false },
  { role: "build", command: "tsc -p tsconfig.json", watchesSource: false, createsRuntimeArtifact: true },
  { role: "production", command: "node dist/src/server.js", watchesSource: false, createsRuntimeArtifact: false }
];

export function isValidProductionRuntime(command: RuntimeCommand): boolean {
  return command.role === "production" && command.command.startsWith("node ") && !command.watchesSource;
}

export function explainRuntimeBoundary(command: RuntimeCommand): string {
  if (command.watchesSource) return "Watcher processes are development feedback loops, not release runtimes.";
  if (command.createsRuntimeArtifact) return "Build commands create emitted JavaScript but do not serve traffic.";
  return "Production runtime starts a fixed artifact with the Node process.";
}
