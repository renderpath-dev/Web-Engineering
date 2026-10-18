export type DeprecatedOperation = {
  operationId: string;
  deprecated: true;
  replacement: string;
};

export function describeDeprecation(operation: DeprecatedOperation): string {
  return `${operation.operationId} -> ${operation.replacement}`;
}
