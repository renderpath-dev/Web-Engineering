export type OutboxRecord = {
  id: string;
  aggregateId: string;
  eventName: string;
  publishedAt: Date | null;
};

export function isPendingOutboxRecord(record: OutboxRecord): boolean {
  return record.publishedAt === null;
}
