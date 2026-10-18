export interface ReleaseCandidateApproval {
  readonly owner: string;
  readonly approved: boolean;
}

export interface ReleaseCandidate {
  readonly id: string;
  readonly changedPackages: readonly string[];
  readonly versionPlanComplete: boolean;
  readonly changelogComplete: boolean;
  readonly migrationNoteComplete: boolean;
  readonly approvals: readonly ReleaseCandidateApproval[];
}

export const releaseCandidate: ReleaseCandidate = {
  id: "rc-19-local",
  changedPackages: ["@vue-lab/design-system", "@vue-lab/admin-app"],
  versionPlanComplete: true,
  changelogComplete: true,
  migrationNoteComplete: false,
  approvals: [
    { owner: "Design Systems", approved: true },
    { owner: "App Experience", approved: false },
  ],
};

export function isReleaseCandidateBlocked(candidate: ReleaseCandidate): boolean {
  return (
    candidate.changedPackages.length === 0 ||
    !candidate.versionPlanComplete ||
    !candidate.changelogComplete ||
    !candidate.migrationNoteComplete ||
    candidate.approvals.some((approval) => !approval.approved)
  );
}

