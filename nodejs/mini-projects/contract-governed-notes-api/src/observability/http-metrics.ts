import type { RequestHandler } from "express";
import { getRoutePattern } from "../contracts/route-inventory.js";
import { httpRequestCounter } from "./metrics.js";

function statusClass(statusCode: number): string {
  return `${Math.floor(statusCode / 100)}xx`;
}

export function recordHttpRequest(method: string, route: string, statusCode: number): void {
  httpRequestCounter.inc({
    method: method.toUpperCase(),
    route,
    status_class: statusClass(statusCode)
  });
}

export const httpMetrics: RequestHandler = (request, response, next) => {
  response.on("finish", () => {
    recordHttpRequest(request.method, getRoutePattern(request), response.statusCode);
  });
  next();
};
