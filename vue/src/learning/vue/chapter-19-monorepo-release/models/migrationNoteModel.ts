export interface MigrationNote {
  readonly packageName: string;
  readonly fromVersion: string;
  readonly toVersion: string;
  readonly breakingChange: boolean;
  readonly steps: readonly string[];
  readonly owner: string;
}

export const migrationNote: MigrationNote = {
  packageName: "@vue-lab/design-system",
  fromVersion: "1.4.2",
  toVersion: "2.0.0",
  breakingChange: true,
  steps: ["Replace legacy button alias", "Import CSS entry"],
  owner: "Design Systems",
};

export function isMigrationNoteComplete(note: MigrationNote): boolean {
  if (!note.breakingChange) {
    return true;
  }

  return note.steps.length > 0 && note.owner.length > 0;
}

