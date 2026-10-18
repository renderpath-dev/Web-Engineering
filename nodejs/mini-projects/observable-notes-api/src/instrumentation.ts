import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { config } from "./config/env.js";

let sdk: NodeSDK | undefined;

export function startInstrumentation(): void {
  if (sdk) return;

  sdk = new NodeSDK({
    serviceName: config.OTEL_SERVICE_NAME,
    traceExporter: new ConsoleSpanExporter(),
    instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()]
  });

  sdk.start();
}

export async function stopInstrumentation(): Promise<void> {
  await sdk?.shutdown();
  sdk = undefined;
}

startInstrumentation();
