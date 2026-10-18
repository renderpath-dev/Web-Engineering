import type { ErrorRequestHandler } from "express";
import { logger } from "./logger.js";

function scrubPattern(value: string): string {
  return value
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, ":id")
    .replace(/\d+/g, ":number");
}

function getSafeRoutePattern(request: Parameters<ErrorRequestHandler>[1]): string {
  if (request.route?.path) return scrubPattern(request.baseUrl + String(request.route.path));
  return scrubPattern(request.path);
}

export const errorLogger: ErrorRequestHandler = (error, request, response, next) => {
  logger.error({
    requestId: response.getHeader("x-request-id"),
    method: request.method,
    route: getSafeRoutePattern(request),
    error
  }, "request failed");

  next(error);
};
