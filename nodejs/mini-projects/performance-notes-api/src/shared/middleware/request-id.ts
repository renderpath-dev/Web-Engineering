import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { runWithRequestContext } from "../../observability/request-context.js";

export const requestId: RequestHandler = (request, response, next) => {
  const existing = request.get("x-request-id");
  const id = existing && existing.length <= 128 ? existing : randomUUID();
  response.setHeader("x-request-id", id);
  runWithRequestContext({ requestId: id }, next);
};
