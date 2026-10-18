import type { CiCheckStatus } from "./ciPipelineEvidenceModel";

export interface TestBuildMatrixRow {
  readonly packageName: string;
  readonly checkName: string;
  readonly status: CiCheckStatus;
  readonly required: boolean;
}

export const testBuildMatrixRows: readonly TestBuildMatrixRow[] = [
  {
    packageName: "@vue-lab/design-system",
    checkName: "typecheck",
    status: "pass",
    required: true,
  },
  {
    packageName: "@vue-lab/design-system",
    checkName: "unit",
    status: "pass",
    required: true,
  },
  {
    packageName: "@vue-lab/admin-app",
    checkName: "consumer-css",
    status: "unknown",
    required: true,
  },
];

export function isMatrixReleaseBlocked(rows: readonly TestBuildMatrixRow[]): boolean {
  return rows.some((row) => row.required && row.status !== "pass");
}

export function countRowsByStatus(
  rows: readonly TestBuildMatrixRow[],
  status: CiCheckStatus,
): number {
  return rows.filter((row) => row.status === status).length;
}

