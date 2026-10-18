export type ResourcePair = {
  request: string;
  limit: string;
};

export function hasRequestAndLimit(resource: ResourcePair): boolean {
  return resource.request.length > 0 && resource.limit.length > 0;
}
