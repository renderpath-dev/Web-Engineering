import { context, SpanStatusCode, trace } from "@opentelemetry/api";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import type { AppConfig } from "../config/env.js";
import { traceWorkTotal } from "./metrics.js";

let sdkStarted = false;
let telemetrySdk: NodeSDK | undefined;

export type TraceWorkInput = {
  operationName: string;
  steps: number;
};

export type TraceWorkResult = {
  operationName: string;
  traceId: string;
  spanId: string;
  traceparent: string;
  steps: number;
};

export function startTelemetrySdk(config: Pick<AppConfig, "SERVICE_NAME">): void {
  if (sdkStarted) {
    return;
  }
  telemetrySdk = new NodeSDK({
    resource: resourceFromAttributes({
      "service.name": config.SERVICE_NAME,
      "service.version": "1.0.0"
    }),
    traceExporter: new ConsoleSpanExporter()
  });
  telemetrySdk.start();
  sdkStarted = true;
}

export async function shutdownTelemetrySdk(): Promise<void> {
  if (!telemetrySdk) {
    return;
  }
  await telemetrySdk.shutdown();
}

export function isTraceContextShape(value: string): boolean {
  return /^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/.test(value) &&
    !value.includes("00000000000000000000000000000000") &&
    !value.includes("0000000000000000");
}

export function runManualTraceWork(input: TraceWorkInput): TraceWorkResult {
  const tracer = trace.getTracer("platform-observability-kubernetes-lab");
  return tracer.startActiveSpan("simulate.trace_work", (span) => {
    span.setAttribute("operation.name", input.operationName);
    span.setAttribute("signal.kind", "trace");
    span.addEvent("trace_work.started");
    for (let step = 0; step < input.steps; step += 1) {
      const childSpan = tracer.startSpan("simulate.trace_work.step", undefined, context.active());
      childSpan.setAttribute("operation.name", "trace_work_step");
      childSpan.setAttribute("step.index", step);
      childSpan.end();
    }
    span.setStatus({ code: SpanStatusCode.OK });
    const spanContext = span.spanContext();
    const traceparent = "00-" + spanContext.traceId + "-" + spanContext.spanId + "-01";
    span.end();
    traceWorkTotal.inc({ operation_name: input.operationName, result: "ok" });
    return {
      operationName: input.operationName,
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
      traceparent,
      steps: input.steps
    };
  });
}
