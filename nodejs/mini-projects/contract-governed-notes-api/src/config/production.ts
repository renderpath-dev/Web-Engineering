import type { AppConfig } from "./env.js";

export type ProductionRuntimePolicy = {
  trustProxy: number;
  secureCookies: boolean;
  allowedOrigins: string[];
  requestTimeoutMs: number;
  headersTimeoutMs: number;
  keepAliveTimeoutMs: number;
  shutdownTimeoutMs: number;
};

export function createProductionRuntimePolicy(config: AppConfig): ProductionRuntimePolicy {
  return {
    trustProxy: config.TRUST_PROXY,
    secureCookies: config.COOKIE_SECURE,
    allowedOrigins: config.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean),
    requestTimeoutMs: config.HTTP_REQUEST_TIMEOUT_MS,
    headersTimeoutMs: config.HTTP_HEADERS_TIMEOUT_MS,
    keepAliveTimeoutMs: config.HTTP_KEEP_ALIVE_TIMEOUT_MS,
    shutdownTimeoutMs: config.SHUTDOWN_TIMEOUT_MS
  };
}
