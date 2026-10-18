import { createHash } from "node:crypto";

export function validateIdempotencyKey(value: string | undefined): string {
  if (!value || value.length < 8 || value.length > 128) {
    throw new Error("Idempotency-Key must be between 8 and 128 characters");
  }
  return value;
}

export function buildRequestFingerprint(method: string, path: string, body: unknown): string {
  const normalizedBody = JSON.stringify(sortJson(body));
  return createHash("sha256")
    .update(`${method.toUpperCase()} ${path}\n${normalizedBody}`)
    .digest("hex");
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortJson(child)])
    );
  }
  return value;
}
