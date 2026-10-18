export type KubernetesObjectKind = "Pod" | "Deployment" | "ReplicaSet" | "Service";

export function ownsReplicaSet(kind: KubernetesObjectKind): boolean {
  return kind === "Deployment";
}
