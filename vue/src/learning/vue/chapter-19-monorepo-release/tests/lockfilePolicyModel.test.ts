import { describe, expect, it } from "vitest";
import {
  countLockfilePackageMovement,
  requiresLockfileReview,
} from "../models/lockfilePolicyModel";

describe("lockfilePolicyModel", () => {
  it("requires review for lockfile package movement", () => {
    const change = {
      filePath: "package-lock.json",
      packageName: "@vue-lab/admin-app",
      addedPackages: ["@vue-lab/design-system"],
      removedPackages: [],
      versionChanged: true,
    };

    expect(requiresLockfileReview(change)).toBe(true);
    expect(countLockfilePackageMovement(change)).toBe(1);
  });
});

