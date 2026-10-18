export function createCorrelationContext(headers: Record<string, string | undefined>, generatedRequestId: string) {
  return {
    requestId: headers["x-request-id"] ?? generatedRequestId,
    correlationId: headers["x-correlation-id"] ?? generatedRequestId
  };
}
