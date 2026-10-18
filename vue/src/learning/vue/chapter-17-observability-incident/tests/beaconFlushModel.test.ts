import { describe, expect, it } from "vitest";
import { decideBeaconFlush } from "../models/beaconFlushModel";

describe("beaconFlushModel", () => {
  it("blocks payloads that are too large for the local model", () => {
    const decision = decideBeaconFlush(70000, true);

    expect(decision.method).toBe("drop");
    expect(decision.queued).toBe(false);
  });

  it("keeps delivery verification unknown for queued beacon models", () => {
    const decision = decideBeaconFlush(1200, true);

    expect(decision.method).toBe("send-beacon");
    expect(decision.deliveryVerified).toBe(false);
  });
});
