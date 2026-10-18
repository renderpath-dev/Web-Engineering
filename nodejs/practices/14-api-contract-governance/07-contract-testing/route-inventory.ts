export type RouteInventoryItem = {
  method: string;
  path: string;
  operationId: string;
};

export function routeKey(route: RouteInventoryItem): string {
  return `${route.method.toUpperCase()} ${route.path}`;
}
