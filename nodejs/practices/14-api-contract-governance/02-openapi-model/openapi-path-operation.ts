export type OpenApiOperation = {
  operationId: string;
  responses: Record<string, unknown>;
};

export function operationHasStableIdentity(operation: OpenApiOperation): boolean {
  return operation.operationId.length > 0 && Object.keys(operation.responses).length > 0;
}
