export const allowedCiSecretNames = [
  "DATABASE_URL",
  "REDIS_URL",
  "SESSION_SECRET"
] as const;

export function isSecretValueSafeForTemplate(value: string): boolean {
  return value.length === 0 || value.startsWith("${{ secrets.");
}
