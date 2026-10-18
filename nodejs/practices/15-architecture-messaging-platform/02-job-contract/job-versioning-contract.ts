export type SupportedJobVersion = "1";

export function assertSupportedVersion(version: string): SupportedJobVersion {
  if (version !== "1") {
    throw new Error("Unsupported job payload version");
  }

  return version;
}
