import { describe, expect, it } from "vitest";
import {
  classifyStatusFamily,
  createApiFailureSignal,
} from "../models/apiFailureTelemetryModel";

describe("apiFailureTelemetryModel", () => {
  it("groups status values by family", () => {
    expect(classifyStatusFamily(404)).toBe("4xx");
    expect(classifyStatusFamily(503)).toBe("5xx");
    expect(classifyStatusFamily(null)).toBe("network");
  });

  it("strips query strings from endpoint labels", () => {
    const signal = createApiFailureSignal({
      endpointPath: "/api/orders?account=redacted",
      status: 503,
      requestId: "request-local-17",
    });

    expect(signal.endpointLabel).toBe("/api/orders");
    expect(signal.retryDecision).toBe("retry-later");
  });
});
