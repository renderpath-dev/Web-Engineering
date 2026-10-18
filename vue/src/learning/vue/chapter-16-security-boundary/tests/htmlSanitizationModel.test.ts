import { describe, expect, it } from "vitest";
import { classifyRichTextInput } from "../models/htmlSanitizationModel";

describe("htmlSanitizationModel", () => {
  it("allows listed tags with listed attributes", () => {
    const review = classifyRichTextInput("cms-preview", "strong", ["class"]);

    expect(review.decision).toBe("allowed");
  });

  it("blocks risky tags", () => {
    const review = classifyRichTextInput("cms-preview", "script", ["class"]);

    expect(review.decision).toBe("blocked");
  });

  it("requires backend review for unknown attributes", () => {
    const review = classifyRichTextInput("cms-preview", "p", ["data-track"]);

    expect(review.decision).toBe("requires-backend-review");
  });
});
