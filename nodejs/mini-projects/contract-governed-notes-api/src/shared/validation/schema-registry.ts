export const publicSchemaNames = [
  "ProblemDetails",
  "User",
  "Notebook",
  "Note",
  "NotebookList",
  "NoteList",
  "CompatibilityReport"
] as const;

export function hasPublicSchema(name: string): boolean {
  return (publicSchemaNames as readonly string[]).includes(name);
}
