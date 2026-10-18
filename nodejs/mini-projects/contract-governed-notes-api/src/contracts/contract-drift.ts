import { routeInventory, routeKey } from "./route-inventory.js";
import { buildOpenApiInventory } from "./openapi-inventory.js";
import type { OpenApiDocument } from "./openapi-loader.js";

export type ContractDrift = {
  check: string;
  message: string;
};

export function findContractDrift(document: OpenApiDocument): ContractDrift[] {
  const drift: ContractDrift[] = [];
  const openApiInventory = buildOpenApiInventory(document);
  const openApiByRoute = new Map(openApiInventory.map((item) => [`${item.method} ${item.path}`, item]));

  for (const route of routeInventory) {
    const openApiRoute = openApiByRoute.get(routeKey(route));
    if (!openApiRoute) {
      drift.push({ check: "missing_openapi_operation", message: routeKey(route) });
      continue;
    }
    if (openApiRoute.operationId !== route.operationId) {
      drift.push({ check: "operation_id_mismatch", message: `${routeKey(route)} ${openApiRoute.operationId} ${route.operationId}` });
    }
    if (openApiRoute.deprecated !== route.deprecated) {
      drift.push({ check: "deprecated_flag_mismatch", message: route.operationId });
    }
  }

  const seen = new Set<string>();
  for (const item of openApiInventory) {
    if (seen.has(item.operationId)) drift.push({ check: "duplicate_operation_id", message: item.operationId });
    seen.add(item.operationId);
  }

  return drift;
}
