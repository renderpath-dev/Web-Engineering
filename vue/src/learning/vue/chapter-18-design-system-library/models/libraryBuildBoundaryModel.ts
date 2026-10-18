export interface LibraryBuildBoundary {
  readonly hasLibraryEntry: boolean;
  readonly externalVue: boolean;
  readonly hasCssExport: boolean;
  readonly hasTypeDeclarations: boolean;
}

export function evaluateLibraryBuildBoundary(
  boundary: LibraryBuildBoundary,
): readonly string[] {
  const failures: string[] = [];

  if (!boundary.hasLibraryEntry) {
    failures.push("missing-library-entry");
  }

  if (!boundary.externalVue) {
    failures.push("vue-not-external");
  }

  if (!boundary.hasCssExport) {
    failures.push("missing-css-export");
  }

  if (!boundary.hasTypeDeclarations) {
    failures.push("missing-type-declarations");
  }

  return failures;
}
