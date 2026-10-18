export type StatusFamily = "network" | "4xx" | "5xx" | "unknown";
export type RetryDecision = "retry-now" | "retry-later" | "do-not-retry";

export interface ApiFailureSignal {
  readonly endpointLabel: string;
  readonly statusFamily: StatusFamily;
  readonly requestId: string;
  readonly retryDecision: RetryDecision;
  readonly safeMessage: string;
}

export function classifyStatusFamily(status: number | null): StatusFamily {
  if (status === null) {
    return "network";
  }

  if (status >= 400 && status < 500) {
    return "4xx";
  }

  if (status >= 500 && status < 600) {
    return "5xx";
  }

  return "unknown";
}

export function createApiFailureSignal(input: {
  readonly endpointPath: string;
  readonly status: number | null;
  readonly requestId: string;
}): ApiFailureSignal {
  const statusFamily = classifyStatusFamily(input.status);
  const endpointLabel = input.endpointPath.split("?")[0] || "/api/unknown";
  const retryDecision: RetryDecision =
    statusFamily === "5xx" || statusFamily === "network" ? "retry-later" : "do-not-retry";

  return {
    endpointLabel,
    statusFamily,
    requestId: input.requestId,
    retryDecision,
    safeMessage: `${endpointLabel} failed with ${statusFamily}`,
  };
}
