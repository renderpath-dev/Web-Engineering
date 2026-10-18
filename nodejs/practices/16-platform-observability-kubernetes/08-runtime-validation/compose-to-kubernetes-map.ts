export function composeServiceToKubernetesKind(serviceName: string): "Deployment" | "Service" | "ConfigMap" {
  return serviceName === "api" ? "Deployment" : "Service";
}
