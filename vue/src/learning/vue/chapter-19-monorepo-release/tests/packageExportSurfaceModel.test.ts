import { describe, expect, it } from "vitest";
import {
  canConsumerImportPath,
  hasPublicCssExport,
  hasTypeDeclarationEntry,
  packageExportSurface,
} from "../models/packageExportSurfaceModel";

describe("packageExportSurfaceModel", () => {
  it("blocks internal import paths", () => {
    expect(canConsumerImportPath(packageExportSurface, "./internal/token-resolver")).toBe(
      false,
    );
  });

  it("requires CSS and type declaration entries", () => {
    expect(hasPublicCssExport(packageExportSurface)).toBe(true);
    expect(hasTypeDeclarationEntry(packageExportSurface)).toBe(true);
  });
});

