export function hasRunbookAnnotation(rule: { annotations?: Record<string, string> }): boolean {
  return typeof rule.annotations?.runbook === "string";
}
