import type { WorkspacePackageKind } from "./workspacePackageModel";

export type PackageBuildGoal =
  | "browser-app"
  | "reusable-library"
  | "release-tooling";

export interface PackageBoundary {
  readonly packageName: string;
  readonly packageKind: WorkspacePackageKind;
  readonly entryPoint: string;
  readonly buildGoal: PackageBuildGoal;
  readonly runtimeOwner: string;
  readonly consumerContract: string;
  readonly evidenceRequired: readonly string[];
}

export const packageBoundaries: readonly PackageBoundary[] = [
  {
    packageName: "@vue-lab/admin-app",
    packageKind: "app",
    entryPoint: "src/main.ts",
    buildGoal: "browser-app",
    runtimeOwner: "Browser shell",
    consumerContract: "route and rendered DOM",
    evidenceRequired: ["app build", "consumer smoke"],
  },
  {
    packageName: "@vue-lab/design-system",
    packageKind: "library",
    entryPoint: "src/index.ts",
    buildGoal: "reusable-library",
    runtimeOwner: "Package consumer",
    consumerContract: "exports, types, CSS entry",
    evidenceRequired: ["library build", "type declarations", "CSS import"],
  },
  {
    packageName: "@vue-lab/release-tools",
    packageKind: "tooling",
    entryPoint: "src/release-gate.ts",
    buildGoal: "release-tooling",
    runtimeOwner: "CI job",
    consumerContract: "gate result payload",
    evidenceRequired: ["unit tests", "CI output"],
  },
];

export function findPackageBoundary(
  boundaries: readonly PackageBoundary[],
  packageName: string,
): PackageBoundary | undefined {
  return boundaries.find((boundary) => boundary.packageName === packageName);
}

export function isLibraryPackageBoundary(boundary: PackageBoundary): boolean {
  return boundary.packageKind === "library" && boundary.buildGoal === "reusable-library";
}

export function listRequiredBoundaryEvidence(boundary: PackageBoundary): readonly string[] {
  return boundary.evidenceRequired;
}

