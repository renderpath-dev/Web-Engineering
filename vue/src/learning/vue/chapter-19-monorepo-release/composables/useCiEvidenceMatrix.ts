import { computed } from "vue";
import {
  countRowsByStatus,
  isMatrixReleaseBlocked,
  testBuildMatrixRows,
} from "../models/testBuildMatrixModel";

export function useCiEvidenceMatrix() {
  const passCount = computed(() => countRowsByStatus(testBuildMatrixRows, "pass"));
  const unknownCount = computed(() => countRowsByStatus(testBuildMatrixRows, "unknown"));
  const blocked = computed(() => isMatrixReleaseBlocked(testBuildMatrixRows));

  return {
    rows: testBuildMatrixRows,
    passCount,
    unknownCount,
    blocked,
  };
}

