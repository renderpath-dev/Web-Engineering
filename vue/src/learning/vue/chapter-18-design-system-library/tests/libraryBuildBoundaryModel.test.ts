import { describe, expect, it } from "vitest";
import { evaluateLibraryBuildBoundary } from "../models/libraryBuildBoundaryModel";

describe("libraryBuildBoundaryModel", () => {
  it("blocks package readiness when type declarations are missing", () => {
    expect(
      evaluateLibraryBuildBoundary({
        hasLibraryEntry: true,
        externalVue: true,
        hasCssExport: true,
        hasTypeDeclarations: false,
      }),
    ).toContain("missing-type-declarations");
  });
});
