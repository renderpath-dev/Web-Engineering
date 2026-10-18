export type DependencyHealth = "ready" | "unavailable";

export type LiveHealth = {
  status: "live";
  uptimeSeconds: number;
};

export type ReadyHealth = {
  status: "ready" | "not_ready";
  dependencies: {
    postgres: DependencyHealth;
    redis: DependencyHealth;
  };
};
