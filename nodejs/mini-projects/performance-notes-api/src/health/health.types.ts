export type DependencyStatus = "ready" | "unavailable";

export interface LiveHealth {
  status: "live";
  uptimeSeconds: number;
}

export interface ReadyHealth {
  status: "ready" | "not_ready";
  dependencies: {
    postgres: DependencyStatus;
    redis: DependencyStatus;
  };
}
