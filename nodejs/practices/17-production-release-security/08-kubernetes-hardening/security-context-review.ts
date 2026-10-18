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
  topic: "security context review",
  trigger: "release validation",
  ownerFile: "k8s/deployment.yaml",
  trustBoundary: "local artifact versus production claim",
  command: "npm run k8s:security:check",
  artifact: "k8s/deployment.yaml",
  securityRule: "pod and container security contexts differ",
  releaseGate: "UNKNOWN never equals PASS",
  observableOutput: "structured validation result",
  failureMode: "pod and container security contexts differ"
};

export function decideEvidenceStatus(value: boolean | undefined): EvidenceStatus {
  if (value === true) return "PASS";
  if (value === false) return "FAIL";
  return "UNKNOWN";
}

export function summarizeEvidence(input: ReleaseEvidence): string {
  return [input.topic, input.ownerFile, input.command, input.releaseGate].join(" | ");
}
