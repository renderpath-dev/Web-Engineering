export function retryAfterHeader(seconds: number): Record<string, string> {
  return { "Retry-After": String(Math.max(1, Math.floor(seconds))) };
}
