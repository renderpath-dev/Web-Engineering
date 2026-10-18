import { computed, ref } from "vue";
import { findAffectedPackages } from "../models/affectedPackageModel";
import { buildGraphEdges } from "../models/buildOrderModel";

export function useAffectedPackageSet() {
  const changedPackageName = ref("@vue-lab/design-system");
  const affectedPackageNames = computed(() =>
    findAffectedPackages([changedPackageName.value], buildGraphEdges),
  );

  function setChangedPackage(packageName: string): void {
    changedPackageName.value = packageName;
  }

  return {
    changedPackageName,
    affectedPackageNames,
    setChangedPackage,
  };
}

