import { computed } from "vue";
import {
  countPackagesByKind,
  listPackageDependencies,
  workspaceDependencyEdges,
  workspacePackages,
} from "../models/workspacePackageModel";

export function useWorkspaceGraph() {
  const appCount = computed(() => countPackagesByKind(workspacePackages, "app"));
  const libraryCount = computed(() => countPackagesByKind(workspacePackages, "library"));
  const graphRows = computed(() =>
    workspacePackages.map((workspacePackage) => ({
      packageName: workspacePackage.name,
      owner: workspacePackage.owner,
      dependencies:
        listPackageDependencies(workspaceDependencyEdges, workspacePackage.name).join(", ") ||
        "none",
    })),
  );

  return {
    appCount,
    libraryCount,
    graphRows,
  };
}

