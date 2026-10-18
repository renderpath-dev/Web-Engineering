import { describe, expect, it } from "vitest";
import { isReusableVueLibraryDependencySafe } from "../models/peerDependencyModel";

describe("peerDependencyModel", () => {
  it("accepts peer Vue with external library output", () => {
    expect(
      isReusableVueLibraryDependencySafe({
        packageName: "@vue-lab/design-system",
        dependencyName: "vue",
        placement: "peer",
        externalizedInLibraryBuild: true,
        duplicateRuntimeRisk: false,
      }),
    ).toBe(true);
  });

  it("blocks bundled Vue risk", () => {
    expect(
      isReusableVueLibraryDependencySafe({
        packageName: "@vue-lab/design-system",
        dependencyName: "vue",
        placement: "dependency",
        externalizedInLibraryBuild: false,
        duplicateRuntimeRisk: true,
      }),
    ).toBe(false);
  });
});

