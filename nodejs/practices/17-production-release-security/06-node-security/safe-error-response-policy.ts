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
  topic: "safe error response policy",
  trigger: "release validation",
  ownerFile: "src/shared/errors/error-middleware.ts",
  trustBoundary: "local artifact versus production claim",
  command: "npm test",
  artifact: "src/shared/errors/error-middleware.ts",
  securityRule: "public errors must not return stack traces",
  releaseGate: "UNKNOWN never equals PASS",
  observableOutput: "structured validation result",
  failureMode: "public errors must not return stack traces"
};

export function decideEvidenceStatus(value: boolean | undefined): EvidenceStatus {
  if (value === true) return "PASS";
  if (value === false) return "FAIL";
  return "UNKNOWN";
}

export function summarizeEvidence(input: ReleaseEvidence): string {
  return [input.topic, input.ownerFile, input.command, input.releaseGate].join(" | ");
}
