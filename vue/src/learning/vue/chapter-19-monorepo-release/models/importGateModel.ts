export interface ImportPathPolicy {
  readonly packageName: string;
  readonly allowedPaths: readonly string[];
  readonly blockedPatterns: readonly string[];
}

export const designSystemImportPolicy: ImportPathPolicy = {
  packageName: "@vue-lab/design-system",
  allowedPaths: [".", "./css", "./button", "./use-theme"],
  blockedPatterns: ["./internal/*", "./src/*"],
};

export function isInternalImportPath(importPath: string): boolean {
  return importPath.startsWith("./internal/") || importPath.startsWith("./src/");
}

export function isImportPathAllowed(policy: ImportPathPolicy, importPath: string): boolean {
  if (isInternalImportPath(importPath)) {
    return false;
  }

  return policy.allowedPaths.includes(importPath);
}

export function listBlockedImportSignals(
  policy: ImportPathPolicy,
  importPaths: readonly string[],
): readonly string[] {
  return importPaths.filter((importPath) => !isImportPathAllowed(policy, importPath));
}

