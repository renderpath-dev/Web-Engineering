export type WorkerHandlerInput = {
  payloadValid: boolean;
  idempotencyKey: string;
  taskCount: number;
};

export function summarizeWorkerHandler(input: WorkerHandlerInput): string {
  if (!input.payloadValid) return "reject-invalid-payload";
  if (input.taskCount === 0) return "complete-empty-import";
  return `apply-idempotent-import:${input.idempotencyKey}`;
}
