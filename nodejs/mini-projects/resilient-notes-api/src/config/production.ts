import type { AppConfig } from "./env.js";

export interface ProductionRuntimePolicy {
  trustProxy: number | boolean;
  cookieSecure: boolean;
}

export function createProductionRuntimePolicy(appConfig: AppConfig): ProductionRuntimePolicy {
  if (appConfig.NODE_ENV === "production" && appConfig.SESSION_SECRET.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters in production");
  }

  return {
    trustProxy: appConfig.TRUST_PROXY === 1 ? 1 : false,
    cookieSecure: appConfig.COOKIE_SECURE
  };
}
