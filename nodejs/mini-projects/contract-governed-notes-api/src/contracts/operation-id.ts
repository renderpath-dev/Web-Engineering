export const operationIds = [
  "getLiveHealth",
  "getReadyHealth",
  "getMetrics",
  "registerUser",
  "loginUser",
  "logoutUser",
  "getCurrentUser",
  "getCsrfToken",
  "listNotebooks",
  "createNotebook",
  "getNotebookById",
  "updateNotebookById",
  "deleteNotebookById",
  "listNotebookNotes",
  "createNotebookNote",
  "getNoteById",
  "updateNoteById",
  "deleteNoteById",
  "getOpenApiYaml",
  "getRouteInventory",
  "getCompatibilityReport",
  "getVersion",
  "getDeprecatedDemo"
] as const;

export type OperationId = (typeof operationIds)[number];

export function isOperationId(value: string): value is OperationId {
  return (operationIds as readonly string[]).includes(value);
}

export function assertUniqueOperationIds(values: readonly string[]): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`Duplicate operationId: ${value}`);
    seen.add(value);
  }
}
