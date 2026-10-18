import type { IncidentSeverity } from "./incidentSeverityModel";

export interface RollbackDecisionInput {
  readonly severity: IncidentSeverity;
  readonly releaseHealthBlocked: boolean;
  readonly mitigationAvailable: boolean;
}

export interface RollbackDecision {
  readonly recommended: boolean;
  readonly owner: string;
  readonly reason: string;
}

export function decideRollback(input: RollbackDecisionInput): RollbackDecision {
  const severe = input.severity === "sev1" || input.severity === "sev2";
  const recommended = input.releaseHealthBlocked && (severe || !input.mitigationAvailable);

  return {
    recommended,
    owner: recommended ? "release-owner" : "feature-owner",
    reason: recommended
      ? "Rollback is recommended by incident threshold model."
      : "Mitigation can continue with owner review.",
  };
}
