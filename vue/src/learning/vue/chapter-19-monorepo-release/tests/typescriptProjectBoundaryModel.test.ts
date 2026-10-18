import { describe, expect, it } from "vitest";
import {
  canTypeScriptProveRuntimeRender,
  isDeclarationBoundaryReady,
} from "../models/typescriptProjectBoundaryModel";

describe("typescriptProjectBoundaryModel", () => {
  it("accepts declaration boundary fields", () => {
    expect(
      isDeclarationBoundaryReady({
        packageName: "@vue-lab/design-system",
        composite: true,
        declaration: true,
        references: [],
        vueSfcIncluded: true,
      }),
    ).toBe(true);
  });

  it("does not claim runtime render proof", () => {
    expect(
      canTypeScriptProveRuntimeRender({
        packageName: "@vue-lab/admin-app",
        composite: true,
        declaration: false,
        references: ["@vue-lab/design-system"],
        vueSfcIncluded: true,
      }),
    ).toBe(false);
  });
});

