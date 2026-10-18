export type AccessibilityIssueSeverity = "low" | "medium" | "high" | "release-blocking";
export type AccessibilityIssueStatus = "open" | "verified" | "blocked";

export interface AccessibilityIssue {
  readonly id: string;
  readonly title: string;
  readonly wcagCriterion: string;
  readonly owner: string;
  readonly severity: AccessibilityIssueSeverity;
  readonly status: AccessibilityIssueStatus;
  readonly evidence: string;
  readonly remediation: string;
}

export const accessibilityIssues: ReadonlyArray<AccessibilityIssue> = [
  {
    id: "a11y-route-focus",
    title: "Route change needs focus restore evidence",
    wcagCriterion: "2.4.3 Focus Order",
    owner: "Router owner",
    severity: "high",
    status: "open",
    evidence: "useFocusRestore target is defined but browser check remains required.",
    remediation: "Verify skip link and main target focus after navigation.",
  },
  {
    id: "a11y-dialog-trap",
    title: "Dialog focus trap requires runtime evidence",
    wcagCriterion: "2.1.2 No Keyboard Trap",
    owner: "Component owner",
    severity: "release-blocking",
    status: "blocked",
    evidence: "Dialog unit test covers focus cycle and Escape close.",
    remediation: "Run manual keyboard check in browser before release.",
  },
  {
    id: "a11y-responsive-overflow",
    title: "Responsive widths require viewport matrix check",
    wcagCriterion: "1.4.10 Reflow",
    owner: "Layout owner",
    severity: "medium",
    status: "open",
    evidence: "responsiveVerificationModel covers required widths.",
    remediation: "Check each width for page overflow and clipped focus.",
  },
];

export function getBlockedAccessibilityIssues(
  issues: ReadonlyArray<AccessibilityIssue>,
): ReadonlyArray<AccessibilityIssue> {
  return issues.filter((issue) => issue.status === "blocked");
}

export function canReleaseAccessibilityWork(
  issues: ReadonlyArray<AccessibilityIssue>,
): boolean {
  return getBlockedAccessibilityIssues(issues).length === 0;
}

