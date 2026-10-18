import { describe, expect, it } from "vitest";
import { findAffectedPackages } from "../models/affectedPackageModel";
import { buildGraphEdges } from "../models/buildOrderModel";

describe("affectedPackageModel", () => {
  it("marks the app consumer affected by design system changes", () => {
    expect(findAffectedPackages(["@vue-lab/design-system"], buildGraphEdges)).toEqual([
      "@vue-lab/design-system",
      "@vue-lab/admin-app",
      "@vue-lab/release-tools",
    ]);
  });
});

