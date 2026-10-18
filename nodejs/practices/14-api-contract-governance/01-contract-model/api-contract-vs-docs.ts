export type ContractArtifact = {
  route: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  operationId: string;
  requestSchema: string;
  responseSchema: string;
  errorSchema: string;
};

export function compareContractToDocs(artifact: ContractArtifact): string[] {
  return [
    artifact.operationId,
    artifact.requestSchema,
    artifact.responseSchema,
    artifact.errorSchema
  ];
}
