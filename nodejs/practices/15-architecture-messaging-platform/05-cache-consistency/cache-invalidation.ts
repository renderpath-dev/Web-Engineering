export type CacheInvalidationEvent = {
  resource: "project-summary";
  resourceId: string;
  reason: "task-created" | "task-imported" | "manual";
};

export function buildInvalidationKey(event: CacheInvalidationEvent): string {
  return `cache:v1:${event.resource}:${event.resourceId}`;
}
