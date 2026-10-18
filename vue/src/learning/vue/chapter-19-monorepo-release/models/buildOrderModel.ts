export interface BuildGraphEdge {
  readonly packageName: string;
  readonly dependsOn: string;
}

export const buildPackages: readonly string[] = [
  "@vue-lab/design-system",
  "@vue-lab/admin-app",
  "@vue-lab/release-tools",
];

export const buildGraphEdges: readonly BuildGraphEdge[] = [
  { packageName: "@vue-lab/admin-app", dependsOn: "@vue-lab/design-system" },
  { packageName: "@vue-lab/release-tools", dependsOn: "@vue-lab/design-system" },
];

export function createBuildOrder(
  packageNames: readonly string[],
  edges: readonly BuildGraphEdge[],
): readonly string[] {
  const pending = new Set(packageNames);
  const order: string[] = [];

  while (pending.size > 0) {
    const readyPackages = packageNames.filter(
      (packageName) =>
        pending.has(packageName) &&
        edges
          .filter((edge) => edge.packageName === packageName)
          .every((edge) => !pending.has(edge.dependsOn)),
    );

    if (readyPackages.length === 0) {
      throw new Error("Build graph has a cycle.");
    }

    for (const packageName of readyPackages) {
      pending.delete(packageName);
      order.push(packageName);
    }
  }

  return order;
}

export function mustBuildBefore(
  firstPackage: string,
  secondPackage: string,
  order: readonly string[],
): boolean {
  return order.indexOf(firstPackage) < order.indexOf(secondPackage);
}

