export function configKindForKey(key: string): "ConfigMap" | "Secret" {
  return /password|token|secret|database_url|redis_url/i.test(key) ? "Secret" : "ConfigMap";
}
