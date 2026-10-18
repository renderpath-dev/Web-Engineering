export function assertObjectHasKeys(value: unknown, keys: string[]): void {
  if (typeof value !== "object" || value === null) {
    throw new Error("Response body is not an object");
  }

  for (const key of keys) {
    if (!(key in value)) throw new Error(`Missing response key: ${key}`);
  }
}
