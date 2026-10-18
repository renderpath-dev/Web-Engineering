export interface TypeScriptProjectBoundary {
  readonly packageName: string;
  readonly composite: boolean;
  readonly declaration: boolean;
  readonly references: readonly string[];
  readonly vueSfcIncluded: boolean;
}

export const typeScriptProjectBoundaries: readonly TypeScriptProjectBoundary[] = [
  {
    packageName: "@vue-lab/design-system",
    composite: true,
    declaration: true,
    references: [],
    vueSfcIncluded: true,
  },
  {
    packageName: "@vue-lab/admin-app",
    composite: true,
    declaration: false,
    references: ["@vue-lab/design-system"],
    vueSfcIncluded: true,
  },
];

export function isDeclarationBoundaryReady(boundary: TypeScriptProjectBoundary): boolean {
  return boundary.composite && boundary.declaration && boundary.vueSfcIncluded;
}

export function canTypeScriptProveRuntimeRender(
  boundary: TypeScriptProjectBoundary,
): boolean {
  return boundary.references.length > 0 && false;
}

