import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "../config/env.js";
import { healthRouter } from "../health/health.routes.js";
import { releaseRouter } from "../modules/release/release.routes.js";
import { securityRouter } from "../modules/security/security.routes.js";
import { errorMiddleware } from "../shared/errors/error-middleware.js";
import { notFoundMiddleware } from "../shared/middleware/not-found.js";
import { requestIdMiddleware } from "../shared/middleware/request-id.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", false);

  app.use(helmet());
  app.use(cors({
    origin: env.API_ORIGIN,
    credentials: false
  }));
  app.use(rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false
  }));
  app.use(express.json({ limit: "100kb" }));
  app.use(requestIdMiddleware);

  app.use("/v1/health", healthRouter);
  app.use("/v1/release", releaseRouter);
  app.use("/v1/security", securityRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
