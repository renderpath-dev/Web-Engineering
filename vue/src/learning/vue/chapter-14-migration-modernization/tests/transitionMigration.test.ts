import { describe, expect, it } from "vitest";
import {
  hasStableTransitionGroupKeys,
  mapLegacyTransitionClass,
  requiresStableTransitionGroupKey,
} from "../modernized/transitionMigration";

describe("transition migration", () => {
  it("maps legacy transition class phases", () => {
    expect(mapLegacyTransitionClass("fade-enter")).toBe("fade-enter-from");
    expect(mapLegacyTransitionClass("fade-leave")).toBe("fade-leave-from");
  });

  it("requires stable keys for transition group movement", () => {
    expect(requiresStableTransitionGroupKey("move")).toBe(true);
    expect(hasStableTransitionGroupKeys(["profile-1", "profile-2"])).toBe(true);
    expect(hasStableTransitionGroupKeys(["profile-1", "profile-1"])).toBe(false);
  });
});
