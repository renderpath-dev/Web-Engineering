import type { BuildGraphEdge } from "./buildOrderModel";

export function findAffectedPackages(
  changedPackageNames: readonly string[],
  edges: readonly BuildGraphEdge[],
): readonly string[] {
  const affected = new Set(changedPackageNames);
  let changed = true;

  while (changed) {
    changed = false;

    for (const edge of edges) {
      if (affected.has(edge.dependsOn) && !affected.has(edge.packageName)) {
        affected.add(edge.packageName);
        changed = true;
      }
    }
  }

  return Array.from(affected);
}

export function isPackageAffected(
  packageName: string,
  affectedPackages: readonly string[],
): boolean {
  return affectedPackages.includes(packageName);
}

