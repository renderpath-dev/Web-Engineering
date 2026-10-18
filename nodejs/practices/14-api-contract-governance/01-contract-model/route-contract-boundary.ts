export type RouteBoundary = {
  method: string;
  expressPattern: string;
  publicPath: string;
  operationId: string;
};

export function routeMatchesPublicContract(route: RouteBoundary): boolean {
  return route.expressPattern === route.publicPath && route.operationId.length > 0;
}
