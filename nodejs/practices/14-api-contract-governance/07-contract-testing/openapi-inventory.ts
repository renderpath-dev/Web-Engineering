export type OpenApiInventoryItem = {
  method: string;
  path: string;
  operationId: string;
};

export function openApiKey(item: OpenApiInventoryItem): string {
  return `${item.method.toUpperCase()} ${item.path}`;
}
