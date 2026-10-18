import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { AppConfig } from "../config/env.js";
import { loadConfig } from "../config/env.js";
import { createDependencyProbes } from "../dependencies/index.js";
import type { DependencyProbe } from "../dependencies/postgres.js";
import { createHealthRouter } from "../health/health.routes.js";
import { createHealthService } from "../health/health.service.js";
import { createSimulationRouter } from "../modules/simulate/simulate.routes.js";
import { createMetricsRouter } from "../observability/metrics.routes.js";
import { httpMetricsMiddleware } from "../observability/http-metrics.js";
import { requestContextMiddleware } from "../observability/request-context.js";
import { createPlatformRouter } from "../platform/platform.routes.js";
import { createSloRouter } from "../slo/slo.routes.js";
import { createSloStore } from "../slo/slo.service.js";
import { errorHandler, notFoundHandler } from "../shared/problem.js";

export type AppDependencies = {
  config?: AppConfig;
  probes?: DependencyProbe[];
};

export function createApp(options: AppDependencies = {}) {
  const config = options.config ?? loadConfig();
  const probes = options.probes ?? createDependencyProbes(config);
  const sloStore = createSloStore();
  const healthService = createHealthService(config, probes);
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGIN === "*" ? true : config.CORS_ORIGIN }));
  app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));
  app.use(express.json({ limit: "32kb" }));
  app.use(requestContextMiddleware);
  app.use(httpMetricsMiddleware);

  app.use("/v1/health", createHealthRouter(healthService));
  app.use("/v1", createMetricsRouter());
  app.use("/v1/simulate", createSimulationRouter(sloStore));
  app.use("/v1/slo", createSloRouter(sloStore));
  app.use("/v1/platform", createPlatformRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return {
    app,
    close: async () => {
      await healthService.close();
    }
  };
}
