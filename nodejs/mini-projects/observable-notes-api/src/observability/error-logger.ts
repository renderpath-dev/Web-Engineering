import type { ErrorRequestHandler } from "express";
import { getRequestContext } from "./request-context.js";
import { logger } from "./logger.js";
import { redactSensitiveData } from "./log-redaction.js";
import { sanitizeLogField } from "./log-sanitization.js";
import { getRoutePattern } from "./request-logger.js";

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return redactSensitiveData({
      name: error.name,
      message: error.message,
      stack: error.stack
    }) as Record<string, unknown>;
  }

  return { message: sanitizeLogField(error) };
}

export const errorLogger: ErrorRequestHandler = (error, request, _response, next) => {
  const context = getRequestContext();
  const routePattern = getRoutePattern(request);
  const safeRoute = routePattern === "unmatched" ? sanitizeLogField(request.path || "unmatched") : routePattern;

  logger.error({
    requestId: context?.requestId,
    method: sanitizeLogField(request.method),
    route: safeRoute,
    error: serializeError(error)
  }, "request failed");

  next(error);
};
