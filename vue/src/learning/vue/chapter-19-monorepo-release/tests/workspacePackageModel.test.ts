import { describe, expect, it } from "vitest";
import {
  findPackageOwner,
  listPackageDependencies,
  workspaceDependencyEdges,
  workspacePackages,
} from "../models/workspacePackageModel";

describe("workspacePackageModel", () => {
  it("looks up dependencies in the workspace graph", () => {
    expect(
      listPackageDependencies(workspaceDependencyEdges, "@vue-lab/admin-app"),
    ).toContain("@vue-lab/design-system");
  });

  it("looks up the package owner", () => {
    expect(findPackageOwner(workspacePackages, "@vue-lab/design-system")).toBe(
      "Design Systems",
    );
  });
});

