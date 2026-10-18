import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { trace } from "@opentelemetry/api";

export type RequestContext = {
  requestId: string;
  correlationId: string;
  traceId?: string;
  spanId?: string;
};

declare module "express-serve-static-core" {
  interface Request {
    context: RequestContext;
  }
}

function headerValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function requestContextMiddleware(request: Request, response: Response, next: NextFunction): void {
  const requestId = headerValue(request.headers["x-request-id"]) ?? randomUUID();
  const correlationId = headerValue(request.headers["x-correlation-id"]) ?? requestId;
  const activeSpan = trace.getActiveSpan();
  const activeSpanContext = activeSpan?.spanContext();

  request.context = {
    requestId,
    correlationId,
    traceId: activeSpanContext?.traceId,
    spanId: activeSpanContext?.spanId
  };

  response.setHeader("x-request-id", requestId);
  response.setHeader("x-correlation-id", correlationId);
  if (activeSpanContext?.traceId) {
    response.setHeader("traceparent", "00-" + activeSpanContext.traceId + "-" + activeSpanContext.spanId + "-01");
  }
  next();
}
