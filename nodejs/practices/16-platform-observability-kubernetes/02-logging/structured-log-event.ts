export type StructuredLogEvent = {
  level: "info" | "warn" | "error";
  message: string;
  requestId: string;
  correlationId: string;
  traceId?: string;
  spanId?: string;
};
