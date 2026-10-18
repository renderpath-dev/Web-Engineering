import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import { idempotencyConflictTotal, idempotencyReplayTotal } from "../observability/reliability-metrics.js";
import { HttpError } from "../shared/errors/http-error.js";

export interface StoredIdempotencyResult {
  replayed: boolean;
  statusCode: number;
  body: unknown;
}

export async function executeIdempotentOperation(
  key: string,
  requestFingerprint: string,
  operation: () => Promise<{ statusCode: number; body: unknown }>,
  ttlSeconds = 86_400
): Promise<StoredIdempotencyResult> {
  const existing = await prisma.idempotencyRecord.findUnique({ where: { key } });
  const now = new Date();

  if (existing && existing.expiresAt > now) {
    if (existing.requestFingerprint !== requestFingerprint) {
      idempotencyConflictTotal.inc({ operation: "idempotent_operation" });
      throw new HttpError(409, "Idempotency key conflict", "IDEMPOTENCY_CONFLICT");
    }

    idempotencyReplayTotal.inc({ operation: "idempotent_operation" });
    return { replayed: true, statusCode: existing.statusCode, body: existing.responseBody };
  }

  const result = await operation();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1_000);

  await prisma.idempotencyRecord.upsert({
    where: { key },
    update: {
      requestFingerprint,
      statusCode: result.statusCode,
              responseBody: result.body as Prisma.InputJsonValue,
      expiresAt
    },
    create: {
      key,
      requestFingerprint,
      statusCode: result.statusCode,
              responseBody: result.body as Prisma.InputJsonValue,
      expiresAt
    }
  });

  return { replayed: false, statusCode: result.statusCode, body: result.body };
}
