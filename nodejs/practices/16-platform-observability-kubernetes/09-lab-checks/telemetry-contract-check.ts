export function rejectsForbiddenMetricLabel(labelName: string): boolean {
  return ["trace_id", "span_id", "request_id", "user_id", "email"].includes(labelName);
}
