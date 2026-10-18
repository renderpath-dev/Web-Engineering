export function duplicatePostMistake(hasIdempotencyKey: boolean): string {
  return hasIdempotencyKey
    ? "safe replay boundary is present"
    : "duplicate side effect risk is present";
}
