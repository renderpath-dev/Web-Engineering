export type ComponentEvidenceType =
  | "typecheck"
  | "unit"
  | "component"
  | "accessibility-assertion"
  | "visual-screenshot"
  | "manual-review";

export type EvidenceStatus = "pass" | "fail" | "skipped" | "unknown";

export interface ComponentTestEvidence {
  readonly type: ComponentEvidenceType;
  readonly status: EvidenceStatus;
  readonly required: boolean;
  readonly evidence: string;
}

export function blocksComponentRelease(
  evidence: readonly ComponentTestEvidence[],
): boolean {
  return evidence.some(
    (item) => item.required && (item.status === "fail" || item.status === "unknown"),
  );
}
