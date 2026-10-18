import { describe, expect, it } from "vitest";
import { decideRollback } from "../models/rollbackDecisionModel";

describe("rollbackDecisionModel", () => {
  it("recommends rollback for blocked severe incidents without mitigation", () => {
    const decision = decideRollback({
      severity: "sev2",
      releaseHealthBlocked: true,
      mitigationAvailable: false,
    });

    expect(decision.recommended).toBe(true);
    expect(decision.owner).toBe("release-owner");
  });
});
