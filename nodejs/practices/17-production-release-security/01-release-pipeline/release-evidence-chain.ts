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
  topic: "release evidence chain",
  trigger: "release validation",
  ownerFile: "release/release-manifest.example.json",
  trustBoundary: "local artifact versus production claim",
  command: "npm run release:manifest",
  artifact: "release/release-manifest.example.json",
  securityRule: "evidence must point to artifacts",
  releaseGate: "UNKNOWN never equals PASS",
  observableOutput: "structured validation result",
  failureMode: "evidence must point to artifacts"
};

export function decideEvidenceStatus(value: boolean | undefined): EvidenceStatus {
  if (value === true) return "PASS";
  if (value === false) return "FAIL";
  return "UNKNOWN";
}

export function summarizeEvidence(input: ReleaseEvidence): string {
  return [input.topic, input.ownerFile, input.command, input.releaseGate].join(" | ");
}
