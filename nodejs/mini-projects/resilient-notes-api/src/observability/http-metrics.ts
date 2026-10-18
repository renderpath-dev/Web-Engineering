import type { NextFunction, Request, Response } from "express";
import { Counter, Histogram } from "prom-client";
import { metricsRegistry } from "./metrics.js";

export const httpRequestTotal = new Counter({
  name: "resilient_notes_http_request_total",
  help: "HTTP request count by low-cardinality route pattern and status class",
  labelNames: ["method", "route", "statusClass"],
  registers: [metricsRegistry]
});

export const httpRequestDurationSeconds = new Histogram({
  name: "resilient_notes_http_request_duration_seconds",
  help: "HTTP request duration by low-cardinality route pattern and status class",
  labelNames: ["method", "route", "statusClass"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [metricsRegistry]
});

export function scrubPattern(pathname: string): string {
  return pathname
    .replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, ":id")
    .replace(/\d+/g, ":id")
    .split("?")[0] || "/";
}

export function getRoutePattern(request: Request): string {
  const routePath = request.route?.path;
  const pathPart = typeof routePath === "string" ? routePath : request.path;
  return scrubPattern(`${request.baseUrl}${pathPart}`);
}

export function httpMetrics(request: Request, response: Response, next: NextFunction): void {
  const started = process.hrtime.bigint();
  response.on("finish", () => {
    const statusClass = `${Math.floor(response.statusCode / 100)}xx`;
    const labels = {
      method: request.method,
      route: getRoutePattern(request),
      statusClass
    };
    const seconds = Number(process.hrtime.bigint() - started) / 1_000_000_000;
    httpRequestTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, seconds);
  });
  next();
}
