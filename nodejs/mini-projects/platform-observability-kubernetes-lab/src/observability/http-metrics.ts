import type { NextFunction, Request, Response } from "express";
import { httpRequestDurationSeconds, httpRequestsTotal, assertSafeMetricLabels } from "./metrics.js";

function statusClass(statusCode: number): string {
  return Math.floor(statusCode / 100) + "xx";
}

export function routePattern(request: Request): string {
  if (request.route?.path) {
    const baseUrl = request.baseUrl || "";
    const routePath = Array.isArray(request.route.path) ? request.route.path[0] : String(request.route.path);
    return baseUrl + routePath;
  }
  return request.path === "/" ? "/" : "/unmatched";
}

export function httpMetricsMiddleware(request: Request, response: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();
  response.on("finish", () => {
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1_000_000_000;
    const labels = {
      method: request.method,
      route: routePattern(request),
      status_class: statusClass(response.statusCode)
    };
    assertSafeMetricLabels(labels);
    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationSeconds);
  });
  next();
}
