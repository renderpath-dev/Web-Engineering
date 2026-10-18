export type AccessibilityRequirement =
  | "role"
  | "name"
  | "description"
  | "keyboard"
  | "focus-visible"
  | "state";

export interface AccessibilityContract {
  readonly componentName: string;
  readonly requirements: readonly AccessibilityRequirement[];
  readonly verifiedRequirements: readonly AccessibilityRequirement[];
}

export function findMissingAccessibilityEvidence(
  contract: AccessibilityContract,
): readonly AccessibilityRequirement[] {
  const verified = new Set(contract.verifiedRequirements);

  return contract.requirements.filter((requirement) => !verified.has(requirement));
}
