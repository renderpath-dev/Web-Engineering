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
  topic: "request size limit policy",
  trigger: "release validation",
  ownerFile: "src/api/app.ts",
  trustBoundary: "local artifact versus production claim",
  command: "npm test",
  artifact: "src/api/app.ts",
  securityRule: "body size is a release security control",
  releaseGate: "UNKNOWN never equals PASS",
  observableOutput: "structured validation result",
  failureMode: "body size is a release security control"
};

export function decideEvidenceStatus(value: boolean | undefined): EvidenceStatus {
  if (value === true) return "PASS";
  if (value === false) return "FAIL";
  return "UNKNOWN";
}

export function summarizeEvidence(input: ReleaseEvidence): string {
  return [input.topic, input.ownerFile, input.command, input.releaseGate].join(" | ");
}
