export const supportedApiVersions = ["v1"] as const;
export type SupportedApiVersion = (typeof supportedApiVersions)[number];

export function extractVersionFamily(path: string): string | null {
  const [, version] = path.match(/^\/(v\d+)(?:\/|$)/) ?? [];
  return version ?? null;
}

export function isSupportedApiVersion(version: string): version is SupportedApiVersion {
  return (supportedApiVersions as readonly string[]).includes(version);
}
