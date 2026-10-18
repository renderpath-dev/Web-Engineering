const processedKeys = new Set<string>();

export function handleDuplicateMessage(idempotencyKey: string): "apply" | "skip" {
  if (processedKeys.has(idempotencyKey)) return "skip";
  processedKeys.add(idempotencyKey);
  return "apply";
}
