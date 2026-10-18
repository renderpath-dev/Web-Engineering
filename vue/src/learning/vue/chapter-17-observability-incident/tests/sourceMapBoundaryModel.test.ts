import { describe, expect, it } from "vitest";
import { reviewSourceMapBoundary } from "../models/sourceMapBoundaryModel";

describe("sourceMapBoundaryModel", () => {
  it("requires review for public source maps", () => {
    const review = reviewSourceMapBoundary({
      sourceMapEnabled: true,
      publicAsset: true,
      releaseIdPresent: true,
    });

    expect(review.decision).toBe("requires-review");
  });
});
