import { describe, expect, it } from "vitest";
import {
  createEscapedPreview,
  describeEscapedPreview,
} from "../models/escapedRenderingModel";

describe("escapedRenderingModel", () => {
  it("keeps raw input as text preview data", () => {
    const preview = createEscapedPreview("Guest <student>");

    expect(preview.rawValue).toBe("Guest <student>");
    expect(preview.renderedText).toBe("Guest <student>");
    expect(preview.safeForHtmlExecution).toBe(false);
  });

  it("describes the selected sink without executing content", () => {
    const preview = createEscapedPreview("Account owner", "attribute");

    expect(describeEscapedPreview(preview)).toContain("attribute sink");
  });
});
