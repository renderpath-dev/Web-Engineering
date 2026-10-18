import { describe, expect, it } from "vitest";
import {
  hasCssExport,
  isPublicPackageImport,
  packageExportEntries,
} from "../models/packageExportModel";

describe("packageExportModel", () => {
  it("blocks internal package imports", () => {
    expect(isPublicPackageImport(packageExportEntries, "./internal/tokenResolver")).toBe(false);
  });

  it("requires a CSS export path", () => {
    expect(hasCssExport(packageExportEntries)).toBe(true);
  });
});
