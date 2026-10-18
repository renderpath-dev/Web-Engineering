import type { OpenApiDocument } from "./openapi-loader.js";

export type OpenApiInventoryItem = {
  method: string;
  path: string;
  operationId: string;
  deprecated: boolean;
};

const httpMethods = new Set(["get", "post", "patch", "delete", "put", "head", "options"]);

export function buildOpenApiInventory(document: OpenApiDocument): OpenApiInventoryItem[] {
  const items: OpenApiInventoryItem[] = [];
  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!httpMethods.has(method)) continue;
      items.push({
        method: method.toUpperCase(),
        path: path.replaceAll("{notebookId}", ":notebookId").replaceAll("{noteId}", ":noteId"),
        operationId: operation.operationId ?? "",
        deprecated: operation.deprecated === true
      });
    }
  }

  return items;
}
