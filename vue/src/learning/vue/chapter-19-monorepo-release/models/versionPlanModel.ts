export type SemverImpact = "patch" | "minor" | "major";

export interface PublicApiChange {
  readonly removedExport: boolean;
  readonly addedExport: boolean;
  readonly behaviorChanged: boolean;
}

export interface VersionPlan {
  readonly packageName: string;
  readonly currentVersion: string;
  readonly nextVersion: string;
  readonly impact: SemverImpact;
}

export const versionPlan: VersionPlan = {
  packageName: "@vue-lab/design-system",
  currentVersion: "1.4.2",
  nextVersion: "2.0.0",
  impact: "major",
};

export function inferSemverImpact(change: PublicApiChange): SemverImpact {
  if (change.removedExport) {
    return "major";
  }

  if (change.addedExport) {
    return "minor";
  }

  if (change.behaviorChanged) {
    return "patch";
  }

  return "patch";
}

export function doesVersionPlanMatchImpact(
  plan: VersionPlan,
  impact: SemverImpact,
): boolean {
  return plan.impact === impact;
}

