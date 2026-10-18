export type SemverImpact = "patch" | "minor" | "major";

export interface VersionChange {
  readonly changeType:
    | "bug-fix"
    | "new-prop"
    | "removed-prop"
    | "visual-default-change";
  readonly migrationNote: string;
}

export function getSemverImpact(change: VersionChange): SemverImpact {
  if (change.changeType === "removed-prop") {
    return "major";
  }

  if (change.changeType === "new-prop" || change.changeType === "visual-default-change") {
    return "minor";
  }

  return "patch";
}

export function hasMigrationEvidence(change: VersionChange): boolean {
  return change.migrationNote.trim().length > 0;
}
