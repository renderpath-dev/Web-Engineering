import { SpanStatusCode, trace } from "@opentelemetry/api";
import { attachTraceContext } from "./request-context.js";

const tracer = trace.getTracer("observable-notes-api");

type SpanAttributeValue = string | number | boolean;
type SpanAttributes = Record<string, SpanAttributeValue>;

export function getActiveTraceFields(): { traceId?: string; spanId?: string } {
  const activeSpan = trace.getActiveSpan();
  const spanContext = activeSpan?.spanContext();
  if (!spanContext) return {};

  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId
  };
}

export async function runWithSpan<T>(name: string, attributes: SpanAttributes, operation: () => Promise<T>): Promise<T> {
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    const spanContext = span.spanContext();
    attachTraceContext(spanContext.traceId, spanContext.spanId);

    try {
      const result = await operation();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    } finally {
      span.end();
    }
  });
}
