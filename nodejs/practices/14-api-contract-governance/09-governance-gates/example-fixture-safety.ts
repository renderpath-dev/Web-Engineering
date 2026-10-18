const secretPattern = /(password|token|secret|cookie|authorization)/i;

export function fixtureContainsSecret(value: string): boolean {
  return secretPattern.test(value);
}
