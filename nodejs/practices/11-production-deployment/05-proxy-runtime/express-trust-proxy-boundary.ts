export interface TrustProxyDecision {
  trustProxy: boolean;
  acceptsForwardedHeaders: boolean;
  affectsSecureCookies: boolean;
}

export function createTrustProxyDecision(trustProxy: boolean): TrustProxyDecision {
  return {
    trustProxy,
    acceptsForwardedHeaders: trustProxy,
    affectsSecureCookies: trustProxy
  };
}
