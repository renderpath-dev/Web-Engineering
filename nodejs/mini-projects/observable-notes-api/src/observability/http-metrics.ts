import { httpRequestDurationSeconds, httpRequestsTotal } from "./metrics.js";
import { sanitizeRoutePattern } from "./log-sanitization.js";

const unsafeLabelNames = new Set([
  "userId",
  "email",
  "requestId",
  "sessionId",
  "noteId",
  "traceId",
  "rawUrl",
  "errorMessage",
  "authorization",
  "cookie"
]);

export function toStatusClass(statusCode: number): string {
  return `${Math.trunc(statusCode / 100)}xx`;
}

export function assertSafeMetricLabelName(labelName: string): void {
  if (unsafeLabelNames.has(labelName)) {
    throw new Error(`Unsafe metric label name: ${labelName}`);
  }
}

export function observeHttpRequest(method: string, route: string, statusCode: number, durationSeconds: number): void {
  const labels = {
    method,
    route: sanitizeRoutePattern(route),
    status_class: toStatusClass(statusCode)
  };

  httpRequestsTotal.inc(labels);
  httpRequestDurationSeconds.observe(labels, durationSeconds);
}
