export const kubernetesModel = {
  namespace: "platform-observability-kubernetes-lab",
  workload: "Deployment",
  podRole: "api",
  serviceType: "ClusterIP",
  probes: {
    liveness: "/v1/health/live",
    readiness: "/v1/health/ready",
    startup: "/v1/health/startup"
  },
  resources: {
    requests: {
      cpu: "100m",
      memory: "128Mi"
    },
    limits: {
      cpu: "500m",
      memory: "512Mi"
    }
  },
  boundaries: [
    "Static manifests are learning artifacts",
    "No real cluster deployment is claimed",
    "Secret values are placeholders",
    "Ingress is a future boundary"
  ]
};
