export type SecuritySeverity = "low" | "medium" | "high" | "critical";
export type SecurityIssueStatus = "open" | "mitigated" | "accepted";

export interface SecurityIssue {
  readonly id: string;
  readonly title: string;
  readonly severity: SecuritySeverity;
  readonly owner: string;
  readonly evidence: string;
  readonly backendDependency: boolean;
  readonly status: SecurityIssueStatus;
  readonly rollbackPath: string;
}

export const securityIssues: ReadonlyArray<SecurityIssue> = [
  {
    id: "sec-html-001",
    title: "Rich text sanitizer needs backend review",
    severity: "high",
    owner: "security-review",
    evidence: "Learning allowlist blocks unsafe tags but is not a production sanitizer.",
    backendDependency: true,
    status: "open",
    rollbackPath: "Disable rich text display and render plain text.",
  },
  {
    id: "sec-env-001",
    title: "Client env exposure review",
    severity: "medium",
    owner: "platform",
    evidence: "VITE prefix review model flags non-public values.",
    backendDependency: false,
    status: "mitigated",
    rollbackPath: "Remove client env usage and rebuild.",
  },
];

export function getBlockingSecurityIssues(
  issues: ReadonlyArray<SecurityIssue>,
): ReadonlyArray<SecurityIssue> {
  return issues.filter((issue) => {
    const severe = issue.severity === "high" || issue.severity === "critical";

    return severe && issue.status === "open";
  });
}

export function canReleaseSecurityWork(issues: ReadonlyArray<SecurityIssue>): boolean {
  return getBlockingSecurityIssues(issues).length === 0;
}
