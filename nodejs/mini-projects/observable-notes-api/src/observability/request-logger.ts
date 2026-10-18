import { performance } from "node:perf_hooks";
import type { Request, RequestHandler } from "express";
import { logger } from "./logger.js";
import { sanitizeLogField, sanitizeRoutePattern } from "./log-sanitization.js";
import { observeHttpRequest } from "./http-metrics.js";
import { getActiveTraceFields } from "./tracing.js";
import { getRequestContext } from "./request-context.js";

export function getRoutePattern(request: Request): string {
  const routePath = typeof request.route?.path === "string" ? request.route.path : "unmatched";
  if (routePath === "unmatched") return "unmatched";
  return sanitizeRoutePattern(`${request.baseUrl}${routePath}` || "/");
}

export const requestLogger: RequestHandler = (request, response, next) => {
  const startedAt = performance.now();

  response.on("finish", () => {
    const durationSeconds = (performance.now() - startedAt) / 1000;
    const route = getRoutePattern(request);
    const traceFields = getActiveTraceFields();
    const context = getRequestContext();

    observeHttpRequest(request.method, route, response.statusCode, durationSeconds);

    logger.info({
      requestId: context?.requestId,
      traceId: traceFields.traceId,
      spanId: traceFields.spanId,
      method: sanitizeLogField(request.method),
      route,
      statusCode: response.statusCode,
      durationMs: Number((durationSeconds * 1000).toFixed(2))
    }, "request completed");
  });

  next();
};
