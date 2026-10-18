export function buildImportIdempotencyKey(projectId: string, sourceName: string): string {
  const normalizedSource = sourceName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `tasks-import:${projectId}:${normalizedSource}`;
}

export function isSafeIdempotencyKey(value: string): boolean {
  return /^tasks-import:[a-f0-9-]+:[a-z0-9-]+$/.test(value);
}
