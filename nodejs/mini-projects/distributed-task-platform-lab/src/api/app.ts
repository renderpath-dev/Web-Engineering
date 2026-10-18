import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config, parseAllowedOrigins } from "../config/env.js";
import { serviceBoundaryModel } from "../architecture/service-boundary.js";
import { migrationPlan } from "../architecture/migration-plan.js";
import { cacheDemoRoutes } from "../modules/cache-demo/cache-demo.routes.js";
import { jobsRoutes } from "../modules/jobs/jobs.routes.js";
import { projectsRoutes } from "../modules/projects/projects.routes.js";
import { tasksRoutes } from "../modules/tasks/tasks.routes.js";
import { healthRoutes } from "../health/health.routes.js";
import { metricsRoutes } from "../observability/metrics.routes.js";
import { httpMetricsMiddleware } from "../observability/http-metrics.js";
import { errorMiddleware } from "../shared/errors/error-middleware.js";
import { notFoundMiddleware } from "../shared/middleware/not-found.js";
import { requestIdMiddleware } from "../shared/middleware/request-id.js";

export const app = express();

app.set("trust proxy", config.TRUST_PROXY);
app.use(helmet());
app.use(cors({ origin: parseAllowedOrigins(config.ALLOWED_ORIGINS) }));
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: "256kb" }));
app.use(requestIdMiddleware);
app.use(httpMetricsMiddleware);

app.use("/v1/health", healthRoutes);
app.use("/v1/metrics", metricsRoutes);
app.use("/v1/projects", projectsRoutes);
app.use("/v1/projects/:projectId/tasks", tasksRoutes);
app.use("/v1/jobs", jobsRoutes);
app.use("/v1/cache-demo", cacheDemoRoutes);

app.get("/v1/architecture/service-boundary", (_request, response) => {
  response.json(serviceBoundaryModel);
});

app.get("/v1/architecture/migration-plan", (_request, response) => {
  response.json({ steps: migrationPlan });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);
