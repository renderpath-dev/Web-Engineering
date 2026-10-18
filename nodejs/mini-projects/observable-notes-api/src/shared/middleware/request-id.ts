import type { RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { runWithRequestContext } from "../../observability/request-context.js";
import { sanitizeLogField } from "../../observability/log-sanitization.js";

export const requestId: RequestHandler = (request, response, next) => {
  const incomingRequestId = request.header("x-request-id");
  const id = incomingRequestId ? sanitizeLogField(incomingRequestId).slice(0, 128) : randomUUID();

  response.setHeader("x-request-id", id);
  response.locals.requestId = id;

  runWithRequestContext({ requestId: id, startedAt: performance.now() }, () => {
    next();
  });
};
