export type CiCheckStatus = "pass" | "fail" | "skipped" | "unknown";

export type CiStage = "checkout" | "install" | "typecheck" | "test" | "build" | "artifact";

export interface CiPipelineCheck {
  readonly packageName: string;
  readonly stage: CiStage;
  readonly status: CiCheckStatus;
  readonly required: boolean;
  readonly evidenceId: string;
}

export const ciPipelineChecks: readonly CiPipelineCheck[] = [
  {
    packageName: "@vue-lab/design-system",
    stage: "typecheck",
    status: "pass",
    required: true,
    evidenceId: "local-typecheck-model",
  },
  {
    packageName: "@vue-lab/design-system",
    stage: "test",
    status: "pass",
    required: true,
    evidenceId: "local-unit-model",
  },
  {
    packageName: "@vue-lab/admin-app",
    stage: "artifact",
    status: "unknown",
    required: true,
    evidenceId: "ci-artifact-missing",
  },
];

export function isRequiredCiCheckBlocking(check: CiPipelineCheck): boolean {
  return check.required && check.status !== "pass";
}

export function listBlockingCiChecks(
  checks: readonly CiPipelineCheck[],
): readonly CiPipelineCheck[] {
  return checks.filter(isRequiredCiCheckBlocking);
}

