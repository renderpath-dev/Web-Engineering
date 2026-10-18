export function sanitizeLogField(value: unknown): string {
  if (value === undefined || value === null) return "";

  return String(value)
    .replace(/[\r\n\t|]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function sanitizeRoutePattern(route: string): string {
  if (!route || route === "unmatched") return "unmatched";
  return sanitizeLogField(route);
}
