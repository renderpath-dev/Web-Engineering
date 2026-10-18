import express, { type Express } from "express";
import type { AppConfig } from "./config/env.js";
import { config } from "./config/env.js";
import { createProductionRuntimePolicy } from "./config/production.js";
import { contractsRoutes } from "./modules/contracts/contracts.routes.js";
import { healthRoutes } from "./health/health.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { authenticateSession } from "./modules/auth/auth.controller.js";
import { notebookRoutes } from "./modules/notebooks/notebooks.routes.js";
import { notebookNotesRoutes, notesRoutes } from "./modules/notes/notes.routes.js";
import { versioningRoutes } from "./modules/versioning/versioning.routes.js";
import { httpMetrics } from "./observability/http-metrics.js";
import { metricsRoutes } from "./observability/metrics.routes.js";
import { errorMiddleware } from "./shared/errors/error-middleware.js";
import { corsMiddleware } from "./shared/middleware/cors.js";
import { apiRateLimit } from "./shared/middleware/rate-limit.js";
import { notFound } from "./shared/middleware/not-found.js";
import { requestId } from "./shared/middleware/request-id.js";
import { securityHeaders } from "./shared/middleware/security-headers.js";

export function createApp(appConfig: AppConfig = config): Express {
  const runtimePolicy = createProductionRuntimePolicy(appConfig);
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", runtimePolicy.trustProxy);
  app.use(requestId);
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(apiRateLimit);
  app.use(express.json({ limit: "1mb" }));
  app.use(httpMetrics);

  app.use("/v1/health", healthRoutes);
  app.use("/v1/metrics", metricsRoutes);
  app.use("/v1/auth", authRoutes);
  app.use("/v1/notebooks/:notebookId/notes", authenticateSession, notebookNotesRoutes);
  app.use("/v1/notebooks", authenticateSession, notebookRoutes);
  app.use("/v1/notes", authenticateSession, notesRoutes);
  app.use("/v1/contracts", contractsRoutes);
  app.use("/v1", versioningRoutes);

  app.use(notFound);
  app.use(errorMiddleware);

  return app;
}

export const app = createApp();
