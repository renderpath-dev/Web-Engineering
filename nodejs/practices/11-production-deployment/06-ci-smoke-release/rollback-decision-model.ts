export interface RollbackDecision {
  failedGate: "health" | "smoke" | "migration" | "config";
  rollbackCode: boolean;
  rollbackDatabase: boolean;
  needsHumanApproval: boolean;
}

export function decideRollback(failedGate: RollbackDecision["failedGate"]): RollbackDecision {
  return {
    failedGate,
    rollbackCode: failedGate !== "migration",
    rollbackDatabase: failedGate === "migration",
    needsHumanApproval: failedGate === "migration"
  };
}
