export function createTraceparent(traceId: string, spanId: string): string {
  return "00-" + traceId + "-" + spanId + "-01";
}

export function hasTraceparentShape(value: string): boolean {
  return /^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/.test(value);
}
