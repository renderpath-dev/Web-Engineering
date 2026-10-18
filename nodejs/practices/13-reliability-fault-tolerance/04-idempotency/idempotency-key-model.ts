export interface IdempotencyRecord {
  key: string;
  requestFingerprint: string;
  statusCode: number;
  responseBody: unknown;
  expiresAt: Date;
}
