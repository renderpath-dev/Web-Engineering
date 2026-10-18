import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { assertCondition } from "./check-utils.js";

export type KubernetesCheckResult = {
  resources: string[];
};

const root = new URL("../k8s/", import.meta.url);
const manifestFiles = ["namespace.yaml", "configmap.yaml", "secret.example.yaml", "deployment.yaml", "service.yaml"];

async function readManifest(fileName: string): Promise<unknown> {
  return YAML.parse(await readFile(new URL(fileName, root), "utf8"));
}

function labelsFromDeployment(deployment: any): Record<string, string> {
  return deployment.spec.template.metadata.labels as Record<string, string>;
}

function selectorMatches(selector: Record<string, string>, labels: Record<string, string>): boolean {
  return Object.entries(selector).every(([key, value]) => labels[key] === value);
}

export async function validateKubernetesManifests(): Promise<KubernetesCheckResult> {
  const manifests = new Map<string, any>();
  for (const fileName of manifestFiles) {
    const manifest = await readManifest(fileName);
    assertCondition(typeof manifest === "object" && manifest !== null, "Manifest is empty: " + fileName);
    manifests.set(fileName, manifest);
  }

  const namespace = manifests.get("namespace.yaml");
  const configMap = manifests.get("configmap.yaml");
  const secret = manifests.get("secret.example.yaml");
  const deployment = manifests.get("deployment.yaml");
  const service = manifests.get("service.yaml");

  assertCondition(namespace.kind === "Namespace", "Namespace manifest is invalid");
  assertCondition(configMap.kind === "ConfigMap", "ConfigMap manifest is invalid");
  assertCondition(secret.kind === "Secret", "Secret example manifest is invalid");
  assertCondition(deployment.kind === "Deployment", "Deployment manifest is invalid");
  assertCondition(service.kind === "Service", "Service manifest is invalid");

  const container = deployment.spec.template.spec.containers[0];
  assertCondition(container.image.includes("replace-me"), "Deployment image must be a placeholder");
  assertCondition(container.livenessProbe?.httpGet?.path === "/v1/health/live", "Liveness probe is invalid");
  assertCondition(container.readinessProbe?.httpGet?.path === "/v1/health/ready", "Readiness probe is invalid");
  assertCondition(container.startupProbe?.httpGet?.path === "/v1/health/startup", "Startup probe is invalid");
  assertCondition(container.resources?.requests?.cpu, "CPU request is missing");
  assertCondition(container.resources?.requests?.memory, "Memory request is missing");
  assertCondition(container.resources?.limits?.cpu, "CPU limit is missing");
  assertCondition(container.resources?.limits?.memory, "Memory limit is missing");
  assertCondition(deployment.spec.template.spec.terminationGracePeriodSeconds >= 30, "Termination grace period is too short");

  const labels = labelsFromDeployment(deployment);
  assertCondition(selectorMatches(service.spec.selector, labels), "Service selector does not match Deployment labels");
  assertCondition(service.spec.type === "ClusterIP", "Service type must be ClusterIP");

  const secretText = JSON.stringify(secret.stringData ?? {});
  assertCondition(secretText.includes("placeholder"), "Secret example must use placeholder values");
  assertCondition(!/AKIA|BEGIN PRIVATE KEY|sk_live|xoxb-|ghp_/i.test(secretText), "Secret example contains a secret-looking value");

  const allText = JSON.stringify([...manifests.values()]);
  assertCondition(!/cloud\.google\.com|service\.beta\.kubernetes\.io|ingress\.kubernetes\.io/i.test(allText), "Cloud provider annotation found");

  return { resources: [...manifests.values()].map((manifest) => manifest.kind) };
}

const currentFile = fileURLToPath(import.meta.url);

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFile)) {
  await validateKubernetesManifests();
  console.log("k8s ok");
}
