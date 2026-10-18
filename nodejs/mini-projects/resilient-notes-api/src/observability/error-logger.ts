import type { NextFunction, Request, Response } from "express";
import { logger } from "./logger.js";
import { getRoutePattern } from "./http-metrics.js";

export function errorLogger(error: unknown, request: Request, _response: Response, next: NextFunction): void {
  logger.error(
    {
      requestId: request.id,
      method: request.method,
      route: getRoutePattern(request),
      error: error instanceof Error ? error.message : "Unknown error"
    },
    "HTTP request failed"
  );
  next(error);
}
