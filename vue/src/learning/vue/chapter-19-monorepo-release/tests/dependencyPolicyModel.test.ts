import { describe, expect, it } from "vitest";
import {
  isDependencyPolicyReviewRequired,
  isWorkspaceProtocol,
} from "../models/dependencyPolicyModel";

describe("dependencyPolicyModel", () => {
  it("requires review for workspace dependency policy", () => {
    const policy = {
      packageName: "@vue-lab/admin-app",
      dependencyName: "@vue-lab/design-system",
      versionRange: "workspace:*",
      policyKind: "workspace" as const,
      requiredReview: true,
    };

    expect(isDependencyPolicyReviewRequired(policy)).toBe(true);
    expect(isWorkspaceProtocol(policy)).toBe(true);
  });
});

