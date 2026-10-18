import { redactTelemetryValue } from "./telemetryRedactionModel";

export type ErrorTelemetrySource = "app-handler" | "component-boundary" | "global-listener";

export interface ErrorTelemetryRecord {
  readonly source: ErrorTelemetrySource;
  readonly message: string;
  readonly componentName: string;
  readonly info: string;
  readonly releaseId: string;
  readonly redacted: boolean;
}

export function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error";
}

export function createErrorTelemetryRecord(input: {
  readonly source: ErrorTelemetrySource;
  readonly error: unknown;
  readonly componentName?: string;
  readonly info?: string;
  readonly releaseId: string;
}): ErrorTelemetryRecord {
  const rawMessage = normalizeErrorMessage(input.error);
  const message = redactTelemetryValue(rawMessage);

  return {
    source: input.source,
    message,
    componentName: input.componentName ?? "unknown-component",
    info: input.info ?? "unknown-info",
    releaseId: input.releaseId,
    redacted: message !== rawMessage,
  };
}
