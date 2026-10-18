export const composeServiceMap = {
  api: ["postgres", "redis"],
  worker: ["postgres", "redis"],
  nginx: ["api"]
} as const;

export function serviceDependencies(service: keyof typeof composeServiceMap): readonly string[] {
  return composeServiceMap[service];
}
