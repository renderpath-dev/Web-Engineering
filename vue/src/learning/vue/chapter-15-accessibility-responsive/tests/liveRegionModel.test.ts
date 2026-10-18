import { describe, expect, it } from "vitest";
import {
  createLiveRegionText,
  shouldAnnounceMessage,
  type LiveRegionMessage,
} from "../models/liveRegionModel";

describe("liveRegionModel", () => {
  it("throttles polite updates but allows assertive messages", () => {
    const previous: LiveRegionMessage = {
      id: "previous",
      text: "Results updated.",
      priority: "polite",
      createdAtMs: 1000,
    };

    const polite: LiveRegionMessage = {
      id: "polite",
      text: "Results updated.",
      priority: "polite",
      createdAtMs: 1200,
    };

    const assertive: LiveRegionMessage = {
      id: "assertive",
      text: "Save failed.",
      priority: "assertive",
      createdAtMs: 1250,
    };

    expect(shouldAnnounceMessage(previous, polite, 700)).toBe(false);
    expect(shouldAnnounceMessage(previous, assertive, 700)).toBe(true);
    expect(createLiveRegionText(assertive)).toBe("Save failed.");
  });
});

