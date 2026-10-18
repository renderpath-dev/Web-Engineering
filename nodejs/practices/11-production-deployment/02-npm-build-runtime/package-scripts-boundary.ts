export const productionScripts = {
  build: "tsc -p tsconfig.json",
  start: "node dist/src/server.js",
  typecheck: "tsc --noEmit",
  test: "node --import tsx --test tests/*.test.ts",
  "prisma:migrate:deploy": "prisma migrate deploy",
  smoke: "tsx scripts/smoke-test.ts"
} as const;

export function rejectsWatcherStart(startCommand: string): boolean {
  return !/\bwatch\b|\btsx\s+watch\b|\bnodemon\b/.test(startCommand);
}
