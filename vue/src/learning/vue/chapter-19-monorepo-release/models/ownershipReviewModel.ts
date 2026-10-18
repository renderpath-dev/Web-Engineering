export interface OwnershipReviewRule {
  readonly packageName: string;
  readonly owner: string;
  readonly requiredReviewer: string;
  readonly riskArea: string;
  readonly approved: boolean;
}

export const ownershipReviewRules: readonly OwnershipReviewRule[] = [
  {
    packageName: "@vue-lab/design-system",
    owner: "Design Systems",
    requiredReviewer: "UI Platform Lead",
    riskArea: "public export surface",
    approved: true,
  },
  {
    packageName: "@vue-lab/admin-app",
    owner: "App Experience",
    requiredReviewer: "Product Surface Lead",
    riskArea: "consumer rendering",
    approved: false,
  },
];

export function listMissingOwnerApprovals(
  rules: readonly OwnershipReviewRule[],
): readonly OwnershipReviewRule[] {
  return rules.filter((rule) => !rule.approved);
}

export function isOwnershipApproved(rules: readonly OwnershipReviewRule[]): boolean {
  return listMissingOwnerApprovals(rules).length === 0;
}

