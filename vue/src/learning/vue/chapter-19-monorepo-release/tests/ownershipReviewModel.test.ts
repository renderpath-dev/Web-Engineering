import { describe, expect, it } from "vitest";
import {
  isOwnershipApproved,
  listMissingOwnerApprovals,
} from "../models/ownershipReviewModel";

describe("ownershipReviewModel", () => {
  it("detects missing required owner approval", () => {
    const rules = [
      {
        packageName: "@vue-lab/admin-app",
        owner: "App Experience",
        requiredReviewer: "Product Surface Lead",
        riskArea: "consumer rendering",
        approved: false,
      },
    ];

    expect(isOwnershipApproved(rules)).toBe(false);
    expect(listMissingOwnerApprovals(rules)).toEqual(rules);
  });
});

