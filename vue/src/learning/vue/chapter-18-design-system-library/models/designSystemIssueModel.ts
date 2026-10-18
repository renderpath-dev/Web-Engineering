export type DesignSystemIssueSeverity = "low" | "medium" | "high";

export interface DesignSystemIssue {
  readonly id: string;
  readonly title: string;
  readonly severity: DesignSystemIssueSeverity;
  readonly open: boolean;
}

export interface DesignSystemReleaseGate {
  readonly tokenDocsComplete: boolean;
  readonly testsPassing: boolean;
  readonly accessibilityEvidenceComplete: boolean;
  readonly securityReviewComplete: boolean;
  readonly packageBoundaryDocumented: boolean;
  readonly issues: readonly DesignSystemIssue[];
}

export function isDesignSystemReleaseBlocked(
  gate: DesignSystemReleaseGate,
): boolean {
  const hasHighOpenIssue = gate.issues.some(
    (issue) => issue.open && issue.severity === "high",
  );

  return (
    hasHighOpenIssue ||
    !gate.tokenDocsComplete ||
    !gate.testsPassing ||
    !gate.accessibilityEvidenceComplete ||
    !gate.securityReviewComplete ||
    !gate.packageBoundaryDocumented
  );
}
