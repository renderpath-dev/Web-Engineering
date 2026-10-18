export type QueueHarnessResult = {
  enqueued: boolean;
  schemaValid: boolean;
};

export function assertQueueHarness(result: QueueHarnessResult): boolean {
  return result.enqueued && result.schemaValid;
}
