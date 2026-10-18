export type ReleaseFailureKind = "consumer-break" | "ci-failure" | "style-break";

export interface RollbackHotfixDecision {
  readonly failureKind: ReleaseFailureKind;
  readonly affectedPackage: string;
  readonly affectedConsumer: string;
  readonly rollbackOwner: string;
  readonly patchBranchNeeded: boolean;
  readonly communicationReady: boolean;
}

export const rollbackHotfixDecision: RollbackHotfixDecision = {
  failureKind: "consumer-break",
  affectedPackage: "@vue-lab/design-system",
  affectedConsumer: "@vue-lab/admin-app",
  rollbackOwner: "Release Engineering",
  patchBranchNeeded: true,
  communicationReady: false,
};

export function isRollbackPathReady(decision: RollbackHotfixDecision): boolean {
  return decision.patchBranchNeeded && decision.communicationReady;
}

export function getRollbackBlockingReason(decision: RollbackHotfixDecision): string {
  if (!decision.communicationReady) {
    return "consumer notice missing";
  }

  return "rollback path ready";
}

