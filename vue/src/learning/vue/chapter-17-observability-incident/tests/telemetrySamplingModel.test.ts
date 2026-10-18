import { describe, expect, it } from "vitest";
import { createTelemetryEvent } from "../models/telemetryEventModel";
import {
  isRateLimited,
  shouldSampleTelemetryEvent,
} from "../models/telemetrySamplingModel";

describe("telemetrySamplingModel", () => {
  it("keeps high severity events", () => {
    const event = createTelemetryEvent({
      eventName: "release-blocked",
      source: "release",
      severity: "critical",
      routeName: "chapter-17",
      releaseId: "release-17-local",
    });

    expect(shouldSampleTelemetryEvent(event, 0, 1).keep).toBe(true);
  });

  it("rate limits event bursts", () => {
    expect(isRateLimited(10, 10)).toBe(true);
  });
});
