const unsafeMetricLabels = new Set(["userId", "email", "requestId", "noteId", "sessionId", "traceId", "rawUrl", "errorMessage"]);
export function assertSafeMetricLabel(labelName: string): void {
  if (unsafeMetricLabels.has(labelName)) throw new Error(`Unsafe metric label: ${labelName}`);
}
for (const label of ["method", "route", "status_class", "requestId"]) {
  try { assertSafeMetricLabel(label); console.log(`${label}: safe`); } catch (error) { console.log((error as Error).message); }
}
