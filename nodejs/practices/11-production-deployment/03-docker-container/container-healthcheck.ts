export interface HealthProbe {
  name: "live" | "ready" | "container";
  path: string;
  dependsOnExternalServices: boolean;
}

export const healthProbes: HealthProbe[] = [
  { name: "live", path: "/health/live", dependsOnExternalServices: false },
  { name: "ready", path: "/health/ready", dependsOnExternalServices: true },
  { name: "container", path: "/health/live", dependsOnExternalServices: false }
];

export function shouldRestartContainer(probe: HealthProbe, ok: boolean): boolean {
  return probe.name === "container" && !ok;
}
