export interface DependencyStatus {
  name: "postgres" | "redis";
  required: boolean;
  healthy: boolean;
  detail: string;
}

export interface HealthStatus {
  status: "live" | "ready" | "degraded" | "not_ready";
  dependencies: DependencyStatus[];
}
