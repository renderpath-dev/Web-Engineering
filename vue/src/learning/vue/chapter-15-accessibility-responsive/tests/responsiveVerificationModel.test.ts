import { describe, expect, it } from "vitest";
import {
  createViewportMatrix,
  evaluateViewport,
  representativeViewportWidths,
} from "../models/responsiveVerificationModel";

describe("responsiveVerificationModel", () => {
  it("marks overflow as a blocked viewport failure", () => {
    const result = evaluateViewport({
      width: 360,
      hasHorizontalOverflow: true,
      touchTargetsPass: true,
      navigationOperable: true,
    });

    expect(result.status).toBe("blocked");
    expect(result.failureSignals).toContain("Horizontal overflow");
  });

  it("creates the required representative viewport matrix", () => {
    const matrix = createViewportMatrix();

    expect(matrix.map((check) => check.width)).toEqual(representativeViewportWidths);
    expect(matrix.every((check) => check.navigationOperable)).toBe(true);
  });
});

