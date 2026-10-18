import { describe, expect, it } from "vitest";
import {
  getRollbackBlockingReason,
  isRollbackPathReady,
} from "../models/rollbackHotfixModel";

describe("rollbackHotfixModel", () => {
  it("requires communication before rollback path is ready", () => {
    const decision = {
      failureKind: "consumer-break" as const,
      affectedPackage: "@vue-lab/design-system",
      affectedConsumer: "@vue-lab/admin-app",
      rollbackOwner: "Release Engineering",
      patchBranchNeeded: true,
      communicationReady: false,
    };

    expect(isRollbackPathReady(decision)).toBe(false);
    expect(getRollbackBlockingReason(decision)).toBe("consumer notice missing");
  });
});

