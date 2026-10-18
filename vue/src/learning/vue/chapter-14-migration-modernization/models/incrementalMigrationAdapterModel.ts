export type MigrationEntry = "legacy" | "modern";

export interface MigrationFeatureFlag {
  readonly key: string;
  readonly enabled: boolean;
  readonly fallbackEntry: MigrationEntry;
}

export function chooseMigrationEntry(flag: MigrationFeatureFlag): MigrationEntry {
  if (flag.enabled) {
    return "modern";
  }

  return flag.fallbackEntry;
}
