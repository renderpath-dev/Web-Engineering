export type DatabaseFailureKind =
  | "database_unavailable"
  | "pool_timeout"
  | "transaction_conflict"
  | "unique_conflict"
  | "not_found"
  | "unknown_database_error";

export interface DatabaseFailureClassification {
  kind: DatabaseFailureKind;
  retryable: boolean;
  code?: string;
}

export function getDatabaseErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

export function classifyDatabaseError(error: unknown): DatabaseFailureClassification {
  const code = getDatabaseErrorCode(error);
  if (code === "P1001" || code === "P1002") return { kind: "database_unavailable", retryable: true, code };
  if (code === "P2024") return { kind: "pool_timeout", retryable: true, code };
  if (code === "P2034") return { kind: "transaction_conflict", retryable: true, code };
  if (code === "P2002") return { kind: "unique_conflict", retryable: false, code };
  if (code === "P2025") return { kind: "not_found", retryable: false, code };
  return { kind: "unknown_database_error", retryable: false, code };
}

export function isRetryableTransactionConflict(error: unknown): boolean {
  return classifyDatabaseError(error).kind === "transaction_conflict";
}
