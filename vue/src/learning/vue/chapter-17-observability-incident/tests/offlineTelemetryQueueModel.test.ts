import { describe, expect, it } from "vitest";
import {
  createTelemetryQueueState,
  enqueueTelemetryEvent,
} from "../models/offlineTelemetryQueueModel";
import { createTelemetryEvent } from "../models/telemetryEventModel";

function createEvent(index: number) {
  return createTelemetryEvent({
    eventName: `event-${index}`,
    source: "incident",
    severity: "warning",
    routeName: "chapter-17",
    releaseId: "release-17-local",
    timestamp: index,
  });
}

describe("offlineTelemetryQueueModel", () => {
  it("drops the oldest event when queue limit is reached", () => {
    const initial = createTelemetryQueueState(2);
    const first = enqueueTelemetryEvent(initial, createEvent(1));
    const second = enqueueTelemetryEvent(first, createEvent(2));
    const third = enqueueTelemetryEvent(second, createEvent(3));

    expect(third.events.map((event) => event.eventName)).toEqual(["event-2", "event-3"]);
    expect(third.droppedCount).toBe(1);
  });
});
