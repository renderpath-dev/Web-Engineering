import type { AppConfig } from "./env.js";

export type RuntimePolicy = {
  shutdownTimeoutMs: number;
  requestTimeoutMs: number;
  headersTimeoutMs: number;
  keepAliveTimeoutMs: number;
  dependencyTimeoutMs: number;
  jobTimeoutMs: number;
  workerConcurrency: number;
  cacheTtlSeconds: number;
};

export function createRuntimePolicy(config: AppConfig): RuntimePolicy {
  return {
    shutdownTimeoutMs: config.SHUTDOWN_TIMEOUT_MS,
    requestTimeoutMs: config.HTTP_REQUEST_TIMEOUT_MS,
    headersTimeoutMs: config.HTTP_HEADERS_TIMEOUT_MS,
    keepAliveTimeoutMs: config.HTTP_KEEP_ALIVE_TIMEOUT_MS,
    dependencyTimeoutMs: config.DEPENDENCY_TIMEOUT_MS,
    jobTimeoutMs: config.JOB_TIMEOUT_MS,
    workerConcurrency: config.WORKER_CONCURRENCY,
    cacheTtlSeconds: config.CACHE_TTL_SECONDS
  };
}
