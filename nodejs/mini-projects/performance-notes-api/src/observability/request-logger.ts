import type { NextFunction, Request, Response } from "express";
import { logger } from "./logger.js";
import { recordHttpRequest } from "./http-metrics.js";

function scrubPattern(value: string): string {
  return value
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, ":id")
    .replace(/\d+/g, ":number");
}

function getRoutePattern(request: Request): string {
  if (request.route?.path) return scrubPattern(request.baseUrl + String(request.route.path));
  return scrubPattern(request.path);
}

export function requestLogger(request: Request, response: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint();

  response.on("finish", () => {
    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
    const route = getRoutePattern(request);

    recordHttpRequest({
      method: request.method,
      route,
      statusCode: response.statusCode,
      durationSeconds
    });

    logger.info({
      requestId: response.getHeader("x-request-id"),
      method: request.method,
      route,
      statusCode: response.statusCode,
      durationSeconds
    }, "request completed");
  });

  next();
}
