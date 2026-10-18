export const dockerIgnoreEntries = [
  "node_modules",
  ".env",
  ".env.*",
  "logs",
  "*.log",
  "coverage",
  "docs",
  "dist",
  "secrets",
  "*.pem"
] as const;

export function shouldExcludeFromDockerContext(path: string): boolean {
  return dockerIgnoreEntries.some((entry) => path === entry || path.startsWith(entry + "/"));
}
