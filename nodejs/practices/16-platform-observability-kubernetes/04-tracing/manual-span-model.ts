export type ManualSpan = {
  name: string;
  attributes: Record<string, string | number | boolean>;
};

export function createManualSpan(name: string, operationName: string): ManualSpan {
  return { name, attributes: { "operation.name": operationName } };
}
