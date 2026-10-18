const unsafeExamplePattern = /(password|secret|token|cookie|authorization|database_url|redis_url)/i;

export function exampleLooksSafe(name: string, content: string): boolean {
  if (unsafeExamplePattern.test(name)) return false;
  return !unsafeExamplePattern.test(content);
}
