import { env } from "../config/env.js";

export interface HealthResponse {
  status: "ok";
  service: string;
  version: string;
  environment: string;
  timestamp: string;
}

export function getHealth(): HealthResponse {
  return {
    status: "ok",
    service: "final-production-release-lab",
    version: env.RELEASE_VERSION,
    environment: env.RELEASE_ENVIRONMENT,
    timestamp: new Date().toISOString()
  };
}
