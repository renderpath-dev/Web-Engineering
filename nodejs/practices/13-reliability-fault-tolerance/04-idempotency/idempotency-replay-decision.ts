export type ReplayDecision = "replay" | "create" | "conflict" | "expired";

export interface StoredIdempotencyRecord {
  key: string;
  requestFingerprint: string;
  statusCode: number;
  responseBody: unknown;
  expiresAt: Date;
}

export function decideReplay(
  record: StoredIdempotencyRecord | null,
  incomingKey: string | undefined,
  incomingFingerprint: string,
  now = new Date()
): ReplayDecision {
  if (!incomingKey) return "conflict";
  if (!record) return "create";
  if (record.expiresAt <= now) return "expired";
  if (record.key === incomingKey && record.requestFingerprint === incomingFingerprint) return "replay";
  return "conflict";
}
