import type { NextFunction, Request, Response } from "express";
import { logger } from "./logger.js";
import { getRoutePattern } from "./http-metrics.js";

export function requestLogger(request: Request, response: Response, next: NextFunction): void {
  const started = process.hrtime.bigint();
  response.on("finish", () => {
    logger.info(
      {
        requestId: request.id,
        method: request.method,
        route: getRoutePattern(request),
        statusCode: response.statusCode,
        durationMs: Number(process.hrtime.bigint() - started) / 1_000_000
      },
      "HTTP request completed"
    );
  });
  next();
}
