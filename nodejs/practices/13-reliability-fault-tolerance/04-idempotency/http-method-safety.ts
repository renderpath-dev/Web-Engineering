export interface MethodSafety {
  safe: boolean;
  idempotent: boolean;
}

export function describeHttpMethod(method: string): MethodSafety {
  const normalized = method.toUpperCase();
  return {
    safe: ["GET", "HEAD", "OPTIONS", "TRACE"].includes(normalized),
    idempotent: ["GET", "HEAD", "OPTIONS", "TRACE", "PUT", "DELETE"].includes(normalized)
  };
}
