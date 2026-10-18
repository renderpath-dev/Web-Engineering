const operationIds = new Set<string>();

export function registerOperationId(operationId: string): void {
  if (operationIds.has(operationId)) {
    throw new Error(`Duplicate operationId: ${operationId}`);
  }

  operationIds.add(operationId);
}
