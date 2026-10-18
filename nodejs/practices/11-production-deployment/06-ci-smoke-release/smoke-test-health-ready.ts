export interface SmokeEndpoint {
  name: "live" | "ready";
  path: "/health/live" | "/health/ready";
  requiredStatus: 200;
}

export const smokeEndpoints: SmokeEndpoint[] = [
  { name: "live", path: "/health/live", requiredStatus: 200 },
  { name: "ready", path: "/health/ready", requiredStatus: 200 }
];

export function isSmokeSuccess(statusByPath: Record<string, number>): boolean {
  return smokeEndpoints.every((endpoint) => statusByPath[endpoint.path] === endpoint.requiredStatus);
}
