export type ContractEvidence = {
  requestPath: string;
  routeOwner: string;
  contractArtifact: string;
  runtimeValidator: string;
  responseSchema: string;
  testEvidence: string;
};

export function buildEvidenceChain(evidence: ContractEvidence): string {
  return `${evidence.requestPath} -> ${evidence.routeOwner} -> ${evidence.contractArtifact} -> ${evidence.testEvidence}`;
}
