import type { ErrorRequestHandler } from "express";
import { logger } from "./logger.js";

function getSafeRoutePattern(request: Parameters<ErrorRequestHandler>[1]): string {
  if (request.route?.path) return `${request.baseUrl}${String(request.route.path)}`;
  return request.path;
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
