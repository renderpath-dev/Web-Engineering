export function databaseUrlConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
