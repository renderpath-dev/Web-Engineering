import { describe, expect, it } from "vitest";
import { isDesignSystemReleaseBlocked } from "../models/designSystemIssueModel";

describe("designSystemIssueModel", () => {
  it("blocks release when high severity issues are open", () => {
    expect(
      isDesignSystemReleaseBlocked({
        tokenDocsComplete: true,
        testsPassing: true,
        accessibilityEvidenceComplete: true,
        securityReviewComplete: true,
        packageBoundaryDocumented: true,
        issues: [
          {
            id: "DS-18-1",
            title: "Missing package boundary evidence",
            severity: "high",
            open: true,
          },
        ],
      }),
    ).toBe(true);
  });
});
