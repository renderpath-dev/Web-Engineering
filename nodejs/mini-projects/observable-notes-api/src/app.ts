import express from "express";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { notebookRoutes } from "./modules/notebooks/notebooks.routes.js";
import { notesRoutes } from "./modules/notes/notes.routes.js";
import { healthRoutes } from "./health/health.routes.js";
import { metricsRoutes } from "./observability/metrics.routes.js";
import { errorLogger } from "./observability/error-logger.js";
import { requestLogger } from "./observability/request-logger.js";
import { startEventLoopMetrics } from "./observability/event-loop-metrics.js";
import { authenticateSession } from "./shared/auth/authenticate-session.js";
import { errorMiddleware } from "./shared/errors/error-middleware.js";
import { corsMiddleware } from "./shared/middleware/cors.js";
import { notFound } from "./shared/middleware/not-found.js";
import { apiRateLimit } from "./shared/middleware/rate-limit.js";
import { requestId } from "./shared/middleware/request-id.js";
import { securityHeaders } from "./shared/middleware/security-headers.js";

startEventLoopMetrics();

export const app = express();

app.disable("x-powered-by");
app.use(requestId);
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(apiRateLimit);
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);

app.use("/health", healthRoutes);
app.use("/metrics", metricsRoutes);
app.use("/auth", authRoutes);
app.use("/notebooks", authenticateSession, notebookRoutes);
app.use("/notes", authenticateSession, notesRoutes);

app.use(notFound);
app.use(errorLogger);
app.use(errorMiddleware);
