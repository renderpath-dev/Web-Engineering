import type { AppConfig } from "../config/env.js";
import type { DependencyProbe, DependencyStatus } from "../dependencies/postgres.js";
import { dependencyReadiness } from "../observability/metrics.js";

export type HealthSnapshot = {
  status: "live" | "starting" | "started" | "ready" | "degraded";
  uptimeSeconds: number;
  checks?: DependencyStatus[];
};

export function createHealthService(config: Pick<AppConfig, "STARTUP_GRACE_MS">, dependencies: DependencyProbe[]) {
  const startedAt = Date.now();

  return {
    live(): HealthSnapshot {
      return {
        status: "live",
        uptimeSeconds: process.uptime()
      };
    },

    startup(): HealthSnapshot {
      const startupElapsed = Date.now() - startedAt;
      return {
        status: startupElapsed >= config.STARTUP_GRACE_MS ? "started" : "starting",
        uptimeSeconds: process.uptime()
      };
    },

    async ready(): Promise<HealthSnapshot> {
      const checks = await Promise.all(dependencies.map((dependency) => dependency.check()));
      for (const check of checks) {
        dependencyReadiness.set({ dependency_name: check.name }, check.ready ? 1 : 0);
      }
      const allReady = checks.every((check) => check.ready);
      return {
        status: allReady ? "ready" : "degraded",
        uptimeSeconds: process.uptime(),
        checks
      };
    },

    async close(): Promise<void> {
      await Promise.all(dependencies.map((dependency) => dependency.close()));
    }
  };
}
