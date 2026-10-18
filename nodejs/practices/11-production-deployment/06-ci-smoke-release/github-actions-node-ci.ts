export const nodeCiSteps = [
  "actions/checkout",
  "actions/setup-node",
  "npm ci",
  "npm run prisma:generate",
  "npm run typecheck",
  "npm test",
  "npm run build",
  "npm run release:validate"
] as const;

export function includesReleaseValidation(steps: readonly string[]): boolean {
  return steps.includes("npm run release:validate");
}
