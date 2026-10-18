import type { AppConfig, TrustProxyValue } from "./env.js";

export interface ProductionRuntimePolicy {
  trustProxy: TrustProxyValue;
  secureCookies: boolean;
  exposeDebugErrors: boolean;
}

export function createProductionRuntimePolicy(config: AppConfig): ProductionRuntimePolicy {
  return {
    trustProxy: config.TRUST_PROXY,
    secureCookies: config.COOKIE_SECURE,
    exposeDebugErrors: config.NODE_ENV !== "production"
  };
}
