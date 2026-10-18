export type EvidenceStatus = "PASS" | "FAIL" | "UNKNOWN";

export interface ReleaseEvidence {
  topic: string;
  trigger: string;
  ownerFile: string;
  trustBoundary: string;
  command: string;
  artifact: string;
  securityRule: string;
  releaseGate: string;
  observableOutput: string;
  failureMode: string;
}

export const evidence: ReleaseEvidence = {
  topic: "dependency review gate",
  trigger: "release validation",
  ownerFile: ".github/dependency-review-config.yml",
  trustBoundary: "local artifact versus production claim",
  command: "npm run dependency:check",
  artifact: ".github/dependency-review-config.yml",
  securityRule: "dependency review is future remote enforcement",
  releaseGate: "UNKNOWN never equals PASS",
  observableOutput: "structured validation result",
  failureMode: "dependency review is future remote enforcement"
};

export function decideEvidenceStatus(value: boolean | undefined): EvidenceStatus {
  if (value === true) return "PASS";
  if (value === false) return "FAIL";
  return "UNKNOWN";
}

export function summarizeEvidence(input: ReleaseEvidence): string {
  return [input.topic, input.ownerFile, input.command, input.releaseGate].join(" | ");
}
