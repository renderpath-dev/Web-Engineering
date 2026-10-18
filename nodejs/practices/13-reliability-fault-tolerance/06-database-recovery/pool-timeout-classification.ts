export function classifyDatabaseCode(code: string): string {
  if (code === "P2024") return "pool_timeout";
  if (code === "P2034") return "transaction_conflict";
  if (code === "P1001" || code === "P1002") return "database_unavailable";
  return "database_error";
}
