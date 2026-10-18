import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { TimeoutError } from "../../reliability/timeout.js";
import { buildProblemDetails } from "../../reliability/problem-details.js";
import { problemResponseTotal } from "../../observability/reliability-metrics.js";
import { HttpError } from "./http-error.js";

export function errorMiddleware(error: unknown, request: Request, response: Response, _next: NextFunction): void {
  const mapped = mapError(error);
  const statusClass = `${Math.floor(mapped.status / 100)}xx`;
  problemResponseTotal.inc({ code: mapped.code, statusClass });
  response
    .status(mapped.status)
    .type("application/problem+json")
    .json(
      buildProblemDetails({
        status: mapped.status,
        title: mapped.title,
        detail: mapped.detail,
        code: mapped.code,
        instance: request.path,
        requestId: request.id,
        retryable: mapped.retryable,
        retryAfterSeconds: mapped.retryAfterSeconds,
        validationErrors: mapped.validationErrors
      })
    );
}

function mapError(error: unknown): {
  status: number;
  title: string;
  detail: string;
  code: string;
  retryable?: boolean;
  retryAfterSeconds?: number;
  validationErrors?: unknown;
} {
  if (error instanceof HttpError) {
    return {
      status: error.status,
      title: error.message,
      detail: error.message,
      code: error.code,
      retryable: error.retryable,
      retryAfterSeconds: error.retryAfterSeconds,
      validationErrors: error.details
    };
  }
  if (error instanceof ZodError) {
    return {
      status: 400,
      title: "Validation failed",
      detail: "Request validation failed",
      code: "VALIDATION_ERROR",
      validationErrors: error.issues
    };
  }
  if (error instanceof TimeoutError) {
    return {
      status: 504,
      title: "Dependency timeout",
      detail: error.message,
      code: "TIMEOUT",
      retryable: true
    };
  }
  return {
    status: 500,
    title: "Internal server error",
    detail: "The request failed at an internal boundary",
    code: "INTERNAL_ERROR"
  };
}
