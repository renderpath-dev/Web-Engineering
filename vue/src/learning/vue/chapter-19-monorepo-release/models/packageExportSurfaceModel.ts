export type PackageExportKind = "component" | "composable" | "style" | "type" | "internal";

export interface PackageExportSurfaceEntry {
  readonly path: string;
  readonly kind: PackageExportKind;
  readonly public: boolean;
  readonly declarationPath?: string;
}

export const packageExportSurface: readonly PackageExportSurfaceEntry[] = [
  { path: ".", kind: "component", public: true, declarationPath: "dist/index.d.ts" },
  {
    path: "./button",
    kind: "component",
    public: true,
    declarationPath: "dist/button.d.ts",
  },
  { path: "./css", kind: "style", public: true },
  { path: "./types", kind: "type", public: true, declarationPath: "dist/types.d.ts" },
  { path: "./internal/token-resolver", kind: "internal", public: false },
];

export function canConsumerImportPath(
  entries: readonly PackageExportSurfaceEntry[],
  importPath: string,
): boolean {
  return entries.some((entry) => entry.path === importPath && entry.public);
}

export function hasPublicCssExport(entries: readonly PackageExportSurfaceEntry[]): boolean {
  return entries.some((entry) => entry.kind === "style" && entry.public);
}

export function hasTypeDeclarationEntry(entries: readonly PackageExportSurfaceEntry[]): boolean {
  return entries.some((entry) => entry.public && Boolean(entry.declarationPath));
}

