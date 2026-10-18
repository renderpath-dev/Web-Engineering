import http from "node:http";

export function applyHttpTimeouts(server: http.Server): void {
  server.requestTimeout = 30_000;
  server.headersTimeout = 10_000;
  server.keepAliveTimeout = 5_000;
}
