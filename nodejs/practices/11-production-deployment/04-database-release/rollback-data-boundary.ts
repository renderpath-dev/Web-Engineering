export interface RollbackOption {
  target: "code" | "config" | "image" | "database";
  reversibleByRedeploy: boolean;
}

export const rollbackOptions: RollbackOption[] = [
  { target: "code", reversibleByRedeploy: true },
  { target: "config", reversibleByRedeploy: false },
  { target: "image", reversibleByRedeploy: true },
  { target: "database", reversibleByRedeploy: false }
];
