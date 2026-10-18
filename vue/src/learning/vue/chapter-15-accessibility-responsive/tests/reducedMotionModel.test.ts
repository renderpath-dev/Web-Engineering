import { describe, expect, it } from "vitest";
import {
  createMotionPolicy,
  keepsContentVisible,
} from "../models/reducedMotionModel";

describe("reducedMotionModel", () => {
  it("removes non-essential motion while preserving content", () => {
    const reduced = createMotionPolicy("reduce");
    const standard = createMotionPolicy("no-preference");

    expect(reduced.durationMs).toBe(0);
    expect(reduced.transitionName).toBe("no-motion");
    expect(keepsContentVisible(reduced)).toBe(true);
    expect(standard.durationMs).toBeGreaterThan(0);
  });
});

