export type DependencyPlacement = "dependency" | "peer" | "external";

export interface PeerDependencyDecision {
  readonly packageName: string;
  readonly dependencyName: string;
  readonly placement: DependencyPlacement;
  readonly externalizedInLibraryBuild: boolean;
  readonly duplicateRuntimeRisk: boolean;
}

export const vuePeerDependencyDecision: PeerDependencyDecision = {
  packageName: "@vue-lab/design-system",
  dependencyName: "vue",
  placement: "peer",
  externalizedInLibraryBuild: true,
  duplicateRuntimeRisk: false,
};

export function isReusableVueLibraryDependencySafe(
  decision: PeerDependencyDecision,
): boolean {
  return (
    decision.dependencyName === "vue" &&
    decision.placement === "peer" &&
    decision.externalizedInLibraryBuild &&
    !decision.duplicateRuntimeRisk
  );
}

export function explainDuplicateVueRisk(decision: PeerDependencyDecision): string {
  if (decision.duplicateRuntimeRisk) {
    return "duplicate Vue runtime risk blocks release";
  }

  return "shared Vue runtime remains consumer-owned";
}

