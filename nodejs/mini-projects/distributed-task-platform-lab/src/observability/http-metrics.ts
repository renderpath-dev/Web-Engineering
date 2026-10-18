import type { Request, RequestHandler } from "express";
import { httpRequestCounter, statusClass } from "./metrics.js";

export function getRoutePattern(request: Request): string {
  const routePath = typeof request.route?.path === "string" ? request.route.path : request.path.replace(/[0-9a-fA-F-]{36}/g, ":id");
  return `${request.baseUrl}${routePath}` || "unmatched";
}

export const httpMetricsMiddleware: RequestHandler = (request, response, next) => {
  response.on("finish", () => {
    httpRequestCounter.inc({
      method: request.method,
      route: getRoutePattern(request),
      status_class: statusClass(response.statusCode)
    });
  });
  next();
};
