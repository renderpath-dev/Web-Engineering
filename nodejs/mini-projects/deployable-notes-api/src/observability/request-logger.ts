import type { NextFunction, Request, Response } from "express";
import { logger } from "./logger.js";
import { httpRequestDurationSeconds, httpRequestsTotal } from "./metrics.js";

function getRoutePattern(request: Request): string {
  if (request.route?.path) return `${request.baseUrl}${String(request.route.path)}`;
  return request.path;
}

export function requestLogger(request: Request, response: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint();

  response.on("finish", () => {
    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
    const statusClass = `${Math.trunc(response.statusCode / 100)}xx`;
    const route = getRoutePattern(request);

    httpRequestsTotal.inc({ method: request.method, route, status_class: statusClass });
    httpRequestDurationSeconds.observe({ method: request.method, route, status_class: statusClass }, durationSeconds);

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
