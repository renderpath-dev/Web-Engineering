type TraceContext = { traceId?: string; spanId?: string };
export function buildCorrelatedLog(requestId: string, traceContext: TraceContext) {
  return { level: "info", message: "request completed", requestId, traceId: traceContext.traceId, spanId: traceContext.spanId };
}
console.log(JSON.stringify(buildCorrelatedLog("req_123", { traceId: "abc", spanId: "def" })));
