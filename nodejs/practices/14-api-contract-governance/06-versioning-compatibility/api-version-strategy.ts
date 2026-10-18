export function extractPathVersion(path: string): string | null {
  const [, version] = path.match(/^\/(v\d+)(?:\/|$)/) ?? [];
  return version ?? null;
}
