export function hasRuntimeHealthcheck(dockerfile: string): boolean {
  return dockerfile.includes("HEALTHCHECK") && dockerfile.includes("/v1/health/live");
}
