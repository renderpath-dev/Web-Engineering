export interface ChangelogEntry {
  readonly packageName: string;
  readonly version: string;
  readonly changes: readonly string[];
  readonly breaking: boolean;
}

export const changelogEntry: ChangelogEntry = {
  packageName: "@vue-lab/design-system",
  version: "2.0.0",
  changes: ["Remove legacy button alias", "Add CSS export entry"],
  breaking: true,
};

export function isChangelogEntryComplete(entry: ChangelogEntry): boolean {
  return entry.version.length > 0 && entry.changes.length > 0;
}

export function requiresMigrationNote(entry: ChangelogEntry): boolean {
  return entry.breaking;
}

