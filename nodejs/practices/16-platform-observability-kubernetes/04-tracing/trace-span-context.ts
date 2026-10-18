export type SpanRecord = {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
};

export function spanBelongsToTrace(span: SpanRecord, traceId: string): boolean {
  return span.traceId === traceId;
}
