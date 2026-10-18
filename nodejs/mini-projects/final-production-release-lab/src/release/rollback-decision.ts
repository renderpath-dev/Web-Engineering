import type { GateSignal, ReleaseDecision, ReleasePhase } from "./gate-model.js";
import { evaluateReleaseGate } from "./gate-model.js";

export interface RollbackDecision {
  decision: ReleaseDecision;
  reason: string;
  requiredEvidence: string[];
}

export function decideRollback(input: { phase: ReleasePhase; signals: GateSignal[] }): RollbackDecision {
  const evaluation = evaluateReleaseGate(input);
  if (evaluation.decision === "rollback") {
    return {
      decision: "rollback",
      reason: evaluation.summary,
      requiredEvidence: ["failed post-release gate", "previous known-good artifact", "smoke result after rollback"]
    };
  }

  if (evaluation.decision === "hold") {
    return {
      decision: "hold",
      reason: evaluation.summary,
      requiredEvidence: ["fixed gate", "rerun validation", "manual release owner review"]
    };
  }

  return {
    decision: "promote",
    reason: evaluation.summary,
    requiredEvidence: ["release manifest", "validation output", "rollback plan"]
  };
}
