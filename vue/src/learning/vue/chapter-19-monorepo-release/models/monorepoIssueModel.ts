export type MonorepoIssueSeverity = "low" | "medium" | "high";

export interface MonorepoIssue {
  readonly id: string;
  readonly title: string;
  readonly packageName: string;
  readonly severity: MonorepoIssueSeverity;
  readonly open: boolean;
}

export const monorepoIssues: readonly MonorepoIssue[] = [
  {
    id: "MR-19-1",
    title: "CSS smoke evidence missing",
    packageName: "@vue-lab/admin-app",
    severity: "high",
    open: true,
  },
  {
    id: "MR-19-2",
    title: "Migration note draft needed",
    packageName: "@vue-lab/design-system",
    severity: "medium",
    open: true,
  },
];

export function listOpenHighIssues(issues: readonly MonorepoIssue[]): readonly MonorepoIssue[] {
  return issues.filter((issue) => issue.open && issue.severity === "high");
}

