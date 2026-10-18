export type VersionPolicyKind = "exact" | "caret" | "workspace" | "peer";

export interface DependencyPolicy {
  readonly packageName: string;
  readonly dependencyName: string;
  readonly versionRange: string;
  readonly policyKind: VersionPolicyKind;
  readonly requiredReview: boolean;
}

export const dependencyPolicies: readonly DependencyPolicy[] = [
  {
    packageName: "@vue-lab/design-system",
    dependencyName: "vue",
    versionRange: "^3.5.0",
    policyKind: "peer",
    requiredReview: true,
  },
  {
    packageName: "@vue-lab/admin-app",
    dependencyName: "@vue-lab/design-system",
    versionRange: "workspace:*",
    policyKind: "workspace",
    requiredReview: true,
  },
];

export function isDependencyPolicyReviewRequired(policy: DependencyPolicy): boolean {
  return policy.requiredReview || policy.policyKind === "caret";
}

export function isWorkspaceProtocol(policy: DependencyPolicy): boolean {
  return policy.versionRange.startsWith("workspace:");
}

