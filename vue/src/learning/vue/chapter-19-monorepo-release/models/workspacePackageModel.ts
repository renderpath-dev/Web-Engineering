export type WorkspacePackageKind = "app" | "library" | "tooling";

export type WorkspaceRiskArea =
  | "runtime"
  | "ui-contract"
  | "build-system"
  | "release";

export interface WorkspacePackage {
  readonly name: string;
  readonly kind: WorkspacePackageKind;
  readonly owner: string;
  readonly riskArea: WorkspaceRiskArea;
  readonly publicEntry: string;
}

export interface WorkspaceDependencyEdge {
  readonly sourcePackage: string;
  readonly targetPackage: string;
  readonly reason: string;
}

export const workspacePackages: readonly WorkspacePackage[] = [
  {
    name: "@vue-lab/admin-app",
    kind: "app",
    owner: "App Experience",
    riskArea: "runtime",
    publicEntry: "src/main.ts",
  },
  {
    name: "@vue-lab/design-system",
    kind: "library",
    owner: "Design Systems",
    riskArea: "ui-contract",
    publicEntry: "src/index.ts",
  },
  {
    name: "@vue-lab/release-tools",
    kind: "tooling",
    owner: "Release Engineering",
    riskArea: "release",
    publicEntry: "src/release-gate.ts",
  },
];

export const workspaceDependencyEdges: readonly WorkspaceDependencyEdge[] = [
  {
    sourcePackage: "@vue-lab/admin-app",
    targetPackage: "@vue-lab/design-system",
    reason: "renders shared components",
  },
  {
    sourcePackage: "@vue-lab/release-tools",
    targetPackage: "@vue-lab/design-system",
    reason: "reads package metadata",
  },
];

export function findWorkspacePackage(
  packages: readonly WorkspacePackage[],
  packageName: string,
): WorkspacePackage | undefined {
  return packages.find((workspacePackage) => workspacePackage.name === packageName);
}

export function findPackageOwner(
  packages: readonly WorkspacePackage[],
  packageName: string,
): string {
  return findWorkspacePackage(packages, packageName)?.owner ?? "Unknown Owner";
}

export function listPackageDependencies(
  edges: readonly WorkspaceDependencyEdge[],
  packageName: string,
): readonly string[] {
  return edges
    .filter((edge) => edge.sourcePackage === packageName)
    .map((edge) => edge.targetPackage);
}

export function countPackagesByKind(
  packages: readonly WorkspacePackage[],
  kind: WorkspacePackageKind,
): number {
  return packages.filter((workspacePackage) => workspacePackage.kind === kind).length;
}

