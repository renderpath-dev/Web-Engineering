export type ImportTasksPayload = {
  name: "tasks.import";
  version: "1";
  projectId: string;
  idempotencyKey: string;
  correlationId: string;
  tasks: Array<{ title: string; completed: boolean }>;
};

export function isImportTasksPayload(payload: ImportTasksPayload): boolean {
  return payload.name === "tasks.import" && payload.version === "1" && payload.tasks.length > 0;
}
