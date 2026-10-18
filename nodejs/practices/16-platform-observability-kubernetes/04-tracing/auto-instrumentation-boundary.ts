export function needsManualSpan(boundary: "business-rule" | "http-client" | "database-client"): boolean {
  return boundary === "business-rule";
}
