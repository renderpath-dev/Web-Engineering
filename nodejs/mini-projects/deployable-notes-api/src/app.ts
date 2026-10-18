import express, { type Express } from "express";
import type { AppConfig } from "./config/env.js";
import { config } from "./config/env.js";
import { createProductionRuntimePolicy } from "./config/production.js";
import { healthRoutes } from "./health/health.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { notebookRoutes } from "./modules/notebooks/notebooks.routes.js";
import { notebookNotesRoutes } from "./modules/notes/notebook-notes.routes.js";
import { notesRoutes } from "./modules/notes/notes.routes.js";
import { metricsRoutes } from "./observability/metrics.routes.js";
import { errorLogger } from "./observability/error-logger.js";
import { requestLogger } from "./observability/request-logger.js";
import { authenticateSession } from "./shared/auth/authenticate-session.js";
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
  app.use(requestLogger);

  app.use("/health", healthRoutes);
  app.use("/metrics", metricsRoutes);
  app.use("/auth", authRoutes);
  app.use("/notebooks/:notebookId/notes", authenticateSession, notebookNotesRoutes);
  app.use("/notebooks", authenticateSession, notebookRoutes);
  app.use("/notes", authenticateSession, notesRoutes);

  app.use(notFound);
  app.use(errorLogger);
  app.use(errorMiddleware);

  return app;
}

export const app = createApp();
