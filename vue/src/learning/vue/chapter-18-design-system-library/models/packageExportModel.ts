export interface PackageExportEntry {
  readonly path: string;
  readonly public: boolean;
  readonly kind: "component" | "composable" | "style" | "internal";
}

export const packageExportEntries: readonly PackageExportEntry[] = [
  { path: ".", public: true, kind: "component" },
  { path: "./css", public: true, kind: "style" },
  { path: "./internal/tokenResolver", public: false, kind: "internal" },
];

export function isPublicPackageImport(
  entries: readonly PackageExportEntry[],
  importPath: string,
): boolean {
  const entry = entries.find((candidate) => candidate.path === importPath);

  return entry?.public ?? false;
}

export function hasCssExport(entries: readonly PackageExportEntry[]): boolean {
  return entries.some((entry) => entry.public && entry.kind === "style");
}
